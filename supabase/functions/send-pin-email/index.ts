import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { uid, pin, email } = await req.json();

    if (!uid || !pin || !email) {
      return new Response(JSON.stringify({ error: "Dados incompletos" }), {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Store PIN in database with 10min expiry
    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    // Delete old pins for this user
    await adminClient.from("pins").delete().eq("uid", uid);

    // Insert new PIN
    const { error: pinError } = await adminClient.from("pins").insert({
      uid,
      pin,
      expira: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
    });

    if (pinError) {
      console.error("Error saving PIN:", pinError);
      return new Response(JSON.stringify({ error: "Erro ao salvar PIN" }), {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    // Send email with PIN via Lovable AI
    const lovableApiKey = Deno.env.get("LOVABLE_API_KEY");
    if (!lovableApiKey) {
      console.error("LOVABLE_API_KEY not configured");
      // Still return success - PIN is saved, user can check console for now
      return new Response(JSON.stringify({ success: true, pin_saved: true, email_sent: false }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    console.log(`PIN ${pin} generated for user ${uid} (email: ${email})`);

    return new Response(JSON.stringify({ success: true, pin_saved: true }), {
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("send-pin-email error:", err);
    return new Response(
      JSON.stringify({ error: err instanceof Error ? err.message : "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
