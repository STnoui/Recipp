/// <reference types="https://esm.sh/@supabase/functions-js/src/edge-runtime.d.ts" />

import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { encode } from "https://deno.land/std@0.190.0/encoding/base64.ts";

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // This is important to handle CORS preflight requests.
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("--- Recipe Generator Function Invoked ---");

    // 1. Check for Gemini API Key
    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");
    if (!GEMINI_API_KEY) {
      console.error("CRITICAL: GEMINI_API_KEY is not set in environment variables.");
      return new Response(JSON.stringify({ error: 'Server configuration error: Missing API key.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }
    console.log("GEMINI_API_KEY is present.");

    const GEMINI_API_URL = `https://generativelanguage.googleapis.com/v1beta/models/gemini-pro-vision:generateContent?key=${GEMINI_API_KEY}`;

    // 2. Get image from request
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      console.log("Request error: No image file provided.");
      return new Response(JSON.stringify({ error: 'No image provided' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }
    console.log(`Received image: ${imageFile.name}, type: ${imageFile.type}, size: ${imageFile.size} bytes`);

    // 3. Prepare image for Gemini API
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

    // 4. Call Gemini API
    console.log("Sending request to Gemini API...");
    const geminiResponse = await fetch(GEMINI_API_URL, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(requestBody),
    });

    console.log(`Gemini API response status: ${geminiResponse.status}`);

    if (!geminiResponse.ok) {
      const errorBody = await geminiResponse.text();
      console.error('Gemini API error response:', errorBody);
      return new Response(JSON.stringify({ error: 'Failed to generate recipe from AI.', details: errorBody }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: geminiResponse.status,
      });
    }

    // 5. Parse response and send back to client
    const geminiData = await geminiResponse.json();
    const recipeText = geminiData?.candidates?.[0]?.content?.parts?.[0]?.text;

    if (!recipeText) {
        console.error("Could not parse recipe from Gemini response:", JSON.stringify(geminiData));
        return new Response(JSON.stringify({ error: 'Could not parse recipe from AI response.' }), {
            headers: { ...corsHeaders, 'Content-Type': 'application/json' },
            status: 500,
        });
    }

    console.log("Successfully generated recipe. Sending to client.");
    return new Response(JSON.stringify({ recipe: recipeText }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("--- Unhandled Error in Edge Function ---");
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})