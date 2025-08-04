import { serve } from "https://deno.land/std@0.190.0/http/server.ts"

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

serve(async (req) => {
  // This is a preflight request. It's a check to see if the actual request is safe to send.
  if (req.method === 'OPTIONS') {
    return new Response(null, { headers: corsHeaders })
  }

  try {
    const formData = await req.formData();
    const imageFile = formData.get('image') as File;

    if (!imageFile) {
      const errorPayload = { error: 'Diagnostic Error: No image file was found in the request.' };
      return new Response(JSON.stringify(errorPayload), {
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
        status: 400,
      });
    }

    // If we get here, the file was received successfully.
    const successPayload = { 
      message: "Diagnostic Check Passed: The backend function received your image successfully.",
      fileName: imageFile.name,
      fileSize: imageFile.size,
      fileType: imageFile.type,
    };

    return new Response(JSON.stringify(successPayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 200,
    });

  } catch (error) {
    // This will catch errors if formData parsing fails.
    const errorPayload = { 
      error: 'Diagnostic Error: A critical error occurred in the backend function.', 
      details: error.message 
    };
    return new Response(JSON.stringify(errorPayload), {
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      status: 500,
    });
  }
})