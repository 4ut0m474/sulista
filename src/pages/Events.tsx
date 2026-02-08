import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, MapPin, Clock } from "lucide-react";
import FooterNav from "@/components/FooterNav";

const events = [
  { name: "Feira de Artesanato", date: "Todo sábado", time: "08h - 14h", location: "Praça Central" },
  { name: "Festival Gastronômico", date: "15-17 Mar", time: "11h - 22h", location: "Parque Municipal" },
  { name: "Música ao Vivo", date: "Sexta-feira", time: "20h", location: "Bar do Centro" },
  { name: "Exposição de Arte", date: "01-30 Mar", time: "09h - 18h", location: "Museu da Cidade" },
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

      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {events.map((evt, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 shadow-card">
            <h3 className="font-bold text-foreground">{evt.name}</h3>
            <div className="flex flex-wrap gap-3 mt-2">
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{evt.date}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{evt.time}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.location}</span>
            </div>
          </div>
        ))}
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default Events;
