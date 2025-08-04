// Type declarations for Deno global object
declare namespace Deno {
  export const env: {
    get(key: string): string | undefined;
  };
  export function exit(code?: number): never;
}

// Type declarations for URL-based modules
declare module "https://deno.land/std@0.190.0/http/server.ts" {
  export { serve } from "https://deno.land/std@0.190.0/http/server.ts";
}

declare module "https://esm.sh/@supabase/supabase-js@2.45.0" {
  export { createClient } from "https://esm.sh/@supabase/supabase-js@2.45.0";
}