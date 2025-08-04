import { serve } from "https://deno.land/std@0.190.0/http/server.ts";
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0';

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
};

const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
const SUPABASE_SERVICE_ROLE_KEY = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY");

if (!GEMINI_API_KEY || !SUPABASE_URL || !SUPABASE_SERVICE_ROLE_KEY) {
  console.error("Missing environment variables!");
  Deno.exit(1); // Exit if critical environment variables are missing
}

const supabaseAdmin = createClient(SUPABASE_URL, SUPABASE_SERVICE_ROLE_KEY, {
  auth: {
    autoRefreshToken: false,
    persistSession: false,
  },
});

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // 1. Authenticate user
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'Missing authorization header.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }
    const token = authHeader.replace('Bearer ', '');
    const { data: { user }, error: userError } = await supabaseAdmin.auth.getUser(token);

    if (userError || !user) {
      return new Response(JSON.stringify({ error: 'Invalid or expired token.' }), { status: 401, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const userId = user.id;

    // 2. Check daily usage limit
    const { count: generationsToday, error: countError } = await supabaseAdmin
      .from('recipe_generations')
      .select('*', { count: 'exact' })
      .eq('user_id', userId)
      .gte('created_at', new Date(new Date().setHours(0, 0, 0, 0)).toISOString()); // Start of today

    if (countError) {
      console.error("Error counting generations:", countError);
      throw new Error("Failed to check usage limit.");
    }

    const DAILY_LIMIT = 3;
    if (generationsToday && generationsToday >= DAILY_LIMIT) {
      return new Response(JSON.stringify({ error: `Daily recipe generation limit (${DAILY_LIMIT}) reached. Please try again tomorrow!` }), {
        status: 429, // Too Many Requests
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // 3. Parse request body
    const { images, complexity, dietaryPreferences, otherPreferences } = await req.json();

    if (!images || !Array.isArray(images) || images.length === 0) {
      return new Response(JSON.stringify({ error: 'No images provided.' }), { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } });
    }

    const imageParts = images.map((img: { mimeType: string, data: string }) => ({
      inlineData: {
        mimeType: img.mimeType,
        data: img.data,
      },
    }));

    let promptContent = "Generate a detailed recipe based on the ingredients in the images. Provide the recipe in markdown format, including sections for 'Ingredients', 'Instructions', and 'Notes'. Also, include 'Prep Time', 'Cook Time', 'Servings', 'Calories', and 'Tags' (e.g., 'Quick', 'Healthy', 'Dinner') at the beginning of the recipe. If you cannot identify enough ingredients, suggest a simple dish or ask for more clarity.";

    if (complexity && complexity !== 'Normal') {
      promptContent += ` The recipe should be for a ${complexity} level cook.`;
    }
    if (dietaryPreferences && dietaryPreferences.length > 0) {
      promptContent += ` It must be ${dietaryPreferences.join(', ')}.`;
    }
    if (otherPreferences) {
      promptContent += ` Also consider these preferences: ${otherPreferences}.`;
    }

    const contents = [
      {
        role: "user",
        parts: [
          { text: promptContent },
          ...imageParts,
        ],
      },
    ];

    // 4. Call Google Gemini API
    const geminiResponse = await fetch(`https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({
        contents: contents,
        generationConfig: {
          temperature: 0.7,
          maxOutputTokens: 1500,
        },
      }),
    });

    if (!geminiResponse.ok) {
      const errorData = await geminiResponse.json();
      console.error("Gemini API error:", errorData);
      throw new Error(`Gemini API error: ${errorData.error?.message || geminiResponse.statusText}`);
    }

    const geminiData = await geminiResponse.json();
    const generatedRecipe = geminiData.candidates[0].content.parts[0].text;

    // 5. Save recipe and log generation
    const { error: insertRecipeError } = await supabaseAdmin
      .from('recipes')
      .insert({ user_id: userId, content: generatedRecipe });

    if (insertRecipeError) {
      console.error("Error saving recipe:", insertRecipeError);
      throw new Error("Failed to save generated recipe.");
    }

    const { error: insertGenerationError } = await supabaseAdmin
      .from('recipe_generations')
      .insert({ user_id: userId });

    if (insertGenerationError) {
      console.error("Error logging generation:", insertGenerationError);
      // This error is less critical, but we should still log it.
      // We don't want to prevent the user from getting their recipe if logging fails.
    }

    // 6. Return the generated recipe
    return new Response(JSON.stringify({ recipe: generatedRecipe }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error: any) {
    console.error('Edge function error:', error.message);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
});