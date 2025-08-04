import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient, SupabaseClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Helper to create a Supabase client with the service role for admin tasks
const createAdminClient = () => {
  const supabaseUrl = Deno.env.get("SUPABASE_URL");
  const serviceRoleKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

  if (!supabaseUrl || !serviceRoleKey) {
    throw new Error("Server configuration error: Missing Supabase credentials.");
  }

  return createClient(supabaseUrl, serviceRoleKey, {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  });
};

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const supabaseAdmin = createAdminClient();

    // 1. Authenticate the user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid token.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 401,
      });
    }

    // 2. Check daily usage limit
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0); // Start of the current day in UTC

    const { count, error: countError } = await supabaseAdmin
      .from('recipe_generations')
      .select('*', { count: 'exact', head: true })
      .eq('user_id', user.id)
      .gte('created_at', today.toISOString());

    if (countError) {
      throw new Error(`Database error checking usage: ${countError.message}`);
    }

    if (count !== null && count >= 3) {
      return new Response(JSON.stringify({ error: 'You have reached your daily limit of 3 recipes.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 429,
      });
    }

    // 3. Process the request and call the AI
    const { prompt } = await req.json();
    if (!prompt) {
      return new Response(JSON.stringify({ error: 'No prompt provided.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      throw new Error('Server configuration error: Missing API key.');
    }
    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash-latest:generateContent?key=${GEMINI_API_KEY}`;

    const requestBody = {
      contents: [
        {
          parts: [
            { text: `You are a creative chef. Based on the following ingredients, generate a simple recipe. The recipe must have a catchy title, a list of ingredients (including quantities), and clear, step-by-step instructions. If the prompt does not contain recognizable food ingredients, respond with a friendly message explaining that you cannot create a recipe. Format your entire response in markdown. Ingredients: ${prompt}` },
          ],
        },
      ],
    };

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

    if (!recipeText) {
      throw new Error('Could not parse recipe from AI response.');
    }

    // 4. Log the successful generation
    const { error: insertError } = await supabaseAdmin
      .from('recipe_generations')
      .insert({ user_id: user.id });

    if (insertError) {
      // Log this error but still return the recipe to the user
      console.error('Failed to log recipe generation:', insertError.message);
    }

    // 5. Return the recipe
    return new Response(JSON.stringify({ recipe: recipeText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error('Edge function error:', error);
    const errorPayload = { error: error.message };
    return new Response(JSON.stringify(errorPayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})