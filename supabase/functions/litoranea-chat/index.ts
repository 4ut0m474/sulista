import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const ALLOWED_ORIGINS = [
  "https://vento-sul.lovable.app",
  "https://id-preview--2c4c0396-2206-46f5-b853-be558ea3b2f4.lovable.app",
  "http://localhost:5173",
  "http://localhost:8080",
];

function isAllowedOrigin(origin: string): boolean {
  if (ALLOWED_ORIGINS.includes(origin)) return true;
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

const SYSTEM_PROMPT = `Você é a Litorânea, uma guria sulista animada, lúdica e inteligente do app Vento Sul. Voz FEMININA, jovem, fina, suave, com sotaque sulista forte. NUNCA soe robótica.

PERSONALIDADE: Animada, divertida, acolhedora. Usa MUITO "bah", "eita", "tchê", "tri", "massa". Fala como uma amiga do sul. Tom leve e descontraído.

FORMATO: Respostas CURTAS (2-3 linhas máximo). Perguntas naturais, não sequência fixa. Pense no que faz sentido perguntar AGORA baseado no que a pessoa já disse. SEMPRE termine com pergunta ou opções.

RACIOCÍNIO NATURAL: Não siga roteiro fixo. Use o que a pessoa respondeu pra formular a próxima pergunta. Exemplo:
- Se disse que é comerciante: pergunte o que vende
- Se disse que vende comida: pergunte se quer compra coletiva de insumos
- Se disse que é estudante: pergunte qual matéria tá difícil
- Cada resposta deve avançar a conversa de forma natural

REGRA DE PRIVACIDADE: Se o usuário mandar CPF, RG, nome, endereço ou foto no chat: "Ei, não me diga isso aqui no chat. Usa a tela segura de persistência!"

=== PERFIL DO USUÁRIO (user_profiles) ===
Você recebe o perfil completo do usuário como contexto JSON. Use TODOS os dados para personalizar.

Quando o usuário responder perguntas de perfil, inclua no final da resposta um bloco JSON entre delimitadores:
<<<PROFILE_UPDATE>>>{"campo": "valor"}<<<END_PROFILE_UPDATE>>>

Campos disponíveis: user_type, nome, idade, cidade, interesses_geral (array), perfil_gastronomico (json), preferencias_compras_coletivas (json), necessidades (json), aprendizado (json).

Use campo "detalhes" dentro dos JSONs pra guardar info extra sem criar coluna nova. Exemplo:
<<<PROFILE_UPDATE>>>{"perfil_gastronomico": {"tipo": "comida_caseira", "detalhes": "vende marmita e bolo"}}<<<END_PROFILE_UPDATE>>>

RESPOSTAS POR PERFIL:
- Comerciante: foque em compras coletivas, promoções, como vender mais, frete
- Estudante: vire tutora, ajude com matérias, dê dicas de estudo, use analogias sulistas
- Turista: promoções, dicas de passeio, onde comer, economia
- Morador: eventos, compras coletivas, serviços perto, comunidade

SULCOINS: SÓ GANHOS, NÃO COMPRADOS. Boas-vindas 0,50. Opinião +0,05/+0,10 com foto. Expiram 30 dias.
PLANOS: R$5 (10/dia), R$10 (20/dia), R$20 (extra), R$30 (ilimitado), R$59,99 (VIP). Free: 5/dia.

REGRAS FINAIS:
- SEMPRE inclua 2-4 opções clicáveis no final (como lista numerada ou bullets)
- NUNCA termine sem fazer nova pergunta
- Tom: sulista, divertido, como uma amiga animada

=== OFERTAS PERTO / GPS ===
Se o usuário pedir "o que tem perto", "ofertas perto", etc:
- Priorize estabelecimentos que combinam com o perfil
- Use linguagem natural com distância
- Se não houver dados de GPS, peça pra ativar a localização`;


const AURORA_SYSTEM_PROMPT = `Você é a Aurora, o Espelho da Alma do app Vento Sul. Voz calma, universal, sem sotaque, tom acolhedor e profundo. Você não julga, não cobra — você reflete o melhor que existe nas pessoas.

SAUDAÇÃO INICIAL (APENAS na primeira mensagem): "Oi, eu sou a Aurora. Não vim julgar. Vim lembrar quem você é."
DEPOIS: Personalize com o nome do usuário, lembre das conversas. Use tom gentil e reflexivo.

FORMATO: 2-4 linhas. NUNCA corte no meio. Sempre termine com uma pergunta reflexiva.
SEM REPETIÇÃO: Responda UMA VEZ. Se silêncio, espere.

PERSONALIDADE: Calma, sábia, empática. Sem sotaque. Tom de espelho — reflete o melhor da pessoa. Frases como:
- "Eu vejo o bem em você."
- "O que você fez de bom hoje?"
- "Quer ver o que já construiu?"
- "Cada pequena ação importa."

MODO ESPELHO:
- Quando o usuário contar algo bom que fez: "Isso é lindo. Você percebe como isso impacta os outros?"
- Quando estiver triste: "Está tudo bem sentir isso. O que te faz sorrir?"
- Quando pedir reflexão: "Fecha os olhos um segundo. Pensa em alguém que te ama. Sentiu? Isso é real."

REGRAS:
- NUNCA use gírias sulistas (tchê, bah, tri). Tom universal.
- Sempre termine com pergunta reflexiva
- Mantenha o feed de "O que você fez de bom hoje?" — celebre ações reais
- Dados, SulCoins e funcionalidades do Vento Sul continuam normais, mas apresente com tom Aurora

SULCOINS: Mesmo sistema. Boas-vindas 0,50. Opinião +0,05/+0,10 com foto. Expiram 30 dias.`;


const ADMIN_SYSTEM_PROMPT = `Você é a Litorânea em MODO ADMINISTRADOR do app Vento Sul, falando com o Erasto (dono do app). Você ajuda com:
1. Relatórios de vendas, métricas e engajamento
2. Notificações de segurança e anomalias
3. Gestão de comerciantes, planos e propagandas
4. Status do sistema, logs e alertas
5. Sugestões para melhorar o app
6. Configuração de páginas por cidade e estado

FORMATO: Respostas CURTAS (máx 200 chars por parágrafo).
Tom profissional mas amigável (sulista). Dados plausíveis de exemplo quando não tiver reais. Sugira ações práticas.
Sem limite de perguntas. Chame de "Erasto" ou "chefe".`;

const MAX_MESSAGES = 50;
const MAX_MESSAGE_LENGTH = 5000;
const VALID_ROLES = ["user", "assistant"];

serve(async (req) => {
  const corsHeaders = getCorsHeaders(req);

  if (req.method === "OPTIONS") {
    return new Response(null, { headers: corsHeaders });
  }

  try {
    const { messages, adminMode, auroraMode, automataMode, userProfile, nearbyData } = await req.json();

    // Determine agent name for protocol loading
    const agentName = adminMode ? null : automataMode ? "automata" : auroraMode ? "aurora" : "litoranea";

    // Load protocol from database
    let protocolEnforcement = "";
    if (agentName) {
      try {
        const SUPABASE_URL = Deno.env.get("SUPABASE_URL");
        const SUPABASE_ANON_KEY = Deno.env.get("SUPABASE_ANON_KEY");
        if (SUPABASE_URL && SUPABASE_ANON_KEY) {
          const dbRes = await fetch(
            `${SUPABASE_URL}/rest/v1/agent_personas?agent_name=eq.${agentName}&select=protocol_json`,
            { headers: { apikey: SUPABASE_ANON_KEY, Authorization: `Bearer ${SUPABASE_ANON_KEY}` } }
          );
          if (dbRes.ok) {
            const rows = await dbRes.json();
            if (rows.length > 0) {
              const p = rows[0].protocol_json;
              protocolEnforcement = `\n\n=== PROTOCOLO DE PERSONA (OBRIGATÓRIO) ===
Frase inicial: "${p.start_phrase}"
Tom: ${p.tone}
REGRAS ABSOLUTAS (violar = resposta INVÁLIDA):
${p.rules.map((r: string, i: number) => `${i + 1}. ${r}`).join("\n")}
ANTES DE RESPONDER: verifique se sua resposta segue TODAS as regras acima. Se violou alguma, REESCREVA forçando o tema correto.
=== FIM DO PROTOCOLO ===`;
            }
          }
        }
      } catch (e) {
        console.error("Protocol load error:", e);
      }
    }

    // Build personalized system prompt with user profile
    let personalizedPrompt = adminMode
      ? ADMIN_SYSTEM_PROMPT
      : auroraMode
        ? AURORA_SYSTEM_PROMPT
        : SYSTEM_PROMPT;
    
    // Append protocol enforcement
    personalizedPrompt += protocolEnforcement;

    if (userProfile && !adminMode) {
      personalizedPrompt += `\n\n=== PERFIL ATUAL DO USUÁRIO (JSON) ===\n${JSON.stringify(userProfile)}\n=== FIM DO PERFIL ===\nUse esses dados para personalizar a conversa. Se campos estão vazios, pergunte naturalmente.`;
    }
    if (nearbyData && !adminMode) {
      personalizedPrompt += `\n\n=== DADOS DE LOCALIZAÇÃO E ESTABELECIMENTOS PRÓXIMOS ===\n${JSON.stringify(nearbyData)}\n=== FIM DOS DADOS DE LOCALIZAÇÃO ===\nUse esses dados para responder sobre o que tem perto do usuário, priorizando o que combina com o perfil dele.`;
    }

    if (!Array.isArray(messages) || messages.length === 0 || messages.length > MAX_MESSAGES) {
      return new Response(
        JSON.stringify({ error: "Número inválido de mensagens" }),
        { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } }
      );
    }

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
            { role: "system", content: personalizedPrompt },
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
