import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Settings, Image, Edit, Phone, LogIn, Eye, EyeOff } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import CityStateSwitcher from "@/components/CityStateSwitcher";
import { useState, useEffect } from "react";
import { getAdminConfig, pageBackgrounds } from "@/lib/adminData";
import { sanitizeText, MAX_NAME } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";

const MerchantPanel = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;

  const [stallName, setStallName] = useState("");
  const [stallCode, setStallCode] = useState("");
  const [showCode, setShowCode] = useState(false);
  const [loggedIn, setLoggedIn] = useState(false);
  const [error, setError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);


  const [config, setConfig] = useState({ whatsapp: "(41) 99235-4211", whatsappNumber: "5541992354211", email: "eerb1976@gmail.com" });

  useEffect(() => {
    getAdminConfig().then(setConfig);
  }, []);


  const handleMerchantLogin = async () => {
    const name = sanitizeText(stallName);
    const code = sanitizeText(stallCode);
    if (!name || !code) {
      setError("Preencha todos os campos");
      return;
    }
    if (name.length > MAX_NAME) {
      setError(`Nome deve ter no máximo ${MAX_NAME} caracteres`);
      return;
    }
    if (code.length !== 32) {
      setError("O código secreto deve ter 32 caracteres");
      return;
    }
    setLoginLoading(true);
    try {
      // Server-side validation via Edge Function
      const { data, error: fnError } = await supabase.functions.invoke("verify-merchant-code", {
        body: {
          stateAbbr: state || "",
          cityName: city ? decodeURIComponent(city) : "",
          code: code.toUpperCase(),
        },
      });
      if (fnError) {
        setError("Erro ao verificar código. Tente novamente.");
        setLoginLoading(false);
        return;
      }
      if (!data?.valid) {
        setError(data?.error || "Código secreto inválido ou barraca não encontrada");
        setLoginLoading(false);
        return;
      }
      setStallName(data.stallName || name);
      setLoggedIn(true);
      setError("");
    } catch {
      setError("Erro de conexão. Tente novamente.");
    }
    setLoginLoading(false);
  };

  if (!loggedIn) {
    return (
      <div className="min-h-screen bg-background pb-20">
        <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
            <h1 className="font-display text-xl font-bold">Painel do Comerciante</h1>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          <div className="bg-card/90 rounded-xl border border-border p-3 shadow-card">
            <CityStateSwitcher currentState={state || ""} currentCity={city || ""} />
          </div>

          <div className="bg-card rounded-xl border border-border p-6 shadow-card text-center space-y-4">
            <div className="w-16 h-16 rounded-full bg-primary/10 flex items-center justify-center mx-auto">
              <LogIn className="w-8 h-8 text-primary" />
            </div>
            <h2 className="font-display text-xl font-bold text-foreground">Login do Comerciante</h2>
            <p className="text-sm text-muted-foreground">Entre com seu nome e o código secreto de 32 caracteres da sua barraca</p>

            <div className="space-y-3 text-left">
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Nome do Comerciante</label>
                <input
                  type="text"
                  value={stallName}
                  onChange={e => setStallName(e.target.value)}
                  placeholder="Seu nome"
                  maxLength={MAX_NAME}
                  className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
                />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground mb-1 block">Código Secreto (32 caracteres)</label>
                <div className="relative">
                  <input
                    type={showCode ? "text" : "password"}
                    value={stallCode}
                    onChange={e => setStallCode(e.target.value.toUpperCase().slice(0, 32))}
                    placeholder="Ex: A1B2C3D4E5F6G7H8I9J0K1L2M3N4O5P6"
                    maxLength={32}
                    className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none pr-12 font-mono tracking-wider"
                  />
                  <button onClick={() => setShowCode(!showCode)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                    {showCode ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{stallCode.length}/32 caracteres</p>
              </div>

              {error && <p className="text-xs text-destructive font-semibold">{error}</p>}

              <button
                onClick={handleMerchantLogin}
                disabled={loginLoading}
                className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold text-sm shadow-lg hover:scale-[1.02] active:scale-95 transition-all disabled:opacity-50"
              >
                {loginLoading ? "Verificando..." : "Entrar"}
              </button>
            </div>
          </div>

          <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
            <p className="text-sm text-muted-foreground mb-2">Ainda não tem uma barraca?</p>
            <button
              onClick={() => navigate(`${base}/plans`)}
              className="px-6 py-3 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-sm shadow-gold hover:scale-[1.02] active:scale-95 transition-all"
            >
              Ver Planos
            </button>
            <p className="text-xs text-muted-foreground mt-3 flex items-center justify-center gap-1">
              <Phone className="w-3 h-3" /> {config.whatsapp}
            </p>
          </div>

        </div>

        <FooterNav stateAbbr={state || ""} cityName={city || ""} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Painel do Comerciante</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
          <Settings className="w-10 h-10 text-primary mx-auto mb-2" />
          <h2 className="font-display text-lg font-bold text-foreground">Olá, {stallName}!</h2>
          <p className="text-sm text-muted-foreground mt-1">Gerencie sua barraca digital abaixo.</p>
        </div>

        <div className="space-y-3">
          {[
            { icon: Image, label: "Alterar Fotos", desc: "Atualize as imagens dos seus produtos" },
            { icon: Edit, label: "Editar Produtos", desc: "Mude preços, nomes e descrições" },
          ].map((item, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-4 shadow-card flex items-center gap-3">
              <div className="w-10 h-10 rounded-full bg-primary/10 flex items-center justify-center">
                <item.icon className="w-5 h-5 text-primary" />
              </div>
              <div>
                <h3 className="font-bold text-sm text-foreground">{item.label}</h3>
                <p className="text-xs text-muted-foreground">{item.desc}</p>
              </div>
            </div>
          ))}
        </div>

        <button onClick={() => setLoggedIn(false)} className="w-full py-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          Sair
        </button>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default MerchantPanel;
