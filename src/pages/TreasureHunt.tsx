import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Map, Trophy, Gift, Phone } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import CityStateSwitcher from "@/components/CityStateSwitcher";

const TreasureHunt = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;
  const decodedCity = decodeURIComponent(city || "");

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
        <div className="bg-card/90 rounded-xl border border-border p-3 shadow-card">
          <CityStateSwitcher currentState={state || ""} currentCity={city || ""} />
        </div>

        {/* Mini map placeholder */}
        <div className="rounded-2xl overflow-hidden shadow-card border border-border">
          <div className="relative h-48">
            <img
              src={`https://maps.googleapis.com/maps/api/staticmap?center=${encodeURIComponent(decodedCity)},Brazil&zoom=14&size=600x300&maptype=roadmap&key=placeholder`}
              alt={`Mapa de ${decodedCity}`}
              className="w-full h-full object-cover hidden"
            />
            {/* Fallback map illustration */}
            <div className="w-full h-full bg-gradient-to-br from-primary/10 via-accent/10 to-secondary/10 flex flex-col items-center justify-center">
              <Map className="w-12 h-12 text-primary mb-2" />
              <p className="font-display text-lg font-bold text-foreground">Mapa de {decodedCity}</p>
              <p className="text-xs text-muted-foreground">Rota da Caça ao Tesouro</p>
              {/* Simple route illustration */}
              <svg className="mt-3 w-48 h-12" viewBox="0 0 200 50">
                <path d="M10 40 Q50 10 100 25 T190 10" stroke="hsl(var(--primary))" strokeWidth="2" fill="none" strokeDasharray="5,5" />
                <circle cx="10" cy="40" r="4" fill="hsl(var(--primary))" />
                <circle cx="60" cy="18" r="3" fill="hsl(var(--secondary))" />
                <circle cx="100" cy="25" r="3" fill="hsl(var(--secondary))" />
                <circle cx="145" cy="15" r="3" fill="hsl(var(--secondary))" />
                <circle cx="190" cy="10" r="4" fill="hsl(var(--destructive))" />
              </svg>
            </div>
          </div>
        </div>

        <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
          <Trophy className="w-10 h-10 text-secondary mx-auto mb-2" />
          <h2 className="font-display text-lg font-bold text-foreground">Explore o comércio local!</h2>
          <p className="text-sm text-muted-foreground mt-1">
            Visite os estabelecimentos participantes, encontre os tesouros e ganhe prêmios!
          </p>
        </div>

        <div className="space-y-3">
          {treasureSpots.map((spot, i) => (
            <div key={i} className={`bg-card rounded-xl border p-4 shadow-card flex items-center gap-3 ${spot.found ? "border-primary/30 bg-primary/5" : "border-border"}`}>
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
          <p className="text-sm text-muted-foreground mb-2">Quer participar como comerciante?</p>
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
