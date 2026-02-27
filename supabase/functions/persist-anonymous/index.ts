import { createClient } from "https://esm.sh/@supabase/supabase-js@2.49.4";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type",
};

async function hashPin(pin: string, salt: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(pin + salt);
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map((b) => b.toString(16).padStart(2, "0")).join("");
}

Deno.serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const authHeader = req.headers.get("Authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(JSON.stringify({ error: "Não autorizado" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: authHeader } } }
    );

    const token = authHeader.replace("Bearer ", "");
    const { data: claimsData, error: claimsError } =
      await supabase.auth.getClaims(token);
    if (claimsError || !claimsData?.claims) {
      return new Response(JSON.stringify({ error: "Token inválido" }), {
        status: 401,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    const userId = claimsData.claims.sub;
    const { action, pin } = await req.json();

    if (!pin || typeof pin !== "string" || !/^\d{4,6}$/.test(pin)) {
      return new Response(
        JSON.stringify({ error: "PIN deve ter 4 a 6 dígitos" }),
        {
          status: 400,
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    const adminClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    if (action === "create") {
      // Hash PIN with user_id as salt
      const pinHash = await hashPin(pin, userId);

      const { error: insertError } = await adminClient
        .from("anonymous_profiles")
        .upsert(
          { user_id: userId, pin_hash: pinHash, updated_at: new Date().toISOString() },
          { onConflict: "user_id" }
        );

      if (insertError) {
        console.error("Insert error:", insertError);
        return new Response(
          JSON.stringify({ error: "Erro ao salvar perfil" }),
          {
            status: 500,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      // Give initial 0.50 SulCoins
      await adminClient
        .from("sulcoins")
        .upsert(
          { user_id: userId, saldo: 50, atualizado_em: new Date().toISOString() },
          { onConflict: "user_id" }
        );

      await adminClient.from("sulcoins_log").insert({
        user_id: userId,
        tipo: "bonus_persistencia",
        valor: 50,
        descricao: "Bônus de persistência anônima - 0,50 SulC",
      });

      return new Response(
        JSON.stringify({ success: true, uuid: userId }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    if (action === "verify") {
      const pinHash = await hashPin(pin, userId);

      const { data: profile } = await adminClient
        .from("anonymous_profiles")
        .select("pin_hash")
        .eq("user_id", userId)
        .single();

      if (!profile || profile.pin_hash !== pinHash) {
        return new Response(
          JSON.stringify({ error: "PIN incorreto" }),
          {
            status: 403,
            headers: { ...corsHeaders, "Content-Type": "application/json" },
          }
        );
      }

      return new Response(
        JSON.stringify({ success: true, valid: true }),
        {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        }
      );
    }

    return new Response(
      JSON.stringify({ error: "Ação inválida" }),
      {
        status: 400,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error:", err);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      {
        status: 500,
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      }
    );
  }
});
