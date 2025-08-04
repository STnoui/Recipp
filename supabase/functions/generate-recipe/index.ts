import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// The Gemini API key is read from the environment variables, which you must set in your Supabase project secrets.
const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`;

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    if (!GEMINI_API_KEY) {
        throw new Error("GEMINI_API_KEY is not set in environment variables.");
    }

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = encode(imageBuffer);

    const requestBody = {
      contents: [
        {
          parts: [
            { text: "You are a creative chef. Based on the ingredients in this image, generate a simple recipe. The recipe should have a catchy title, a list of ingredients (including quantities), and clear, step-by-step instructions. If the image does not contain recognizable food ingredients, respond with a friendly message saying you can't create a recipe from the image. Format your response in markdown." },
            {
              inline_data: {
                mime_type: imageFile.type,
                data: imageBase64,
              },
            },
          ],
        },
      ],
    };

    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error('Gemini API error:', errorBody);
      return new Response(JSON.stringify({ error: 'Failed to generate recipe from AI.', details: errorBody }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: geminiResponse.status,
      });
    }

    const geminiData = await geminiResponse.json();
    const recipeText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!recipeText) {
        return new Response(JSON.stringify({ error: 'Could not parse recipe from AI response.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    return new Response(JSON.stringify({ recipe: recipeText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})