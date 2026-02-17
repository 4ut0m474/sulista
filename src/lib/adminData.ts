// Helper to read admin-configured data from Supabase
// Used by public pages to display admin-managed content

import { supabase } from "@/integrations/supabase/client";

// Default config values
const DEFAULT_CONFIG = {
  whatsapp: "(41) 99235-4211",
  whatsappNumber: "5541992354211",
  email: "eerb1976@gmail.com",
};

export const getAdminConfig = async (): Promise<typeof DEFAULT_CONFIG> => {
  const { data, error } = await supabase
    .from("admin_config")
    .select("value")
    .eq("key", "global_config")
    .maybeSingle();
  // If RLS blocks access (non-admin), gracefully return defaults
  if (error || !data?.value || typeof data.value !== "object") {
    return DEFAULT_CONFIG;
  }
  return { ...DEFAULT_CONFIG, ...(data.value as Record<string, string>) };
};

export const setAdminConfig = async (config: Record<string, string>) => {
  const { error } = await supabase
    .from("admin_config")
    .upsert({ key: "global_config", value: config as any }, { onConflict: "key" });
  return { error };
};

export const getAdminCityData = async (stateAbbr: string, cityName: string, section: string) => {
  const { data } = await supabase
    .from("admin_city_content")
    .select("data")
    .eq("state_abbr", stateAbbr)
    .eq("city", cityName)
    .eq("section", section)
    .maybeSingle();
  return data?.data ?? null;
};

export const setAdminCityData = async (stateAbbr: string, cityName: string, section: string, sectionData: any) => {
  const { error } = await supabase
    .from("admin_city_content")
    .upsert(
      { state_abbr: stateAbbr, city: cityName, section, data: sectionData },
      { onConflict: "state_abbr,city,section" }
    );
  return { error };
};

// Notifications
export const getAdminNotifications = async () => {
  const { data } = await supabase
    .from("admin_notifications")
    .select("*")
    .order("created_at", { ascending: false });
  return data || [];
};

export const addAdminNotification = async (notif: {
  type: string;
  title: string;
  description: string;
  city?: string;
  state_abbr?: string;
}) => {
  await supabase.from("admin_notifications").insert(notif as any);
};

export const markAllNotificationsRead = async () => {
  await supabase.from("admin_notifications").update({ read: true } as any).eq("read", false);
};

// Page background images - unique per page type
export const pageBackgrounds: Record<string, string> = {
  market: "https://images.unsplash.com/photo-1533900298318-6b8da08a523e?w=1200&q=80",
  promotions: "https://images.unsplash.com/photo-1441986300917-64674bd600d8?w=1200&q=80",
  events: "https://images.unsplash.com/photo-1492684223066-81342ee5ff30?w=1200&q=80",
  opinion: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=1200&q=80",
  treasure: "https://images.unsplash.com/photo-1469474968028-56623f02e42e?w=1200&q=80",
  trails: "https://images.unsplash.com/photo-1441974231531-c6227db76b6e?w=1200&q=80",
  commerce: "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=1200&q=80",
  plans: "https://images.unsplash.com/photo-1501785888041-af3ef285b470?w=1200&q=80",
  merchant: "https://images.unsplash.com/photo-1470071459604-3b5ec3a7fe05?w=1200&q=80",
  weather: "https://images.unsplash.com/photo-1504608524841-42fe6f032b4b?w=1200&q=80",
};
