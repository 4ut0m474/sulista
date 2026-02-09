import { NavLink as RouterNavLink, useLocation } from "react-router-dom";
import { Home, Compass, Settings, CloudSun } from "lucide-react";

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
    { label: "Tempo", icon: CloudSun, path: `${base}/weather` },
    { label: "Comerciante", icon: Settings, path: `${base}/merchant` },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 bg-card/95 backdrop-blur-xl border-t border-border">
      <div className="max-w-md mx-auto flex items-center justify-around py-2">
        {items.map(item => {
          const isActive = location.pathname === item.path;
          return (
            <RouterNavLink
              key={item.label}
              to={item.path}
              className={`flex flex-col items-center gap-0.5 px-4 py-1.5 rounded-lg transition-colors ${
                isActive ? "text-primary" : "text-muted-foreground hover:text-foreground"
              }`}
            >
              <item.icon className="w-5 h-5" />
              <span className="text-[10px] font-bold">{item.label}</span>
            </RouterNavLink>
          );
        })}
      </div>
    </nav>
  );
};

export default FooterNav;
