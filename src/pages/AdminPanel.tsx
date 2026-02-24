import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Store, Image, Tag, Calendar, MapPin, Settings, LogOut, Compass, Map, TreePine, Lock, Eye, EyeOff, GripVertical, Plus, Trash2, Save, Edit2, X, Bell, Filter, RefreshCw, Copy, Check, FileText, Star, ShoppingCart, TreePalm } from "lucide-react";
import { useState, useEffect } from "react";
import { states, citiesByState, getCityData } from "@/data/cities";
import { getCitySubLocations, type SubLocation } from "@/data/subLocations";
import { sanitizeText, isValidUrl, isValidEmail, isValidPhone, MAX_NAME, MAX_DESCRIPTION, MAX_URL, MAX_DATE, MAX_CATEGORY, MAX_PRIZE, MAX_PHONE, MAX_EMAIL, MAX_PASSWORD } from "@/lib/validation";
import { useAdminAuth } from "@/hooks/useAdminAuth";
import { supabase } from "@/integrations/supabase/client";
import { getAdminCityData, setAdminCityData, getAdminConfig, setAdminConfig, getAdminNotifications, addAdminNotification, markAllNotificationsRead } from "@/lib/adminData";
import litoraneaAvatar from "@/assets/litoranea-avatar.png";
// Types
interface AdminNotification {
  id: number;
  type: "purchase" | "city_update" | "merchant_update";
  title: string;
  description: string;
  timestamp: string;
  read: boolean;
  city?: string;
  state?: string;
}

interface EditableItem {
  id: number;
  name: string;
  description?: string;
  image?: string;
  position?: number;
  plan?: string;
  category?: string;
  date?: string;
  prize?: string;
  difficulty?: string;
  active?: boolean;
  secretCode?: string;
  // Group buy fields
  originalPrice?: string;
  discountPrice?: string;
  minBuyers?: number;
  currentBuyers?: number;
  // Sub-location fields
  district?: string;
  highlights?: string[];
}

const generateSecretCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  const array = new Uint8Array(12);
  crypto.getRandomValues(array);
  return Array.from(array, (byte) => chars[byte % chars.length]).join("");
};

const defaultNotifications: AdminNotification[] = [
  { id: 1, type: "purchase", title: "Nova compra de propaganda", description: "Comerciante João solicitou Plano Combo para Barraca 6 em Gramado-RS", timestamp: "09/02/2026 10:30", read: false, city: "Gramado", state: "RS" },
  { id: 2, type: "merchant_update", title: "Comerciante atualizou produtos", description: "Comerciante 1 atualizou fotos da Barraca 1 em Morretes-PR", timestamp: "08/02/2026 15:20", read: true, city: "Morretes", state: "PR" },
  { id: 3, type: "city_update", title: "Informações da cidade atualizadas", description: "Descrição de Florianópolis-SC foi alterada pelo admin", timestamp: "07/02/2026 09:00", read: true, city: "Florianópolis", state: "SC" },
  { id: 4, type: "purchase", title: "Nova compra de propaganda", description: "Comerciante Maria solicitou Plano VIP para Barraca 10 em Curitiba-PR", timestamp: "06/02/2026 14:45", read: false, city: "Curitiba", state: "PR" },
];

// Helper to get/set admin data per city (now async via Supabase, handled by adminData.ts)

// Notifications are now async via Supabase

const defaultStalls = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: i <= 4 ? `Comerciante ${i + 1}` : "",
  description: i <= 4 ? "Produtos artesanais da região" : "",
  active: i <= 4,
  secretCode: generateSecretCode(),
}));

const defaultCarousel = [
  { id: 1, name: "Restaurante Colonial", description: "Comida típica regional", image: "", active: true },
  { id: 2, name: "Pousada Serra Verde", description: "Hospedagem aconchegante", image: "", active: true },
  { id: 3, name: "Artesanato Local", description: "Peças artesanais únicas", image: "", active: true },
];

const defaultPromotions = [
  { id: 1, name: "20% OFF Restaurante Colonial", description: "Válido até 30/03", active: true },
  { id: 2, name: "Combo Especial Pousada", description: "2 diárias pelo preço de 1", active: true },
];

const defaultEvents = [
  { id: 1, name: "Festival Gastronômico", description: "Pratos típicos da região", date: "15/03/2026", active: true },
  { id: 2, name: "Feira de Artesanato", description: "Artesãos locais", date: "20/03/2026", active: true },
];

const defaultExplore = [
  { id: 1, name: "Restaurante Colonial", category: "Restaurante", plan: "VIP", position: 1 },
  { id: 2, name: "Pousada Serra Verde", category: "Pousada", plan: "Combo", position: 2 },
  { id: 3, name: "Café & Confeitaria", category: "Café", plan: "Básico", position: 3 },
  { id: 4, name: "Artesanato do Sul", category: "Artesanato", plan: "Carrossel", position: 4 },
  { id: 5, name: "Churrascaria Gaúcha", category: "Restaurante", plan: "VIP", position: 5 },
];

const defaultTreasure = [
  { id: 1, name: "Pista 1 - Praça Central", description: "Encontre a placa histórica", prize: "Desconto 10%", active: true },
  { id: 2, name: "Pista 2 - Igreja Matriz", description: "Foto na porta principal", prize: "Brinde especial", active: true },
];

