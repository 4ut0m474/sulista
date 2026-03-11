import { useState, useEffect, useMemo } from "react";
import { supabase } from "@/integrations/supabase/client";

export interface Localidade {
  id: string;
  state_abbr: string;
  state_name: string;
  city: string | null;
  type: string; // 'estado' | 'cidade' | 'praia' | 'bairro'
  name: string;
  district: string | null;
  description: string | null;
  image_url: string | null;
  highlights: string[];
  group_label: string | null;
  sort_order: number;
}

interface LocalidadesState {
  data: Localidade[];
  loading: boolean;
  states: { name: string; abbr: string }[];
  citiesByState: Record<string, string[]>;
}

let cachedData: Localidade[] | null = null;

export function useLocalidades(): LocalidadesState {
  const [data, setData] = useState<Localidade[]>(cachedData || []);
  const [loading, setLoading] = useState(!cachedData);

  useEffect(() => {
    if (cachedData) return;

    const fetch = async () => {
      const { data: rows, error } = await supabase
        .from("localidades")
        .select("*")
        .order("sort_order", { ascending: true });

      if (!error && rows) {
        const typed = rows as unknown as Localidade[];
        cachedData = typed;
        setData(typed);
      }
      setLoading(false);
    };
    fetch();
  }, []);

  const states = useMemo(() => {
    return data
      .filter(d => d.type === "estado")
      .map(s => ({ name: s.name, abbr: s.state_abbr }));
  }, [data]);

  const citiesByState = useMemo(() => {
    const cityRows = data.filter(d => d.type === "cidade");
    const result: Record<string, string[]> = {};
    for (const c of cityRows) {
      if (!result[c.state_abbr]) result[c.state_abbr] = [];
      result[c.state_abbr].push(c.name);
    }
    return result;
  }, [data]);

  return { data, loading, states, citiesByState };
}

export interface SubLocation {
  name: string;
  district: string;
  description: string;
  image: string;
  highlights: string[];
}

export interface SubLocationGroup {
  type: "praias" | "bairros";
  label: string;
  subLocations: SubLocation[];
}

export interface CitySubLocations {
  cityName: string;
  stateAbbr: string;
  label: string;
  groups: SubLocationGroup[];
  subLocations: SubLocation[];
}

export function useSubLocations(cityName: string, stateAbbr: string): CitySubLocations | undefined {
  const { data } = useLocalidades();

  return useMemo(() => {
    const subs = data.filter(
      d => d.city === cityName && d.state_abbr === stateAbbr && (d.type === "praia" || d.type === "bairro")
    );
    if (subs.length === 0) return undefined;

    const groupMap = new Map<string, SubLocationGroup>();
    for (const s of subs) {
      const groupType = s.type === "praia" ? "praias" : "bairros";
      const key = groupType;
      if (!groupMap.has(key)) {
        groupMap.set(key, {
          type: groupType,
          label: s.group_label || (groupType === "praias" ? "Praias" : "Bairros Turísticos"),
          subLocations: [],
        });
      }
      groupMap.get(key)!.subLocations.push({
        name: s.name,
        district: s.district || "",
        description: s.description || "",
        image: s.image_url || "",
        highlights: s.highlights || [],
      });
    }

    const groups = Array.from(groupMap.values());
    const allSubs = groups.flatMap(g => g.subLocations);

    return {
      cityName,
      stateAbbr,
      label: groups[0]?.label || "Locais",
      groups,
      subLocations: allSubs,
    };
  }, [data, cityName, stateAbbr]);
}

/**
 * Non-hook version for components that need it synchronously.
 * Returns data from cache or undefined.
 */
export function getCachedSubLocations(cityName: string, stateAbbr: string): CitySubLocations | undefined {
  if (!cachedData) return undefined;
  const subs = cachedData.filter(
    d => d.city === cityName && d.state_abbr === stateAbbr && (d.type === "praia" || d.type === "bairro")
  );
  if (subs.length === 0) return undefined;

  const groupMap = new Map<string, SubLocationGroup>();
  for (const s of subs) {
    const groupType = s.type === "praia" ? "praias" : "bairros";
    if (!groupMap.has(groupType)) {
      groupMap.set(groupType, {
        type: groupType,
        label: s.group_label || (groupType === "praias" ? "Praias" : "Bairros Turísticos"),
        subLocations: [],
      });
    }
    groupMap.get(groupType)!.subLocations.push({
      name: s.name,
      district: s.district || "",
      description: s.description || "",
      image: s.image_url || "",
      highlights: s.highlights || [],
    });
  }

  const groups = Array.from(groupMap.values());
  return {
    cityName,
    stateAbbr,
    label: groups[0]?.label || "Locais",
    groups,
    subLocations: groups.flatMap(g => g.subLocations),
  };
}
