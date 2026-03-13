import { useState, useEffect, useRef, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, MapPin, Loader2 } from "lucide-react";
import FooterNav from "@/components/FooterNav";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

type NearbyItem = {
  id: string;
  name: string;
  category: string | null;
  description: string | null;
  address: string | null;
  latitude: number | null;
  longitude: number | null;
  distance: number;
  bearing: number;
  matchesPreference: boolean;
};

const CATEGORY_LABELS: Record<string, string> = {
  restaurante: "Restaurante",
  pousada: "Pousada",
  cafe: "Café",
  lanche: "Lanchonete",
  artesanato: "Artesanato",
  comercio: "Comércio",
  farmacia: "Farmácia",
};

const AGE_PREFERENCES: Record<string, string[]> = {
  idoso: ["farmacia", "pousada", "restaurante", "cafe"],
  adulto: ["restaurante", "comercio", "cafe", "pousada"],
  jovem: ["lanche", "cafe", "artesanato", "comercio"],
  estudante: ["lanche", "cafe", "artesanato"],
};

function haversine(lat1: number, lon1: number, lat2: number, lon2: number) {
  const R = 6371000;
  const toRad = (d: number) => (d * Math.PI) / 180;
  const dLat = toRad(lat2 - lat1);
  const dLon = toRad(lon2 - lon1);
  const a = Math.sin(dLat / 2) ** 2 + Math.cos(toRad(lat1)) * Math.cos(toRad(lat2)) * Math.sin(dLon / 2) ** 2;
  return R * 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
}

function calcBearing(lat1: number, lon1: number, lat2: number, lon2: number) {
  const toRad = (d: number) => (d * Math.PI) / 180;
  const toDeg = (r: number) => (r * 180) / Math.PI;
  const dLon = toRad(lon2 - lon1);
  const y = Math.sin(dLon) * Math.cos(toRad(lat2));
  const x = Math.cos(toRad(lat1)) * Math.tan(toRad(lat2)) - Math.sin(toRad(lat1)) * Math.cos(dLon);
  return (toDeg(Math.atan2(y, x)) + 360) % 360;
}

function formatDistance(meters: number) {
  if (meters < 1000) return `${Math.round(meters)}m`;
  return `${(meters / 1000).toFixed(1)}km`;
}

function bearingToDirection(bearing: number) {
  const dirs = ["norte", "nordeste", "leste", "sudeste", "sul", "sudoeste", "oeste", "noroeste"];
  return dirs[Math.round(bearing / 45) % 8];
}