const defaultTrails = [
  { id: 1, name: "Trilha da Serra", description: "5km - Nível médio", difficulty: "Médio", active: true },
  { id: 2, name: "Caminho das Cachoeiras", description: "3km - Nível fácil", difficulty: "Fácil", active: true },
];

const defaultGroupBuy = [
  { id: 1, name: "Passeio de Barco - Grupo", description: "Passeio coletivo com desconto", originalPrice: "R$ 150", discountPrice: "R$ 90", minBuyers: 10, currentBuyers: 3, active: true },
  { id: 2, name: "Jantar Colonial - 20 pessoas", description: "Jantar com menu completo", originalPrice: "R$ 120", discountPrice: "R$ 75", minBuyers: 20, currentBuyers: 8, active: true },
];

const AdminPanel = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;

  // Auth via Supabase
  const { isAuthenticated, isLoading: authLoading, signIn, signOut, changePassword } = useAdminAuth();
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);

  const handleAdminAuth = async () => {
    if (!loginUser || !loginPass) {
      setLoginError("Preencha todos os campos");
      return;
    }
    setLoginLoading(true);
    const { error } = await signIn(loginUser, loginPass);
    setLoginLoading(false);
    if (error) {
      setLoginError(error);
    } else {
      setLoginError("");
    }
  };

  const handleLogout = async () => {
    await signOut();
    navigate(base);
  };

  const [activeTab, setActiveTab] = useState("notifications");
  const [selectedState, setSelectedState] = useState(state || "");
  const [selectedCity, setSelectedCity] = useState(city ? decodeURIComponent(city) : "");
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  // Notification filter
  const [notifFilter, setNotifFilter] = useState<"all" | "purchase" | "city_update" | "merchant_update">("all");
  const [notifications, setNotifications] = useState<AdminNotification[]>([]);

  // Load notifications from database
  useEffect(() => {
    const loadNotifs = async () => {
      const notifs = await getAdminNotifications();
      setNotifications(notifs.map((n: any) => ({
        id: n.id || Date.now(),
        type: n.type,
        title: n.title,
        description: n.description,
        timestamp: n.created_at ? new Date(n.created_at).toLocaleString("pt-BR") : "",
        read: n.read,
        city: n.city,
        state: n.state_abbr,
      })));
    };
    loadNotifs();
  }, []);

  // Password
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Global config
  const [configWhatsapp, setConfigWhatsapp] = useState("");
  const [configEmail, setConfigEmail] = useState("");
  const [configMsg, setConfigMsg] = useState("");

  // Delete confirmation
  const [deleteConfirm, setDeleteConfirm] = useState<{ section: string; id: number; name: string } | null>(null);

  // City settings
  const [cityBirthday, setCityBirthday] = useState("");
  const [cityDescription, setCityDescription] = useState("");
  const [cityHistory, setCityHistory] = useState("");
  const [cityFestivities, setCityFestivities] = useState("");
  const [cityMsg, setCityMsg] = useState("");

  // Copied code feedback
  const [copiedId, setCopiedId] = useState<number | null>(null);

  // Section data
  const [stalls, setStalls] = useState<EditableItem[]>([]);
  const [carousel, setCarousel] = useState<EditableItem[]>([]);
  const [promotions, setPromotions] = useState<EditableItem[]>([]);
  const [events, setEvents] = useState<EditableItem[]>([]);
  const [explore, setExplore] = useState<EditableItem[]>([]);
  const [treasure, setTreasure] = useState<EditableItem[]>([]);
  const [trails, setTrails] = useState<EditableItem[]>([]);
  const [groupBuy, setGroupBuy] = useState<EditableItem[]>([]);
  const [subLocations, setSubLocations] = useState<EditableItem[]>([]);

  const availableCities = selectedState ? citiesByState[selectedState] || [] : [];

  // Check if selected city has sub-locations
  const citySubLocs = selectedCity && selectedState ? getCitySubLocations(selectedCity, selectedState) : undefined;

  // Load global config
  useEffect(() => {
    const loadConfig = async () => {
      const cfg = await getAdminConfig();
      setConfigWhatsapp(cfg.whatsapp || "(41) 99235-4211");
      setConfigEmail(cfg.email || "eerb1976@gmail.com");
    };
    loadConfig();
  }, []);

  // Load data when city changes
  useEffect(() => {
    if (!selectedState || !selectedCity) return;
    const loadCityData = async () => {
      const sections = ["stalls", "carousel", "promotions", "events", "explore", "treasure", "trails", "groupBuy", "subLocations", "city_settings"];
      const results = await Promise.all(
        sections.map(s => getAdminCityData(selectedState, selectedCity, s))
      );
      const [stallsData, carouselData, promosData, eventsData, exploreData, treasureData, trailsData, groupBuyData, subLocsData, citySettingsData] = results;

      setStalls((stallsData as any) || defaultStalls);
      setCarousel((carouselData as any) || defaultCarousel);
      setPromotions((promosData as any) || defaultPromotions);
      setEvents((eventsData as any) || defaultEvents);
      setExplore((exploreData as any) || defaultExplore);
      setTreasure((treasureData as any) || defaultTreasure);
      setTrails((trailsData as any) || defaultTrails);
      setGroupBuy((groupBuyData as any) || defaultGroupBuy);

      if (subLocsData) {
        setSubLocations(subLocsData as any);
      } else {
        const defaultSubLocs = getCitySubLocations(selectedCity, selectedState);
        if (defaultSubLocs) {
          setSubLocations(defaultSubLocs.subLocations.map((sl, i) => ({
            id: i + 1,
            name: sl.name,
            description: sl.description,
            image: sl.image,
            district: sl.district,
            highlights: sl.highlights,
            active: true,
          })));
        } else {
          setSubLocations([]);
        }
      }

      if (citySettingsData && typeof citySettingsData === "object" && !Array.isArray(citySettingsData)) {
        const cs = citySettingsData as Record<string, string>;
        setCityBirthday(cs.birthday || "");
        setCityDescription(cs.description || "");
        setCityHistory(cs.history || "");
        setCityFestivities(cs.festivities || "");
      } else {
        const defaultData = getCityData(selectedCity, selectedState);
        setCityBirthday(defaultData.birthday);
        setCityDescription(defaultData.description);
        setCityHistory(defaultData.history);
        setCityFestivities(defaultData.festivities);
      }
    };
    loadCityData();
  }, [selectedState, selectedCity]);

  const saveSection = async (section: string, data: EditableItem[]) => {
    if (!selectedState || !selectedCity) return;
    await setAdminCityData(selectedState, selectedCity, section, data);
    setSaveMsg("Salvo com sucesso!");
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const saveCitySettings = async () => {
    if (!selectedState || !selectedCity) return;
    const sanitizedBirthday = sanitizeText(cityBirthday);
    const sanitizedDesc = sanitizeText(cityDescription);
    const sanitizedHistory = sanitizeText(cityHistory);
    const sanitizedFestivities = sanitizeText(cityFestivities);
    if (sanitizedDesc.length > 2000) { setCityMsg("Descrição muito longa (máx. 2000 caracteres)"); setTimeout(() => setCityMsg(""), 3000); return; }
    if (sanitizedHistory.length > 5000) { setCityMsg("História muito longa (máx. 5000 caracteres)"); setTimeout(() => setCityMsg(""), 3000); return; }
    await setAdminCityData(selectedState, selectedCity, "city_settings", {
      birthday: sanitizedBirthday,
      description: sanitizedDesc,
      history: sanitizedHistory,
      festivities: sanitizedFestivities,
    });
    await addAdminNotification({
      type: "city_update",
      title: "Informações da cidade atualizadas",
      description: `Configurações de ${selectedCity}-${selectedState} foram alteradas pelo admin`,
      city: selectedCity,
      state_abbr: selectedState,
    });
    const notifs = await getAdminNotifications();
    setNotifications(notifs.map((n: any) => ({
      id: n.id || Date.now(),
      type: n.type,
      title: n.title,
      description: n.description,
      timestamp: n.created_at ? new Date(n.created_at).toLocaleString("pt-BR") : "",
      read: n.read,
      city: n.city,
      state: n.state_abbr,
    })));
    setCityMsg("Configurações da cidade salvas!");
    setTimeout(() => setCityMsg(""), 2000);
  };

  const addItem = (section: string, items: EditableItem[], setItems: (v: EditableItem[]) => void) => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const newItem: EditableItem = {
      id: newId,
      name: "",
      description: "",
      active: true,
      ...(section === "stalls" ? { secretCode: generateSecretCode() } : {}),
      ...(section === "groupBuy" ? { originalPrice: "", discountPrice: "", minBuyers: 10, currentBuyers: 0 } : {}),
      ...(section === "subLocations" ? { district: "", image: "", highlights: [] } : {}),
    };
    const updated = [...items, newItem];
    setItems(updated);
    setEditingItem(newItem);
  };

  const confirmDeleteItem = (section: string, id: number, items: EditableItem[], name: string) => {
    setDeleteConfirm({ section, id, name });
  };

  const executeDelete = () => {
    if (!deleteConfirm) return;
    const { section, id } = deleteConfirm;
    const sectionMap: Record<string, { items: EditableItem[]; setter: (v: EditableItem[]) => void }> = {
      stalls: { items: stalls, setter: setStalls },
      carousel: { items: carousel, setter: setCarousel },
      promotions: { items: promotions, setter: setPromotions },
      events: { items: events, setter: setEvents },
      explore: { items: explore, setter: setExplore },
      treasure: { items: treasure, setter: setTreasure },
      trails: { items: trails, setter: setTrails },
      groupBuy: { items: groupBuy, setter: setGroupBuy },
      subLocations: { items: subLocations, setter: setSubLocations },
    };
    const s = sectionMap[section];
    if (!s) return;
    const updated = s.items.filter(i => i.id !== id);
    s.setter(updated);
    saveSection(section, updated);
    setDeleteConfirm(null);
  };

  const saveGlobalConfig = async () => {
    const phone = sanitizeText(configWhatsapp);
    const email = sanitizeText(configEmail);
    if (!isValidPhone(phone)) { setConfigMsg("Formato de telefone inválido"); setTimeout(() => setConfigMsg(""), 3000); return; }
    if (!isValidEmail(email)) { setConfigMsg("Formato de e-mail inválido"); setTimeout(() => setConfigMsg(""), 3000); return; }
    const whatsappNumber = phone.replace(/\D/g, "");
    await setAdminConfig({
      whatsapp: phone,
      whatsappNumber: whatsappNumber.startsWith("55") ? whatsappNumber : `55${whatsappNumber}`,
      email: email,
    });
    setConfigMsg("Configurações salvas com sucesso!");
    setTimeout(() => setConfigMsg(""), 2000);
  };

  const moveItem = (items: EditableItem[], setItems: (v: EditableItem[]) => void, section: string, index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
    saveSection(section, newItems);
  };

  const regenerateCode = async (stallId: number) => {
    const updated = stalls.map(s => s.id === stallId ? { ...s, secretCode: generateSecretCode() } : s);
    setStalls(updated);
    saveSection("stalls", updated);
    await addAdminNotification({
      type: "merchant_update",
      title: "Código secreto regenerado",
      description: `Código da Barraca ${stallId} em ${selectedCity}-${selectedState} foi alterado`,
      city: selectedCity,
      state_abbr: selectedState,
    });
  };

  const copyCode = (code: string, stallId: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(stallId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePasswordChange = async () => {
    if (newPass.length < 6) { setPassMsg("Nova senha deve ter pelo menos 6 caracteres"); return; }
    if (newPass.length > MAX_PASSWORD) { setPassMsg(`Senha deve ter no máximo ${MAX_PASSWORD} caracteres`); return; }
    if (newPass !== confirmPass) { setPassMsg("As senhas não coincidem"); return; }
    const { error } = await changePassword(sanitizeText(newPass));
    if (error) { setPassMsg(error); return; }
    setPassMsg("Senha alterada com sucesso!");
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
  };

  const markAllRead = async () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    await markAllNotificationsRead();
  };

  const filteredNotifications = notifFilter === "all" ? notifications : notifications.filter(n => n.type === notifFilter);
  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: "notifications", label: "Notificações", icon: Bell, badge: unreadCount },
    { id: "stalls", label: "Barracas", icon: Store },
    { id: "carousel", label: "Carrossel", icon: Image },
    { id: "explore", label: "Explorar", icon: Compass },
    { id: "topRated", label: "Mais Votados", icon: Star },
    { id: "promosEvents", label: "Promos & Eventos", icon: Calendar },
    { id: "treasure", label: "Caça Tesouro", icon: Map },
    { id: "trails", label: "Trilhas", icon: TreePine },
    { id: "groupBuy", label: "Compra Coletiva", icon: ShoppingCart },
    ...(citySubLocs ? [{ id: "subLocations", label: citySubLocs.label, icon: TreePalm }] : []),
    { id: "city_settings", label: "Cidade", icon: FileText },
    { id: "cities", label: "Lista Cidades", icon: MapPin },
    { id: "password", label: "Senha", icon: Lock },
    { id: "settings", label: "Config", icon: Settings },
  ];

  const notifFilterLabels = [
    { id: "all", label: "Todas" },
    { id: "purchase", label: "Compras" },
    { id: "city_update", label: "Cidades" },
    { id: "merchant_update", label: "Comerciantes" },
  ];

  // Edit modal
  const EditModal = () => {
    const [form, setForm] = useState({ ...editingItem! });

    if (!editingItem) return null;

    const [formError, setFormError] = useState("");

    const handleSave = () => {
      const sanitized = {
        ...form,
        name: sanitizeText(form.name),
        description: form.description ? sanitizeText(form.description) : form.description,
        category: form.category ? sanitizeText(form.category) : form.category,
        prize: form.prize ? sanitizeText(form.prize) : form.prize,
        date: form.date ? sanitizeText(form.date) : form.date,
        image: form.image ? sanitizeText(form.image) : form.image,
      };

      if (sanitized.name.length > MAX_NAME) { setFormError(`Nome deve ter no máximo ${MAX_NAME} caracteres`); return; }
      if ((sanitized.description || "").length > MAX_DESCRIPTION) { setFormError(`Descrição deve ter no máximo ${MAX_DESCRIPTION} caracteres`); return; }
      if (sanitized.image && !isValidUrl(sanitized.image)) { setFormError("URL da imagem inválida (deve começar com http:// ou https://)"); return; }
      if (sanitized.image && sanitized.image.length > MAX_URL) { setFormError(`URL deve ter no máximo ${MAX_URL} caracteres`); return; }

      setFormError("");
      const sectionMap: Record<string, { items: EditableItem[]; setter: (v: EditableItem[]) => void; key: string }> = {
        stalls: { items: stalls, setter: setStalls, key: "stalls" },
        carousel: { items: carousel, setter: setCarousel, key: "carousel" },
        promotions: { items: promotions, setter: setPromotions, key: "promotions" },
        events: { items: events, setter: setEvents, key: "events" },
        promosEvents: { items: promotions, setter: setPromotions, key: "promotions" },
        explore: { items: explore, setter: setExplore, key: "explore" },
        treasure: { items: treasure, setter: setTreasure, key: "treasure" },
        trails: { items: trails, setter: setTrails, key: "trails" },
        groupBuy: { items: groupBuy, setter: setGroupBuy, key: "groupBuy" },
        topRated: { items: explore, setter: setExplore, key: "explore" },
        subLocations: { items: subLocations, setter: setSubLocations, key: "subLocations" },
      };
      const section = sectionMap[activeTab];
      if (!section) return;
      const updated = section.items.map(i => i.id === sanitized.id ? sanitized : i);
      if (!section.items.find(i => i.id === sanitized.id)) updated.push(sanitized);
      section.setter(updated);
      saveSection(section.key, updated);
      setEditingItem(null);
    };

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setEditingItem(null)}>
        <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-card p-5 space-y-3 max-h-[85vh] overflow-y-auto" onClick={e => e.stopPropagation()}>
          <div className="flex items-center justify-between">
            <h3 className="font-display text-lg font-bold text-foreground">Editar Item</h3>
            <button onClick={() => setEditingItem(null)}><X className="w-5 h-5 text-muted-foreground" /></button>
          </div>
          {formError && <p className="text-xs text-destructive font-semibold">{formError}</p>}
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Nome</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} maxLength={MAX_NAME}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Descrição</label>
            <textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })} maxLength={MAX_DESCRIPTION}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground h-20 resize-none" />
          </div>
          {(activeTab === "carousel" || activeTab === "subLocations") && (
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">URL da Imagem</label>
              <input value={form.image || ""} onChange={e => setForm({ ...form, image: e.target.value })} maxLength={MAX_URL}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
            </div>
          )}
          {(activeTab === "promosEvents" || activeTab === "events") && (
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Data</label>
              <input value={form.date || ""} onChange={e => setForm({ ...form, date: e.target.value })} maxLength={MAX_DATE}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="DD/MM/AAAA" />
            </div>
          )}
          {activeTab === "explore" && (
            <>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Categoria</label>
                <input value={form.category || ""} onChange={e => setForm({ ...form, category: e.target.value })} maxLength={MAX_CATEGORY}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Plano</label>
                <select value={form.plan || "Básico"} onChange={e => setForm({ ...form, plan: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground">
                  <option>Básico</option><option>Carrossel</option><option>Combo</option><option>VIP</option>
                </select>
              </div>
            </>
          )}
          {activeTab === "treasure" && (
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Prêmio</label>
              <input value={form.prize || ""} onChange={e => setForm({ ...form, prize: e.target.value })} maxLength={MAX_PRIZE}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
            </div>
          )}
          {activeTab === "trails" && (
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Dificuldade</label>
              <select value={form.difficulty || "Fácil"} onChange={e => setForm({ ...form, difficulty: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground">
                <option>Fácil</option><option>Médio</option><option>Difícil</option>
              </select>
            </div>
          )}
          {activeTab === "groupBuy" && (
            <>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Preço Original</label>
                <input value={form.originalPrice || ""} onChange={e => setForm({ ...form, originalPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="R$ 150" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Preço com Desconto</label>
                <input value={form.discountPrice || ""} onChange={e => setForm({ ...form, discountPrice: e.target.value })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="R$ 90" />
              </div>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Mínimo de Compradores</label>
                <input type="number" value={form.minBuyers || 10} onChange={e => setForm({ ...form, minBuyers: parseInt(e.target.value) || 0 })}
                  className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
              </div>
            </>
          )}
          {activeTab === "subLocations" && (
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Distrito/Região</label>
              <input value={form.district || ""} onChange={e => setForm({ ...form, district: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="Ex: Norte, Sul, Centro" />
            </div>
          )}
          <button onClick={handleSave} className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
            <Save className="w-4 h-4" /> Salvar
          </button>
        </div>
      </div>
    );
  };

  const renderList = (section: string, items: EditableItem[], setItems: (v: EditableItem[]) => void, showOrder = false) => (
    <div className="space-y-2">
      {items.map((item, idx) => (
        <div key={item.id} className="bg-card rounded-xl border border-border p-3 shadow-card flex items-center gap-2">
          {showOrder && <GripVertical className="w-4 h-4 text-muted-foreground flex-shrink-0" />}
          {showOrder && <span className="text-sm font-bold text-foreground w-6 flex-shrink-0">{idx + 1}º</span>}
          <div className="flex-1 min-w-0">
            <p className="text-sm font-bold text-foreground truncate">{item.name || "(sem nome)"}</p>
            {item.description && <p className="text-[10px] text-muted-foreground truncate">{item.description}</p>}
            {item.plan && (
              <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-bold ${
                item.plan === "VIP" ? "bg-secondary/10 text-secondary" : item.plan === "Combo" ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"
              }`}>{item.plan}</span>
            )}
            {item.district && <span className="text-[9px] px-1.5 py-0.5 rounded-full font-bold bg-accent/10 text-accent ml-1">{item.district}</span>}
            {item.originalPrice && (
              <span className="text-[9px] text-muted-foreground ml-1">
                <span className="line-through">{item.originalPrice}</span> → <span className="text-primary font-bold">{item.discountPrice}</span>
              </span>
            )}
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {showOrder && (
              <>
                <button onClick={() => moveItem(items, setItems, section, idx, "up")} className="text-[10px] text-primary font-bold p-1">▲</button>
                <button onClick={() => moveItem(items, setItems, section, idx, "down")} className="text-[10px] text-primary font-bold p-1">▼</button>
              </>
            )}
            <button onClick={() => setEditingItem(item)} className="p-1.5 rounded-lg hover:bg-muted"><Edit2 className="w-3.5 h-3.5 text-primary" /></button>
            <button onClick={() => confirmDeleteItem(section, item.id, items, item.name || "(sem nome)")} className="p-1.5 rounded-lg hover:bg-muted"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
          </div>
        </div>
      ))}
      <button onClick={() => addItem(section, items, setItems)}
        className="w-full py-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
        <Plus className="w-4 h-4" /> Adicionar
      </button>
      <button onClick={() => saveSection(section, items)}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Salvar Alterações
      </button>
    </div>
  );

  // Stalls list with secret codes
  const renderStallsList = () => (
    <div className="space-y-2">
      {stalls.map((stall) => (
        <div key={stall.id} className="bg-card rounded-xl border border-border p-3 shadow-card space-y-2">
          <div className="flex items-center gap-2">
            <div className="flex-1 min-w-0">
              <p className="text-sm font-bold text-foreground truncate">Barraca #{stall.id} - {stall.name || "(sem nome)"}</p>
              {stall.description && <p className="text-[10px] text-muted-foreground truncate">{stall.description}</p>}
            </div>
            <div className="flex items-center gap-1 flex-shrink-0">
              <button onClick={() => setEditingItem(stall)} className="p-1.5 rounded-lg hover:bg-muted"><Edit2 className="w-3.5 h-3.5 text-primary" /></button>
              <button onClick={() => confirmDeleteItem("stalls", stall.id, stalls, stall.name || `Barraca #${stall.id}`)} className="p-1.5 rounded-lg hover:bg-muted"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
            </div>
          </div>
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
            <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <code className="text-xs font-mono font-bold text-foreground tracking-wider flex-1">
              {stall.secretCode || "—"}
            </code>
            <button onClick={() => stall.secretCode && copyCode(stall.secretCode, stall.id)} className="p-1 rounded hover:bg-muted" title="Copiar código">
              {copiedId === stall.id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            <button onClick={() => regenerateCode(stall.id)} className="p-1 rounded hover:bg-muted" title="Gerar novo código">
              <RefreshCw className="w-3.5 h-3.5 text-primary" />
            </button>
          </div>
        </div>
      ))}
      <button onClick={() => addItem("stalls", stalls, setStalls)}
        className="w-full py-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors flex items-center justify-center gap-1">
        <Plus className="w-4 h-4" /> Adicionar Barraca
      </button>
      <button onClick={() => saveSection("stalls", stalls)}
        className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
        <Save className="w-4 h-4" /> Salvar Alterações
      </button>
    </div>
  );

  if (authLoading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground">Verificando autenticação...</p>
      </div>
    );
  }

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">Painel Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Faça login com seu e-mail de administrador</p>
          </div>
          <div className="space-y-3">
            <input type="email" value={loginUser} onChange={e => setLoginUser(e.target.value)} placeholder="E-mail"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none" />
            <input type="password" value={loginPass} onChange={e => setLoginPass(e.target.value)} placeholder="Senha"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
              onKeyDown={e => e.key === "Enter" && handleAdminAuth()} />
            {loginError && <p className="text-xs text-destructive font-semibold">{loginError}</p>}
            <button onClick={handleAdminAuth} disabled={loginLoading}
              className="w-full py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-all disabled:opacity-50">
              {loginLoading ? "Entrando..." : "Entrar"}
            </button>
          </div>
          <button onClick={() => navigate(base)} className="w-full text-xs text-muted-foreground hover:text-foreground transition-colors py-2">
            ← Voltar
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-foreground text-background px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`${base}/merchant`)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
            <h1 className="font-display text-xl font-bold">Painel Admin</h1>
          </div>
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`${base}/litoranea`)} className="p-1.5 rounded-full bg-background/20 hover:bg-background/30 transition-colors" title="Consultar Litorânea IA">
              <img src={litoraneaAvatar} alt="Litorânea" className="w-6 h-6 rounded-full" />
            </button>
            <button onClick={handleLogout} className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100">
              <LogOut className="w-4 h-4" /> Sair
            </button>
          </div>
        </div>
      </header>

      <div className="max-w-2xl mx-auto">
        {/* State/City Selector */}
        <div className="p-3 bg-card border-b border-border">
          <div className="flex gap-2">
            <select value={selectedState} onChange={e => { setSelectedState(e.target.value); setSelectedCity(""); }}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-bold">
              <option value="">Selecione o Estado</option>
              {states.map(st => <option key={st.abbr} value={st.abbr}>{st.name}</option>)}
            </select>
            <select value={selectedCity} onChange={e => setSelectedCity(e.target.value)} disabled={!selectedState}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-bold">
              <option value="">Selecione a Cidade</option>
              {availableCities.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          {selectedCity && <p className="text-xs text-primary font-bold mt-2 text-center">Administrando: {selectedCity} - {selectedState}</p>}
        </div>

        {/* Save message */}
        {saveMsg && (
          <div className="mx-4 mt-2 p-2 bg-primary/10 text-primary text-xs font-bold rounded-lg text-center">{saveMsg}</div>
        )}

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto p-3 border-b border-border bg-card">
          {tabs.map(tab => (
            <button key={tab.id} onClick={() => setActiveTab(tab.id)}
              className={`relative flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
              {"badge" in tab && (tab as any).badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {(tab as any).badge}
                </span>
              )}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {/* NOTIFICATIONS TAB */}
          {activeTab === "notifications" && (
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <h2 className="font-display text-lg font-bold text-foreground">Notificações</h2>
                <button onClick={markAllRead} className="text-xs text-primary font-bold hover:underline">Marcar todas como lidas</button>
              </div>
              <div className="flex gap-1.5 overflow-x-auto">
                {notifFilterLabels.map(f => (
                  <button key={f.id} onClick={() => setNotifFilter(f.id as any)}
                    className={`flex items-center gap-1 px-3 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                      notifFilter === f.id ? "bg-primary text-primary-foreground" : "bg-muted text-muted-foreground hover:bg-muted/80"
                    }`}>
                    <Filter className="w-3 h-3" /> {f.label}
                  </button>
                ))}
              </div>
              {filteredNotifications.length === 0 ? (
                <div className="bg-card rounded-xl border border-border p-6 text-center">
                  <Bell className="w-10 h-10 text-muted-foreground/30 mx-auto mb-2" />
                  <p className="text-sm text-muted-foreground">Nenhuma notificação</p>
                </div>
              ) : (
                filteredNotifications.map(notif => (
                  <div key={notif.id} className={`bg-card rounded-xl border p-3 shadow-card ${notif.read ? "border-border" : "border-primary/40 bg-primary/5"}`}>
                    <div className="flex items-start gap-2">
                      <div className={`w-2 h-2 rounded-full mt-1.5 flex-shrink-0 ${
                        notif.type === "purchase" ? "bg-secondary" : notif.type === "city_update" ? "bg-primary" : "bg-accent-foreground"
                      }`} />
                      <div className="flex-1 min-w-0">
                        <div className="flex items-center gap-2">
                          <p className="text-sm font-bold text-foreground">{notif.title}</p>
                          {!notif.read && <span className="text-[8px] bg-primary text-primary-foreground px-1.5 py-0.5 rounded-full font-bold">NOVA</span>}
                        </div>
                        <p className="text-xs text-muted-foreground mt-0.5">{notif.description}</p>
                        <p className="text-[10px] text-muted-foreground/70 mt-1">{notif.timestamp}</p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
          )}

          {/* Content tabs that need city selection */}
          {!selectedCity && !["notifications","cities","password","settings"].includes(activeTab) && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">Selecione um Estado e Cidade acima</p>
              <p className="text-xs text-muted-foreground mt-1">para gerenciar o conteúdo específico</p>
            </div>
          )}

          {(selectedCity || ["notifications","cities","password","settings"].includes(activeTab)) && (
            <>
              {activeTab === "stalls" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Barracas Digitais - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie barracas, códigos secretos de 12 dígitos e informações.</p>
                  {renderStallsList()}
                </div>
              )}
              {activeTab === "carousel" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Carrossel de Propagandas - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Configure as propagandas do carrossel da página inicial.</p>
                  {renderList("carousel", carousel, setCarousel)}
                </div>
              )}
              {activeTab === "explore" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Explorar - Ordem de Exibição - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Defina a ordem dos comércios. Use ▲▼ para reordenar.</p>
                  {renderList("explore", explore, setExplore, true)}
                </div>
              )}
              {activeTab === "topRated" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">⭐ Mais Votados - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Ranking dos comércios mais bem avaliados pelos usuários. A ordem reflete a classificação por estrelas.</p>
                  <div className="bg-card rounded-xl border border-border p-4 shadow-card">
                    <p className="text-xs text-muted-foreground mb-3">Os comércios com mais avaliações positivas aparecem primeiro na seção "Mais Votados" do app. Reordene conforme a classificação real.</p>
                    {renderList("explore", explore, setExplore, true)}
                  </div>
                </div>
              )}
              {activeTab === "promosEvents" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">📅 Promoções & Eventos - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie promoções e eventos em um só lugar.</p>
                  
                  <div className="bg-card rounded-xl border border-border p-4 shadow-card space-y-3">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Tag className="w-4 h-4 text-primary" /> Promoções</h3>
                    {renderList("promotions", promotions, setPromotions)}
                  </div>

                  <div className="bg-card rounded-xl border border-border p-4 shadow-card space-y-3">
                    <h3 className="font-bold text-sm text-foreground flex items-center gap-2"><Calendar className="w-4 h-4 text-primary" /> Eventos</h3>
                    {renderList("events", events, setEvents)}
                  </div>
                </div>
              )}
              {activeTab === "treasure" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Caça ao Tesouro - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Configure pistas e prêmios.</p>
                  {renderList("treasure", treasure, setTreasure)}
                </div>
              )}
              {activeTab === "trails" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Trilhas - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie trilhas e rotas turísticas.</p>
                  {renderList("trails", trails, setTrails)}
                </div>
              )}
              {activeTab === "groupBuy" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">🛒 Compra Coletiva - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie ofertas de compra coletiva com desconto progressivo.</p>
                  {renderList("groupBuy", groupBuy, setGroupBuy)}
                </div>
              )}
              {activeTab === "subLocations" && selectedCity && citySubLocs && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">🌴 {citySubLocs.label} - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie as {citySubLocs.label.toLowerCase()} e distritos de {selectedCity}. Cada uma terá sua própria página no app.</p>
                  {renderList("subLocations", subLocations, setSubLocations)}
                </div>
              )}

              {/* City Settings */}
              {activeTab === "city_settings" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Configurações da Cidade - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Edite o resumo, aniversário, história e festividades da cidade.</p>
                  <div className="bg-card rounded-xl border border-border p-4 shadow-card space-y-3">
                    <div>
                      <label className="text-xs font-bold text-muted-foreground block mb-1">Aniversário da Cidade</label>
                      <input value={cityBirthday} onChange={e => setCityBirthday(e.target.value)}
                        placeholder="Ex: 12/03"
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground block mb-1">Descrição da Cidade</label>
                      <textarea value={cityDescription} onChange={e => setCityDescription(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground h-24 resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground block mb-1">História da Cidade</label>
                      <textarea value={cityHistory} onChange={e => setCityHistory(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground h-24 resize-none" />
                    </div>
                    <div>
                      <label className="text-xs font-bold text-muted-foreground block mb-1">Festividades</label>
                      <textarea value={cityFestivities} onChange={e => setCityFestivities(e.target.value)}
                        className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground h-20 resize-none" />
                    </div>
                    {cityMsg && <p className="text-xs font-semibold text-primary">{cityMsg}</p>}
                    <button onClick={saveCitySettings}
                      className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
                      <Save className="w-4 h-4" /> Salvar Configurações da Cidade
                    </button>
                  </div>
                </div>
              )}
            </>
          )}

          {activeTab === "cities" && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">Cidades Cadastradas</h2>
              {states.map(st => (
                <div key={st.abbr} className="bg-card rounded-xl border border-border p-4 shadow-card">
                  <h3 className="font-bold text-foreground mb-2">{st.name} ({citiesByState[st.abbr].length} cidades)</h3>
                  <div className="grid grid-cols-2 gap-1">
                    {citiesByState[st.abbr].map(c => {
                      const hasSubLocs = getCitySubLocations(c, st.abbr);
                      return (
                        <button key={c} onClick={() => { setSelectedState(st.abbr); setSelectedCity(c); setActiveTab("city_settings"); }}
                          className="text-xs text-left text-muted-foreground hover:text-primary transition-colors flex items-center gap-1">
                          {c}
                          {hasSubLocs && <TreePalm className="w-3 h-3 text-accent" />}
                        </button>
                      );
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "password" && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">Alterar Senha do Admin</h2>
              <div className="bg-card rounded-xl border border-border p-4 shadow-card space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Senha atual</label>
                  <div className="relative">
                    <input type={showCurrent ? "text" : "password"} value={currentPass} onChange={e => setCurrentPass(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground pr-10" />
                    <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Nova senha</label>
                  <div className="relative">
                    <input type={showNew ? "text" : "password"} value={newPass} onChange={e => setNewPass(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground pr-10" />
                    <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Confirmar nova senha</label>
                  <input type="password" value={confirmPass} onChange={e => setConfirmPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
                </div>
                {passMsg && <p className={`text-xs font-semibold ${passMsg.includes("sucesso") ? "text-primary" : "text-destructive"}`}>{passMsg}</p>}
                <button onClick={handlePasswordChange} className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">Alterar Senha</button>
              </div>
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">Configurações Gerais</h2>
              <p className="text-sm text-muted-foreground">Estas informações aparecem em todas as páginas do app.</p>
              <div className="bg-card rounded-xl border border-border p-4 shadow-card space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">WhatsApp de contato</label>
                  <input value={configWhatsapp} onChange={e => setConfigWhatsapp(e.target.value)}
                    placeholder="(41) 99235-4211"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">E-mail de contato</label>
                  <input value={configEmail} onChange={e => setConfigEmail(e.target.value)}
                    placeholder="email@exemplo.com"
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
                </div>
                {configMsg && <p className="text-xs font-semibold text-primary">{configMsg}</p>}
                <button onClick={saveGlobalConfig}
                  className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm flex items-center justify-center gap-2">
                  <Save className="w-4 h-4" /> Salvar Configurações
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      <EditModal />

      {/* Delete confirmation dialog */}
      {deleteConfirm && (
        <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm p-4" onClick={() => setDeleteConfirm(null)}>
          <div className="w-full max-w-sm bg-card rounded-2xl border border-border shadow-card p-5 space-y-4" onClick={e => e.stopPropagation()}>
            <div className="text-center">
              <div className="w-12 h-12 rounded-full bg-destructive/10 flex items-center justify-center mx-auto mb-3">
                <Trash2 className="w-6 h-6 text-destructive" />
              </div>
              <h3 className="font-display text-lg font-bold text-foreground">Confirmar Exclusão</h3>
              <p className="text-sm text-muted-foreground mt-1">
                Deseja realmente excluir <strong>"{deleteConfirm.name}"</strong>? Esta ação não pode ser desfeita.
              </p>
            </div>
            <div className="flex gap-2">
              <button onClick={() => setDeleteConfirm(null)}
                className="flex-1 py-2.5 rounded-lg border border-border text-sm font-bold text-foreground hover:bg-muted transition-colors">
                Cancelar
              </button>
              <button onClick={executeDelete}
                className="flex-1 py-2.5 rounded-lg bg-destructive text-destructive-foreground text-sm font-bold hover:opacity-90 transition-all">
                Excluir
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminPanel;
