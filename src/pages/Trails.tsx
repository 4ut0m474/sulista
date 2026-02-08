import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, TreePine, Clock, BarChart3, MapPin } from "lucide-react";
import FooterNav from "@/components/FooterNav";

const trails = [
  { name: "Trilha da Serra", difficulty: "Moderada", duration: "3h", distance: "8 km" },
  { name: "Caminho das Araucárias", difficulty: "Fácil", duration: "1h30", distance: "4 km" },
  { name: "Rota dos Vales", difficulty: "Difícil", duration: "5h", distance: "14 km" },
  { name: "Passarela Ecológica", difficulty: "Fácil", duration: "45min", distance: "2 km" },
];

const difficultyColor: Record<string, string> = {
  Fácil: "text-primary bg-primary/10",
  Moderada: "text-gold bg-gold/10",
  Difícil: "text-destructive bg-destructive/10",
};

const Trails = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Trilhas</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {trails.map((trail, i) => (
          <div key={i} className="bg-card rounded-xl border border-border p-4 shadow-card">
            <div className="flex items-center gap-2 mb-2">
              <TreePine className="w-5 h-5 text-primary" />
              <h3 className="font-bold text-foreground">{trail.name}</h3>
            </div>
            <div className="flex flex-wrap gap-2">
              <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${difficultyColor[trail.difficulty]}`}>{trail.difficulty}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{trail.duration}</span>
              <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{trail.distance}</span>
            </div>
          </div>
        ))}
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default Trails;
