import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://sulista.lovable.app",
  "https://id-preview--2c4c0396-2206-46f5-b853-be558ea3b2f4.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = ALLOWED_ORIGINS.includes(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

const MAX_ATTEMPTS = 5;
const WINDOW_MS = 60 * 60 * 1000; // 1 hour
const MIN_RESPONSE_TIME_MS = 2000; // Constant-time responses to prevent timing attacks

Deno.serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  const startTime = Date.now();

  try {
    const { stateAbbr, cityName, code } = await req.json();

    if (!stateAbbr || !cityName || !code) {
      return await constantTimeResponse(startTime, new Response(
        JSON.stringify({ error: "Missing required fields" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ));
    }

    // Input validation for stateAbbr: must be exactly 2 uppercase letters
    if (typeof stateAbbr !== "string" || !/^[A-Z]{2}$/.test(stateAbbr)) {
      return await constantTimeResponse(startTime, new Response(
        JSON.stringify({ error: "Invalid state format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ));
    }

    // Input validation for cityName: max 100 chars, only letters/spaces/hyphens/accents
    if (typeof cityName !== "string" || cityName.length > 100 || !/^[\p{L}\s\-'']+$/u.test(cityName)) {
      return await constantTimeResponse(startTime, new Response(
        JSON.stringify({ error: "Invalid city format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ));
    }

    if (typeof code !== "string" || code.length !== 32) {
      return await constantTimeResponse(startTime, new Response(
        JSON.stringify({ error: "Invalid code format" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ));
    }

    const sanitizedCode = code.toUpperCase().replace(/[^A-Z0-9]/g, "");
    if (sanitizedCode.length !== 32) {
      return await constantTimeResponse(startTime, new Response(
        JSON.stringify({ error: "Invalid code characters" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ));
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Rate limiting: check recent failed attempts for this city
    const rateLimitKey = `${stateAbbr}:${cityName}`;
    const windowStart = new Date(Date.now() - WINDOW_MS).toISOString();

    const { count } = await supabase
      .from("admin_notifications")
      .select("*", { count: "exact", head: true })
      .eq("type", "merchant_code_attempt")
      .eq("state_abbr", stateAbbr)
      .eq("city", cityName)
      .gte("created_at", windowStart);

    if ((count ?? 0) >= MAX_ATTEMPTS) {
      return await constantTimeResponse(startTime, new Response(
        JSON.stringify({ valid: false, error: "Muitas tentativas. Tente novamente em 1 hora." }),
        { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ));
    }

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
      return await constantTimeResponse(startTime, new Response(
        JSON.stringify({ error: "Internal error" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ));
    }

    if (!data?.data || !Array.isArray(data.data)) {
      await logFailedAttempt(supabase, stateAbbr, cityName);
      return await constantTimeResponse(startTime, new Response(
        JSON.stringify({ valid: false, error: "Código secreto inválido ou barraca não encontrada" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ));
    }

    const stalls = data.data as any[];
    const match = stalls.find(
      (s: any) => s.secretCode === sanitizedCode && s.name && s.active
    );

    if (!match) {
      await logFailedAttempt(supabase, stateAbbr, cityName);
      return await constantTimeResponse(startTime, new Response(
        JSON.stringify({ valid: false, error: "Código secreto inválido ou barraca não encontrada" }),
        { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      ));
    }

    // Return only the stall name, never the secret code
    return await constantTimeResponse(startTime, new Response(
      JSON.stringify({ valid: true, stallName: match.name }),
      { status: 200, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    ));
  } catch (err) {
    console.error("Unexpected error:", err);
    const corsHeaders = getCorsHeaders(req);
    return await constantTimeResponse(startTime, new Response(
      JSON.stringify({ error: "Internal error" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    ));
  }
});

async function logFailedAttempt(supabase: any, stateAbbr: string, cityName: string) {
  await supabase.from("admin_notifications").insert({
    type: "merchant_code_attempt",
    title: "Tentativa de código de comerciante",
    description: `Tentativa falha para ${cityName}/${stateAbbr}`,
    state_abbr: stateAbbr,
    city: cityName,
  });
}

async function constantTimeResponse(startTime: number, response: Response): Promise<Response> {
  const elapsed = Date.now() - startTime;
  if (elapsed < MIN_RESPONSE_TIME_MS) {
    await new Promise((resolve) => setTimeout(resolve, MIN_RESPONSE_TIME_MS - elapsed));
  }
  return response;
}
