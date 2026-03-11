import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { ChevronDown, ChevronRight, Palmtree, Building2 } from "lucide-react";
import { useLocalidades, getCachedSubLocations, type SubLocationGroup } from "@/hooks/useLocalidades";

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
  const [expandedGroup, setExpandedGroup] = useState<string | null>(null);

  const stateName = states.find(s => s.abbr === currentState)?.name || currentState;
  const decodedCity = decodeURIComponent(currentCity);

  const handleStateChange = (abbr: string) => {
    setShowStates(false);
    const firstCity = citiesByState[abbr]?.[0];
    if (firstCity) navigate(`/city/${abbr}/${encodeURIComponent(firstCity)}`);
  };

  const handleCityChange = (city: string) => {
    setShowCities(false);
    setExpandedCity(null);
    setExpandedGroup(null);
    navigate(`/city/${currentState}/${encodeURIComponent(city)}`);
  };

  const handleSubLocationClick = (city: string, subLocationName: string) => {
    setShowCities(false);
    setExpandedCity(null);
    setExpandedGroup(null);
    navigate(`/city/${currentState}/${encodeURIComponent(city)}/local/${encodeURIComponent(subLocationName)}`);
  };

  const cities = citiesByState[currentState] || [];
  const groupIcon = (type: string) => type === "praias"
    ? <Palmtree className="w-3 h-3" />
    : <Building2 className="w-3 h-3" />;

  return (
    <div className={`flex flex-col ${className}`}>
      {/* State */}
      <div className="relative">
        <button
          onClick={() => { setShowStates(!showStates); setShowCities(false); }}
          className="flex items-center gap-1 text-xs font-semibold uppercase tracking-wider text-muted-foreground hover:text-primary transition-colors"
        >
          {stateName}
          <ChevronDown className={`w-3 h-3 transition-transform ${showStates ? "rotate-180" : ""}`} />
        </button>
        {showStates && (
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-card min-w-[180px] overflow-hidden" style={{ zIndex: 9999 }}>
            {states.map(s => (
              <button key={s.abbr} onClick={() => handleStateChange(s.abbr)}
                className={`w-full text-left px-4 py-2.5 text-sm hover:bg-muted transition-colors ${currentState === s.abbr ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}
              >{s.name}</button>
            ))}
          </div>
        )}
      </div>

      {/* City */}
      <div className="relative">
        <button
          onClick={() => { setShowCities(!showCities); setShowStates(false); }}
          className="flex items-center gap-1 font-display text-2xl font-bold text-foreground hover:text-primary transition-colors"
        >
          {decodedCity}
          <ChevronDown className={`w-4 h-4 transition-transform ${showCities ? "rotate-180" : ""}`} />
        </button>
        {showCities && (
          <div className="absolute top-full left-0 mt-1 bg-card border border-border rounded-xl shadow-card min-w-[260px] max-h-[70vh] overflow-y-auto" style={{ zIndex: 9999 }}>
            {cities.map(c => {
              const subLocs = getCitySubLocations(c, currentState);
              const isExpanded = expandedCity === c;

              return (
                <div key={c}>
                  <div className="flex items-center">
                    <button onClick={() => handleCityChange(c)}
                      className={`flex-1 text-left px-4 py-2 text-sm hover:bg-muted transition-colors ${decodedCity === c ? "bg-primary/10 text-primary font-bold" : "text-foreground"}`}
                    >{c}</button>
                    {subLocs && subLocs.groups.length > 0 && (
                      <button
                        onClick={(e) => { e.stopPropagation(); setExpandedCity(isExpanded ? null : c); setExpandedGroup(null); }}
                        className="px-2 py-2 text-accent hover:bg-muted transition-colors"
                        title="Ver locais"
                      >
                        <ChevronRight className={`w-3.5 h-3.5 transition-transform ${isExpanded ? "rotate-90" : ""}`} />
                      </button>
                    )}
                  </div>

                  {/* Expanded: show groups separately */}
                  {subLocs && isExpanded && subLocs.groups.map(group => {
                    const groupKey = `${c}-${group.type}`;
                    const isGroupExpanded = expandedGroup === groupKey;
                    return (
                      <div key={groupKey} className="ml-3 border-l-2 border-accent/20">
                        <button
                          onClick={() => setExpandedGroup(isGroupExpanded ? null : groupKey)}
                          className="w-full flex items-center gap-1.5 px-3 py-1.5 text-xs font-bold uppercase tracking-wider text-accent hover:bg-muted/50 transition-colors"
                        >
                          {groupIcon(group.type)}
                          {group.label}
                          <ChevronRight className={`w-3 h-3 ml-auto transition-transform ${isGroupExpanded ? "rotate-90" : ""}`} />
                        </button>

                        {isGroupExpanded && (
                          <div className="bg-muted/20">
                            {(() => {
                              const districts = [...new Set(group.subLocations.map(sl => sl.district))];
                              return districts.map(district => (
                                <div key={district}>
                                  <div className="px-4 py-1 text-[10px] font-semibold text-muted-foreground uppercase tracking-wider bg-muted/40">
                                    {district}
                                  </div>
                                  {group.subLocations
                                    .filter(sl => sl.district === district)
                                    .map(sl => (
                                      <button key={sl.name}
                                        onClick={() => handleSubLocationClick(c, sl.name)}
                                        className="w-full text-left px-5 py-1.5 text-xs hover:bg-accent/10 text-foreground/80 hover:text-accent transition-colors"
                                      >{sl.name}</button>
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
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default CityStateSwitcher;
