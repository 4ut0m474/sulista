import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { plans as globalPlans } from "@/data/cities";

export interface CityPlan {
  id: string;
  plano_nome: string;
  preco: number;
  beneficios: string[];
  descricao: string | null;
  /** Mapped fields for compatibility with existing UI */
  name: string;
  price: number;
  features: string[];
  annualDiscount: number;
  highlight: boolean;
  isVip?: boolean;
}

const ANNUAL_DISCOUNTS: Record<string, number> = {
  "Litorânea IA": 17,
  "Básico": 10,
  "Carrossel": 15,
  "Combo": 20,
  "VIP": 25,
};

function mapDbPlan(row: any): CityPlan {
  const nome = row.plano_nome as string;
  return {
    id: row.id,
    plano_nome: nome,
    preco: Number(row.preco),
    beneficios: row.beneficios ?? [],
    descricao: row.descricao,
    name: nome,
    price: Number(row.preco),
    features: row.beneficios ?? [],
    annualDiscount: ANNUAL_DISCOUNTS[nome] ?? 10,
    highlight: nome === "Combo",
    isVip: nome === "VIP",
  };
}

export function useCityPlans(stateAbbr: string, cityName: string) {
  const [plans, setPlans] = useState<CityPlan[]>([]);
  const [loading, setLoading] = useState(true);
  const [isFromDb, setIsFromDb] = useState(false);

  useEffect(() => {
    if (!stateAbbr || !cityName) {
      setPlans(globalPlans as unknown as CityPlan[]);
      setLoading(false);
      return;
    }

    (async () => {
      setLoading(true);
      try {
        const { data, error } = await supabase
          .from("planos_cidade")
          .select("*")
          .eq("state_abbr", stateAbbr)
          .eq("city", cityName)
          .eq("ativo", true)
          .order("preco", { ascending: true });

        if (!error && data && data.length > 0) {
          setPlans(data.map(mapDbPlan));
          setIsFromDb(true);
        } else {
          // Fallback to global static plans
          setPlans(globalPlans as unknown as CityPlan[]);
          setIsFromDb(false);
        }
      } catch {
        setPlans(globalPlans as unknown as CityPlan[]);
        setIsFromDb(false);
      } finally {
        setLoading(false);
      }
    })();
  }, [stateAbbr, cityName]);

  return { plans, loading, isFromDb };
}
