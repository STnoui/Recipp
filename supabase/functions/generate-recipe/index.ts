import { serve } from "https://deno.land/std@0.190.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.45.0'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

// Add Deno type declarations
declare const Deno: {
  env: {
    get: (key: string) => string | undefined;
  };
};

const OPENROUTER_API_URL = "https://openrouter.ai/api/v1/chat/completions";
const OPENROUTER_API_KEY = Deno.env.get("OPENROUTER_API_KEY") || "";

// ... (keep all existing code until the image processing part)

// Fix images reference by properly destructuring from request body
const { images, complexity = 'Normal', dietaryPreferences = [], otherPreferences = '' } = await req.json();
if (!images || !Array.isArray(images) || images.length === 0) {
  return new Response(JSON.stringify({ error: 'No images provided.' }), { 
    status: 400, 
    headers: { ...corsHeaders, 'Content-Type': 'application/json' } 
  });
}

const image_descriptions = await Promise.all(images.map(async (img, index) => {
  return `[Image ${index + 1} description: Contains ingredients for recipe]`;
}));

// ... (rest of the function remains the same)