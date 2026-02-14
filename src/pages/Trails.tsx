import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, TreePine, Clock, MapPin, Users, Shield, Backpack } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import { useState } from "react";

const trails = [
  {
    name: "Trilha da Serra",
    difficulty: "Moderada",
    duration: "3h",
    distance: "8 km",
    image: "https://images.unsplash.com/photo-1551632811-561732d1e306?w=600&q=80",
    equipment: ["Tênis de trilha", "Garrafa d'água", "Protetor solar", "Chapéu"],
    description: "Percurso com vistas panorâmicas da serra e vegetação nativa preservada.",
  },
  {
    name: "Caminho das Araucárias",
    difficulty: "Fácil",
    duration: "1h30",
    distance: "4 km",
    image: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=600&q=80",
    equipment: ["Tênis confortável", "Garrafa d'água"],
    description: "Caminhada suave entre araucárias centenárias, perfeita para famílias.",
  },
  {
    name: "Rota dos Vales",
    difficulty: "Difícil",
    duration: "5h",
    distance: "14 km",
    image: "https://images.unsplash.com/photo-1464822759023-fed622ff2c3b?w=600&q=80",
    equipment: ["Bota de trekking", "Bastão de caminhada", "Mochila 20L", "Kit primeiros socorros", "Lanche energético"],
    description: "Trilha desafiadora com travessias de rios e subidas íngremes. Paisagens espetaculares.",
  },
  {
    name: "Passarela Ecológica",
    difficulty: "Fácil",
    duration: "45min",
    distance: "2 km",
    image: "https://images.unsplash.com/photo-1448375240586-882707db888b?w=600&q=80",
    equipment: ["Calçado confortável"],
    description: "Passarela suspensa sobre a mata, com mirantes e placas informativas sobre a flora local.",
  },
];

const difficultyColor: Record<string, string> = {
  Fácil: "text-primary bg-primary/10",
  Moderada: "text-secondary bg-secondary/10",
  Difícil: "text-destructive bg-destructive/10",
};

const Trails = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;
  const [teamTrail, setTeamTrail] = useState<number | null>(null);
  const [teamName, setTeamName] = useState("");
  const [teamMembers, setTeamMembers] = useState("");

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Trilhas</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">

        {trails.map((trail, i) => (
          <div key={i} className="bg-card rounded-2xl border border-border shadow-card overflow-hidden">
            <div className="h-44 overflow-hidden relative">
              <img src={trail.image} alt={trail.name} className="w-full h-full object-cover" />
              <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent" />
              <div className="absolute bottom-3 left-3 right-3">
                <h3 className="font-display text-lg font-bold text-white">{trail.name}</h3>
              </div>
            </div>
            <div className="p-4 space-y-3">
              <p className="text-sm text-muted-foreground">{trail.description}</p>
              <div className="flex flex-wrap gap-2">
                <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${difficultyColor[trail.difficulty]}`}>{trail.difficulty}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><Clock className="w-3 h-3" />{trail.duration}</span>
                <span className="text-xs text-muted-foreground flex items-center gap-1"><MapPin className="w-3 h-3" />{trail.distance}</span>
              </div>

              {/* Equipment */}
              <div className="bg-muted/50 rounded-xl p-3">
                <h4 className="text-xs font-bold text-foreground flex items-center gap-1 mb-2">
                  <Backpack className="w-3 h-3" /> Equipamento Necessário
                </h4>
                <div className="flex flex-wrap gap-1">
                  {trail.equipment.map((eq, j) => (
                    <span key={j} className="text-[10px] bg-card border border-border px-2 py-0.5 rounded-full text-muted-foreground">{eq}</span>
                  ))}
                </div>
              </div>

              {/* Team formation */}
              <button
                onClick={() => setTeamTrail(teamTrail === i ? null : i)}
                className="w-full flex items-center justify-center gap-2 py-2.5 rounded-xl bg-primary/10 text-primary font-bold text-xs hover:bg-primary/20 transition-colors"
              >
                <Users className="w-4 h-4" /> Formar Equipe
              </button>

              {teamTrail === i && (
                <div className="space-y-2 pt-2 border-t border-border">
                  <input
                    type="text"
                    value={teamName}
                    onChange={e => setTeamName(e.target.value)}
                    placeholder="Nome da equipe"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <input
                    type="text"
                    value={teamMembers}
                    onChange={e => setTeamMembers(e.target.value)}
                    placeholder="Nomes dos membros (separados por vírgula)"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground focus:ring-2 focus:ring-primary focus:outline-none"
                  />
                  <button className="w-full py-2 rounded-lg bg-gradient-primary text-primary-foreground font-bold text-xs">
                    Criar Equipe
                  </button>
                </div>
              )}
            </div>
          </div>
        ))}
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default Trails;
