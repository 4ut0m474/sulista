import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Store, Image, Tag, Calendar, MapPin, Settings, LogOut, Compass, Map, TreePine, Lock, Eye, EyeOff, GripVertical, Plus, Trash2, Save, Edit2, X, Bell, Filter, RefreshCw, Copy, Check, FileText } from "lucide-react";
import { useState, useEffect } from "react";
import { states, citiesByState, getCityData } from "@/data/cities";

// Helper to get/set admin data per city
const getAdminData = (stateAbbr: string, cityName: string, section: string) => {
  const key = `admin_${stateAbbr}_${cityName}_${section}`;
  const stored = localStorage.getItem(key);
  return stored ? JSON.parse(stored) : null;
};

const setAdminData = (stateAbbr: string, cityName: string, section: string, data: any) => {
  const key = `admin_${stateAbbr}_${cityName}_${section}`;
  localStorage.setItem(key, JSON.stringify(data));
};

// Notifications helper
const getNotifications = (): Notification[] => {
  const stored = localStorage.getItem("admin_notifications");
  return stored ? JSON.parse(stored) : defaultNotifications;
};

const saveNotifications = (notifs: Notification[]) => {
  localStorage.setItem("admin_notifications", JSON.stringify(notifs));
};

export const addNotification = (notif: Omit<Notification, "id" | "timestamp" | "read">) => {
  const notifs = getNotifications();
  const newNotif: Notification = {
    ...notif,
    id: Date.now(),
    timestamp: new Date().toLocaleString("pt-BR"),
    read: false,
  };
  saveNotifications([newNotif, ...notifs]);
};

interface Notification {
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
}

const generateSecretCode = (): string => {
  const chars = "ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789";
  let code = "";
  for (let i = 0; i < 12; i++) {
    code += chars[Math.floor(Math.random() * chars.length)];
  }
  return code;
};

const defaultNotifications: Notification[] = [
  { id: 1, type: "purchase", title: "Nova compra de propaganda", description: "Comerciante João solicitou Plano Combo para Barraca 6 em Gramado-RS", timestamp: "09/02/2026 10:30", read: false, city: "Gramado", state: "RS" },
  { id: 2, type: "merchant_update", title: "Comerciante atualizou produtos", description: "Comerciante 1 atualizou fotos da Barraca 1 em Morretes-PR", timestamp: "08/02/2026 15:20", read: true, city: "Morretes", state: "PR" },
  { id: 3, type: "city_update", title: "Informações da cidade atualizadas", description: "Descrição de Florianópolis-SC foi alterada pelo admin", timestamp: "07/02/2026 09:00", read: true, city: "Florianópolis", state: "SC" },
  { id: 4, type: "purchase", title: "Nova compra de propaganda", description: "Comerciante Maria solicitou Plano VIP para Barraca 10 em Curitiba-PR", timestamp: "06/02/2026 14:45", read: false, city: "Curitiba", state: "PR" },
];

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

