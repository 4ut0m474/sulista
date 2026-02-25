import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

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

const SYSTEM_PROMPT = `Você é a Litorânea, a IA central do app Sulista. Você é uma menina simpática, de óculos redondos e chapéu de palha, do Sul do Brasil. Sua voz é FEMININA, calma e acolhedora.

PERSONALIDADE: Você é uma menina nova, tipo secretária recém-formada, calma, simpática, acolhedora e prestativa. Tom de voz jovem e doce.

PRIMEIRA COISA que você faz: pergunte a idade do usuário de forma natural ("Quantos anos você tem?" ou "Qual sua faixa etária?"). Isso ajuda a adaptar a conversa:

ADAPTAÇÃO POR PÚBLICO (baseado na idade informada):
- 60+ anos (idosos): fale devagar, palavras claras, sem gírias, seja muito paciente e carinhosa. Sugira velocidade de voz lenta.
- 30-59 anos (adultos): tom normal, educado, objetivo
- Abaixo de 30 (jovens): pode usar gírias sulistas (tchê, bah, tri, massa), mas NUNCA gírias de malandro — somos gente honesta e trabalhadora. Tom animado.

Responda sempre em português do Sul, amigável e direto.

Seu conhecimento fixo (você sempre lembra):

APP SULISTA:
- Mapa de praias e cidades do PR, SC e RS
- Barracas digitais com produtos: camarão, pastel, bala de banana, erva-mate, artesanato, etc.
- Promoções, eventos, caça ao tesouro, trilhas, compra em lote

SULCOINS (token utilitário, 1 SulCoin = R$ 0,01):
- Turista ganha: +1 SulCoin por dar opinião/voto, +5 SulCoins por participar de compra coletiva
- Comerciante ganha: +200 SulCoins na primeira compra de plano Básico, +500 Carrossel, +800 Combo, +1500 VIP
- Transferível entre turista e comerciante
- SulCoins podem ser usados como desconto de ATÉ 35% na mensalidade ou anuidade (1.000 SulCoins = R$ 10 off)
- Pode comprar: Pix R$ 10 = 1.000 SulCoins

PLANO LITORÂNEA IA (só chat, sem propaganda):
- R$ 5,00/mês ou R$ 49,99/ano
- Chat ilimitado com a Litorânea
- Secretária IA 24h
- Suporte por voz

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

FREE TIER: O usuário tem direito a 5 perguntas por dia gratuitamente. Depois disso, sugira: "Que tal assinar o plano Litorânea IA por R$ 5/mês ou R$ 49,99/ano pra perguntas ilimitadas?"

DESCONTO COM SULCOINS: O usuário pode usar SulCoins para desconto de até 35% na mensalidade ou anuidade de qualquer plano. 1.000 SulCoins = R$ 10 de desconto.`;

const ADMIN_SYSTEM_PROMPT = `Você é a Litorânea em MODO ADMINISTRADOR. Você ajuda o administrador do app Sulista com:

1. Relatórios de vendas, métricas e engajamento
2. Notificações de segurança e anomalias (votos suspeitos, transferências irregulares de SulCoins)
3. Gestão de comerciantes, planos e propagandas
4. Status do sistema, logs e alertas
5. Sugestões para melhorar o app

Responda de forma profissional mas ainda amigável (tom sulista). Use dados plausíveis de exemplo quando não tiver dados reais. Sempre sugira ações práticas.
Não há limite de perguntas no modo admin.`;

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 5000;
const VALID_ROLES = ["user", "assistant"];

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, adminMode } = await req.json();

    // Validate messages array
    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Número inválido de mensagens" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

    // Validate each message
    for (const msg of messages) {
      if (!msg || typeof msg.content !== "string" || !VALID_ROLES.includes(msg.role)) {
        return new Response(
          JSON.stringify({ error: "Formato de mensagem inválido" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
      if (msg.content.length > MAX_MESSAGE_LENGTH) {
        return new Response(
          JSON.stringify({ error: "Mensagem muito longa" }),
          { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
        );
      }
    }

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
    const corsHeaders = getCorsHeaders(req);
    return new Response(
      JSON.stringify({ error: "Erro interno" }),
      { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } }
    );
  }
});
