// Helper to read admin-configured data from localStorage
// Used by public pages to display admin-managed content

export const getAdminConfig = () => {
  const stored = localStorage.getItem("admin_global_config");
  if (stored) return JSON.parse(stored);
  return {
    whatsapp: "(41) 99235-4211",
    whatsappNumber: "5541992354211",
    email: "eerb1976@gmail.com",
  };
};

export const getAdminCityData = (stateAbbr: string, cityName: string, section: string) => {
  const key = `admin_${stateAbbr}_${cityName}_${section}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
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
