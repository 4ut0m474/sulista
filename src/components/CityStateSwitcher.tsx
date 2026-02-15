import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight } from "lucide-react";
import { states, citiesByState } from "@/data/cities";
import { getCitySubLocations } from "@/data/subLocations";

interface CityStateSwitcherProps {
  currentState: string;
  currentCity: string;
  className?: string;
}

const CityStateSwitcher = ({ currentState, currentCity, className = "" }: CityStateSwitcherProps) => {
  const navigate = useNavigate();
  const [showStates, setShowStates] = useState(false);
  const [showCities, setShowCities] = useState(false);
  const [expandedCity, setExpandedCity] = useState<string | null>(null);

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
    setExpandedCity(null);
    navigate(`/city/${currentState}/${encodeURIComponent(city)}`);
  };

  const handleSubLocationClick = (city: string, subLocationName: string) => {
    setShowCities(false);
    setExpandedCity(null);
    navigate(`/city/${currentState}/${encodeURIComponent(city)}/local/${encodeURIComponent(subLocationName)}`);
  };

  const cities = citiesByState[currentState] || [];

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
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-card z-50 min-w-[240px] max-h-80 overflow-y-auto">
            {cities.map(c => {
              const subLocs = getCitySubLocations(c, currentState);
              const isExpanded = expandedCity === c;

              return (
                <div key={c}>
                  <div className="flex items-center">
                    <button
                      onClick={() => handleCityChange(c)}
                      className={`flex-1 text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${
                        decodedCity === c ? "bg-primary/10 text-primary font-bold" : "text-foreground"
                      }`}
                    >
                      {c}
                    </button>
                    {subLocs && (
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          setExpandedCity(isExpanded ? null : c);
                        }}
                        className="px-2 py-2 text-accent hover:bg-muted transition-colors"
                        title={`Ver ${subLocs.label}`}
                      >
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    )}
                  </div>
                  {subLocs && isExpanded && (
                    <div className="bg-muted/30 border-l-2 border-accent/30 ml-4">
                      <div className="px-3 py-1.5 text-[10px] font-bold uppercase tracking-wider text-accent">
                        {subLocs.label}
                      </div>
                      {/* Group by district */}
                      {(() => {
                        const districts = [...new Set(subLocs.subLocations.map(sl => sl.district))];
                        return districts.map(district => (
                          <div key={district}>
                            <div className="px-3 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/50">
                              {district}
                            </div>
                            {subLocs.subLocations
                              .filter(sl => sl.district === district)
                              .map(sl => (
                                <button
                                  key={sl.name}
                                  onClick={() => handleSubLocationClick(c, sl.name)}
                                  className="w-full text-left px-4 py-1.5 text-xs hover:bg-accent/10 text-foreground/80 hover:text-accent transition-colors"
                                >
                                  {sl.name}
                                </button>
                              ))}
                          </div>
                        ));
                      })()}
                    </div>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityStateSwitcher;
