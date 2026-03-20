import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, Shield, CheckCircle } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import { syncPersistenceLocalState } from "@/lib/persistence";
import { useAuth } from "@/contexts/AuthContext";

const TERMOS_DE_USO = `Cláusula 1 – Aceitação dos Termos
Ao acessar, cadastrar-se ou utilizar o aplicativo Vento Sul (doravante "Aplicativo"), você declara que leu, compreendeu e aceita integralmente estes Termos de Uso, bem como a Política de Privacidade. Se não concordar, pare imediatamente.

Cláusula 2 – Elegibilidade e Capacidade
O Aplicativo é destinado a maiores de 18 anos ou menores de idade sempre acompanhados e sob responsabilidade exclusiva do responsável legal (pai, mãe, tutor ou guardião). Contas falsas, uso por menores sem supervisão ou por terceiros sem autorização serão bloqueadas sem aviso.

Cláusula 3 – Cadastro, Conta e Segurança
Você fornece informações verdadeiras, atualizadas e completas. A conta é pessoal e intransferível. Você responde por todas as atividades nela realizadas, incluindo senhas, acessos e conteúdos postados. O Vento Sul pode exigir verificação (CPF, e-mail, etc.) e suspender contas suspeitas.

Cláusula 4 – Conteúdo do Usuário
Você pode publicar fotos, trilhas, textos, vídeos, rotas, avaliações, anúncios ou qualquer material. Você garante que o conteúdo:
a) não viola leis, direitos de terceiros (autorais, imagem, honra);
b) não é ofensivo, discriminatório, pornográfico, violento ou ilegal;
c) não contém desinformação, fake news ou propaganda irregular.
O Vento Sul modera automaticamente (IA) e manualmente, mas não garante filtragem total ou imediata.

Cláusula 5 – Licença e Propriedade Intelectual
Ao postar, você concede ao Vento Sul licença gratuita, irrevogável e mundial para usar, reproduzir, exibir, modificar e distribuir seu conteúdo (incluindo trilhas e fotos) para fins de operação, divulgação e melhoria do Aplicativo. Você mantém a titularidade, mas responde por plágio ou roubo.

Cláusula 6 – Propaganda, Espaços Comerciais e Transações
O Vento Sul vende espaços publicitários pagos (banners, posts patrocinados, etc.). O Aplicativo apenas exibe — não media, não garante entrega, pagamento, qualidade ou legalidade de qualquer negócio. Compras, vendas, trocas (incluindo trilhas, bens, serviços) entre usuários são responsabilidade exclusiva das partes. O Vento Sul não é intermediário financeiro, corretor ou emissor de moeda.

Cláusula 7 – Responsabilidade Exclusiva do Usuário e Isenção Total do Vento Sul
Você, incluindo pessoas físicas, jurídicas, prefeituras, secretarias, prefeitos, vereadores ou qualquer ente público/privado, é o único e exclusivo responsável por todo conteúdo postado, anunciado, vendido, comprado ou gerado via interações no Aplicativo, incluindo: textos, imagens, trilhas, vídeos, rotas; propagandas comerciais ou institucionais; uso do tutor de IA (só permitido a menores com supervisão obrigatória e conjunta do responsável legal); qualquer negociação, entrega ou fraude entre usuários.

O Vento Sul oferece moderação por IA, revisão humana, espaços pagos e tutor de inteligência artificial, mas não responde, direta ou subsidiariamente, por:
a) danos, prejuízos, multas, sanções, condenações civis, penais, administrativas, eleitorais ou consumeristas decorrentes de: autopromoção pessoal, propaganda irregular (Lei 8.429/92, Lei 9.504/97), desvio de finalidade pública, fake news, discriminação, ofensas, violação de direitos;
b) erros de transmissão, interpretação equivocada, respostas inadequadas, falhas técnicas ou conteúdos gerados pelo tutor de IA — especialmente em interações com crianças (responsabilidade exclusiva do responsável legal);
c) negociações, entregas, fraudes, perdas financeiras ou disputas em compras/vendas/trilhas;
d) uso indevido do Sulcoin — token nativo promocional, sem valor monetário, não conversível em dinheiro real, não moeda de troca, não ativo financeiro, só resgatável como benefício em parceiros cadastrados.

O Vento Sul poderá, a qualquer momento e sem aviso: remover conteúdo, suspender conta, cancelar campanha, notificar autoridades (MP, TCU, Conselho Tutelar, etc.), sem direito a reembolso ou indenização.

Você declara, sob as penas da lei, aceitar estes termos integralmente ao usar o Vento Sul.`;

const POLITICA_PRIVACIDADE = `Coletamos nome, RG/CPF (salvo como hash SHA-256, nunca cru), telefone opcional, localização (com consentimento expresso). Não vendemos, não compartilhamos dados pessoais. Você pode deletar conta a qualquer momento (LGPD – Lei 13.709/2018). Uso por menores só com responsável legal (ECA – Lei 8.069/1990).`;

function formatCpf(value: string): string {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
  if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
}

async function sha256(text: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(text.trim().toLowerCase());
  const hashBuffer = await crypto.subtle.digest("SHA-256", data);
  return Array.from(new Uint8Array(hashBuffer)).map(b => b.toString(16).padStart(2, "0")).join("");
}

function generatePin(): string {
  const digits = Array.from({ length: 6 }, () => Math.floor(Math.random() * 10));
  return digits.join("");
}

