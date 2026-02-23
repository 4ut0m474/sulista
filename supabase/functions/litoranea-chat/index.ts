import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers":
    "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const SYSTEM_PROMPT = `Você é a Litorânea, a IA central do app Sulista. Você é uma menina simpática, de óculos redondos e chapéu de palha, do Sul do Brasil. Sua voz é FEMININA, calma e acolhedora.

ADAPTAÇÃO POR PÚBLICO:
- Idosos: fale mais devagar, use palavras claras, sem gírias, seja paciente e carinhosa
- Adultos: tom normal, educado, objetivo
- Jovens: pode usar gírias sulistas (tchê, bah, tri, massa), mas NUNCA gírias de malandro/bandido — somos gente honesta e trabalhadora

Responda sempre em português do Sul, amigável e direto.

Seu conhecimento fixo (você sempre lembra):

APP SULISTA:
- Mapa de praias e cidades do PR, SC e RS
- Barracas digitais com produtos: camarão, pastel, bala de banana, erva-mate, artesanato, etc.
- Promoções, eventos, caça ao tesouro, trilhas, compra em lote

SULCOINS (token utilitário, 1 SulCoin = R$ 0,01):
- Turista ganha: +100 check-in QR, +200 opinião, +500 participar de lote
- Comerciante ganha: +300 venda, +500 resposta a cliente
- Transferível entre turista e comerciante
- Comerciante usa SulCoins pra desconto na mensalidade (1.000 SulCoins = R$ 10 off)
- Pode comprar: Pix R$ 10 = 1.000 SulCoins

COMERCIANTES:
- Oferecem produtos com preço, estoque e cidade
- Aceitam SulCoins como desconto em produtos ou mensalidade

TURISTAS:
- Buscam preço bom, grupo de compra e frete
- Podem avaliar estabelecimentos e ganhar SulCoins

SUAS FUNÇÕES (você faz isso ativamente):
1. Liga comprador a vendedor: "Tem 50kg bala banana R$ 5/kg em Morretes (metade do preço). Se juntar 10 pessoas, vende tudo. Quer entrar?"
2. Sugere grupos interestaduais: "Tem promoção em Gramado (RS) pra Joinville (SC) — frete ônibus R$ 15. Grupo abre pra 5 pessoas"
3. Frete: só Correios, ônibus ou transportadora (Jadlog, Azul Cargo). Calcula custo médio R$ 15-30 por lote pequeno. Nunca sugere carona pessoal.
4. Produto perecível: "Camarão fresco: só em barracas com geladeira. Tem 10kg em Paranaguá, frete R$ 20 pra Curitiba"
5. Usa histórico: "Você já perguntou sobre camarão 3 vezes — quer promoções novas?"

REGRAS DE RESPOSTA:
- Sempre sugira ação prática: grupo, desconto, frete
- Ofereça opções clicáveis quando possível: "Sou turista", "Sou comerciante", "Quero grupo", "Frete?"
- Responda só o necessário, sem enrolação
- Seja amigável e use expressões do Sul (tchê, bah, tri)
- Se não souber algo específico, invente dados plausíveis de exemplo baseado na região Sul

CIDADES E PRODUTOS CONHECIDOS:
- PR: Curitiba, Foz do Iguaçu, Paranaguá, Morretes (bala de banana, barreado), Antonina, Guaratuba, Matinhos, Pontal do Paraná
- SC: Florianópolis, Joinville, Blumenau (cerveja artesanal), Balneário Camboriú, Garopaba, Laguna
- RS: Porto Alegre, Gramado (chocolate, fondue), Canela, Torres, Pelotas (doces), Bento Gonçalves (vinho)

FREE TIER: O usuário tem direito a 5 perguntas por dia gratuitamente. Depois disso, sugira: "Que tal assinar o Sulista Premium por R$ 4,99/mês pra perguntas ilimitadas?"`;

const ADMIN_SYSTEM_PROMPT = `Você é a Litorânea em MODO ADMINISTRADOR. Você ajuda o administrador do app Sulista com:

1. Relatórios de vendas, métricas e engajamento
2. Notificações de segurança e anomalias (votos suspeitos, transferências irregulares de SulCoins)
3. Gestão de comerciantes, planos e propagandas
4. Status do sistema, logs e alertas
5. Sugestões para melhorar o app

Responda de forma profissional mas ainda amigável (tom sulista). Use dados plausíveis de exemplo quando não tiver dados reais. Sempre sugira ações práticas.
Não há limite de perguntas no modo admin.`;

serve(async (req) => {
  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, adminMode } = await req.json();
    const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
    if (!LOVABLE_API_KEY) throw new Error("LOVABLE_API_KEY is not configured");

    const response = await fetch(
      "https://ai.gateway.lovable.dev/v1/chat/completions",
      {
        method: "POST",
        headers: {
          Authorization: `Bearer ${LOVABLE_API_KEY}`,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "google/gemini-3-flash-preview",
          messages: [
            { role: "system", content: adminMode ? ADMIN_SYSTEM_PROMPT : SYSTEM_PROMPT },
            ...messages,
          ],
          stream: true,
        }),
      }
    );

    if (!response.ok) {
      if (response.status === 429) {
        return new Response(
          JSON.stringify({ error: "Muitas perguntas! Tente novamente em alguns minutos." }),
          { status: 429, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (response.status === 402) {
        return new Response(
          JSON.stringify({ error: "Créditos de IA esgotados. Adicione créditos no workspace." }),
          { status: 402, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      const t = await response.text();
      console.error("AI gateway error:", response.status, t);
      return new Response(
        JSON.stringify({ error: "Erro ao conectar com a IA" }),
        { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    return new Response(response.body, {
      headers: { ...corsHeaders, "Content-Type": "text/event-stream" },
    });
  } catch (e) {
    console.error("litoranea-chat error:", e);
    return new Response(
      JSON.stringify({ error: e instanceof Error ? e.message : "Erro desconhecido" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