const AdminPanel = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;

  // Auth gate state
  const [isAuthenticated, setIsAuthenticated] = useState(() => sessionStorage.getItem("admin_authenticated") === "true");
  const [loginUser, setLoginUser] = useState("");
  const [loginPass, setLoginPass] = useState("");
  const [loginError, setLoginError] = useState("");

  const handleAdminAuth = () => {
    // Initialize default credentials if none exist
    if (!localStorage.getItem("admin_username")) {
      localStorage.setItem("admin_username", "EERB1976");
    }
    if (!localStorage.getItem("admin_password")) {
      localStorage.setItem("admin_password", "123456");
    }
    const storedUser = localStorage.getItem("admin_username");
    const storedPass = localStorage.getItem("admin_password");
    if (loginUser === storedUser && loginPass === storedPass) {
      sessionStorage.setItem("admin_authenticated", "true");
      setIsAuthenticated(true);
      setLoginError("");
    } else {
      setLoginError("Login ou senha incorretos");
    }
  };

  const handleLogout = () => {
    sessionStorage.removeItem("admin_authenticated");
    setIsAuthenticated(false);
    navigate(base);
  };

  const [activeTab, setActiveTab] = useState("notifications");
  const [selectedState, setSelectedState] = useState(state || "");
  const [selectedCity, setSelectedCity] = useState(city ? decodeURIComponent(city) : "");
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  // Notification filter
  const [notifFilter, setNotifFilter] = useState<"all" | "purchase" | "city_update" | "merchant_update">("all");
  const [notifications, setNotifications] = useState<Notification[]>(getNotifications());

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

  const availableCities = selectedState ? citiesByState[selectedState] || [] : [];

  // Load global config
  useEffect(() => {
    const stored = localStorage.getItem("admin_global_config");
    if (stored) {
      const cfg = JSON.parse(stored);
      setConfigWhatsapp(cfg.whatsapp || "(41) 99235-4211");
      setConfigEmail(cfg.email || "eerb1976@gmail.com");
    } else {
      setConfigWhatsapp("(41) 99235-4211");
      setConfigEmail("eerb1976@gmail.com");
    }
  }, []);

  // Load data when city changes
  useEffect(() => {
    if (!selectedState || !selectedCity) return;
    setStalls(getAdminData(selectedState, selectedCity, "stalls") || defaultStalls);
    setCarousel(getAdminData(selectedState, selectedCity, "carousel") || defaultCarousel);
    setPromotions(getAdminData(selectedState, selectedCity, "promotions") || defaultPromotions);
    setEvents(getAdminData(selectedState, selectedCity, "events") || defaultEvents);
    setExplore(getAdminData(selectedState, selectedCity, "explore") || defaultExplore);
    setTreasure(getAdminData(selectedState, selectedCity, "treasure") || defaultTreasure);
    setTrails(getAdminData(selectedState, selectedCity, "trails") || defaultTrails);

    // Load city settings
    const citySettings = getAdminData(selectedState, selectedCity, "city_settings");
    if (citySettings) {
      setCityBirthday(citySettings.birthday || "");
      setCityDescription(citySettings.description || "");
      setCityHistory(citySettings.history || "");
      setCityFestivities(citySettings.festivities || "");
    } else {
      const defaultData = getCityData(selectedCity, selectedState);
      setCityBirthday(defaultData.birthday);
      setCityDescription(defaultData.description);
      setCityHistory(defaultData.history);
      setCityFestivities(defaultData.festivities);
    }
  }, [selectedState, selectedCity]);

  const saveSection = (section: string, data: EditableItem[]) => {
    if (!selectedState || !selectedCity) return;
    setAdminData(selectedState, selectedCity, section, data);
    setSaveMsg("Salvo com sucesso!");
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const saveCitySettings = () => {
    if (!selectedState || !selectedCity) return;
    setAdminData(selectedState, selectedCity, "city_settings", {
      birthday: cityBirthday,
      description: cityDescription,
      history: cityHistory,
      festivities: cityFestivities,
    });
    addNotification({
      type: "city_update",
      title: "Informações da cidade atualizadas",
      description: `Configurações de ${selectedCity}-${selectedState} foram alteradas pelo admin`,
      city: selectedCity,
      state: selectedState,
    });
    setNotifications(getNotifications());
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
    };
    const s = sectionMap[section];
    if (!s) return;
    const updated = s.items.filter(i => i.id !== id);
    s.setter(updated);
    saveSection(section, updated);
    setDeleteConfirm(null);
  };

  const saveGlobalConfig = () => {
    const whatsappNumber = configWhatsapp.replace(/\D/g, "");
    localStorage.setItem("admin_global_config", JSON.stringify({
      whatsapp: configWhatsapp,
      whatsappNumber: whatsappNumber.startsWith("55") ? whatsappNumber : `55${whatsappNumber}`,
      email: configEmail,
    }));
    setConfigMsg("Configurações salvas com sucesso!");
    setTimeout(() => setConfigMsg(""), 2000);
  };
  };

  const moveItem = (items: EditableItem[], setItems: (v: EditableItem[]) => void, section: string, index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
    saveSection(section, newItems);
  };

  const regenerateCode = (stallId: number) => {
    const updated = stalls.map(s => s.id === stallId ? { ...s, secretCode: generateSecretCode() } : s);
    setStalls(updated);
    saveSection("stalls", updated);
    addNotification({
      type: "merchant_update",
      title: "Código secreto regenerado",
      description: `Código da Barraca ${stallId} em ${selectedCity}-${selectedState} foi alterado`,
      city: selectedCity,
      state: selectedState,
    });
    setNotifications(getNotifications());
  };

  const copyCode = (code: string, stallId: number) => {
    navigator.clipboard.writeText(code);
    setCopiedId(stallId);
    setTimeout(() => setCopiedId(null), 2000);
  };

  const handlePasswordChange = () => {
    const storedPass = localStorage.getItem("admin_password");
    if (!storedPass) { setPassMsg("Nenhuma senha configurada"); return; }
    if (currentPass !== storedPass) { setPassMsg("Senha atual incorreta"); return; }
    if (newPass.length < 4) { setPassMsg("Nova senha deve ter pelo menos 4 caracteres"); return; }
    if (newPass !== confirmPass) { setPassMsg("As senhas não coincidem"); return; }
    localStorage.setItem("admin_password", newPass);
    setPassMsg("Senha alterada com sucesso!");
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
  };

  const markAllRead = () => {
    const updated = notifications.map(n => ({ ...n, read: true }));
    setNotifications(updated);
    saveNotifications(updated);
  };

  const filteredNotifications = notifFilter === "all" ? notifications : notifications.filter(n => n.type === notifFilter);
  const unreadCount = notifications.filter(n => !n.read).length;

  const tabs = [
    { id: "notifications", label: "Notificações", icon: Bell, badge: unreadCount },
    { id: "stalls", label: "Barracas", icon: Store },
    { id: "carousel", label: "Carrossel", icon: Image },
    { id: "promotions", label: "Promoções", icon: Tag },
    { id: "events", label: "Eventos", icon: Calendar },
    { id: "explore", label: "Explorar", icon: Compass },
    { id: "treasure", label: "Caça Tesouro", icon: Map },
    { id: "trails", label: "Trilhas", icon: TreePine },
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
    if (!editingItem) return null;
    const [form, setForm] = useState({ ...editingItem });

    const handleSave = () => {
      const sectionMap: Record<string, { items: EditableItem[]; setter: (v: EditableItem[]) => void; key: string }> = {
        stalls: { items: stalls, setter: setStalls, key: "stalls" },
        carousel: { items: carousel, setter: setCarousel, key: "carousel" },
        promotions: { items: promotions, setter: setPromotions, key: "promotions" },
        events: { items: events, setter: setEvents, key: "events" },
        explore: { items: explore, setter: setExplore, key: "explore" },
        treasure: { items: treasure, setter: setTreasure, key: "treasure" },
        trails: { items: trails, setter: setTrails, key: "trails" },
      };
      const section = sectionMap[activeTab];
      if (!section) return;
      const updated = section.items.map(i => i.id === form.id ? form : i);
      if (!section.items.find(i => i.id === form.id)) updated.push(form);
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
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Nome</label>
            <input value={form.name} onChange={e => setForm({ ...form, name: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
          </div>
          <div>
            <label className="text-xs font-bold text-muted-foreground block mb-1">Descrição</label>
            <textarea value={form.description || ""} onChange={e => setForm({ ...form, description: e.target.value })}
              className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground h-20 resize-none" />
          </div>
          {(activeTab === "carousel") && (
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">URL da Imagem</label>
              <input value={form.image || ""} onChange={e => setForm({ ...form, image: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
            </div>
          )}
          {activeTab === "events" && (
            <div>
              <label className="text-xs font-bold text-muted-foreground block mb-1">Data</label>
              <input value={form.date || ""} onChange={e => setForm({ ...form, date: e.target.value })}
                className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" placeholder="DD/MM/AAAA" />
            </div>
          )}
          {activeTab === "explore" && (
            <>
              <div>
                <label className="text-xs font-bold text-muted-foreground block mb-1">Categoria</label>
                <input value={form.category || ""} onChange={e => setForm({ ...form, category: e.target.value })}
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
              <input value={form.prize || ""} onChange={e => setForm({ ...form, prize: e.target.value })}
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
          </div>
          <div className="flex items-center gap-1 flex-shrink-0">
            {showOrder && (
              <>
                <button onClick={() => moveItem(items, setItems, section, idx, "up")} className="text-[10px] text-primary font-bold p-1">▲</button>
                <button onClick={() => moveItem(items, setItems, section, idx, "down")} className="text-[10px] text-primary font-bold p-1">▼</button>
              </>
            )}
            <button onClick={() => setEditingItem(item)} className="p-1.5 rounded-lg hover:bg-muted"><Edit2 className="w-3.5 h-3.5 text-primary" /></button>
            <button onClick={() => deleteItem(section, item.id, items, setItems)} className="p-1.5 rounded-lg hover:bg-muted"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
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
              <button onClick={() => deleteItem("stalls", stall.id, stalls, setStalls)} className="p-1.5 rounded-lg hover:bg-muted"><Trash2 className="w-3.5 h-3.5 text-destructive" /></button>
            </div>
          </div>
          {/* Secret code section */}
          <div className="flex items-center gap-2 bg-muted/50 rounded-lg p-2">
            <Lock className="w-3.5 h-3.5 text-muted-foreground flex-shrink-0" />
            <code className="text-xs font-mono font-bold text-foreground tracking-wider flex-1">
              {stall.secretCode || "—"}
            </code>
            <button
              onClick={() => stall.secretCode && copyCode(stall.secretCode, stall.id)}
              className="p-1 rounded hover:bg-muted"
              title="Copiar código"
            >
              {copiedId === stall.id ? <Check className="w-3.5 h-3.5 text-primary" /> : <Copy className="w-3.5 h-3.5 text-muted-foreground" />}
            </button>
            <button
              onClick={() => regenerateCode(stall.id)}
              className="p-1 rounded hover:bg-muted"
              title="Gerar novo código"
            >
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

  if (!isAuthenticated) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center p-4">
        <div className="w-full max-w-sm bg-card rounded-2xl border border-border p-6 shadow-card space-y-4">
          <div className="text-center">
            <div className="w-16 h-16 rounded-full bg-foreground/10 flex items-center justify-center mx-auto mb-3">
              <Lock className="w-8 h-8 text-foreground" />
            </div>
            <h1 className="font-display text-xl font-bold text-foreground">Painel Admin</h1>
            <p className="text-sm text-muted-foreground mt-1">Faça login para acessar o painel</p>
          </div>
          <div className="space-y-3">
            <input
              type="text"
              value={loginUser}
              onChange={e => setLoginUser(e.target.value)}
              placeholder="Login"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
            <input
              type="password"
              value={loginPass}
              onChange={e => setLoginPass(e.target.value)}
              placeholder="Senha"
              className="w-full px-4 py-3 rounded-xl border border-border bg-background text-foreground text-sm focus:ring-2 focus:ring-primary focus:outline-none"
            />
            {loginError && <p className="text-xs text-destructive font-semibold">{loginError}</p>}
            <button
              onClick={handleAdminAuth}
              className="w-full py-3 rounded-xl bg-foreground text-background font-bold text-sm hover:opacity-90 transition-all"
            >
              Entrar
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
          <button onClick={handleLogout} className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100">
            <LogOut className="w-4 h-4" /> Sair
          </button>
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
              {tab.badge && tab.badge > 0 && (
                <span className="absolute -top-1 -right-1 bg-destructive text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                  {tab.badge}
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

              {/* Filters */}
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

              {/* Notification list */}
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
              {activeTab === "promotions" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Promoções - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie promoções e ofertas.</p>
                  {renderList("promotions", promotions, setPromotions)}
                </div>
              )}
              {activeTab === "events" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Eventos - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie eventos e atividades.</p>
                  {renderList("events", events, setEvents)}
                </div>
              )}
              {activeTab === "explore" && selectedCity && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Explorar - Ordem de Exibição - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Defina a ordem dos comércios. Use ▲▼ para reordenar.</p>
                  {renderList("explore", explore, setExplore, true)}
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
                    {citiesByState[st.abbr].map(c => (
                      <button key={c} onClick={() => { setSelectedState(st.abbr); setSelectedCity(c); setActiveTab("city_settings"); }}
                        className="text-xs text-left text-muted-foreground hover:text-primary transition-colors">{c}</button>
                    ))}
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
              <div className="bg-card rounded-xl border border-border p-4 shadow-card space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">WhatsApp de contato</label>
                  <input defaultValue="(41) 99235-4211" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">E-mail de contato</label>
                  <input defaultValue="eerb1976@gmail.com" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
                </div>
                <button className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">Salvar Configurações</button>
              </div>
            </div>
          )}
        </div>
      </div>

      <EditModal />
    </div>
  );
};

export default AdminPanel;
