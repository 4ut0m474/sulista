import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown } from "lucide-react";
import { states, citiesByState } from "@/data/cities";

interface CityStateSwitcherProps {
  currentState: string;
  currentCity: string;
  className?: string;
}

const CityStateSwitcher = ({ currentState, currentCity, className = "" }: CityStateSwitcherProps) => {
  const navigate = useNavigate();
  const [showStates, setShowStates] = useState(false);
  const [showCities, setShowCities] = useState(false);

  const stateName = states.find(s => s.abbr === currentState)?.name || currentState;
  const decodedCity = decodeURIComponent(currentCity);

  const handleStateChange = (abbr: string) => {
    setShowStates(false);
    const firstCity = citiesByState[abbr]?.[0];
    if (firstCity) {
      navigate(`/city/${abbr}/${encodeURIComponent(firstCity)}`);
    }
  };

  const handleCityChange = (city: string) => {
    setShowCities(false);
    navigate(`/city/${currentState}/${encodeURIComponent(city)}`);
  };

  return (
    <div className={`flex flex-col ${className}`}>
      {/* State name - clickable */}
      <div className="relative">
        <button
          onClick={() => { setShowStates(!showStates); setShowCities(false); }}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
        >
          {stateName}
          <ChevronDown className={`w-3 h-3 transition-transform ${showStates ? "rotate-180" : ""}`} />
        </button>
        {showStates && (
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-card z-50 min-w-[180px] overflow-hidden">
            {states.map(s => (
              <button
                key={s.abbr}
                onClick={() => handleStateChange(s.abbr)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${
                  currentState === s.abbr ? "bg-primary/10 text-primary font-bold" : "text-foreground"
                }`}
              >
                {s.name}
              </button>
            ))}
          </div>
        )}
      </div>

      {/* City name - clickable */}
      <div className="relative">
        <button
          onClick={() => { setShowCities(!showCities); setShowStates(false); }}
          className="flex items-center gap-1 font-display text-2xl font-bold text-foreground hover:text-primary transition-colors"
        >
          {decodedCity}
          <ChevronDown className={`w-4 h-4 transition-transform ${showCities ? "rotate-180" : ""}`} />
        </button>
        {showCities && (
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-card z-50 min-w-[220px] max-h-72 overflow-y-auto">
            {(citiesByState[currentState] || []).map(c => (
              <button
                key={c}
                onClick={() => handleCityChange(c)}
                className={`w-full text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                  decodedCity === c ? "bg-primary/10 text-primary font-bold" : "text-foreground"
                }`}
              >
                {c}
              </button>
            ))}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityStateSwitcher;
