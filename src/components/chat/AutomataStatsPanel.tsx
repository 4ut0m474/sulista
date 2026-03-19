import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";

type Stats = {
  totalUsers: number;
  totalEstablishments: number;
  totalVotes: number;
  totalTransfers: number;
};

const AutomataStatsPanel = () => {
  const [stats, setStats] = useState<Stats>({ totalUsers: 0, totalEstablishments: 0, totalVotes: 0, totalTransfers: 0 });
  const [loading, setLoading] = useState(true);

  const fetchStats = async () => {
    try {
      const [usersRes, estRes, votesRes, transfersRes] = await Promise.all([
        supabase.from("user_profiles").select("id", { count: "exact", head: true }),
        supabase.from("establishments_public").select("id", { count: "exact", head: true }),
        supabase.from("avaliacoes").select("id", { count: "exact", head: true }),
        supabase.from("sulcoins_log").select("id", { count: "exact", head: true }),
      ]);
      setStats({
        totalUsers: usersRes.count || 0,
        totalEstablishments: estRes.count || 0,
        totalVotes: votesRes.count || 0,
        totalTransfers: transfersRes.count || 0,
      });
    } catch (e) {
      console.error("Stats fetch error:", e);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
    const interval = setInterval(fetchStats, 30000);
    return () => clearInterval(interval);
  }, []);

  const total = stats.totalUsers + stats.totalEstablishments + stats.totalVotes + stats.totalTransfers;
  const segments = [
    { label: "Usuários", value: stats.totalUsers, color: "hsl(38,65%,55%)" },
    { label: "Comércios", value: stats.totalEstablishments, color: "hsl(152,45%,40%)" },
    { label: "Avaliações", value: stats.totalVotes, color: "hsl(211,64%,45%)" },
    { label: "Transações", value: stats.totalTransfers, color: "hsl(0,62%,50%)" },
  ];

  // Simple pie chart SVG
  const renderPie = () => {
    if (total === 0) return null;
    let cumAngle = 0;
    const r = 40;
    const cx = 50;
    const cy = 50;

    return (
      <svg viewBox="0 0 100 100" className="w-20 h-20">
        {segments.map((seg, i) => {
          const fraction = seg.value / total;
          if (fraction === 0) return null;
          const startAngle = cumAngle;
          cumAngle += fraction * 360;
          const endAngle = cumAngle;
          const startRad = (startAngle - 90) * (Math.PI / 180);
          const endRad = (endAngle - 90) * (Math.PI / 180);
          const largeArc = fraction > 0.5 ? 1 : 0;
          const x1 = cx + r * Math.cos(startRad);
          const y1 = cy + r * Math.sin(startRad);
          const x2 = cx + r * Math.cos(endRad);
          const y2 = cy + r * Math.sin(endRad);
          const d = `M ${cx} ${cy} L ${x1} ${y1} A ${r} ${r} 0 ${largeArc} 1 ${x2} ${y2} Z`;
          return <path key={i} d={d} fill={seg.color} opacity={0.8} />;
        })}
      </svg>
    );
  };

  if (loading) return null;

  return (
    <div className="flex items-center gap-3 px-3 py-2 overflow-x-auto scrollbar-hide">
      {renderPie()}
      <div className="flex gap-2 flex-wrap">
        {segments.map((seg) => (
          <div key={seg.label} className="flex items-center gap-1">
            <span className="w-2 h-2 rounded-full" style={{ backgroundColor: seg.color }} />
            <span className="text-[10px] text-muted-foreground">{seg.label}: <strong className="text-foreground">{seg.value}</strong></span>
          </div>
        ))}
      </div>
    </div>
  );
};

export default AutomataStatsPanel;
