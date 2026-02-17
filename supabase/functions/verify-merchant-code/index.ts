import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { stateAbbr, cityName, code } = await req.json();

    if (!stateAbbr || !cityName || !code) {
      return new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (typeof code !== "string" || code.length !== 12) {
      return new Response(
        JSON.stringify({ error: "Invalid code format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const sanitizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (sanitizedCode.length !== 12) {
      return new Response(
        JSON.stringify({ error: "Invalid code characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Fetch stall data server-side
    const { data, error } = await supabase
      .from("admin_city_content")
      .select("data")
      .eq("state_abbr", stateAbbr)
      .eq("city", cityName)
      .eq("section", "stalls")
      .maybeSingle();

    if (error) {
      console.error("DB error:", error.message);
      return new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    if (!data?.data || !Array.isArray(data.data)) {
      return new Response(
        JSON.stringify({ valid: false, error: "Código secreto inválido ou barraca não encontrada" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const stalls = data.data as any[];
    const match = stalls.find(
      (s: any) => s.secretCode === sanitizedCode && s.name && s.active
    );

    if (!match) {
      return new Response(
        JSON.stringify({ valid: false, error: "Código secreto inválido ou barraca não encontrada" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Return only the stall name, never the secret code
    return new Response(
      JSON.stringify({ valid: true, stallName: match.name }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (err) {
    console.error("Unexpected error:", err);
    return new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
