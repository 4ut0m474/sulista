import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Star, Trophy, ThumbsUp, Info } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import VoteModal from "@/components/VoteModal";
import { useState, useEffect } from "react";
import { pageBackgrounds } from "@/lib/adminData";
import { supabase } from "@/integrations/supabase/client";

type Establishment = {
  id: string;
  name: string;
  description: string | null;
  category: string;
  photo_url: string | null;
  avg_rating: number;
  total_votes: number;
  address: string | null;
};


const Opinion = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;
  const cityName = decodeURIComponent(city || "");
  const bgUrl = pageBackgrounds.opinion;

  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVoteModal, setShowVoteModal] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    fetchEstablishments();
  }, [cityName, state]);

  const fetchEstablishments = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from("establishments_public")
      .select("id, name, description, category, photo_url, avg_rating, total_votes, address")
      .eq("city", cityName)
      .eq("state_abbr", state || "")
      .order("total_votes", { ascending: false });
    
    if (!error && data) setEstablishments(data as Establishment[]);
    setLoading(false);
  };

  const handleVoteCompleted = () => {
    fetchEstablishments(); // Refresh the list to show updated ratings
  };

  const topThree = establishments.slice(0, 3);
  const rest = establishments.slice(3);

  return (
    <div className="min-h-screen pb-20 relative">
      <div className="fixed inset-0 z-0">
        <img src={bgUrl} alt="Background" className="w-full h-full object-cover" />
        <div className="absolute inset-0 bg-gradient-to-b from-primary/70 via-background/95 to-background" />
      </div>

      <div className="relative z-10">
        <header className="px-4 py-4">
          <div className="max-w-md mx-auto flex items-center justify-between">
            <div className="flex items-center gap-2">
              <button onClick={() => navigate(base)} className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-card">
                <ChevronLeft className="w-5 h-5 text-foreground" />
              </button>
              <h1 className="font-display text-xl font-bold text-foreground drop-shadow-sm">⭐ Mais Votados</h1>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setShowHowTo(!showHowTo)} className="p-2 rounded-full bg-card/80 backdrop-blur-sm border border-border/50 shadow-card" aria-label="Como votar">
                <Info className="w-5 h-5 text-primary" />
              </button>
              <button onClick={() => setShowVoteModal(true)} className="p-2 rounded-full bg-primary text-primary-foreground shadow-card" aria-label="Votar">
                <ThumbsUp className="w-5 h-5" />
              </button>
            </div>
          </div>
        </header>

        <div className="max-w-md mx-auto px-4 space-y-4">
          {/* How to vote panel */}
          {showHowTo && (
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-primary/20 p-4 shadow-card animate-fade-in">
              <h3 className="font-bold text-foreground mb-2">📋 Como votar?</h3>
              <ol className="text-sm text-muted-foreground space-y-1 list-decimal list-inside">
                <li>Clique no botão <ThumbsUp className="w-3 h-3 inline text-primary" /> no cabeçalho</li>
                <li>Selecione o comércio que deseja avaliar</li>
                <li>Dê sua nota de 1 a 5 estrelas</li>
                <li>Deixe um comentário (opcional)</li>
                <li>Envie! Cada pessoa pode votar 1 vez por comércio</li>
              </ol>
            </div>
          )}


          {/* Top 3 Podium */}
          {loading ? (
            <div className="text-center py-8">
              <div className="w-8 h-8 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
            </div>
          ) : topThree.length > 0 ? (
            <>
              <div className="grid grid-cols-3 gap-2 items-end">
                {[1, 0, 2].map(idx => {
                  const est = topThree[idx];
                  if (!est) return <div key={idx} />;
                  const isFirst = idx === 0;
                  const medals = ["🥇", "🥈", "🥉"];
                  return (
                    <div key={est.id} className={`flex flex-col items-center ${isFirst ? "order-1" : idx === 1 ? "order-0" : "order-2"}`}>
                      <span className="text-2xl mb-1">{medals[idx]}</span>
                      <div className={`relative overflow-hidden rounded-2xl border shadow-card ${isFirst ? "h-40 border-secondary/50" : "h-32 border-border/50"}`}>
                        <img src={est.photo_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=300&q=60"} alt={est.name} className="w-full h-full object-cover" />
                        <div className="absolute inset-0 bg-gradient-to-t from-black/70 to-transparent" />
                        <div className="absolute bottom-0 left-0 right-0 p-2 text-white">
                          <p className="font-bold text-[10px] leading-tight truncate">{est.name}</p>
                          <div className="flex items-center gap-0.5">
                            <Star className="w-3 h-3 fill-secondary text-secondary" />
                            <span className="text-[10px] font-bold">{Number(est.avg_rating).toFixed(1)}</span>
                          </div>
                          <span className="text-[8px] opacity-80">{est.total_votes} votos</span>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>

              {/* Rest of rankings */}
              {rest.length > 0 && (
                <div className="space-y-2">
                  {rest.map((est, idx) => (
                    <div key={est.id} className="flex items-center gap-3 bg-card/90 backdrop-blur-sm rounded-xl border border-border/50 p-3 shadow-card">
                      <span className="text-lg font-black text-muted-foreground w-6 text-center">{idx + 4}</span>
                      <img src={est.photo_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&q=60"} alt={est.name} className="w-14 h-14 rounded-xl object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="font-bold text-sm text-foreground truncate">{est.name}</p>
                        <p className="text-[10px] text-muted-foreground truncate">{est.description || est.category}</p>
                        <div className="flex items-center gap-1 mt-0.5">
                          <Star className="w-3 h-3 fill-secondary text-secondary" />
                          <span className="text-xs font-bold text-foreground">{Number(est.avg_rating).toFixed(1)}</span>
                          <span className="text-[10px] text-muted-foreground">({est.total_votes})</span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </>
          ) : (
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-border/50 p-6 shadow-card text-center">
              <Trophy className="w-10 h-10 text-muted-foreground mx-auto mb-2" />
              <p className="text-sm text-muted-foreground">Nenhum comércio cadastrado para {cityName} ainda.</p>
            </div>
          )}
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
      
      <VoteModal
        open={showVoteModal}
        onClose={() => setShowVoteModal(false)}
        city={cityName}
        stateAbbr={state || ""}
        onVoted={handleVoteCompleted}
      />
    </div>
  );
};

export default Opinion;
