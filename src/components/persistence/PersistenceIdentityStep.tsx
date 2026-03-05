import { Camera, CreditCard, IdCard, Loader2, ShieldCheck, UserRound } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

interface PersistenceIdentityValues {
  fullName: string;
  documentType: "cpf" | "rg";
  documentId: string;
}

interface PersistenceIdentityStepProps {
  values: PersistenceIdentityValues;
  errors: Partial<Record<keyof PersistenceIdentityValues | "frontImage" | "backImage" | "selfieImage", string>>;
  frontPreview: string;
  backPreview: string;
  selfiePreview: string;
  loading: boolean;
  onChange: (field: keyof PersistenceIdentityValues, value: string) => void;
  onFileChange: (field: "front" | "back" | "selfie", file: File | null) => void;
  onSubmit: () => void;
}

const UploadField = ({
  label,
  hint,
  preview,
  capture,
  error,
  onChange,
}: {
  label: string;
  hint: string;
  preview: string;
  capture?: "environment" | "user";
  error?: string;
  onChange: (file: File | null) => void;
}) => (
  <div className="space-y-2">
    <Label className="text-xs font-bold text-muted-foreground">{label}</Label>
    <label className="flex cursor-pointer flex-col items-center justify-center rounded-2xl border border-dashed border-border bg-muted/40 p-4 text-center transition-colors hover:border-primary hover:bg-muted">
      {preview ? (
        <img src={preview} alt={label} className="mb-3 h-32 w-full rounded-xl object-cover" loading="lazy" />
      ) : (
        <div className="mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-primary/10 text-primary">
          <Camera className="h-6 w-6" />
        </div>
      )}
      <span className="text-sm font-bold text-foreground">{preview ? "Trocar imagem" : label}</span>
      <span className="mt-1 text-[11px] text-muted-foreground">{hint}</span>
      <input
        accept="image/*"
        capture={capture}
        className="hidden"
        type="file"
        onChange={(event) => onChange(event.target.files?.[0] ?? null)}
      />
    </label>
    {error ? <p className="text-xs font-semibold text-destructive">{error}</p> : null}
  </div>
);

const PersistenceIdentityStep = ({
  values,
  errors,
  frontPreview,
  backPreview,
  selfiePreview,
  loading,
  onChange,
  onFileChange,
  onSubmit,
}: PersistenceIdentityStepProps) => {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-primary/10 p-3 text-xs text-foreground">
        <div className="mb-1 flex items-center gap-2 font-bold text-primary">
          <ShieldCheck className="h-4 w-4" />
          Verificação segura
        </div>
        <p>Seus dados ficam criptografados com AES-256 e entram com status pendente até aprovação manual.</p>
      </div>

      <div className="space-y-2">
        <Label htmlFor="fullName" className="text-xs font-bold text-muted-foreground">Nome completo</Label>
        <div className="relative">
          <UserRound className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
          <Input
            id="fullName"
            maxLength={100}
            placeholder="Digite seu nome completo"
            value={values.fullName}
            onChange={(event) => onChange("fullName", event.target.value)}
            className="pl-10"
          />
        </div>
        {errors.fullName ? <p className="text-xs font-semibold text-destructive">{errors.fullName}</p> : null}
      </div>

      <div className="grid grid-cols-2 gap-3">
        <div className="space-y-2">
          <Label htmlFor="documentType" className="text-xs font-bold text-muted-foreground">Tipo</Label>
          <div className="relative">
            <IdCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <select
              id="documentType"
              value={values.documentType}
              onChange={(event) => onChange("documentType", event.target.value)}
              className="flex h-10 w-full rounded-md border border-input bg-background pl-10 pr-3 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
            >
              <option value="cpf">CPF</option>
              <option value="rg">RG</option>
            </select>
          </div>
        </div>

        <div className="space-y-2">
          <Label htmlFor="documentId" className="text-xs font-bold text-muted-foreground">CPF ou RG</Label>
          <div className="relative">
            <CreditCard className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
            <Input
              id="documentId"
              maxLength={20}
              placeholder="Só números"
              value={values.documentId}
              onChange={(event) => onChange("documentId", event.target.value)}
              className="pl-10"
            />
          </div>
        </div>
      </div>
      {errors.documentId ? <p className="text-xs font-semibold text-destructive">{errors.documentId}</p> : null}

      <UploadField
        label="Foto frente do documento"
        hint="Use a câmera traseira para pegar tudo nítido"
        preview={frontPreview}
        capture="environment"
        error={errors.frontImage}
        onChange={(file) => onFileChange("front", file)}
      />

      <UploadField
        label="Foto verso do documento"
        hint="Mostre o verso inteiro, sem cortes"
        preview={backPreview}
        capture="environment"
        error={errors.backImage}
        onChange={(file) => onFileChange("back", file)}
      />

      <UploadField
        label="Selfie de validação"
        hint="Use a câmera frontal com rosto bem iluminado"
        preview={selfiePreview}
        capture="user"
        error={errors.selfieImage}
        onChange={(file) => onFileChange("selfie", file)}
      />

      <Button onClick={onSubmit} disabled={loading} className="w-full rounded-xl py-6 text-sm font-bold">
        {loading ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
        Enviar verificação
      </Button>
    </div>
  );
};

export default PersistenceIdentityStep;
