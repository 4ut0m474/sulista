import { useAuth } from "@/contexts/AuthContext";
import PinLoginModal from "@/components/PinLoginModal";

/**
 * Renders a full-screen PIN gate when a persistent user opens the app
 * without having verified their PIN this session.
 */
const PinGate = ({ children }: { children: React.ReactNode }) => {
  const { needsPinGate, confirmPin, loading } = useAuth();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="animate-pulse text-muted-foreground text-sm">Carregando...</div>
      </div>
    );
  }

  if (needsPinGate) {
    return (
      <PinLoginModal
        open={true}
        onSuccess={() => {
          confirmPin();
        }}
        onCancel={() => {
          // No anonymous mode — user must enter PIN
        }}
      />
    );
  }

  return <>{children}</>;
};

export default PinGate;
