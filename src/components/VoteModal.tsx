import { useState, useEffect } from "react";
import { Star, Send, X } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { toast } from "sonner";
import { MAX_COMMENT, sanitizeText } from "@/lib/validation";

type Establishment = {
  id: string;
  name: string;
  photo_url: string | null;
  category: string;
};

interface VoteModalProps {
  open: boolean;
  onClose: () => void;
  city: string;
  stateAbbr: string;
  onVoted?: () => void;
}

const VoteModal = ({ open, onClose, city, stateAbbr, onVoted }: VoteModalProps) => {
  const [establishments, setEstablishments] = useState<Establishment[]>([]);
  const [selected, setSelected] = useState<Establishment | null>(null);
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [loading, setLoading] = useState(true);
  const [userId, setUserId] = useState<string | null>(null);
  const [isAnonymous, setIsAnonymous] = useState(true);

  useEffect(() => {
    if (!open) return;
    setSelected(null);
    setRating(0);
    setComment("");

    const checkAuth = async () => {
      const { data: { session } } = await supabase.auth.getSession();
      const uid = session?.user?.id || null;
      setUserId(uid);
      const persistent = localStorage.getItem("vento-sul-persistent") === "true";
      setIsAnonymous(!uid || !persistent);
    };

    const loadEstablishments = async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("establishments_public")
          .select("id, name, photo_url, category")
          .eq("city", city)
          .eq("state_abbr", stateAbbr)
          .order("name");
        
        if (error) {
          console.error("Erro ao carregar estabelecimentos:", error);
          toast.error("Erro ao carregar comércios");
        } else if (data) {
          setEstablishments(data);
        }
      } catch (err) {
        console.error("Erro ao carregar estabelecimentos:", err);
        toast.error("Erro ao carregar comércios");
      }
      setLoading(false);
    };

    checkAuth();
    loadEstablishments();
  }, [open, city, stateAbbr]);

  const handleVote = async () => {
    if (!selected || rating === 0 || !userId) return;
    
    setSubmitting(true);
    try {
      const sanitized = sanitizeText(comment);

      const { error } = await supabase.from("avaliacoes").upsert({
        comercio_id: selected.id,
        user_id: userId,
        nota: rating,
        comentario: sanitized || null,
      }, { 
        onConflict: "user_id,comercio_id" 
      });

      if (error) {
        console.error("Erro ao votar:", error);
        toast.error("Erro ao votar: " + error.message);
      } else {
        toast.success("Voto enviado! ✅");
        onVoted?.();
        onClose();
      }
    } catch (err) {
      console.error("Erro ao votar:", err);
      toast.error("Erro ao enviar voto");
    }
    setSubmitting(false);
  };

  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm" onClick={onClose}>
      <div className="w-full max-w-md bg-card rounded-t-3xl border-t border-border/50 shadow-lg p-5 animate-fade-in" onClick={e => e.stopPropagation()}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-display text-lg font-bold text-foreground">🗳️ Votar</h3>
          <button onClick={onClose} className="p-1.5 rounded-full bg-muted/50 hover:bg-muted">
            <X className="w-4 h-4 text-muted-foreground" />
          </button>
        </div>

        {isAnonymous ? (
          <div className="py-6 text-center space-y-3">
            <p className="text-sm text-muted-foreground">Ative a persistência para poder votar.</p>
            <button onClick={onClose} className="px-4 py-2 rounded-xl bg-primary text-primary-foreground font-bold text-sm">
              Entendi
            </button>
          </div>
        ) : loading ? (
          <div className="py-8 text-center">
            <div className="w-6 h-6 border-2 border-primary border-t-transparent rounded-full animate-spin mx-auto" />
          </div>
        ) : establishments.length === 0 ? (
          <p className="text-sm text-muted-foreground text-center py-6">Nenhum comércio cadastrado nesta cidade ainda.</p>
        ) : !selected ? (
          <div className="space-y-2 max-h-64 overflow-y-auto">
            <p className="text-xs text-muted-foreground mb-2">Selecione um comércio:</p>
            {establishments.map(est => (
              <button key={est.id} onClick={() => setSelected(est)}
                className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-background/50 border border-border/30 hover:border-primary/50 transition-all text-left">
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
              <img src={selected.photo_url || ""} alt={selected.name} className="w-10 h-10 rounded-lg object-cover" />
              <div className="flex-1">
                <p className="font-bold text-sm text-foreground">{selected.name}</p>
                <button onClick={() => setSelected(null)} className="text-[10px] text-primary underline">Trocar</button>
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
            <textarea value={comment} onChange={e => setComment(e.target.value)} placeholder="Comentário (opcional)" maxLength={MAX_COMMENT}
              className="w-full h-16 rounded-xl border border-border bg-background/80 px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20" />
            <button onClick={handleVote} disabled={rating === 0 || submitting}
              className="w-full py-2.5 rounded-xl bg-gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 hover:scale-[1.02] active:scale-95 transition-all">
              <Send className="w-4 h-4" /> {submitting ? "Enviando..." : "Enviar Voto"}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default VoteModal;
