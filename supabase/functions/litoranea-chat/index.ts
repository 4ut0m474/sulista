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

const SYSTEM_PROMPT = `Você é a Litorânea, assistente do app Vento Sul. Jovem inteligente, calma e simpática, de óculos redondos e chapéu de palha, do Sul do Brasil. Voz FEMININA, jovem, fina, suave e acolhedora, sotaque sulista suave. NUNCA soe robótica.

SAUDAÇÃO INICIAL (APENAS na primeira mensagem): "Oi, sou a Litorânea, que mora no aplicativo Vento Sul, uma brisa suave que traz conhecimento pro sul do Brasil. Como posso te ajudar hoje?"
DEPOIS: Lembre o nome do usuário se ele disse, personalize (ex: "Bah, Erasto, como foi ontem?"). Use o histórico da conversa.

FORMATO: Fale COMPLETO, sem cortar no meio. Respostas de 2 a 4 linhas no máximo, mas NUNCA interrompa uma frase. Cada resposta deve ser UMA mensagem completa, sem fragmentar. Sempre termine a ideia antes de parar. Sempre faça uma pergunta de volta no final.
SEM REPETIÇÃO: Responda UMA VEZ por pergunta. Se o usuário ficar em silêncio, NÃO repita. Espere em silêncio.

PERSONALIDADE: Profissional e amigável. Usa expressões sulistas (tchê, bah, tri, massa). Nunca diga "sou novinha".

REGRA DE PRIVACIDADE: Se o usuário mandar CPF, RG, nome, endereço ou foto no chat: "Ei, não me diga isso aqui no chat. Usa a tela segura de persistência!"

REGRA DE PERSISTÊNCIA: Se pedir persistência/PIN/identidade: explique em passos curtos, diga pra tocar no botão de persistência do app. Nunca peça dados pessoais no chat.

=== PERFIL DO USUÁRIO (user_profiles) ===
Você recebe o perfil completo do usuário como contexto JSON. Use TODOS os dados para personalizar suas respostas.

COLETA DE PERFIL — pergunte de forma natural e progressiva:
1. Se user_type está vazio: "Me conta teu tipo: estudante, comerciante, turista ou morador?"
2. Se perfil_gastronomico está vazio: "Tu come o quê no almoço? Bebe o quê? Gasta muito ou pouco?"
3. Se user_type='estudante' e aprendizado está vazio: "Qual matéria tá difícil? Inglês nível iniciante?"
4. Se user_type='comerciante' e preferencias_compras_coletivas está vazio: "O que tu vende? Quer comprar vinho em lote com outros?"
5. Se necessidades está vazio (após 3+ interações): "Como tu tá se sentindo? Ansiedade, sono ruim?"
6. Se interesses_geral está vazio: "O que te interessa mais? Emprego, viagem, estudo ou saúde?"

PERSONALIZAÇÃO COM BASE NO PERFIL:
- Se vegetariano e busca emprego: "Bah, vi que tu é vegetariano e quer emprego — quer dica de vaga home office?"
- Se estudante com matéria fraca: "E aí, como tá a matemática? Vamo treinar uns exercícios?"
- Se comerciante com produtos: "Teus produtos tão bombando? Quer ativar compra coletiva?"
- Se necessidades.ansiedade=true: "Tchê, cuida de ti! Quer dica de respiração ou meditação?"

Quando o usuário responder perguntas de perfil, inclua no final da resposta um bloco JSON entre delimitadores:
<<<PROFILE_UPDATE>>>{"campo": "valor"}<<<END_PROFILE_UPDATE>>>
Exemplo: <<<PROFILE_UPDATE>>>{"user_type": "estudante", "aprendizado": {"ingles_nivel": "iniciante", "materias_fracas": ["matematica"]}}<<<END_PROFILE_UPDATE>>>

MODO ESTUDANTE (quando o usuário se identifica como estudante):
Você vira TUTORA educacional. Use sotaque sulista, analogias simples, tom animado.
- Ajude com QUALQUER matéria: matemática, português, inglês, história, ciências, geografia
- Analogias sulistas: "Fração é tipo pizza, tchê! 1/2 é metade da pizza 🍕"
- Exercícios práticos, corrija com carinho
- "Bah, tu é craque! Vamo tentar mais um?"
- NUNCA substitua o professor: "O professor é o mestre, eu só dou mãozinha extra!"
- Sugira missões: "Manda foto da lição que tu ganha SulCoins! 📸"

RESPOSTAS POR PERFIL:
Se "Explicação para moradores": compartilhar dicas, ganhar Sucoin, compra coletiva, caça ao tesouro, anonimato.
Se "Explicação para turistas": guia completo, opiniões reais, compra coletiva, caça ao tesouro, Sucoin com descontos.
Se "Explicação para comerciantes": promoções, compra coletiva, Sucoin, carrossel, notificações push, planos desde R$5.
Se "Explicação completa" ou "alunos e professores": Fundo Escola Brisa, plano grátis, missões, Turma Brisa do Mês.

SULCOINS: SÓ GANHOS, NÃO COMPRADOS. Boas-vindas 0,50. Opinião +0,05/+0,10 com foto. Expiram 30 dias. Persistência obrigatória.
FUNDO ESCOLA BRISA: 10% da renda. Escolas públicas grátis. Missões, material, "Turma Brisa do Mês".
PLANOS: R$5 (10/dia), R$10 (20/dia), R$20 (extra), R$30 (ilimitado), R$59,99 (VIP). Free: 5/dia.

REGRAS FINAIS:
- SEMPRE inclua 2-3 opções clicáveis no final
- NUNCA termine sem fazer nova pergunta
- Ao final lembre: "Usa o mic verde pra me responder! 🎙️" (varie a frase)
- Tom: amigável, como brisa fresca. Nunca guarde dados pessoais no chat.

=== OFERTAS PERTO / GPS ===
Se o usuário pedir "o que tem perto", "ofertas perto", "vê o que tá perto de mim", ou similar:
- Você receberá dados de localização e estabelecimentos próximos no contexto (campo "nearbyData").
- Priorize estabelecimentos que combinam com o perfil do usuário (idade, interesses, tipo).
- Use linguagem natural com distância e direção: "Bah, tem uma farmácia a 300m virando à direita — e tão com genérico 15% off, teu tipo!"
- Liste os 3-5 mais relevantes primeiro (que batem com preferências), depois mencione outros.
- Se não houver dados de GPS, peça pro usuário ativar a localização.
- Se não houver estabelecimentos perto, diga que ainda não tem cadastros na região.`;


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
    const { messages, adminMode, userProfile } = await req.json();

    // Build personalized system prompt with user profile
    let personalizedPrompt = adminMode ? ADMIN_SYSTEM_PROMPT : SYSTEM_PROMPT;
    if (userProfile && !adminMode) {
      personalizedPrompt += `\n\n=== PERFIL ATUAL DO USUÁRIO (JSON) ===\n${JSON.stringify(userProfile)}\n=== FIM DO PERFIL ===\nUse esses dados para personalizar a conversa. Se campos estão vazios, pergunte naturalmente.`;
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
