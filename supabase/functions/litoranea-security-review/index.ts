import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const ALLOWED_ORIGINS = [
  "https://vento-sul.lovable.app",
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

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    // Authenticate: require valid JWT and admin role
    const authHeader = req.headers.get("authorization");
    if (!authHeader?.startsWith("Bearer ")) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    const token = authHeader.replace("Bearer ", "");
    const anonClient = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_ANON_KEY")!,
      { global: { headers: { Authorization: `Bearer ${token}` } } }
    );

    const { data: userData, error: authError } = await anonClient.auth.getUser();
    if (authError || !userData?.user) {
      return new Response(
        JSON.stringify({ error: "Unauthorized" }),
        { status: 401, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Check admin role
    const supabaseAdmin = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: roleData } = await supabaseAdmin
      .from("user_roles")
      .select("role")
      .eq("user_id", userData.user.id)
      .eq("role", "admin")
      .maybeSingle();

    if (!roleData) {
      return new Response(
        JSON.stringify({ error: "Admin access required" }),
        { status: 403, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Proceed with security review using service role
    const supabase = supabaseAdmin;
    const issues: { title: string; description: string; type: string }[] = [];

    // 1. Check establishments with no votes but very high avg_rating
    const { data: suspectEstabs } = await supabase
      .from("establishments")
      .select("id, name, city, state_abbr, avg_rating, total_votes")
      .gt("avg_rating", 4.5)
      .eq("total_votes", 0);

    if (suspectEstabs && suspectEstabs.length > 0) {
      issues.push({
        title: "⚠️ Estabelecimentos com nota alta sem votos",
        description: `${suspectEstabs.length} estabelecimento(s) com nota > 4.5 mas 0 votos: ${suspectEstabs.map(e => `${e.name} (${e.city}/${e.state_abbr})`).join(", ")}`,
        type: "segurança",
      });
    }

    // 2. Check sulcoins balances that are impossibly high
    const { data: suspectCoins } = await supabase
      .from("sulcoins")
      .select("user_id, saldo")
      .gt("saldo", 999999);

    if (suspectCoins && suspectCoins.length > 0) {
      issues.push({
        title: "🚨 Saldo de SulCoins suspeito",
        description: `${suspectCoins.length} conta(s) com saldo acima de 999.999 SulCoins.`,
        type: "fraude",
      });
    }

    // 3. Check transfers with very high values
    const { data: bigTransfers } = await supabase
      .from("transfers")
      .select("id, de_id, para_id, valor, created_at")
      .gt("valor", 100000)
      .order("created_at", { ascending: false })
      .limit(5);

    if (bigTransfers && bigTransfers.length > 0) {
      issues.push({
        title: "💸 Transferências de alto valor detectadas",
        description: `${bigTransfers.length} transferência(s) de mais de 100.000 SulCoins detectadas recentemente.`,
        type: "fraude",
      });
    }

    // 4. Check establishments with missing required fields
    const { data: incompleteEstabs } = await supabase
      .from("establishments")
      .select("id, name")
      .or("city.is.null,state_abbr.is.null,name.is.null");

    if (incompleteEstabs && incompleteEstabs.length > 0) {
      issues.push({
        title: "📋 Estabelecimentos com dados incompletos",
        description: `${incompleteEstabs.length} estabelecimento(s) sem cidade, estado ou nome preenchido.`,
        type: "dados",
      });
    }

    // 5. Check for vote stuffing
    const { data: allVotes } = await supabase
      .from("votes")
      .select("establishment_id, device_fingerprint");

    if (allVotes && allVotes.length > 0) {
      const counts: Record<string, number> = {};
      for (const v of allVotes) {
        const key = `${v.establishment_id}:${v.device_fingerprint}`;
        counts[key] = (counts[key] || 0) + 1;
      }
      const stuffed = Object.entries(counts).filter(([, c]) => c > 3);
      if (stuffed.length > 0) {
        issues.push({
          title: "🗳️ Possível manipulação de votação",
          description: `${stuffed.length} combinações de dispositivo+estabelecimento com mais de 3 votos.`,
          type: "fraude",
        });
      }
    }

    // Insert found issues as admin notifications
    if (issues.length > 0) {
      const notifications = issues.map(issue => ({
        type: issue.type,
        title: issue.title,
        description: issue.description,
        read: false,
      }));

      const { error: insertError } = await supabase
        .from("admin_notifications")
        .insert(notifications);

      if (insertError) {
        console.error("Error inserting notifications:", insertError);
      }
    }

    return new Response(
      JSON.stringify({
        success: true,
        issuesFound: issues.length,
        issues,
      }),
      { headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  } catch (e) {
    console.error("litoranea-security-review error:", e);
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
