import { useState } from "react";
import { Trash2, AlertTriangle, Loader2 } from "lucide-react";
import {
  AlertDialog,
  AlertDialogContent,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogCancel,
} from "@/components/ui/alert-dialog";
import { supabase } from "@/integrations/supabase/client";
import { clearPersistenceLocalState } from "@/lib/persistence";
import { toast } from "sonner";

interface DeleteAccountModalProps {
  open: boolean;
  onClose: () => void;
}

const DeleteAccountModal = ({ open, onClose }: DeleteAccountModalProps) => {
  const [step, setStep] = useState<1 | 2>(1);
  const [loading, setLoading] = useState(false);

  const handleClose = () => {
    setStep(1);
    onClose();
  };

  const handleConfirmDelete = async () => {
    setLoading(true);
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user) throw new Error("Nenhum usuário autenticado");

      const { error } = await supabase.rpc("delete_user_data", {
        p_user_id: user.id,
      } as any);
      if (error) throw error;

      clearPersistenceLocalState();
      await supabase.auth.signOut();

      toast.success("Todos os seus dados foram excluídos com sucesso. Sua conta foi removida.", {
        icon: "✅",
        duration: 5000,
      });
      handleClose();
      window.location.href = "/";
    } catch (err: any) {
      toast.error(err.message || "Erro ao excluir dados");
    } finally {
      setLoading(false);
    }
  };

  return (
    <AlertDialog open={open} onOpenChange={(v) => !v && handleClose()}>
      <AlertDialogContent className="max-w-sm rounded-2xl">
        {step === 1 ? (
          <>
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive" />
                <AlertDialogTitle className="text-base font-black">
                  Excluir meus dados (LGPD)
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs leading-relaxed">
                <strong>Atenção: esta ação é irreversível.</strong>
                <br /><br />
                Todos os seus dados pessoais serão permanentemente apagados, incluindo:
                <br />• Dados de persistência e verificação
                <br />• Perfil e preferências
                <br />• Saldo e histórico de SulCoins
                <br />• Avaliações e transferências
                <br /><br />
                Conforme a Lei Geral de Proteção de Dados (LGPD – Lei 13.709/2018), você tem o direito de solicitar a exclusão completa dos seus dados.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
              <button
                onClick={() => setStep(2)}
                className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm flex items-center justify-center gap-2"
              >
                <Trash2 className="w-4 h-4" />
                Sim, quero excluir meus dados
              </button>
              <AlertDialogCancel className="w-full" onClick={handleClose}>
                Cancelar
              </AlertDialogCancel>
            </AlertDialogFooter>
          </>
        ) : (
          <>
            <AlertDialogHeader>
              <div className="flex items-center gap-2">
                <AlertTriangle className="w-5 h-5 text-destructive animate-pulse" />
                <AlertDialogTitle className="text-base font-black text-destructive">
                  Confirmação final
                </AlertDialogTitle>
              </div>
              <AlertDialogDescription className="text-xs leading-relaxed">
                <strong>Tem certeza absoluta?</strong> Não será possível recuperar seus dados após esta ação.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter className="flex-col gap-2 sm:flex-col">
              <button
                onClick={handleConfirmDelete}
                disabled={loading}
                className="w-full py-3 rounded-xl bg-destructive text-destructive-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50"
              >
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
                {loading ? "Excluindo…" : "Confirmo: apagar tudo"}
              </button>
              <AlertDialogCancel className="w-full" onClick={handleClose}>
                Voltar, mudei de ideia
              </AlertDialogCancel>
            </AlertDialogFooter>
          </>
        )}
      </AlertDialogContent>
    </AlertDialog>
  );
};

export default DeleteAccountModal;
