import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Map, Trophy, Gift, Phone } from "lucide-react";
import FooterNav from "@/components/FooterNav";

const TreasureHunt = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;

  const treasureSpots = [
    { name: "Padaria do João", hint: "Onde o pão quente te espera toda manhã", found: false },
    { name: "Livraria Cultural", hint: "Conhecimento em cada esquina", found: false },
    { name: "Café da Praça", hint: "O melhor espresso da cidade", found: true },
    { name: "Floricultura Verde", hint: "Cores que alegram seu dia", found: false },
    { name: "Ateliê Arte Sul", hint: "Criatividade sulista em cada peça", found: false },
  ];

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Caça ao Tesouro</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
          <Trophy className="w-10 h-10 text-gold mx-auto mb-2" />
          <h2 className="font-display text-lg font-bold text-foreground">Explore o comércio local!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visite os estabelecimentos participantes, encontre os tesouros e ganhe prêmios!
          </p>
        </div>

        <div className="space-y-3">
          {treasureSpots.map((spot, i) => (
            <div key={i} className={`bg-card rounded-xl border p-4 shadow-card flex items-center gap-3 ${spot.found ? "border-primary/30" : "border-border"}`}>
              <div className={`w-10 h-10 rounded-full flex items-center justify-center ${spot.found ? "bg-primary/10" : "bg-muted"}`}>
                {spot.found ? <Gift className="w-5 h-5 text-primary" /> : <Map className="w-5 h-5 text-muted-foreground" />}
              </div>
              <div className="flex-1">
                <h3 className={`font-bold text-sm ${spot.found ? "text-primary" : "text-foreground"}`}>{spot.name}</h3>
                <p className="text-xs text-muted-foreground">{spot.hint}</p>
              </div>
              {spot.found && <span className="text-[10px] bg-primary/10 text-primary px-2 py-0.5 rounded-full font-bold">Encontrado!</span>}
            </div>
          ))}
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
          <p className="text-sm text-muted-foreground mb-2">Quer participar da Caça ao Tesouro como comerciante?</p>
          <a
            href="https://wa.me/5541992355421?text=Quero participar da Caça ao Tesouro no Sulista!"
            target="_blank" rel="noopener noreferrer"
            className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-gradient-gold text-primary-foreground font-bold text-sm shadow-gold"
          >
            <Phone className="w-4 h-4" /> Fale conosco
          </a>
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default TreasureHunt;