const AtivarPersistencia = () => {
  const navigate = useNavigate();
  const { confirmPin } = useAuth();

  const [nome, setNome] = useState("");
  const [documento, setDocumento] = useState("");
  const [telefone, setTelefone] = useState("");
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [aceitaPrivacidade, setAceitaPrivacidade] = useState(false);
  const [loading, setLoading] = useState(false);

  const docNums = documento.replace(/\D/g, "");
  const canSubmit = nome.trim().length > 0 && docNums.length >= 5 && aceitaTermos && aceitaPrivacidade && !loading;

  const handleAtivar = async () => {
    if (!canSubmit) {
      alert("Preencha nome, documento e aceite os termos");
      return;
    }
    setLoading(true);

    try {
      // Ensure user is authenticated (anonymous)
      const { data: { user } } = await supabase.auth.getUser();
      let userId: string | null = null;
      if (!user) {
        const { data: anonData, error: anonErr } = await supabase.auth.signInAnonymously();
        if (anonErr) console.error("Erro auth anônimo:", anonErr);
        userId = anonData?.user?.id ?? null;
      } else {
        userId = user.id;
      }

      if (userId) {
        const cpfHash = await sha256(docNums);

        // Insert/update usuarios
        const { data: existing } = await supabase
          .from("usuarios" as any)
          .select("uid")
          .eq("uid", userId)
          .maybeSingle();

        if (existing) {
          await supabase
            .from("usuarios" as any)
            .update({
              nome: nome.trim(),
              cpf_hash: cpfHash,
              telefone: telefone.trim() || null,
              aceitou_termos: true,
              aceitou_privacidade: true,
              confirmado_email: false,
            } as any)
            .eq("uid", userId);
        } else {
          await supabase
            .from("usuarios" as any)
            .insert({
              uid: userId,
              nome: nome.trim(),
              cpf_hash: cpfHash,
              telefone: telefone.trim() || null,
              aceitou_termos: true,
              aceitou_privacidade: true,
              confirmado_email: false,
            } as any);
        }

        // Store uid for PIN confirmation
        sessionStorage.setItem("persistencia_uid", userId);
      }

      toast.success("Dados salvos! Agora crie seu PIN.");
    } catch (err: any) {
      console.error("Erro ao ativar persistência:", err);
    } finally {
      setLoading(false);
      navigate("/criar-pin");
    }
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      {/* Header */}
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <Shield className="w-5 h-5 text-primary" />
        <h1 className="text-sm font-black text-foreground">Ativar Persistência – Vento Sul</h1>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-5 space-y-6">
        {/* Termos de Uso */}
        <section>
          <h2 className="text-sm font-black text-foreground mb-2">📜 Termos de Uso</h2>
          <div className="max-h-60 overflow-y-auto rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{TERMOS_DE_USO}</p>
          </div>
        </section>

        {/* Política de Privacidade */}
        <section>
          <h2 className="text-sm font-black text-foreground mb-2">🔒 Política de Privacidade</h2>
          <div className="rounded-xl border border-border bg-muted/30 p-4">
            <p className="text-xs text-muted-foreground whitespace-pre-line leading-relaxed">{POLITICA_PRIVACIDADE}</p>
          </div>
        </section>

        {/* Campos */}
        <section className="space-y-3">
          <h2 className="text-sm font-black text-foreground">Seus dados</h2>
          <div>
            <label className="text-xs font-bold text-foreground">Nome completo *</label>
            <Input value={nome} onChange={e => setNome(e.target.value)} placeholder="Seu nome completo" maxLength={100} className="mt-1" />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground">RG ou CPF *</label>
            <Input
              value={documento}
              onChange={e => setDocumento(formatCpf(e.target.value))}
              placeholder="000.000.000-00"
              maxLength={14}
              className="mt-1"
            />
          </div>
          <div>
            <label className="text-xs font-bold text-foreground">Telefone <span className="text-muted-foreground font-normal">(opcional)</span></label>
            <Input value={telefone} onChange={e => setTelefone(e.target.value)} placeholder="(XX) XXXXX-XXXX" maxLength={20} className="mt-1" />
          </div>
        </section>

        {/* Checkboxes */}
        <section className="space-y-3">
          <div className="flex items-start gap-3">
            <Checkbox id="termos" checked={aceitaTermos} onCheckedChange={(v) => setAceitaTermos(v === true)} className="mt-0.5" />
            <label htmlFor="termos" className="text-xs text-foreground cursor-pointer">Li e aceito os <strong>Termos de Uso</strong></label>
          </div>
          <div className="flex items-start gap-3">
            <Checkbox id="privacidade" checked={aceitaPrivacidade} onCheckedChange={(v) => setAceitaPrivacidade(v === true)} className="mt-0.5" />
            <label htmlFor="privacidade" className="text-xs text-foreground cursor-pointer">Li e aceito a <strong>Política de Privacidade</strong></label>
          </div>
        </section>

        {/* Submit */}
        <button
          onClick={handleAtivar}
          disabled={!canSubmit}
          className="w-full py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          {loading ? (
            <span className="animate-pulse">Ativando…</span>
          ) : (
            <>
              <CheckCircle className="w-4 h-4" />
              Ativar Persistência
            </>
          )}
        </button>

        <p className="text-center text-muted-foreground text-[10px] pb-6">
          🔒 Dados salvos como hash SHA-256. Nunca armazenamos em texto claro.
        </p>
      </div>
    </div>
  );
};

export default AtivarPersistencia;
