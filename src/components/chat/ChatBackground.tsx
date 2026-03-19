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

const RPGMapBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,6%)] via-[hsl(222,35%,10%)] to-[hsl(38,40%,8%)]" />
    <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-[hsl(38,80%,50%)] opacity-5 blur-2xl" />
    <div className="absolute top-1/3 left-4 w-2 h-2 rounded-full bg-[hsl(38,90%,60%)] opacity-30 animate-pulse" />
    <div className="absolute top-1/2 right-8 w-1.5 h-1.5 rounded-full bg-[hsl(152,50%,50%)] opacity-25 animate-pulse" style={{ animationDelay: "1s" }} />
    <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-[hsl(38,90%,60%)] opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
    <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[hsl(222,30%,8%)] to-transparent opacity-80" />
    <div className="absolute top-1/2 inset-x-0 h-16 bg-[hsl(222,20%,15%)] opacity-10 blur-xl" />
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
