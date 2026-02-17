import { useEffect, useState } from "react";
import { Star } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";

type TopEstablishment = {
  id: string;
  name: string;
  photo_url: string | null;
  avg_rating: number;
  total_votes: number;
  category: string;
};

interface TopRatedCarouselProps {
  city: string;
  stateAbbr: string;
}

const TopRatedCarousel = ({ city, stateAbbr }: TopRatedCarouselProps) => {
  const [items, setItems] = useState<TopEstablishment[]>([]);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const fetch = async () => {
      const { data } = await (supabase as any)
        .from("establishments_public")
        .select("id, name, photo_url, avg_rating, total_votes, category")
        .eq("city", city)
        .eq("state_abbr", stateAbbr)
        .gt("total_votes", 0)
        .order("avg_rating", { ascending: false })
        .limit(6);
      if (data) setItems(data as TopEstablishment[]);
    };
    fetch();
  }, [city, stateAbbr]);

  useEffect(() => {
    if (items.length <= 1) return;
    const interval = setInterval(() => setCurrent(p => (p + 1) % items.length), 3500);
    return () => clearInterval(interval);
  }, [items.length]);

  if (items.length === 0) return null;

  return (
    <div className="px-4 mb-4">
      <h3 className="text-xs font-bold text-muted-foreground uppercase tracking-wider mb-2">⭐ Mais Votados</h3>
      <div className="relative overflow-hidden rounded-2xl h-28 shadow-card border border-border/30">
        {items.map((item, i) => (
          <div key={item.id} className={`absolute inset-0 transition-all duration-500 ${i === current ? "opacity-100 translate-x-0" : "opacity-0 translate-x-full"}`}>
            <img src={item.photo_url || "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=400&q=60"} alt={item.name} className="w-full h-full object-cover" />
            <div className="absolute inset-0 bg-gradient-to-r from-black/70 via-black/40 to-transparent" />
            <div className="absolute bottom-0 left-0 right-0 p-3 text-white flex items-end justify-between">
              <div>
                <p className="font-bold text-sm">{item.name}</p>
                <p className="text-[10px] opacity-80">{item.category}</p>
              </div>
              <div className="flex items-center gap-1 bg-black/30 backdrop-blur-sm px-2 py-1 rounded-full">
                <Star className="w-3 h-3 fill-secondary text-secondary" />
                <span className="text-xs font-bold">{Number(item.avg_rating).toFixed(1)}</span>
                <span className="text-[9px] opacity-70">({item.total_votes})</span>
              </div>
            </div>
          </div>
        ))}
        <div className="absolute bottom-1 right-2 flex gap-1 z-10">
          {items.map((_, i) => (
            <button key={i} onClick={() => setCurrent(i)} className={`w-1.5 h-1.5 rounded-full transition-all ${i === current ? "bg-white w-3" : "bg-white/40"}`} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default TopRatedCarousel;
