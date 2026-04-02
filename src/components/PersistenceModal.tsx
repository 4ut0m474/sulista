import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Mail, Shield, UserCheck, RefreshCw } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PersistenceIdentityStep from "@/components/persistence/PersistenceIdentityStep";
import {
  syncPersistenceLocalState,
  clearPersistenceLocalState,
  type PersistenceVerificationStatus,
} from "@/lib/persistence";
import { isValidEmail, persistenceIdentitySchema, sanitizeText } from "@/lib/validation";
import { Input } from "@/components/ui/input";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";

interface PersistenceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (uuid: string) => void;
}

type Step = "form" | "waiting" | "identity" | "done";
type DocumentType = "cpf" | "rg";

type IdentityErrors = Partial<
  Record<"fullName" | "documentType" | "documentId" | "frontImage" | "backImage" | "selfieImage", string>
>;

const TERMOS_RESUMO = `Ao usar o Vento Sul você aceita nossos Termos de Uso e Política de Privacidade. Seus dados ficam criptografados (AES-256), não vendemos informações e você pode deletar tudo a qualquer momento (LGPD).`;

function formatCpf(value: string): string {
  const nums = value.replace(/\D/g, "").slice(0, 11);
  if (nums.length <= 3) return nums;
  if (nums.length <= 6) return `${nums.slice(0, 3)}.${nums.slice(3)}`;
  if (nums.length <= 9) return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6)}`;
  return `${nums.slice(0, 3)}.${nums.slice(3, 6)}.${nums.slice(6, 9)}-${nums.slice(9)}`;
}

function isValidCpf(cpf: string): boolean {
  const nums = cpf.replace(/\D/g, "");
  if (nums.length !== 11) return false;
  if (/^(\d)\1{10}$/.test(nums)) return false;
  let sum = 0;
  for (let i = 0; i < 9; i++) sum += parseInt(nums[i]) * (10 - i);
  let rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  if (rest !== parseInt(nums[9])) return false;
  sum = 0;
  for (let i = 0; i < 10; i++) sum += parseInt(nums[i]) * (11 - i);
  rest = (sum * 10) % 11;
  if (rest === 10) rest = 0;
  return rest === parseInt(nums[10]);
}

const fileToCompressedDataUrl = async (file: File) => {
  const imageBitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(imageBitmap.width, imageBitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(imageBitmap.width * scale));
  canvas.height = Math.max(1, Math.round(imageBitmap.height * scale));
  const context = canvas.getContext("2d");
  if (!context) throw new Error("Não foi possível processar a imagem");
  context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.78);
};

const PersistenceModal = ({ open, onClose, onSuccess }: PersistenceModalProps) => {
  const [step, setStep] = useState<Step>("form");
  const [nome, setNome] = useState("");
  const [cpf, setCpf] = useState("");
  const [email, setEmail] = useState("");
  const [aceitaTermos, setAceitaTermos] = useState(false);
  const [loading, setLoading] = useState(false);
  const [uuid, setUuid] = useState("");
  const [status, setStatus] = useState<PersistenceVerificationStatus | null>(null);
  const [verified, setVerified] = useState(false);
  const [resendCount, setResendCount] = useState(0);
  const [showTermos, setShowTermos] = useState(false);

  // Identity step state
  const [identityValues, setIdentityValues] = useState({
    fullName: "",
    documentType: "cpf" as DocumentType,
    documentId: "",
  });
  const [identityErrors, setIdentityErrors] = useState<IdentityErrors>({});
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");
  const [selfiePreview, setSelfiePreview] = useState("");

  const isActive = useMemo(() => status === "identity_pending" || status === "pending" || status === "approved", [status]);

  const cpfNums = cpf.replace(/\D/g, "");
  const canSubmitForm = nome.trim().length >= 3 && isValidCpf(cpf) && email.trim().length > 0 && isValidEmail(email.trim().toLowerCase()) && aceitaTermos && !loading;

  const resetState = () => {
    setStep("form");
    setNome("");
    setCpf("");
    setEmail("");
    setAceitaTermos(false);
    setLoading(false);
    setUuid("");
    setStatus(null);
    setVerified(false);
    setResendCount(0);
    setShowTermos(false);
    setIdentityValues({ fullName: "", documentType: "cpf", documentId: "" });
    setIdentityErrors({});
    setFrontFile(null);
    setBackFile(null);
    setSelfieFile(null);
    setFrontPreview("");
    setBackPreview("");
    setSelfiePreview("");
  };

  const handleClose = () => {
    if (step !== "done" && !isActive) {
      clearPersistenceLocalState();
    }
    resetState();
    onClose();
  };

  const loadStatus = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;

    const { data, error } = await supabase.functions.invoke("persist-anonymous", {
      body: { action: "status" },
    });

    if (error) throw error;
    if (!data) return;

    const nextStatus = (data.status as PersistenceVerificationStatus | undefined) ?? null;
    setStatus(nextStatus);
    setVerified(Boolean(data.verified));
    setUuid(data.uuid || sessionData.session.user.id);
    setEmail(data.email || sessionData.session.user.email || "");

    if (nextStatus) {
      syncPersistenceLocalState({
        userId: data.uuid || sessionData.session.user.id,
        status: nextStatus,
        verified: true,
      });
    }

    if (nextStatus === "approved" || nextStatus === "pending") {
      setStep("done");
    } else if (nextStatus === "identity_pending" || nextStatus === "rejected") {
      setStep("identity");
    }
  };

  useEffect(() => {
    if (!open) return;
    loadStatus().catch(() => undefined);
  }, [open]);

  // Listen for auth state change (user clicks email link)
  useEffect(() => {
    if (!open || step !== "waiting") return;

    const { data: { subscription } } = supabase.auth.onAuthStateChange(async (event, session) => {
      if (session?.user && (event === "SIGNED_IN" || event === "TOKEN_REFRESHED")) {
        // User confirmed email - create persistence
        setLoading(true);
        try {
          const { data, error } = await supabase.functions.invoke("persist-anonymous", {
            body: {
              action: "create",
              email: email.trim().toLowerCase(),
              fullName: nome.trim(),
              cpf: cpf.replace(/\D/g, ""),
            },
          });

          if (error) throw error;

          const nextStatus = (data.status as PersistenceVerificationStatus) ?? "identity_pending";
          setStatus(nextStatus);
          setUuid(data.uuid || session.user.id);
          syncPersistenceLocalState({ userId: data.uuid || session.user.id, status: nextStatus, verified: true });
          onSuccess(data.uuid || session.user.id);

          if (nextStatus === "identity_pending" || nextStatus === "rejected") {
            setIdentityValues({ fullName: nome.trim(), documentType: "cpf", documentId: cpf });
            setStep("identity");
          } else {
            setStep("done");
          }
          toast.success("E-mail confirmado! Persistência ativada.");
        } catch (err: any) {
          toast.error(err.message || "Erro ao ativar persistência");
        } finally {
          setLoading(false);
        }
      }
    });

    return () => subscription.unsubscribe();
  }, [open, step, nome, cpf, email]);

  const handleFormSubmit = async () => {
    if (!canSubmitForm) return;

    const normalizedEmail = sanitizeText(email).toLowerCase();

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/confirmar-persistencia`,
        },
      });

      if (error) throw error;

      setEmail(normalizedEmail);
      setStep("waiting");
      toast.success("Link de confirmação enviado para seu e-mail!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar e-mail");
    } finally {
      setLoading(false);
    }
  };

  const handleResend = async () => {
    if (resendCount >= 3) {
      toast.error("Limite de reenvio atingido (3x/hora)");
      return;
    }

    setLoading(true);
    try {
      const { error } = await supabase.auth.signInWithOtp({
        email: email,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: `${window.location.origin}/confirmar-persistencia`,
        },
      });

      if (error) throw error;
      setResendCount(prev => prev + 1);
      toast.success("E-mail reenviado!");
    } catch (err: any) {
      toast.error(err.message || "Erro ao reenviar");
    } finally {
      setLoading(false);
    }
  };

  const handleIdentityChange = (field: "fullName" | "documentType" | "documentId", value: string) => {
    setIdentityValues(cur => ({ ...cur, [field]: value }));
    setIdentityErrors(cur => ({ ...cur, [field]: undefined }));
  };

  const handleFileChange = (field: "front" | "back" | "selfie", file: File | null) => {
    const preview = file ? URL.createObjectURL(file) : "";
    if (field === "front") { if (frontPreview) URL.revokeObjectURL(frontPreview); setFrontFile(file); setFrontPreview(preview); setIdentityErrors(c => ({ ...c, frontImage: undefined })); }
    else if (field === "back") { if (backPreview) URL.revokeObjectURL(backPreview); setBackFile(file); setBackPreview(preview); setIdentityErrors(c => ({ ...c, backImage: undefined })); }
    else { if (selfiePreview) URL.revokeObjectURL(selfiePreview); setSelfieFile(file); setSelfiePreview(preview); setIdentityErrors(c => ({ ...c, selfieImage: undefined })); }
  };

  const handleIdentitySubmit = async () => {
    const parsed = persistenceIdentitySchema.safeParse({
      fullName: identityValues.fullName,
      documentType: identityValues.documentType,
      documentId: identityValues.documentId,
    });

    const nextErrors: IdentityErrors = {};
    if (!parsed.success) {
      for (const issue of parsed.error.issues) {
        nextErrors[issue.path[0] as keyof IdentityErrors] = issue.message;
      }
    }
    if (!frontFile) nextErrors.frontImage = "Envie a foto da frente do documento";
    if (!backFile) nextErrors.backImage = "Envie a foto do verso do documento";
    if (!selfieFile) nextErrors.selfieImage = "Envie sua selfie";

    if (Object.keys(nextErrors).length > 0) { setIdentityErrors(nextErrors); return; }

    setLoading(true);
    try {
      const [frontImage, backImage, selfieImage] = await Promise.all([
        fileToCompressedDataUrl(frontFile!),
        fileToCompressedDataUrl(backFile!),
        fileToCompressedDataUrl(selfieFile!),
      ]);

      const { data, error } = await supabase.functions.invoke("persist-anonymous", {
        body: {
          action: "submit-identity",
          fullName: parsed.data.fullName,
          documentType: parsed.data.documentType,
          documentId: parsed.data.documentId,
          frontImage, backImage, selfieImage,
        },
      });

      if (error) throw error;

      const nextStatus = (data.status as PersistenceVerificationStatus) ?? "pending";
      setStatus(nextStatus);
      setVerified(Boolean(data.verified));
      syncPersistenceLocalState({ userId: data.uuid || uuid, status: nextStatus, verified: true });
      onSuccess(data.uuid || uuid);
      setStep("done");
      toast.success("Recebi! Aprovo em minutos.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar verificação");
    } finally {
      setLoading(false);
    }
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md max-h-[90vh] overflow-y-auto rounded-3xl border border-border bg-card shadow-2xl">
        <div className="bg-gradient-ocean p-5 text-ocean-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-foreground/10">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">
                {step === "done" ? "Persistência ativada!" : "Ativar Persistência"}
              </h2>
              <p className="text-xs text-ocean-foreground/80">
                {step === "done" ? "Seu progresso fica salvo" : "Confirme seus dados e e-mail"}
              </p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {step === "form" && (
            <>
              {/* Termos */}
              <div className="rounded-2xl bg-primary/10 p-3 text-xs text-foreground">
                <p className="leading-relaxed">{TERMOS_RESUMO}</p>
                <button
                  onClick={() => setShowTermos(!showTermos)}
                  className="mt-2 text-primary font-bold underline text-[11px]"
                >
                  {showTermos ? "Fechar termos completos" : "Ler Termos de Uso e Política de Privacidade"}
                </button>
                {showTermos && (
                  <div className="mt-2 max-h-40 overflow-y-auto rounded-xl border border-border bg-muted/30 p-3">
                    <p className="text-[10px] text-muted-foreground whitespace-pre-line leading-relaxed">
                      {`Cláusula 1 – Aceitação dos Termos\nAo acessar, cadastrar-se ou utilizar o aplicativo Vento Sul, você declara que leu, compreendeu e aceita integralmente estes Termos de Uso e a Política de Privacidade.\n\nCláusula 2 – Dados e Privacidade\nColetamos nome e CPF (salvo como hash SHA-256, nunca em texto). Não vendemos dados. Você pode deletar sua conta a qualquer momento (LGPD – Lei 13.709/2018).\n\nCláusula 3 – Segurança\nDados criptografados com AES-256. O Vento Sul não armazena senhas ou PINs.`}
                    </p>
                  </div>
                )}
              </div>

              {/* Nome */}
              <div className="space-y-1.5">
                <Label htmlFor="persist-nome" className="text-xs font-bold text-muted-foreground">Nome completo *</Label>
                <Input
                  id="persist-nome"
                  value={nome}
                  onChange={e => setNome(e.target.value)}
                  placeholder="Seu nome completo"
                  maxLength={100}
                />
                {nome.length > 0 && nome.trim().length < 3 && (
                  <p className="text-xs text-destructive">Mínimo 3 caracteres</p>
                )}
              </div>

              {/* CPF */}
              <div className="space-y-1.5">
                <Label htmlFor="persist-cpf" className="text-xs font-bold text-muted-foreground">CPF *</Label>
                <Input
                  id="persist-cpf"
                  value={cpf}
                  onChange={e => setCpf(formatCpf(e.target.value))}
                  placeholder="000.000.000-00"
                  maxLength={14}
                  inputMode="numeric"
                />
                {cpfNums.length === 11 && !isValidCpf(cpf) && (
                  <p className="text-xs text-destructive">CPF inválido</p>
                )}
              </div>

              {/* Email */}
              <div className="space-y-1.5">
                <Label htmlFor="persist-email" className="text-xs font-bold text-muted-foreground">E-mail *</Label>
                <Input
                  id="persist-email"
                  type="email"
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  placeholder="voce@email.com"
                  maxLength={255}
                />
              </div>

              {/* Checkbox termos */}
              <div className="flex items-start gap-3">
                <Checkbox
                  id="persist-termos"
                  checked={aceitaTermos}
                  onCheckedChange={v => setAceitaTermos(v === true)}
                  className="mt-0.5"
                />
                <label htmlFor="persist-termos" className="text-xs text-foreground cursor-pointer">
                  Li e aceito os <strong>Termos de Uso</strong> e a <strong>Política de Privacidade</strong>
                </label>
              </div>

              <button
                onClick={handleFormSubmit}
                disabled={!canSubmitForm}
                className="w-full rounded-2xl bg-primary py-3.5 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50 flex items-center justify-center gap-2"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : <CheckCircle2 className="h-4 w-4" />}
                Confirmar e Ativar
              </button>
            </>
          )}

          {step === "waiting" && (
            <div className="space-y-4 py-4 text-center">
              <Mail className="mx-auto h-12 w-12 text-primary" />
              <div className="space-y-2">
                <p className="text-base font-bold text-foreground">Confirmação via e-mail</p>
                <p className="text-sm text-muted-foreground">
                  Enviamos um link para <strong className="text-foreground">{email}</strong>.
                </p>
                <p className="text-xs text-muted-foreground">
                  Clique no link para finalizar. Link válido por 24h.
                </p>
              </div>

              <button
                onClick={handleResend}
                disabled={loading || resendCount >= 3}
                className="flex items-center justify-center gap-2 mx-auto rounded-2xl border border-border bg-muted px-6 py-2.5 text-xs font-bold text-foreground transition hover:bg-muted/80 disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-3.5 w-3.5 animate-spin" /> : <RefreshCw className="h-3.5 w-3.5" />}
                Reenviar e-mail ({3 - resendCount} restantes)
              </button>

              <p className="text-[10px] text-muted-foreground">
                Não recebeu? Verifique sua caixa de spam.
              </p>
            </div>
          )}

          {step === "identity" && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <UserCheck className="h-4 w-4 text-primary" />
                <span className="font-semibold">Identidade</span>
              </div>
              <PersistenceIdentityStep
                values={identityValues}
                errors={identityErrors}
                frontPreview={frontPreview}
                backPreview={backPreview}
                selfiePreview={selfiePreview}
                loading={loading}
                onChange={handleIdentityChange}
                onFileChange={handleFileChange}
                onSubmit={handleIdentitySubmit}
              />
            </>
          )}

          {step === "done" && (
            <div className="space-y-4 py-4 text-center">
              <CheckCircle2 className="mx-auto h-12 w-12 text-success" />
              <div className="space-y-1">
                <p className="text-base font-bold text-foreground">
                  {status === "approved" ? "Persistência aprovada!" : "Persistência ativada!"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {status === "approved"
                    ? "Sua persistência está ativa e aprovada."
                    : "Agora seu progresso fica salvo. Bem-vindo de volta — tudo salvo!"}
                </p>
              </div>
              <button
                onClick={handleClose}
                className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90"
              >
                Fechar
              </button>
            </div>
          )}

          {step !== "done" && (
            <button onClick={handleClose} className="w-full py-1 text-center text-xs text-muted-foreground transition hover:text-foreground">
              Cancelar
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

export default PersistenceModal;
