import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    console.log("--- Simplified Diagnostic Function Invoked ---");
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      console.log("Request error: No image file provided.");
      const errorPayload = { error: 'No image file was found in the form data.' };
      return new Response(JSON.stringify(errorPayload), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    console.log(`Successfully received image: ${imageFile.name}, size: ${imageFile.size}`);
    const successPayload = { 
      message: "Image received successfully by the diagnostic function!",
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type,
    };

    return new Response(JSON.stringify(successPayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    console.error("--- Unhandled Error in Simplified Edge Function ---");
    console.error(error);
    const errorPayload = { 
      error: 'A critical error occurred while processing the request.', 
      details: error.message 
    };
    return new Response(JSON.stringify(errorPayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})