const NearbyOffers = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const { user } = useAuth();
  const cityName = decodeURIComponent(city || "");

  const [items, setItems] = useState<NearbyItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [userPos, setUserPos] = useState<{ lat: number; lng: number } | null>(null);
  const [heading, setHeading] = useState<number | null>(null);
  const headingRef = useRef<number | null>(null);

  // Get user preferences
  const [prefCategories, setPrefCategories] = useState<string[]>([]);

  useEffect(() => {
    const loadPrefs = async () => {
      if (!user) {
        // Guess from age in localStorage
        const profile = localStorage.getItem("litoranea-user-profile");
        if (profile) {
          try {
            const p = JSON.parse(profile);
            const age = parseInt(p.idade || "30", 10);
            const key = age >= 60 ? "idoso" : age < 18 ? "estudante" : age < 30 ? "jovem" : "adulto";
            setPrefCategories(AGE_PREFERENCES[key] || []);
          } catch { setPrefCategories([]); }
        }
        return;
      }
      const { data } = await supabase.from("user_profiles").select("*").eq("user_id", user.id).maybeSingle();
      if (data) {
        const age = data.idade || 30;
        const key = age >= 60 ? "idoso" : age < 18 ? "estudante" : age < 30 ? "jovem" : "adulto";
        const interests = data.interesses_geral || [];
        setPrefCategories([...new Set([...(AGE_PREFERENCES[key] || []), ...interests])]);
      }
    };
    loadPrefs();
  }, [user]);

  // GPS
  useEffect(() => {
    if (!navigator.geolocation) {
      setError("GPS não disponível neste dispositivo.");
      setLoading(false);
      return;
    }
    const watchId = navigator.geolocation.watchPosition(
      (pos) => setUserPos({ lat: pos.coords.latitude, lng: pos.coords.longitude }),
      () => {
        setError("Permita o acesso à localização para ver ofertas perto de você.");
        setLoading(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000 }
    );
    return () => navigator.geolocation.clearWatch(watchId);
  }, []);

  // Compass
  useEffect(() => {
    const handler = (e: DeviceOrientationEvent) => {
      const alpha = (e as any).webkitCompassHeading ?? e.alpha;
      if (alpha != null) {
        headingRef.current = alpha;
        setHeading(alpha);
      }
    };

    // Request permission on iOS
    if (typeof (DeviceOrientationEvent as any).requestPermission === "function") {
      (DeviceOrientationEvent as any).requestPermission().then((resp: string) => {
        if (resp === "granted") window.addEventListener("deviceorientation", handler, true);
      }).catch(() => {});
    } else {
      window.addEventListener("deviceorientation", handler, true);
    }
    return () => window.removeEventListener("deviceorientation", handler, true);
  }, []);

  // Fetch establishments & compute distances
  useEffect(() => {
    if (!userPos) return;
    const fetch = async () => {
      setLoading(true);
      const { data } = await supabase
        .from("establishments_public")
        .select("*")
        .eq("state_abbr", state || "")
        .eq("city", cityName);

      if (!data || data.length === 0) {
        setItems([]);
        setLoading(false);
        return;
      }

      const withDist: NearbyItem[] = data
        .filter((e: any) => e.latitude != null && e.longitude != null)
        .map((e: any) => {
          const dist = haversine(userPos.lat, userPos.lng, e.latitude, e.longitude);
          const bear = calcBearing(userPos.lat, userPos.lng, e.latitude, e.longitude);
          const cat = (e.category || "").toLowerCase();
          return {
            id: e.id,
            name: e.name || "",
            category: e.category,
            description: e.description,
            address: e.address,
            latitude: e.latitude,
            longitude: e.longitude,
            distance: dist,
            bearing: bear,
            matchesPreference: prefCategories.some(p => cat.includes(p)),
          };
        })
        .sort((a: NearbyItem, b: NearbyItem) => {
          if (a.matchesPreference && !b.matchesPreference) return -1;
          if (!a.matchesPreference && b.matchesPreference) return 1;
          return a.distance - b.distance;
        });

      setItems(withDist);
      setLoading(false);
    };
    fetch();
  }, [userPos, state, cityName, prefCategories]);

  // Update bearings every 2s
  useEffect(() => {
    if (!userPos) return;
    const interval = setInterval(() => {
      setItems(prev => prev.map(item => ({
        ...item,
        bearing: item.latitude && item.longitude
          ? calcBearing(userPos.lat, userPos.lng, item.latitude, item.longitude)
          : item.bearing,
      })));
    }, 2000);
    return () => clearInterval(interval);
  }, [userPos]);

  const getArrowRotation = (itemBearing: number) => {
    const h = heading ?? 0;
    return itemBearing - h;
  };

  return (
    <div className="min-h-screen pb-20 bg-background">
      <header className="sticky top-0 z-30 bg-card/95 backdrop-blur-xl border-b border-border px-4 py-3">
        <div className="max-w-md mx-auto flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="p-2 rounded-full bg-card border border-border shadow-card">
            <ChevronLeft className="w-5 h-5 text-foreground" />
          </button>
          <MapPin className="w-5 h-5 text-primary" />
          <h1 className="font-display text-lg font-bold text-foreground">Ofertas Perto</h1>
        </div>
      </header>

      <div className="max-w-md mx-auto px-4 py-4 space-y-3">
        {loading && (
          <div className="flex flex-col items-center gap-3 py-16 text-muted-foreground">
            <Loader2 className="w-8 h-8 animate-spin text-primary" />
            <p className="text-sm">Buscando ofertas próximas...</p>
          </div>
        )}

        {error && (
          <div className="bg-destructive/10 border border-destructive/30 rounded-2xl p-4 text-center">
            <MapPin className="w-8 h-8 text-destructive mx-auto mb-2" />
            <p className="text-sm text-destructive font-semibold">{error}</p>
          </div>
        )}

        {!loading && !error && items.length === 0 && (
          <div className="text-center py-16 text-muted-foreground">
            <MapPin className="w-10 h-10 mx-auto mb-3 opacity-40" />
            <p className="font-semibold">Nenhuma oferta cadastrada perto de você ainda.</p>
            <p className="text-xs mt-1">Estabelecimentos com localização serão exibidos aqui.</p>
          </div>
        )}

        {items.map((item, idx) => (
          <div
            key={item.id}
            className={`rounded-2xl border p-4 shadow-card backdrop-blur-sm transition-all ${
              item.matchesPreference
                ? "border-primary bg-primary/5 ring-1 ring-primary/30"
                : "border-border bg-card/90"
            }`}
          >
            <div className="flex items-start gap-3">
              {/* Green arrow */}
              <div className="flex-shrink-0 mt-1">
                <svg
                  width="40"
                  height="40"
                  viewBox="0 0 40 40"
                  style={{
                    transform: `rotate(${getArrowRotation(item.bearing)}deg)`,
                    transition: "transform 0.5s ease-out",
                  }}
                >
                  <polygon
                    points="20,4 32,32 20,26 8,32"
                    fill="#00ff00"
                    stroke="#00cc00"
                    strokeWidth="1.5"
                  />
                </svg>
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 mb-1">
                  {item.matchesPreference && (
                    <span className="text-[9px] font-bold bg-primary/20 text-primary px-1.5 py-0.5 rounded-full">Pra você</span>
                  )}
                  <span className="text-[10px] text-muted-foreground">
                    {CATEGORY_LABELS[item.category || ""] || item.category}
                  </span>
                </div>
                <h3 className="font-bold text-foreground text-sm leading-tight">{item.name}</h3>
                <p className="text-xs text-muted-foreground mt-1">
                  Tá a <strong className="text-foreground">{formatDistance(item.distance)}</strong> de você, sentido{" "}
                  <strong className="text-foreground">{bearingToDirection(item.bearing)}</strong>
                  {item.matchesPreference && " — combina com seu perfil ✨"}
                </p>
                {item.address && (
                  <p className="text-[10px] text-muted-foreground mt-0.5">{item.address}</p>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      <FooterNav stateAbbr={state || ""} cityName={city || ""} />
    </div>
  );
};

export default NearbyOffers;
