import { useEffect, useRef } from "react";
import { type AgentType } from "@/components/AgentIntroModal";

const SteampunkBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(30,10%,8%)] via-[hsl(30,15%,10%)] to-[hsl(30,10%,6%)]" />
    <svg className="absolute top-10 right-[-40px] w-48 h-48 text-[hsl(38,50%,30%)] opacity-20 animate-[spin_60s_linear_infinite]" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="30" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="15" fill="none" stroke="currentColor" strokeWidth="3" />
      {[0, 45, 90, 135, 180, 225, 270, 315].map(deg => (
        <rect key={deg} x="47" y="10" width="6" height="15" rx="2" fill="currentColor" transform={`rotate(${deg} 50 50)`} />
      ))}
    </svg>
    <svg className="absolute bottom-20 left-[-30px] w-36 h-36 text-[hsl(38,50%,25%)] opacity-15 animate-[spin_45s_linear_infinite_reverse]" viewBox="0 0 100 100">
      <circle cx="50" cy="50" r="25" fill="none" stroke="currentColor" strokeWidth="4" />
      <circle cx="50" cy="50" r="12" fill="none" stroke="currentColor" strokeWidth="3" />
      {[0, 60, 120, 180, 240, 300].map(deg => (
        <rect key={deg} x="47" y="15" width="6" height="12" rx="2" fill="currentColor" transform={`rotate(${deg} 50 50)`} />
      ))}
    </svg>
    <div className="absolute bottom-0 left-1/4 w-1 h-32 bg-gradient-to-t from-transparent to-[hsl(38,30%,50%)] opacity-10 animate-[float_8s_ease-in-out_infinite]" />
    <div className="absolute bottom-0 right-1/3 w-1 h-24 bg-gradient-to-t from-transparent to-[hsl(38,30%,50%)] opacity-8 animate-[float_6s_ease-in-out_infinite_1s]" />
  </div>
);

const southCities = [
  { name: "Curitiba", x: 62, y: 22, pop: true },
  { name: "Londrina", x: 48, y: 12, pop: true },
  { name: "Maringá", x: 42, y: 15, pop: false },
  { name: "Foz", x: 22, y: 20, pop: false },
  { name: "Cascavel", x: 30, y: 22, pop: true },
  { name: "Ponta Grossa", x: 58, y: 28, pop: false },
  { name: "Florianópolis", x: 72, y: 48, pop: true },
  { name: "Joinville", x: 68, y: 40, pop: true },
  { name: "Blumenau", x: 64, y: 44, pop: false },
  { name: "Chapecó", x: 38, y: 42, pop: false },
  { name: "Criciúma", x: 62, y: 55, pop: true },
  { name: "Porto Alegre", x: 58, y: 72, pop: true },
  { name: "Caxias", x: 52, y: 64, pop: true },
  { name: "Pelotas", x: 50, y: 85, pop: false },
  { name: "Santa Maria", x: 38, y: 74, pop: false },
  { name: "Passo Fundo", x: 44, y: 58, pop: true },
  { name: "Uruguaiana", x: 18, y: 78, pop: false },
];

const RPGMapBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    {/* Dark map base */}
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,8%)] via-[hsl(160,25%,10%)] to-[hsl(222,30%,6%)]" />
    {/* State boundaries (simplified SVG paths for PR, SC, RS) */}
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="none">
      {/* PR outline */}
      <path d="M20,10 L75,10 L75,32 L20,32 Z" fill="none" stroke="hsl(152,30%,25%)" strokeWidth="0.3" opacity="0.4" />
      <text x="50" y="8" fill="hsl(152,40%,40%)" fontSize="3" textAnchor="middle" opacity="0.5">PR</text>
      {/* SC outline */}
      <path d="M30,34 L78,34 L78,56 L30,56 Z" fill="none" stroke="hsl(152,30%,25%)" strokeWidth="0.3" opacity="0.4" />
      <text x="55" y="36" fill="hsl(152,40%,40%)" fontSize="3" textAnchor="middle" opacity="0.5">SC</text>
      {/* RS outline */}
      <path d="M15,58 L70,58 L70,95 L15,95 Z" fill="none" stroke="hsl(152,30%,25%)" strokeWidth="0.3" opacity="0.4" />
      <text x="42" y="60" fill="hsl(152,40%,40%)" fontSize="3" textAnchor="middle" opacity="0.5">RS</text>
      {/* City pins */}
      {southCities.map((c) => (
        <g key={c.name}>
          <circle cx={c.x} cy={c.y} r={c.pop ? 1.2 : 0.8} fill={c.pop ? "hsl(142,70%,50%)" : "hsl(0,70%,55%)"} opacity={c.pop ? 0.8 : 0.5}>
            <animate attributeName="opacity" values={c.pop ? "0.8;0.5;0.8" : "0.5;0.3;0.5"} dur={`${3 + Math.random() * 2}s`} repeatCount="indefinite" />
          </circle>
          <text x={c.x} y={c.y - 2} fill="hsl(0,0%,80%)" fontSize="2" textAnchor="middle" opacity="0.6">{c.name}</text>
        </g>
      ))}
      {/* Connection lines between big cities */}
      <line x1="62" y1="22" x2="68" y2="40" stroke="hsl(38,60%,40%)" strokeWidth="0.2" opacity="0.2" />
      <line x1="68" y1="40" x2="72" y2="48" stroke="hsl(38,60%,40%)" strokeWidth="0.2" opacity="0.2" />
      <line x1="72" y1="48" x2="58" y2="72" stroke="hsl(38,60%,40%)" strokeWidth="0.2" opacity="0.2" />
      <line x1="48" y1="12" x2="62" y2="22" stroke="hsl(38,60%,40%)" strokeWidth="0.2" opacity="0.15" />
      <line x1="58" y1="72" x2="52" y2="64" stroke="hsl(38,60%,40%)" strokeWidth="0.2" opacity="0.15" />
    </svg>
    {/* Atmospheric overlay */}
    <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[hsl(222,30%,4%)] to-transparent opacity-80" />
  </div>
);

const NeuralNetworkBackground = () => {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    let animationId: number;
    const nodeCount = 220;

    const resize = () => {
      canvas.width = canvas.offsetWidth * (window.devicePixelRatio || 1);
      canvas.height = canvas.offsetHeight * (window.devicePixelRatio || 1);
      ctx.scale(window.devicePixelRatio || 1, window.devicePixelRatio || 1);
    };
    resize();

    type Node = { x: number; y: number; vx: number; vy: number; r: number };
    const w = () => canvas.offsetWidth;
    const h = () => canvas.offsetHeight;

    const nodes: Node[] = Array.from({ length: nodeCount }, () => ({
      x: Math.random() * w(),
      y: Math.random() * h(),
      vx: (Math.random() - 0.5) * 0.3,
      vy: (Math.random() - 0.5) * 0.3,
      r: Math.random() * 1.2 + 0.6,
    }));

    const connectionDistance = 90;

    const draw = () => {
      ctx.clearRect(0, 0, w(), h());

      // Move nodes
      for (const n of nodes) {
        n.x += n.vx;
        n.y += n.vy;
        if (n.x < 0 || n.x > w()) n.vx *= -1;
        if (n.y < 0 || n.y > h()) n.vy *= -1;
      }

      // Draw connections
      ctx.strokeStyle = "hsla(152, 50%, 45%, 0.12)";
      ctx.lineWidth = 0.4;
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const dx = nodes[i].x - nodes[j].x;
          const dy = nodes[i].y - nodes[j].y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < connectionDistance) {
            const alpha = (1 - dist / connectionDistance) * 0.18;
            ctx.strokeStyle = `hsla(152, 50%, 45%, ${alpha})`;
            ctx.beginPath();
            ctx.moveTo(nodes[i].x, nodes[i].y);
            ctx.lineTo(nodes[j].x, nodes[j].y);
            ctx.stroke();
          }
        }
      }

      // Draw nodes
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = "hsla(152, 50%, 50%, 0.35)";
        ctx.fill();
      }

      animationId = requestAnimationFrame(draw);
    };

    draw();

    const onResize = () => {
      ctx.setTransform(1, 0, 0, 1, 0, 0);
      resize();
    };
    window.addEventListener("resize", onResize);

    return () => {
      cancelAnimationFrame(animationId);
      window.removeEventListener("resize", onResize);
    };
  }, []);

  return (
    <div className="absolute inset-0 overflow-hidden pointer-events-none">
      <div className="absolute inset-0 bg-gradient-to-b from-[hsl(152,30%,6%)] via-[hsl(152,20%,8%)] to-[hsl(152,25%,5%)]" />
      <canvas ref={canvasRef} className="absolute inset-0 w-full h-full" />
    </div>
  );
};

export const ChatBackground = ({ agent }: { agent: AgentType }) => {
  switch (agent) {
    case "automata": return <SteampunkBackground />;
    case "aurora": return <RPGMapBackground />;
    case "litoranea": return <NeuralNetworkBackground />;
  }
};

export default ChatBackground;
