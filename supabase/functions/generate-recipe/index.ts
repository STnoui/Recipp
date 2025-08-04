import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

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
    console.log("--- Diagnostic Function Invoked ---");

    const GEMINI_API_KEY = Deno.env.get("GEMINI_API_KEY");

    if (!GEMINI_API_KEY) {
      console.error("DIAGNOSTIC: GEMINI_API_KEY is NOT set.");
      return new Response(JSON.stringify({ error: 'Diagnostic failed: GEMINI_API_KEY is not set in environment variables.' }), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 500,
      });
    }

    console.log("DIAGNOSTIC: GEMINI_API_KEY is present.");
    
    const keyPreview = `${GEMINI_API_KEY.substring(0, 4)}...${GEMINI_API_KEY.substring(GEMINI_API_KEY.length - 4)}`;

    return new Response(JSON.stringify({ 
      message: "Diagnostic successful: The API key is accessible by the function.",
      key_preview: keyPreview,
      key_length: GEMINI_API_KEY.length,
    }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("--- Unhandled Error in Diagnostic Function ---");
    console.error(error);
    return new Response(JSON.stringify({ error: error.message }), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})