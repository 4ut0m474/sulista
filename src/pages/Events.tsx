import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Calendar, MapPin, Clock } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import { getAdminCityData, pageBackgrounds } from "@/lib/adminData";
import { useState, useEffect } from "react";

const defaultEvents = [
  { name: "Feira de Artesanato", date: "Todo sábado", time: "08h - 14h", location: "Praça Central", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=400&q=80", active: true },
  { name: "Festival Gastronômico", date: "15-17 Mar", time: "11h - 22h", location: "Parque Municipal", image: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80", active: true },
  { name: "Música ao Vivo", date: "Sexta-feira", time: "20h", location: "Bar do Centro", image: "https://images.unsplash.com/photo-1493225457124-a3eb161ffa5f?w=400&q=80", active: true },
  { name: "Exposição de Arte", date: "01-30 Mar", time: "09h - 18h", location: "Museu da Cidade", image: "https://images.unsplash.com/photo-1531058020387-3be344556be6?w=400&q=80", active: true },
];

const Events = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;
  const bgUrl = pageBackgrounds.events;
  const cityName = city ? decodeURIComponent(city) : "";

  const [events, setEvents] = useState(defaultEvents);

  useEffect(() => {
    const load = async () => {
      const adminEvents = await getAdminCityData(state || "", cityName, "events");
      if (Array.isArray(adminEvents)) {
        setEvents(adminEvents.filter((e: any) => e.active !== false) as any[]);
      }
    };
    load();
  }, [state, cityName]);

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="fixed inset-0 z-0">
        <img src={bgUrl} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-background/95 to-background" />
      </div>

      <div className="relative z-10">
        <header className="px-4 py-4">
          <div className="max-w-md mx-auto flex items-center gap-2">
            <button onClick={() => navigate(base)} className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-card">
              <ChevronLeft className="w-5 h-5 text-foreground" />
            </button>
            <h1 className="font-display text-xl font-bold text-foreground drop-shadow-sm">Eventos</h1>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 py-4 space-y-4">
          {events.map((evt: any, i: number) => (
            <div key={i} className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 shadow-card overflow-hidden">
              {evt.image && (
                <div className="h-36 overflow-hidden">
                  <img src={evt.image} alt={evt.name} className="w-full h-full object-cover" />
                </div>
              )}
              <div className="p-4">
                <h3 className="font-display text-lg font-bold text-foreground">{evt.name}</h3>
                <div className="flex flex-wrap gap-3 mt-2">
                  {evt.date && <span className="text-xs text-muted-foreground flex items-center gap-1"><Calendar className="w-3 h-3" />{evt.date}</span>}
                  {evt.time && <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{evt.time}</span>}
                  {evt.location && <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{evt.location}</span>}
                </div>
                {evt.description && <p className="text-xs text-muted-foreground mt-2">{evt.description}</p>}
              </div>
            </div>
          ))}
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default Events;
