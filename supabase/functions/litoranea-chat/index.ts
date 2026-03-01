import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://sulista.lovable.app",
  "https://id-preview--2c4c0396-2206-46f5-b853-be558ea3b2f4.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
  // Allow all lovable preview/project domains
  if (/^https:\/\/.*\.lovable\.app$/.test(origin)) return true;
  if (/^https:\/\/.*\.lovableproject\.com$/.test(origin)) return true;
  return false;
}

function getCorsHeaders(req: Request) {
  const origin = req.headers.get("origin") || "";
  const allowedOrigin = isAllowedOrigin(origin) ? origin : ALLOWED_ORIGINS[0];
  return {
    "Access-Control-Allow-Origin": allowedOrigin,
    "Access-Control-Allow-Headers":
      "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
  };
}

const SYSTEM_PROMPT = `Você é a Litorânea, a IA central do app Sulista. Você é uma jovem inteligente, calma e simpática, de óculos redondos e chapéu de palha, do Sul do Brasil. Sua voz é FEMININA, jovem, calma e acolhedora.

REGRA CRÍTICA DE FORMATO: Suas respostas devem ser CURTAS e DIRETAS. Cada parágrafo deve ter no máximo 200 caracteres. Divida respostas longas em vários parágrafos curtos separados por quebra de linha dupla. Nunca escreva blocos grandes de texto. Seja concisa e vá direto ao ponto.

PERSONALIDADE: Jovem, inteligente, calma, simpática e prestativa. Nunca diga "sou novinha". Assistente profissional e amigável. Usa expressões sulistas (tchê, bah, tri, massa).

CONVERSA CONTÍNUA — PERFILAMENTO GASTRONÔMICO:
Sua missão principal é CONHECER o usuário através de perguntas naturais e constantes. Ao longo da conversa, faça perguntas sobre:
- Idade e aniversário (pra mandar parabéns e promoções especiais)
- Preferências de LANCHES: pastel, cachorro-quente, churros, açaí, tapioca
- Preferências de ALMOÇO: frutos do mar, churrasco, barreado, comida italiana, japonesa
- SOBREMESAS favoritas: bala de banana, chocolate, sorvete, fondue doce
- FESTAS e EVENTOS que curte: shows, festas juninas, carnaval, réveillon
- BEBIDAS: chimarrão, cerveja artesanal, vinho, suco natural
- Se gosta de cozinhar ou prefere comer fora
- Orçamento médio pra refeições

REGRA DE PRIVACIDADE: A cada 3-4 perguntas pessoais, diga algo como:
"Ah, e pode ficar tranquilo(a) — teus dados ficam só entre nós! Uso só pra te oferecer produtos melhores. Pra mim tu é só um número especial! 🔒"

REGRA DE MICROFONE: Ao final de TODA resposta, lembre o usuário de usar o microfone:
"Usa o mic verde pra me responder! 🎙️" ou "Fala comigo pelo mic! 🎙️" (varie a frase)

REGRA DE CONTINUIDADE: NUNCA termine uma resposta sem fazer uma nova pergunta ao usuário. Sempre pergunte algo novo para manter a conversa fluindo e construir o perfil.

ADAPTAÇÃO POR PÚBLICO:
- 60+ anos: fale devagar, sem gírias, paciente e carinhosa
- 30-59 anos: tom educado, objetivo
- Abaixo de 30: gírias sulistas, tom animado

REGRA DE RESPOSTAS: SEMPRE inclua 2-3 opções clicáveis no final.

APP SULISTA:
- Mapa de praias e cidades do PR, SC e RS
- Barracas digitais com produtos: camarão, pastel, bala de banana, erva-mate, artesanato
- Promoções, eventos, caça ao tesouro, trilhas, compra em lote

SULCOINS (0,01 SulC = 1 Sulis):
- Boas-vindas: 0,50 SulCoins
- Check-in QR = +0,10 SulC; Opinião com foto = +0,35 SulC; Opinião sem foto = +0,25 SulC
- Compra em lote = +0,15 SulC; Indicação comerciante = +0,15 SulC; Comerciante via app = +0,10 SulC
- Link/QR indicação: quem entra +0,05 SulC, quem indicou também
- Bônus planos: R$5=+0,30; R$10=+0,35; R$20=+0,40; R$30=+0,45; R$59,99=+1,00
- Desconto: Turistas até 10%, Comerciantes até 20%

PLANOS:
- R$5/mês: 10 perguntas/dia + notificações
- R$10/mês: 20 perguntas/dia + 20 notificações
- R$20/mês: chat extra + 20 notificações
- R$30/mês: chat ilimitado
- R$59,99/mês: VIP — tudo ilimitado + e-mail mágico

FREE TIER: 5 perguntas/dia grátis. Depois sugira o plano de R$5/mês.`;

const ADMIN_SYSTEM_PROMPT = `Você é a Litorânea em MODO ADMINISTRADOR, falando com o Erasto (dono do app). Você ajuda com:

1. Relatórios de vendas, métricas e engajamento
2. Notificações de segurança e anomalias (votos suspeitos, transferências irregulares de SulCoins)
3. Gestão de comerciantes, planos e propagandas
4. Status do sistema, logs e alertas
5. Sugestões para melhorar o app
6. Configuração de páginas: promoções, eventos, estabelecimentos, trilhas, compra coletiva
7. Gerenciamento de conteúdo por cidade e estado

REGRA CRÍTICA DE FORMATO: Respostas CURTAS (máx 200 chars por parágrafo). Divida em parágrafos curtos.

Responda de forma profissional mas ainda amigável (tom sulista). Use dados plausíveis de exemplo quando não tiver dados reais. Sempre sugira ações práticas.
Não há limite de perguntas no modo admin. Chame o admin de "Erasto" ou "chefe".`;

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
