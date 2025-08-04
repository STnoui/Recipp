import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

const createAdminClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");
  if (!supabaseUrl || !serviceRoleKey) throw new Error("Server config error: Missing Supabase credentials.");
  return createClient(supabaseUrl, serviceRoleKey, { auth: { autoRefreshToken: false, persistSession: false } });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createAdminClient();

    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) return new Response(JSON.stringify({ error: 'Missing authorization.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);
    if (userError || !user) return new Response(JSON.stringify({ error: 'Invalid token.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // 2. Check daily usage limit
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const { count, error: countError } = await supabaseAdmin.from('recipe_generations').select('*', { count: 'exact', head: true }).eq('user_id', user.id).gte('created_at', today.toISOString());
    if (countError) throw new Error(`DB error checking usage: ${countError.message}`);
    if (count !== null && count >= 3) return new Response(JSON.stringify({ error: 'You have reached your daily limit of 3 recipes.' }), { status: 429, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });

    // 3. Process image data
    const { images } = await req.json();
    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: 'No images provided.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) throw new Error('Server config error: Missing API key.');
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const promptPart = { text: "You are a creative chef. Based on the ingredients in the following image(s), generate a simple recipe. The recipe must have a catchy title, a list of ingredients (including quantities), and clear, step-by-step instructions. If the image(s) do not contain recognizable food ingredients, respond with a friendly message explaining that you cannot create a recipe. Format your entire response in markdown." };
    const imageParts = images.map(img => ({
      inline_data: {
        mime_type: img.mimeType,
        data: img.data,
      },
    }));

    const requestBody = { contents: [{ parts: [promptPart, ...imageParts] }] };

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      throw new Error(`AI service error: ${geminiResponse.status} ${errorBody}`);
    }

    const geminiData = await geminiResponse.json();
    const recipeText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;
    if (!recipeText) throw new Error('Could not parse recipe from AI response.');

    // 4. Log successful generation and save recipe
    const { error: insertError } = await supabaseAdmin.from('recipe_generations').insert({ user_id: user.id });
    if (insertError) console.error('Failed to log recipe generation:', insertError.message);

    const { error: insertRecipeError } = await supabaseAdmin.from('recipes').insert({ user_id: user.id, content: recipeText });
    if (insertRecipeError) console.error('Failed to save recipe:', insertRecipeError.message);


    // 5. Return recipe
    return new Response(JSON.stringify({ recipe: recipeText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge function error:', error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})