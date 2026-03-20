import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ArrowLeft, KeyRound, Lock } from "lucide-react";
import { InputOTP, InputOTPGroup, InputOTPSlot } from "@/components/ui/input-otp";

const CriarPin = () => {
  const navigate = useNavigate();
  const [pin, setPin] = useState("");

  const handleCriar = () => {
    if (pin.length !== 6) return;
    localStorage.setItem("pin", pin);
    navigate("/confirmar-pin");
  };

  return (
    <div className="min-h-screen flex flex-col bg-background">
      <div className="sticky top-0 z-20 bg-background/95 backdrop-blur border-b border-border px-4 py-3 flex items-center gap-3">
        <button onClick={() => navigate(-1)} className="p-1">
          <ArrowLeft className="w-5 h-5 text-foreground" />
        </button>
        <Lock className="w-5 h-5 text-primary" />
        <h1 className="text-sm font-black text-foreground">Criar PIN</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center px-6 py-10 space-y-6">
        <div className="rounded-2xl bg-primary/10 p-4 text-center max-w-sm">
          <KeyRound className="h-10 w-10 text-primary mx-auto mb-3" />
          <h2 className="text-base font-black text-foreground mb-1">Crie seu PIN de 6 dígitos</h2>
          <p className="text-xs text-muted-foreground">
            Esse PIN será usado para acessar sua conta. Memorize-o.
          </p>
        </div>

        <div className="flex justify-center">
          <InputOTP maxLength={6} value={pin} onChange={setPin}>
            <InputOTPGroup>
              <InputOTPSlot index={0} />
              <InputOTPSlot index={1} />
              <InputOTPSlot index={2} />
              <InputOTPSlot index={3} />
              <InputOTPSlot index={4} />
              <InputOTPSlot index={5} />
            </InputOTPGroup>
          </InputOTP>
        </div>

        <button
          onClick={handleCriar}
          disabled={pin.length !== 6}
          className="w-full max-w-sm py-3.5 rounded-xl bg-primary text-primary-foreground font-black text-sm transition-all disabled:opacity-40 disabled:cursor-not-allowed flex items-center justify-center gap-2"
        >
          <Lock className="w-4 h-4" />
          Criar PIN
        </button>

        <p className="text-center text-muted-foreground text-[10px]">
          🔒 Guarde seu PIN. Você precisará dele para acessar o app.
        </p>
      </div>
    </div>
  );
};

export default CriarPin;
