import { type AgentType } from "@/components/AgentIntroModal";

const SteampunkBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(30,10%,8%)] via-[hsl(30,15%,10%)] to-[hsl(30,10%,6%)]" />
    {/* Gears */}
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
    {/* Steam particles */}
    <div className="absolute bottom-0 left-1/4 w-1 h-32 bg-gradient-to-t from-transparent to-[hsl(38,30%,50%)] opacity-10 animate-[float_8s_ease-in-out_infinite]" />
    <div className="absolute bottom-0 right-1/3 w-1 h-24 bg-gradient-to-t from-transparent to-[hsl(38,30%,50%)] opacity-8 animate-[float_6s_ease-in-out_infinite_1s]" />
  </div>
);

const RPGMapBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(222,47%,6%)] via-[hsl(222,35%,10%)] to-[hsl(38,40%,8%)]" />
    {/* Castle glow */}
    <div className="absolute top-8 right-8 w-20 h-20 rounded-full bg-[hsl(38,80%,50%)] opacity-5 blur-2xl" />
    {/* Trail lights */}
    <div className="absolute top-1/3 left-4 w-2 h-2 rounded-full bg-[hsl(38,90%,60%)] opacity-30 animate-pulse" />
    <div className="absolute top-1/2 right-8 w-1.5 h-1.5 rounded-full bg-[hsl(152,50%,50%)] opacity-25 animate-pulse" style={{ animationDelay: "1s" }} />
    <div className="absolute bottom-1/3 left-1/3 w-2 h-2 rounded-full bg-[hsl(38,90%,60%)] opacity-20 animate-pulse" style={{ animationDelay: "2s" }} />
    {/* Fog */}
    <div className="absolute bottom-0 inset-x-0 h-32 bg-gradient-to-t from-[hsl(222,30%,8%)] to-transparent opacity-80" />
    <div className="absolute top-1/2 inset-x-0 h-16 bg-[hsl(222,20%,15%)] opacity-10 blur-xl" />
  </div>
);

const NeuralNetworkBackground = () => (
  <div className="absolute inset-0 overflow-hidden pointer-events-none">
    <div className="absolute inset-0 bg-gradient-to-b from-[hsl(152,30%,6%)] via-[hsl(152,20%,8%)] to-[hsl(152,25%,5%)]" />
    {/* Network nodes */}
    {[
      { x: "15%", y: "20%", delay: "0s", size: "w-2 h-2" },
      { x: "45%", y: "15%", delay: "0.5s", size: "w-3 h-3" },
      { x: "75%", y: "25%", delay: "1s", size: "w-2 h-2" },
      { x: "25%", y: "50%", delay: "1.5s", size: "w-2.5 h-2.5" },
      { x: "60%", y: "45%", delay: "2s", size: "w-2 h-2" },
      { x: "85%", y: "55%", delay: "0.3s", size: "w-1.5 h-1.5" },
      { x: "35%", y: "75%", delay: "1.2s", size: "w-2 h-2" },
      { x: "70%", y: "70%", delay: "0.8s", size: "w-3 h-3" },
      { x: "10%", y: "80%", delay: "1.8s", size: "w-2 h-2" },
    ].map((node, i) => (
      <div
        key={i}
        className={`absolute ${node.size} rounded-full bg-[hsl(152,50%,40%)] opacity-30 animate-pulse`}
        style={{ left: node.x, top: node.y, animationDelay: node.delay, animationDuration: "3s" }}
      />
    ))}
    {/* Connection lines (SVG) */}
    <svg className="absolute inset-0 w-full h-full opacity-10">
      <line x1="15%" y1="20%" x2="45%" y2="15%" stroke="hsl(152,50%,40%)" strokeWidth="0.5" />
      <line x1="45%" y1="15%" x2="75%" y2="25%" stroke="hsl(152,50%,40%)" strokeWidth="0.5" />
      <line x1="25%" y1="50%" x2="60%" y2="45%" stroke="hsl(152,50%,40%)" strokeWidth="0.5" />
      <line x1="60%" y1="45%" x2="85%" y2="55%" stroke="hsl(152,50%,40%)" strokeWidth="0.5" />
      <line x1="35%" y1="75%" x2="70%" y2="70%" stroke="hsl(152,50%,40%)" strokeWidth="0.5" />
      <line x1="15%" y1="20%" x2="25%" y2="50%" stroke="hsl(152,50%,40%)" strokeWidth="0.5" />
      <line x1="75%" y1="25%" x2="60%" y2="45%" stroke="hsl(152,50%,40%)" strokeWidth="0.5" />
    </svg>
  </div>
);

export const ChatBackground = ({ agent }: { agent: AgentType }) => {
  switch (agent) {
    case "automata": return <SteampunkBackground />;
    case "aurora": return <RPGMapBackground />;
    case "litoranea": return <NeuralNetworkBackground />;
  }
};

export default ChatBackground;
