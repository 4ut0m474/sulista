import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const issues: { title: string; description: string; type: string }[] = [];

    // 1. Check establishments with no votes but very high avg_rating (inconsistency)
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

    // 2. Check sulcoins balances that are impossibly high (> 999999)
    const { data: suspectCoins } = await supabase
      .from("sulcoins")
      .select("user_id, saldo")
      .gt("saldo", 999999);

    if (suspectCoins && suspectCoins.length > 0) {
      issues.push({
        title: "🚨 Saldo de SulCoins suspeito",
        description: `${suspectCoins.length} conta(s) com saldo acima de 999.999 SulCoins — possível inconsistência ou tentativa de fraude.`,
        type: "fraude",
      });
    }

    // 3. Check transfers with very high values (> 100000 SulCoins in one shot)
    const { data: bigTransfers } = await supabase
      .from("transfers")
      .select("id, de_id, para_id, valor, created_at")
      .gt("valor", 100000)
      .order("created_at", { ascending: false })
      .limit(5);

    if (bigTransfers && bigTransfers.length > 0) {
      issues.push({
        title: "💸 Transferências de alto valor detectadas",
        description: `${bigTransfers.length} transferência(s) de mais de 100.000 SulCoins detectadas recentemente — revisão manual recomendada.`,
        type: "fraude",
      });
    }

    // 4. Check establishments with no city or missing required fields
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

    // 5. Check votes with duplicate device fingerprints for same establishment (vote stuffing)
    const { data: dupVotes } = await supabase.rpc
      ? null // RPC call below
      : null;

    // Use raw query via RPC — check for vote stuffing
    const { data: stuffedVotes } = await supabase
      .from("votes")
      .select("establishment_id, device_fingerprint")
      .then(async ({ data }) => {
        if (!data) return { data: [] };
        const counts: Record<string, number> = {};
        for (const v of data) {
          const key = `${v.establishment_id}:${v.device_fingerprint}`;
          counts[key] = (counts[key] || 0) + 1;
        }
        const stuffed = Object.entries(counts).filter(([, c]) => c > 3);
        return { data: stuffed };
      });

    if (stuffedVotes && stuffedVotes.length > 0) {
      issues.push({
        title: "🗳️ Possível manipulação de votação",
        description: `${stuffedVotes.length} combinações de dispositivo+estabelecimento com mais de 3 votos — suspeita de vote stuffing.`,
        type: "fraude",
      });
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
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
