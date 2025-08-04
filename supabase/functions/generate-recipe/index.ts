import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      const errorPayload = { error: 'Server configuration error: Missing API key.' };
      return new Response(JSON.stringify({ error: errorPayload }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-lite:generateContent?key=${GEMINI_API_KEY}`;

    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      const errorPayload = { error: 'No image provided' };
      return new Response(JSON.stringify({ error: errorPayload }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const imageBuffer = await imageFile.arrayBuffer();
    const imageBase64 = encode(imageBuffer);

    const requestBody = {
      contents: [
        {
          parts: [
            { text: "You are a creative chef with advanced reasoning abilities. First, carefully analyze the ingredients shown in the image. Consider possible flavor combinations and what kind of dish would be best. Then, based on your analysis, generate a simple recipe. The recipe must have a catchy title, a list of ingredients (including quantities), and clear, step-by-step instructions. If the image does not contain recognizable food ingredients, respond with a friendly message explaining that you cannot create a recipe. Format your entire response in markdown." },
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
      const errorPayload = { 
        error: 'The AI service returned an error.',
        details: {
          status: geminiResponse.status,
          statusText: geminiResponse.statusText,
          body: errorBody || "Response body was empty."
        }
      };
      return new Response(JSON.stringify({ error: errorPayload }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 200,
      });
    }

    const geminiData = await geminiResponse.json();
    const recipeText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!recipeText) {
        const errorPayload = { error: 'Could not parse recipe from AI response.', details: geminiData };
        return new Response(JSON.stringify({ error: errorPayload }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 200,
        });
    }

    return new Response(JSON.stringify({ recipe: recipeText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    const errorPayload = { error: 'A critical error occurred in the edge function.', details: error.message };
    return new Response(JSON.stringify({ error: errorPayload }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });
  }
})