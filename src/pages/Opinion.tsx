import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MessageSquare, Send, Star } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import { useState } from "react";

const Opinion = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const [rating, setRating] = useState(0);
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState(false);
  const base = `/city/${state}/${city}`;
  const cityName = decodeURIComponent(city || "");

  const handleSubmit = () => {
    if (rating > 0 && comment.trim()) {
      setSubmitted(true);
    }
  };

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Sua Opinião</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
          <MessageSquare className="w-10 h-10 text-primary mx-auto mb-2" />
          <p className="text-sm text-foreground font-semibold leading-relaxed">
            "Ajude o comércio local a saber o que está fazendo de certo e de errado. Dê a sua opinião!"
          </p>
          <p className="text-xs text-muted-foreground mt-2">
            Isso ajuda as pessoas a entenderem melhor o seu produto.
          </p>
        </div>

        {submitted ? (
          <div className="bg-card rounded-xl border border-primary/20 p-6 shadow-card text-center animate-fade-in">
            <div className="w-12 h-12 rounded-full bg-primary/10 flex items-center justify-center mx-auto mb-3">
              <MessageSquare className="w-6 h-6 text-primary" />
            </div>
            <h3 className="font-display text-lg font-bold text-foreground">Obrigado!</h3>
            <p className="text-sm text-muted-foreground mt-1">Sua opinião sobre {cityName} foi enviada com sucesso.</p>
          </div>
        ) : (
          <div className="bg-card rounded-xl border border-border p-4 shadow-card space-y-4">
            <div>
              <label className="text-sm font-bold text-foreground mb-2 block">Avaliação geral de {cityName}</label>
              <div className="flex gap-1">
                {[1, 2, 3, 4, 5].map(n => (
                  <button key={n} onClick={() => setRating(n)} className="p-1">
                    <Star className={`w-7 h-7 transition-colors ${n <= rating ? "text-gold fill-gold" : "text-muted-foreground/30"}`} />
                  </button>
                ))}
              </div>
            </div>
            <div>
              <label className="text-sm font-bold text-foreground mb-2 block">Seu comentário</label>
              <textarea
                value={comment}
                onChange={e => setComment(e.target.value)}
                placeholder="O que você acha do comércio e produtos locais?"
                className="w-full h-28 rounded-xl border border-border bg-background px-3 py-2 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/20"
              />
            </div>
            <button
              onClick={handleSubmit}
              disabled={rating === 0 || !comment.trim()}
              className="w-full py-3 rounded-xl bg-gradient-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed hover:scale-[1.02] active:scale-95 transition-all"
            >
              <Send className="w-4 h-4" /> Enviar Opinião
            </button>
          </div>
        )}
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default Opinion;
