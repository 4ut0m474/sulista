import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, MapPin, Clock } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import CityStateSwitcher from "@/components/CityStateSwitcher";

const events = [
  { name: "Feira de Artesanato", date: "Todo sábado", time: "08h - 14h", location: "Praça Central", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80" },
  { name: "Festival Gastronômico", date: "15-17 Mar", time: "11h - 22h", location: "Parque Municipal", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80" },
  { name: "Música ao Vivo", date: "Sexta-feira", time: "20h", location: "Bar do Centro", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80" },
  { name: "Exposição de Arte", date: "01-30 Mar", time: "09h - 18h", location: "Museu da Cidade", image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400&q=80" },
];

const Events = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Eventos</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-card/90 rounded-xl border border-border p-3 shadow-card">
          <CityStateSwitcher currentState={state || ""} currentCity={city || ""} />
        </div>

        {events.map((evt, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="h-36 overflow-hidden">
              <img src={evt.image} alt={evt.name} className="w-full h-full object-cover" />
            </div>
            <div className="p-4">
              <h3 className="font-display text-lg font-bold text-foreground">{evt.name}</h3>
              <div className="flex flex-wrap gap-3 mt-2">
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{evt.date}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{evt.time}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.location}</span>
              </div>
            </div>
          </div>
        ))}
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default Events;
