import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Star, Send, Trophy, ThumbsUp, Info } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import { useState, useEffect } from "react";
import { pageBackgrounds } from "@/lib/adminData";
import { MAX_COMMENT, sanitizeText } from "@/lib/validation";
import { supabase } from "@/integrations/supabase/client";
import { useToast } from "@/hooks/use-toast";

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

const getDeviceFingerprint = () => {
  let fp = localStorage.getItem("sulista-device-fp");
  if (!fp) {
    fp = crypto.randomUUID();
    localStorage.setItem("sulista-device-fp", fp);
  }
  return fp;
};

const Opinion = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const { toast } = useToast();
  const base = `/city/${state}/${city}`;
  const cityName = decodeURIComponent(city || "");
  const bgUrl = pageBackgrounds.opinion;

  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [loading, setLoading] = useState(true);
  const [showVotePanel, setShowVotePanel] = useState(false);
  const [selectedEstablishment, setSelectedEstablishment] = useState<Establishment | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [showHowTo, setShowHowTo] = useState(false);

  useEffect(() => {
    fetchEstablishments();
  }, [cityName, state]);

  const fetchEstablishments = async () => {
    setLoading(true);
    const { data, error } = await (supabase as any)
      .from("establishments_public")
      .select("id, name, description, category, photo_url, avg_rating, total_votes, address")
      .eq("city", cityName)
      .eq("state_abbr", state || "")
      .order("avg_rating", { ascending: false });
    
    if (!error && data) setEstablishments(data as Establishment[]);
    setLoading(false);
  };

  const handleVote = async () => {
    if (!selectedEstablishment || rating === 0) return;
    setSubmitting(true);
    const fp = getDeviceFingerprint();
    const sanitized = sanitizeText(comment);

    const { error } = await supabase.from("votes").insert({
      establishment_id: selectedEstablishment.id,
      rating,
      comment: sanitized || null,
      device_fingerprint: fp,
    } as any);

    if (error) {
      if (error.code === "23505") {
        toast({ title: "Você já votou neste comércio!", description: "Cada pessoa pode votar apenas uma vez.", variant: "destructive" });
      } else {
        toast({ title: "Erro ao votar", description: error.message, variant: "destructive" });
      }
    } else {
      toast({ title: "Voto registrado!", description: `Obrigado por avaliar ${selectedEstablishment.name}` });
      setSelectedEstablishment(null);
      setRating(0);
      setComment("");
      setShowVotePanel(false);
      fetchEstablishments();
    }
    setSubmitting(false);
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
              <button onClick={() => setShowVotePanel(!showVotePanel)} className="p-2 rounded-full bg-primary text-primary-foreground shadow-card" aria-label="Votar">
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

          {/* Voting panel */}
          {showVotePanel && (
            <div className="bg-card/90 backdrop-blur-sm rounded-2xl border border-primary/30 p-4 shadow-card animate-fade-in space-y-3">
              <h3 className="font-bold text-foreground">🗳️ Painel de Votação</h3>
              
              {!selectedEstablishment ? (
                <div className="space-y-2">
                  <p className="text-xs text-muted-foreground">Selecione um comércio para votar:</p>
                  {establishments.map(est => (
                    <button key={est.id} onClick={() => setSelectedEstablishment(est)}
                      className="w-full flex items-center gap-3 p-2 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 transition-all text-left">
                      <img src={est.photo_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=100&q=60"} alt={est.name} className="w-10 h-10 rounded-lg object-cover" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-bold text-foreground truncate">{est.name}</p>
                        <p className="text-[10px] text-muted-foreground">{est.category}</p>
                      </div>
                    </button>
                  ))}
                </div>
              ) : (
                <div className="space-y-3">
                  <div className="flex items-center gap-3 p-2 bg-primary/5 rounded-xl">
                    <img src={selectedEstablishment.photo_url || ""} alt={selectedEstablishment.name} className="w-12 h-12 rounded-lg object-cover" />
                    <div>
                      <p className="font-bold text-foreground text-sm">{selectedEstablishment.name}</p>
                      <button onClick={() => setSelectedEstablishment(null)} className="text-[10px] text-primary underline">Trocar</button>
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Sua nota</label>
                    <div className="flex gap-1">
                      {[1, 2, 3, 4, 5].map(n => (
                        <button key={n} onClick={() => setRating(n)} className="p-0.5">
                          <Star className={`w-7 h-7 transition-colors ${n <= rating ? "text-secondary fill-secondary" : "text-muted-foreground/30"}`} />
                        </button>
                      ))}
                    </div>
                  </div>
                  <div>
                    <label className="text-xs font-bold text-foreground mb-1 block">Comentário (opcional)</label>
                    <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="O que você achou?" maxLength={MAX_COMMENT}
                      className="w-full h-20 rounded-xl border border-border bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
                  </div>
                  <button onClick={handleVote} disabled={rating === 0 || submitting}
                    className="w-full py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all">
                    <Send className="w-4 h-4" /> {submitting ? "Enviando..." : "Enviar Voto"}
                  </button>
                </div>
              )}
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
    </div>
  );
};

export default Opinion;
