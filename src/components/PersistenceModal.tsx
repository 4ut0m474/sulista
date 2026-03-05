import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Loader2, Lock, Mail, Shield, UserCheck } from "lucide-react";
import { toast } from "sonner";
import { supabase } from "@/integrations/supabase/client";
import PersistenceIdentityStep from "@/components/persistence/PersistenceIdentityStep";
import {
  PERSISTENCE_KEYS,
  syncPersistenceLocalState,
  type PersistenceVerificationStatus,
} from "@/lib/persistence";
import { isValidEmail, persistenceIdentitySchema, sanitizeText } from "@/lib/validation";

interface PersistenceModalProps {
  open: boolean;
  onClose: () => void;
  onSuccess: (uuid: string) => void;
}

type Step = "pin" | "confirm-pin" | "email" | "waiting" | "identity" | "done";
type DocumentType = "cpf" | "rg";

type IdentityErrors = Partial<
  Record<"fullName" | "documentType" | "documentId" | "frontImage" | "backImage" | "selfieImage", string>
>;

const createEmptyErrors = (): IdentityErrors => ({});

const fileToCompressedDataUrl = async (file: File) => {
  const imageBitmap = await createImageBitmap(file);
  const scale = Math.min(1, 1600 / Math.max(imageBitmap.width, imageBitmap.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(imageBitmap.width * scale));
  canvas.height = Math.max(1, Math.round(imageBitmap.height * scale));

  const context = canvas.getContext("2d");
  if (!context) {
    throw new Error("Não foi possível processar a imagem");
  }

  context.drawImage(imageBitmap, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.78);
};

const PersistenceModal = ({ open, onClose, onSuccess }: PersistenceModalProps) => {
  const [step, setStep] = useState<Step>("pin");
  const [pin, setPin] = useState("");
  const [confirmPin, setConfirmPin] = useState("");
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);
  const [uuid, setUuid] = useState("");
  const [status, setStatus] = useState<PersistenceVerificationStatus | null>(null);
  const [verified, setVerified] = useState(false);
  const [identityValues, setIdentityValues] = useState({
    fullName: "",
    documentType: "cpf" as DocumentType,
    documentId: "",
  });
  const [identityErrors, setIdentityErrors] = useState<IdentityErrors>(createEmptyErrors());
  const [frontFile, setFrontFile] = useState<File | null>(null);
  const [backFile, setBackFile] = useState<File | null>(null);
  const [selfieFile, setSelfieFile] = useState<File | null>(null);
  const [frontPreview, setFrontPreview] = useState("");
  const [backPreview, setBackPreview] = useState("");
  const [selfiePreview, setSelfiePreview] = useState("");

  const isActive = useMemo(() => status === "identity_pending" || status === "pending" || status === "approved", [status]);

  const resetState = () => {
    setStep("pin");
    setPin("");
    setConfirmPin("");
    setEmail("");
    setLoading(false);
    setUuid("");
    setStatus(null);
    setVerified(false);
    setIdentityValues({ fullName: "", documentType: "cpf", documentId: "" });
    setIdentityErrors(createEmptyErrors());
    setFrontFile(null);
    setBackFile(null);
    setSelfieFile(null);
    setFrontPreview("");
    setBackPreview("");
    setSelfiePreview("");
  };

  const handleClose = () => {
    resetState();
    onClose();
  };

  const loadStatus = async () => {
    const { data: sessionData } = await supabase.auth.getSession();
    if (!sessionData.session) return;

    const { data, error } = await supabase.functions.invoke("persist-anonymous", {
      body: { action: "status" },
    });

    if (error) {
      throw error;
    }

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

    if (nextStatus === "approved") {
      setStep("done");
    } else if (nextStatus === "pending") {
      setStep("done");
    } else if (nextStatus === "identity_pending" || nextStatus === "rejected") {
      setStep("identity");
    }
  };

  useEffect(() => {
    if (!open) return;

    loadStatus().catch(() => undefined);
  }, [open]);

  const handlePinSubmit = () => {
    if (!/^\d{6}$/.test(pin)) {
      toast.error("PIN deve ter exatamente 6 dígitos numéricos");
      return;
    }

    setStep("confirm-pin");
  };

  const handleConfirmPin = () => {
    if (pin !== confirmPin) {
      toast.error("Os PINs não coincidem. Tente novamente.");
      setConfirmPin("");
      return;
    }

    setStep("email");
  };

  const handleEmailSubmit = async () => {
    const normalizedEmail = sanitizeText(email).toLowerCase();
    if (!normalizedEmail || !isValidEmail(normalizedEmail)) {
      toast.error("Insira um e-mail válido");
      return;
    }

    setLoading(true);
    try {
      sessionStorage.setItem(PERSISTENCE_KEYS.pendingPin, pin);
      sessionStorage.setItem(PERSISTENCE_KEYS.pendingEmail, normalizedEmail);
      sessionStorage.setItem(PERSISTENCE_KEYS.pendingPersist, "true");

      const { error } = await supabase.auth.signInWithOtp({
        email: normalizedEmail,
        options: {
          shouldCreateUser: true,
          emailRedirectTo: window.location.origin,
        },
      });

      if (error) throw error;

      setEmail(normalizedEmail);
      setStep("waiting");
      toast.success("Link de confirmação enviado para seu e-mail.");
    } catch (err: any) {
      toast.error(err.message || "Erro ao enviar link");
    } finally {
      setLoading(false);
    }
  };

  const handleIdentityChange = (field: "fullName" | "documentType" | "documentId", value: string) => {
    setIdentityValues((current) => ({ ...current, [field]: value }));
    setIdentityErrors((current) => ({ ...current, [field]: undefined }));
  };

  const handleFileChange = (field: "front" | "back" | "selfie", file: File | null) => {
    const preview = file ? URL.createObjectURL(file) : "";

    if (field === "front") {
      if (frontPreview) URL.revokeObjectURL(frontPreview);
      setFrontFile(file);
      setFrontPreview(preview);
      setIdentityErrors((current) => ({ ...current, frontImage: undefined }));
      return;
    }

    if (field === "back") {
      if (backPreview) URL.revokeObjectURL(backPreview);
      setBackFile(file);
      setBackPreview(preview);
      setIdentityErrors((current) => ({ ...current, backImage: undefined }));
      return;
    }

    if (selfiePreview) URL.revokeObjectURL(selfiePreview);
    setSelfieFile(file);
    setSelfiePreview(preview);
    setIdentityErrors((current) => ({ ...current, selfieImage: undefined }));
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
        const field = issue.path[0] as keyof IdentityErrors;
        nextErrors[field] = issue.message;
      }
    }

    if (!frontFile) nextErrors.frontImage = "Envie a foto da frente do documento";
    if (!backFile) nextErrors.backImage = "Envie a foto do verso do documento";
    if (!selfieFile) nextErrors.selfieImage = "Envie sua selfie";

    if (Object.keys(nextErrors).length > 0) {
      setIdentityErrors(nextErrors);
      return;
    }

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
          frontImage,
          backImage,
          selfieImage,
        },
      });

      if (error) throw error;

      const nextStatus = (data.status as PersistenceVerificationStatus | undefined) ?? "pending";
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

  const title = step === "done" ? "Persistência criada" : "Crie sua persistência";

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-black/60 backdrop-blur-sm p-4">
      <div className="w-full max-w-md overflow-hidden rounded-3xl border border-border bg-card shadow-2xl">
        <div className="bg-gradient-ocean p-5 text-ocean-foreground">
          <div className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-2xl bg-ocean-foreground/10">
              <Shield className="h-6 w-6" />
            </div>
            <div>
              <h2 className="font-display text-xl font-bold">{title}</h2>
              <p className="text-xs text-ocean-foreground/80">PIN, e-mail e identidade em fluxo seguro</p>
            </div>
          </div>
        </div>

        <div className="space-y-4 p-5">
          {step === "pin" && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-primary" />
                <span className="font-semibold">Crie PIN (6 dígitos)</span>
              </div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={pin}
                onChange={(event) => setPin(event.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-center font-mono text-2xl tracking-[0.45em] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
                autoFocus
              />
              <button
                onClick={handlePinSubmit}
                disabled={pin.length !== 6}
                className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Continuar
              </button>
            </>
          )}

          {step === "confirm-pin" && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Lock className="h-4 w-4 text-primary" />
                <span className="font-semibold">Confirme PIN</span>
              </div>
              <input
                type="password"
                inputMode="numeric"
                maxLength={6}
                value={confirmPin}
                onChange={(event) => setConfirmPin(event.target.value.replace(/\D/g, ""))}
                placeholder="••••••"
                className="w-full rounded-2xl border border-border bg-background px-4 py-4 text-center font-mono text-2xl tracking-[0.45em] text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleConfirmPin}
                disabled={confirmPin.length !== 6}
                className="w-full rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Confirmar PIN
              </button>
            </>
          )}

          {step === "email" && (
            <>
              <div className="flex items-center gap-2 text-sm text-muted-foreground">
                <Mail className="h-4 w-4 text-primary" />
                <span className="font-semibold">Seu e-mail</span>
              </div>
              <p className="text-xs text-muted-foreground">
                Confirmamos seu e-mail uma vez e depois você entra só com o PIN neste aparelho.
              </p>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="voce@email.com"
                className="w-full rounded-2xl border border-border bg-background px-4 py-3 text-sm text-foreground outline-none transition focus:border-primary focus:ring-2 focus:ring-primary"
              />
              <button
                onClick={handleEmailSubmit}
                disabled={loading || !email}
                className="flex w-full items-center justify-center gap-2 rounded-2xl bg-primary py-3 text-sm font-bold text-primary-foreground transition hover:opacity-90 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
                Enviar link de confirmação
              </button>
            </>
          )}

          {step === "waiting" && (
            <div className="space-y-3 py-6 text-center">
              <Loader2 className="mx-auto h-10 w-10 animate-spin text-primary" />
              <p className="text-sm font-semibold text-foreground">Confirme seu e-mail para continuar</p>
              <p className="text-xs text-muted-foreground">
                Depois da primeira confirmação, este aparelho vai pedir só o seu PIN.
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
                <p className="text-base font-bold text-foreground">Recebi! Aprovo em minutos.</p>
                <p className="text-xs text-muted-foreground">
                  {status === "approved"
                    ? "Sua persistência já está aprovada e ativa."
                    : "Sua persistência já ficou ligada e os documentos estão em análise."}
                </p>
              </div>
              {uuid ? (
                <div className="rounded-2xl bg-muted/50 p-3">
                  <p className="mb-1 text-[10px] uppercase tracking-[0.2em] text-muted-foreground">ID do usuário</p>
                  <p className="break-all font-mono text-xs text-foreground">{uuid}</p>
                </div>
              ) : null}
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

          {isActive && step !== "done" ? (
            <p className="text-center text-[11px] text-muted-foreground">
              Persistência ligada. Status atual: <strong className="text-foreground">{verified ? "aprovado" : status === "rejected" ? "reenvio necessário" : "pendente"}</strong>
            </p>
          ) : null}
        </div>
      </div>
    </div>
  );
};

export default PersistenceModal;
