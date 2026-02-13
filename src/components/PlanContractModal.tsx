import { useState } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { sanitizeText, MAX_NAME, MAX_PHONE } from "@/lib/validation";
import { FileText, Shield, AlertTriangle } from "lucide-react";

interface PlanContractModalProps {
  open: boolean;
  onClose: () => void;
  planName: string;
  displayPrice: string;
  priceDetail: string;
  whatsappNumber: string;
}

const PlanContractModal = ({ open, onClose, planName, displayPrice, priceDetail, whatsappNumber }: PlanContractModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [name, setName] = useState("");
  const [cpf, setCpf] = useState("");
  const [cnpj, setCnpj] = useState("");
  const [wantNota, setWantNota] = useState(false);
  const [acceptTerms, setAcceptTerms] = useState(false);
  const [acceptData, setAcceptData] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const resetForm = () => {
    setStep(1);
    setName("");
    setCpf("");
    setCnpj("");
    setWantNota(false);
    setAcceptTerms(false);
    setAcceptData(false);
    setErrors({});
  };

  const handleClose = () => {
    resetForm();
    onClose();
  };

  const formatCpf = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 11);
    if (digits.length <= 3) return digits;
    if (digits.length <= 6) return `${digits.slice(0, 3)}.${digits.slice(3)}`;
    if (digits.length <= 9) return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6)}`;
    return `${digits.slice(0, 3)}.${digits.slice(3, 6)}.${digits.slice(6, 9)}-${digits.slice(9)}`;
  };

  const formatCnpj = (value: string) => {
    const digits = value.replace(/\D/g, "").slice(0, 14);
    if (digits.length <= 2) return digits;
    if (digits.length <= 5) return `${digits.slice(0, 2)}.${digits.slice(2)}`;
    if (digits.length <= 8) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5)}`;
    if (digits.length <= 12) return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8)}`;
    return `${digits.slice(0, 2)}.${digits.slice(2, 5)}.${digits.slice(5, 8)}/${digits.slice(8, 12)}-${digits.slice(12)}`;
  };

  const validateStep1 = () => {
    const newErrors: Record<string, string> = {};
    const cleanName = sanitizeText(name);
    if (!cleanName || cleanName.length < 3) newErrors.name = "Nome completo é obrigatório (mín. 3 caracteres)";
    const cpfDigits = cpf.replace(/\D/g, "");
    if (cpfDigits.length !== 11) newErrors.cpf = "CPF deve ter 11 dígitos";
    if (wantNota) {
      const cnpjDigits = cnpj.replace(/\D/g, "");
      if (cnpjDigits.length !== 14) newErrors.cnpj = "CNPJ deve ter 14 dígitos";
    }
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleNext = () => {
    if (validateStep1()) setStep(2);
  };

  const handleContract = () => {
    if (!acceptTerms || !acceptData) {
      setErrors({ terms: "Você precisa aceitar os termos para continuar" });
      return;
    }

    const cleanName = sanitizeText(name);
    const cpfDigits = cpf.replace(/\D/g, "");
    const cnpjDigits = cnpj.replace(/\D/g, "");

    const message = `Olá! Quero adquirir o plano *${planName}* do Sulista.\n\n💰 ${priceDetail}\n\n👤 Nome: ${cleanName}\n📋 CPF: ${cpfDigits}${wantNota ? `\n🏢 CNPJ: ${cnpjDigits}` : ""}\n💳 Pagamento: PIX\n\n✅ Termos aceitos pelo contratante.`;

    const url = `https://web.whatsapp.com/send?phone=${whatsappNumber}&text=${encodeURIComponent(message)}`;
    window.open(url, "_blank", "noopener,noreferrer");
    handleClose();
  };

  return (
    <Dialog open={open} onOpenChange={(o) => !o && handleClose()}>
      <DialogContent className="max-w-sm mx-auto rounded-2xl bg-card border-border/50">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2 text-foreground">
            <FileText className="w-5 h-5 text-primary" />
            Contratação — {planName}
          </DialogTitle>
          <DialogDescription className="text-muted-foreground text-xs">
            {step === 1 ? "Preencha seus dados para contratação" : "Leia e aceite os termos"}
          </DialogDescription>
        </DialogHeader>

        {step === 1 ? (
          <div className="space-y-4">
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-3 flex items-start gap-2">
              <Shield className="w-4 h-4 text-primary mt-0.5 shrink-0" />
              <p className="text-xs text-muted-foreground">
                Seus dados serão usados exclusivamente para a contratação do plano e emissão de comprovante. Não armazenamos dados de usuários comuns.
              </p>
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contract-name" className="text-sm text-foreground">Nome completo *</Label>
              <Input
                id="contract-name"
                value={name}
                onChange={(e) => setName(e.target.value.slice(0, MAX_NAME))}
                placeholder="Seu nome completo"
                className="bg-background/50"
              />
              {errors.name && <p className="text-xs text-destructive">{errors.name}</p>}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="contract-cpf" className="text-sm text-foreground">CPF *</Label>
              <Input
                id="contract-cpf"
                value={cpf}
                onChange={(e) => setCpf(formatCpf(e.target.value))}
                placeholder="000.000.000-00"
                className="bg-background/50"
              />
              {errors.cpf && <p className="text-xs text-destructive">{errors.cpf}</p>}
            </div>

            <div className="flex items-center gap-2">
              <Checkbox
                id="want-nota"
                checked={wantNota}
                onCheckedChange={(c) => setWantNota(!!c)}
              />
              <Label htmlFor="want-nota" className="text-sm text-muted-foreground cursor-pointer">
                Desejo emitir nota fiscal (CNPJ)
              </Label>
            </div>

            {wantNota && (
              <div className="space-y-1.5">
                <Label htmlFor="contract-cnpj" className="text-sm text-foreground">CNPJ *</Label>
                <Input
                  id="contract-cnpj"
                  value={cnpj}
                  onChange={(e) => setCnpj(formatCnpj(e.target.value))}
                  placeholder="00.000.000/0000-00"
                  className="bg-background/50"
                />
                {errors.cnpj && <p className="text-xs text-destructive">{errors.cnpj}</p>}
              </div>
            )}

            <div className="bg-muted/50 rounded-xl p-3 border border-border/30">
              <p className="text-xs text-muted-foreground">
                💰 <strong className="text-foreground">Plano {planName}</strong> — R$ {displayPrice}/mês
              </p>
              <p className="text-xs text-muted-foreground mt-1">
                💳 Pagamento via <strong className="text-foreground">PIX</strong> — comprovante enviado pelo WhatsApp
              </p>
            </div>

            <button
              onClick={handleNext}
              className="w-full py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all"
            >
              Continuar
            </button>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="bg-muted/30 rounded-xl p-3 border border-border/30 max-h-48 overflow-y-auto text-xs text-muted-foreground space-y-2">
              <p className="font-bold text-foreground text-sm">Termos de Contratação</p>
              <p>1. <strong>Dados coletados:</strong> Nome completo, CPF{wantNota ? ", CNPJ" : ""} e comprovante de pagamento via PIX. Estes dados são necessários exclusivamente para a prestação do serviço contratado.</p>
              <p>2. <strong>Uso dos dados:</strong> Seus dados serão utilizados apenas para identificação do contratante, confirmação do pagamento e, quando solicitado, emissão de nota fiscal.</p>
              <p>3. <strong>Armazenamento:</strong> Os dados do contratante serão mantidos durante a vigência do plano e pelo período legal obrigatório após o encerramento.</p>
              <p>4. <strong>Pagamento:</strong> O pagamento é realizado via PIX. O comprovante deve ser enviado pela conversa do WhatsApp para ativação do plano.</p>
              <p>5. <strong>Cancelamento:</strong> O plano pode ser cancelado a qualquer momento via WhatsApp. Não há reembolso proporcional para o período restante.</p>
              <p>6. <strong>Privacidade:</strong> Não coletamos dados pessoais de usuários comuns do aplicativo. Apenas contratantes de planos fornecem informações pessoais.</p>
              <p>7. <strong>LGPD:</strong> Em conformidade com a Lei Geral de Proteção de Dados (Lei nº 13.709/2018), você pode solicitar a exclusão de seus dados a qualquer momento.</p>
            </div>

            <div className="space-y-3">
              <div className="flex items-start gap-2">
                <Checkbox
                  id="accept-terms"
                  checked={acceptTerms}
                  onCheckedChange={(c) => { setAcceptTerms(!!c); setErrors({}); }}
                />
                <Label htmlFor="accept-terms" className="text-xs text-muted-foreground cursor-pointer leading-snug">
                  Li e aceito os <strong className="text-foreground">Termos de Contratação</strong> e a política de cancelamento.
                </Label>
              </div>

              <div className="flex items-start gap-2">
                <Checkbox
                  id="accept-data"
                  checked={acceptData}
                  onCheckedChange={(c) => { setAcceptData(!!c); setErrors({}); }}
                />
                <Label htmlFor="accept-data" className="text-xs text-muted-foreground cursor-pointer leading-snug">
                  Autorizo a coleta e uso dos meus dados pessoais (nome, CPF{wantNota ? ", CNPJ" : ""}) conforme descrito nos termos.
                </Label>
              </div>
            </div>

            {errors.terms && (
              <div className="flex items-center gap-1.5 text-destructive">
                <AlertTriangle className="w-3.5 h-3.5" />
                <p className="text-xs">{errors.terms}</p>
              </div>
            )}

            <div className="flex gap-2">
              <button
                onClick={() => setStep(1)}
                className="flex-1 py-3 rounded-xl bg-muted text-foreground font-bold text-sm hover:bg-muted/80 transition-all"
              >
                Voltar
              </button>
              <button
                onClick={handleContract}
                disabled={!acceptTerms || !acceptData}
                className="flex-1 py-3 rounded-xl bg-primary text-primary-foreground font-bold text-sm hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50 disabled:scale-100"
              >
                Contratar
              </button>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default PlanContractModal;
