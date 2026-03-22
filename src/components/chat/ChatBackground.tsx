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
  // PR - grandes
  { name: "Curitiba", x: 62, y: 18, pop: 1962, big: true },
  { name: "Londrina", x: 44, y: 10, pop: 580, big: true },
  { name: "Maringá", x: 38, y: 13, pop: 430, big: true },
  { name: "Ponta Grossa", x: 58, y: 24, pop: 358, big: true },
  { name: "Cascavel", x: 26, y: 20, pop: 332, big: true },
  { name: "Foz do Iguaçu", x: 18, y: 22, pop: 258, big: false },
  { name: "São José dos Pinhais", x: 64, y: 20, pop: 323, big: true },
  { name: "Colombo", x: 63, y: 17, pop: 246, big: false },
  { name: "Guarapuava", x: 42, y: 25, pop: 183, big: false },
  { name: "Paranaguá", x: 72, y: 22, pop: 157, big: false },
  { name: "Toledo", x: 24, y: 18, pop: 142, big: false },
  { name: "Apucarana", x: 46, y: 12, pop: 136, big: false },
  { name: "Pato Branco", x: 30, y: 28, pop: 83, big: false },
  // SC - grandes
  { name: "Joinville", x: 68, y: 36, pop: 604, big: true },
  { name: "Florianópolis", x: 72, y: 45, pop: 516, big: true },
  { name: "Blumenau", x: 64, y: 40, pop: 365, big: true },
  { name: "Chapecó", x: 34, y: 40, pop: 230, big: false },
  { name: "Itajaí", x: 70, y: 39, pop: 227, big: false },
  { name: "Criciúma", x: 62, y: 52, pop: 217, big: false },
  { name: "Jaraguá do Sul", x: 66, y: 37, pop: 181, big: false },
  { name: "Lages", x: 52, y: 44, pop: 158, big: false },
  { name: "Balneário Camboriú", x: 69, y: 41, pop: 149, big: false },
  // RS - grandes
  { name: "Porto Alegre", x: 56, y: 68, pop: 1488, big: true },
  { name: "Caxias do Sul", x: 50, y: 62, pop: 517, big: true },
  { name: "Canoas", x: 55, y: 67, pop: 349, big: true },
  { name: "Pelotas", x: 48, y: 82, pop: 343, big: true },
  { name: "Santa Maria", x: 36, y: 72, pop: 285, big: false },
  { name: "Gravataí", x: 57, y: 66, pop: 283, big: false },
  { name: "Novo Hamburgo", x: 54, y: 64, pop: 249, big: false },
  { name: "Passo Fundo", x: 42, y: 56, pop: 206, big: false },
  { name: "Rio Grande", x: 50, y: 86, pop: 211, big: false },
  { name: "Uruguaiana", x: 16, y: 76, pop: 130, big: false },
  { name: "Bagé", x: 32, y: 82, pop: 122, big: false },
  { name: "Erechim", x: 42, y: 52, pop: 107, big: false },
  { name: "Santa Cruz do Sul", x: 44, y: 68, pop: 133, big: false },
  { name: "Alegrete", x: 22, y: 78, pop: 78, big: false },
];

const RPGMapBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,8%)] via-[hsl(200,30%,10%)] to-[hsl(222,30%,6%)]" />
    <svg className="absolute inset-0 w-full h-full" viewBox="0 0 100 100" preserveAspectRatio="xMidYMid slice">
      <defs>
        <linearGradient id="prGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(142,45%,25%)" />
          <stop offset="100%" stopColor="hsl(160,40%,18%)" />
        </linearGradient>
        <linearGradient id="scGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(200,50%,22%)" />
          <stop offset="100%" stopColor="hsl(210,45%,16%)" />
        </linearGradient>
        <linearGradient id="rsGrad" x1="0" y1="0" x2="1" y2="1">
          <stop offset="0%" stopColor="hsl(270,35%,22%)" />
          <stop offset="100%" stopColor="hsl(280,30%,15%)" />
        </linearGradient>
        <linearGradient id="oceanGrad" x1="0" y1="0" x2="0" y2="1">
          <stop offset="0%" stopColor="hsl(210,60%,18%)" />
          <stop offset="100%" stopColor="hsl(220,50%,12%)" />
        </linearGradient>
        <filter id="glow">
          <feGaussianBlur stdDeviation="0.8" result="blur" />
          <feMerge><feMergeNode in="blur" /><feMergeNode in="SourceGraphic" /></feMerge>
        </filter>
      </defs>

      {/* Ocean */}
      <rect x="70" y="0" width="30" height="100" fill="url(#oceanGrad)" opacity="0.5" />

      {/* PR */}
      <path d="M18,8 L30,6 L45,7 L55,6 L65,8 L72,12 L75,18 L74,24 L70,28 L60,30 L50,29 L40,30 L30,28 L22,25 L18,20 L16,14 Z"
        fill="url(#prGrad)" fillOpacity="0.6" stroke="hsl(142,50%,40%)" strokeWidth="0.5" />
      <path d="M20,15 Q35,18 50,16 Q60,15 68,20" fill="none" stroke="hsl(200,60%,40%)" strokeWidth="0.2" opacity="0.4" />
      <text x="45" y="5" fill="hsl(142,60%,55%)" fontSize="2.8" textAnchor="middle" fontWeight="bold" opacity="0.8" filter="url(#glow)">PARANÁ</text>

      {/* SC */}
      <path d="M30,32 L42,31 L55,32 L65,33 L74,36 L76,42 L74,48 L68,52 L58,53 L48,52 L38,50 L32,46 L30,40 Z"
        fill="url(#scGrad)" fillOpacity="0.6" stroke="hsl(200,50%,40%)" strokeWidth="0.5" />
      <text x="53" y="31" fill="hsl(200,60%,60%)" fontSize="2.5" textAnchor="middle" fontWeight="bold" opacity="0.8" filter="url(#glow)">SANTA CATARINA</text>

      {/* RS */}
      <path d="M14,56 L28,55 L42,56 L55,57 L65,60 L66,68 L62,76 L55,82 L48,86 L40,88 L30,86 L22,82 L16,76 L14,68 Z"
        fill="url(#rsGrad)" fillOpacity="0.6" stroke="hsl(270,40%,40%)" strokeWidth="0.5" />
      <ellipse cx="49" cy="84" rx="3" ry="4" fill="hsl(210,50%,25%)" fillOpacity="0.4" stroke="hsl(200,50%,35%)" strokeWidth="0.2" />
      <text x="40" y="55" fill="hsl(270,50%,60%)" fontSize="2.5" textAnchor="middle" fontWeight="bold" opacity="0.8" filter="url(#glow)">RIO GRANDE DO SUL</text>

      {/* Forests */}
      {[[25,12],[35,14],[50,20],[60,16],[45,38],[55,44],[35,65],[45,70],[25,72]].map(([cx,cy], i) => (
        <circle key={`forest${i}`} cx={cx} cy={cy} r={2.5} fill="hsl(140,40%,15%)" opacity="0.25" />
      ))}

      {/* Mountains */}
      {[[58,24],[60,26],[56,22],[52,44],[54,46],[50,62],[48,64]].map(([cx,cy], i) => (
        <polygon key={`mtn${i}`} points={`${cx},${cy-1.5} ${cx-1.2},${cy+0.8} ${cx+1.2},${cy+0.8}`} fill="hsl(30,20%,25%)" opacity="0.3" />
      ))}

      {/* Grid */}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`h${i}`} x1="0" y1={i * 10} x2="100" y2={i * 10} stroke="hsl(152,20%,20%)" strokeWidth="0.08" opacity="0.15" />
      ))}
      {Array.from({ length: 10 }, (_, i) => (
        <line key={`v${i}`} x1={i * 10} y1="0" x2={i * 10} y2="100" stroke="hsl(152,20%,20%)" strokeWidth="0.08" opacity="0.15" />
      ))}

      {/* Routes */}
      {[
        [62, 18, 68, 36], [68, 36, 72, 45], [72, 45, 62, 52], [62, 52, 56, 68],
        [44, 10, 62, 18], [56, 68, 50, 62], [50, 62, 42, 56], [38, 13, 44, 10],
        [26, 20, 38, 13], [56, 68, 48, 82], [36, 72, 56, 68], [64, 40, 72, 45],
      ].map(([x1, y1, x2, y2], i) => (
        <line key={`route${i}`} x1={x1} y1={y1} x2={x2} y2={y2} stroke="hsl(38,50%,40%)" strokeWidth="0.2" opacity="0.3" strokeDasharray="1,0.8" />
      ))}

      {/* City pins */}
      {southCities.map((c) => {
        const r = c.pop > 500 ? 1.6 : c.pop > 200 ? 1.1 : 0.7;
        const isHigh = c.pop > 200;
        return (
          <g key={c.name}>
            {c.big && <circle cx={c.x} cy={c.y} r={r * 3} fill={isHigh ? "hsl(142,70%,50%)" : "hsl(0,70%,50%)"} opacity="0.1" />}
            <circle cx={c.x} cy={c.y} r={r} fill={isHigh ? "hsl(142,70%,55%)" : "hsl(0,65%,50%)"} opacity={isHigh ? 0.9 : 0.65}>
              <animate attributeName="opacity" values={isHigh ? "0.9;0.6;0.9" : "0.65;0.35;0.65"} dur={`${3 + Math.random() * 2}s`} repeatCount="indefinite" />
            </circle>
            {c.pop > 500 && <circle cx={c.x} cy={c.y} r={r * 0.4} fill="white" opacity="0.7" />}
            <text x={c.x} y={c.y - r - 1} fill="hsl(0,0%,90%)" fontSize={c.big ? "1.8" : "1.3"} textAnchor="middle" opacity={c.big ? 0.85 : 0.5} fontWeight={c.big ? "bold" : "normal"}>{c.name}</text>
          </g>
        );
      })}

      {/* Compass */}
      <g transform="translate(88,12)" opacity="0.4">
        <circle cx="0" cy="0" r="4" fill="none" stroke="hsl(38,50%,50%)" strokeWidth="0.3" />
        <line x1="0" y1="-4" x2="0" y2="4" stroke="hsl(38,50%,50%)" strokeWidth="0.2" />
        <line x1="-4" y1="0" x2="4" y2="0" stroke="hsl(38,50%,50%)" strokeWidth="0.2" />
        <text x="0" y="-5" fill="hsl(38,60%,60%)" fontSize="1.8" textAnchor="middle" fontWeight="bold">N</text>
        <text x="0" y="6.5" fill="hsl(38,60%,50%)" fontSize="1.4" textAnchor="middle">S</text>
      </g>

      {/* Legend */}
      <g transform="translate(78,88)" opacity="0.6">
        <rect x="0" y="0" width="20" height="11" rx="1" fill="hsl(222,30%,8%)" fillOpacity="0.7" stroke="hsl(38,30%,30%)" strokeWidth="0.2" />
        <circle cx="3" cy="3" r="1.2" fill="hsl(142,70%,55%)" />
        <text x="6" y="4" fill="hsl(0,0%,80%)" fontSize="1.5">Alta pop.</text>
        <circle cx="3" cy="7" r="0.7" fill="hsl(0,65%,50%)" />
        <text x="6" y="8" fill="hsl(0,0%,80%)" fontSize="1.5">Baixa pop.</text>
      </g>
    </svg>
    <div className="absolute bottom-0 inset-x-0 h-20 bg-gradient-to-t from-[hsl(222,30%,4%)] to-transparent opacity-50" />
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
