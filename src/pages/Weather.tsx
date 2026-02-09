import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Sun, Cloud, CloudRain, CloudSun, Wind, Droplets, Waves, TreePine, Thermometer, Eye } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import { getCityData } from "@/data/cities";

const forecastDays = [
  { day: "Hoje", icon: Sun, temp: 28, min: 18, condition: "Ensolarado", wind: 12, humidity: 65, waves: "0.5m", uv: 8, visibility: "10km" },
  { day: "Amanhã", icon: CloudSun, temp: 25, min: 16, condition: "Parcialmente nublado", wind: 15, humidity: 70, waves: "0.8m", uv: 6, visibility: "8km" },
  { day: "Quarta", icon: Cloud, temp: 22, min: 15, condition: "Nublado", wind: 18, humidity: 78, waves: "1.0m", uv: 4, visibility: "6km" },
  { day: "Quinta", icon: CloudRain, temp: 20, min: 14, condition: "Chuva leve", wind: 22, humidity: 85, waves: "1.2m", uv: 3, visibility: "4km" },
  { day: "Sexta", icon: CloudRain, temp: 19, min: 13, condition: "Chuva", wind: 25, humidity: 90, waves: "1.5m", uv: 2, visibility: "3km" },
  { day: "Sábado", icon: CloudSun, temp: 24, min: 15, condition: "Melhorando", wind: 14, humidity: 68, waves: "0.7m", uv: 7, visibility: "9km" },
  { day: "Domingo", icon: Sun, temp: 27, min: 17, condition: "Ensolarado", wind: 10, humidity: 60, waves: "0.4m", uv: 9, visibility: "10km" },
];

const Weather = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;
  const cityData = getCityData(decodeURIComponent(city || ""), state || "");

  return (
    <div className="min-h-screen bg-background pb-20">
      <header className="bg-gradient-primary text-primary-foreground px-4 py-4">
        <div className="max-w-md mx-auto flex items-center gap-2">
          <button onClick={() => navigate(base)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
          <h1 className="font-display text-xl font-bold">Previsão do Tempo</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-4">
        {/* Current Weather */}
        <div className="bg-card rounded-2xl border border-border p-6 shadow-card text-center">
          <p className="text-sm text-muted-foreground font-bold mb-1">{cityData.name} - {state}</p>
          <Sun className="w-16 h-16 text-secondary mx-auto my-3" />
          <p className="text-5xl font-black text-foreground">{cityData.temperature}°C</p>
          <p className="text-sm text-muted-foreground mt-1">Ensolarado</p>
          <div className="grid grid-cols-4 gap-3 mt-4 pt-4 border-t border-border">
            <div className="text-center">
              <Wind className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs font-bold text-foreground">12 km/h</p>
              <p className="text-[10px] text-muted-foreground">Vento</p>
            </div>
            <div className="text-center">
              <Droplets className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs font-bold text-foreground">65%</p>
              <p className="text-[10px] text-muted-foreground">Umidade</p>
            </div>
            <div className="text-center">
              <Waves className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs font-bold text-foreground">0.5m</p>
              <p className="text-[10px] text-muted-foreground">Ondas</p>
            </div>
            <div className="text-center">
              <Eye className="w-4 h-4 text-primary mx-auto mb-1" />
              <p className="text-xs font-bold text-foreground">10km</p>
              <p className="text-[10px] text-muted-foreground">Visibilidade</p>
            </div>
          </div>
        </div>

        {/* Extra details */}
        <div className="grid grid-cols-3 gap-3">
          <div className="bg-card rounded-xl border border-border p-3 shadow-card text-center">
            <Thermometer className="w-5 h-5 text-destructive mx-auto mb-1" />
            <p className="text-xs font-bold text-foreground">UV: 8</p>
            <p className="text-[10px] text-muted-foreground">Muito Alto</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 shadow-card text-center">
            <TreePine className="w-5 h-5 text-accent mx-auto mb-1" />
            <p className="text-xs font-bold text-foreground">Baixo</p>
            <p className="text-[10px] text-muted-foreground">Esporos/Pólen</p>
          </div>
          <div className="bg-card rounded-xl border border-border p-3 shadow-card text-center">
            <Droplets className="w-5 h-5 text-primary mx-auto mb-1" />
            <p className="text-xs font-bold text-foreground">18°C</p>
            <p className="text-[10px] text-muted-foreground">Ponto Orvalho</p>
          </div>
        </div>

        {/* 7 Day Forecast */}
        <div className="space-y-2">
          <h2 className="font-display text-lg font-bold text-foreground">Próximos 7 dias</h2>
          {forecastDays.map((day, i) => (
            <div key={i} className="bg-card rounded-xl border border-border p-3 shadow-card flex items-center gap-3">
              <div className="w-16 text-left">
                <p className="text-xs font-bold text-foreground">{day.day}</p>
              </div>
              <day.icon className={`w-6 h-6 shrink-0 ${
                day.condition.includes("Ensolarado") ? "text-secondary" :
                day.condition.includes("Chuva") ? "text-primary" : "text-muted-foreground"
              }`} />
              <div className="flex-1">
                <p className="text-[11px] text-muted-foreground">{day.condition}</p>
              </div>
              <div className="text-right">
                <p className="text-sm font-bold text-foreground">{day.temp}°</p>
                <p className="text-[10px] text-muted-foreground">{day.min}°</p>
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-[10px] text-muted-foreground"><Wind className="w-3 h-3 inline" /> {day.wind}km/h</p>
                <p className="text-[10px] text-muted-foreground"><Droplets className="w-3 h-3 inline" /> {day.humidity}%</p>
              </div>
            </div>
          ))}
        </div>
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default Weather;
