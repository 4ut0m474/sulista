import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Home, Compass, MessageSquare, Coins } from "lucide-react";
import litoraneaAvatar from "@/assets/litoranea-avatar.png";

interface FooterNavProps {
  stateAbbr: string;
  cityName: string;
}

const FooterNav = ({ stateAbbr, cityName }: FooterNavProps) => {
  const location = useLocation();
  const base = `/city/${stateAbbr}/${encodeURIComponent(cityName)}`;

  const items = [
    { label: "Início", icon: Home, path: base },
    { label: "Explorar", icon: Compass, path: `${base}/commerce` },
    { label: "Litorânea", icon: null, path: `${base}/litoranea`, isCenter: true },
    { label: "Opiniões", icon: MessageSquare, path: `${base}/opinion` },
    { label: "Carteira", icon: Coins, path: `${base}/wallet` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {items.map(item => {
          const isActive = location.pathname === item.path;
          if (item.isCenter) {
            return (
              <RouterNavLink
                key={item.label}
                to={item.path}
                className="flex flex-col items-center gap-0.5 -mt-5"
              >
                <div className={`w-14 h-14 rounded-full border-4 border-card bg-primary/10 flex items-center justify-center shadow-lg transition-transform hover:scale-110 ${isActive ? "ring-2 ring-primary" : ""}`}>
                  <img src={litoraneaAvatar} alt="Litorânea" className="w-11 h-11 rounded-full" />
                </div>
                <span className="text-[9px] font-bold text-primary">Litorânea</span>
              </RouterNavLink>
            );
          }
          return (
            <RouterNavLink
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-3 py-1.5 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              {item.icon && <item.icon className="w-5 h-5" />}
              <span className="text-[10px] font-bold">{item.label}</span>
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default FooterNav;
