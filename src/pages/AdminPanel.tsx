import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Store, Image, Tag, Calendar, MapPin, Settings, LogOut, Compass, Map, TreePine, Lock, Eye, EyeOff, GripVertical, Plus, Trash2, Save, Edit2, X } from "lucide-react";
import { useState, useEffect } from "react";
import { states, citiesByState } from "@/data/cities";

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
}

const defaultStalls = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: i <= 4 ? `Comerciante ${i + 1}` : "",
  description: i <= 4 ? "Produtos artesanais da região" : "",
  active: i <= 4,
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

  const [activeTab, setActiveTab] = useState("stalls");
  const [selectedState, setSelectedState] = useState(state || "");
  const [selectedCity, setSelectedCity] = useState(city ? decodeURIComponent(city) : "");
  const [editingItem, setEditingItem] = useState<EditableItem | null>(null);
  const [saveMsg, setSaveMsg] = useState("");

  // Password
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [passMsg, setPassMsg] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  // Section data
  const [stalls, setStalls] = useState<EditableItem[]>([]);
  const [carousel, setCarousel] = useState<EditableItem[]>([]);
  const [promotions, setPromotions] = useState<EditableItem[]>([]);
  const [events, setEvents] = useState<EditableItem[]>([]);
  const [explore, setExplore] = useState<EditableItem[]>([]);
  const [treasure, setTreasure] = useState<EditableItem[]>([]);
  const [trails, setTrails] = useState<EditableItem[]>([]);

  const availableCities = selectedState ? citiesByState[selectedState] || [] : [];

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
  }, [selectedState, selectedCity]);

  const saveSection = (section: string, data: EditableItem[]) => {
    if (!selectedState || !selectedCity) return;
    setAdminData(selectedState, selectedCity, section, data);
    setSaveMsg("Salvo com sucesso!");
    setTimeout(() => setSaveMsg(""), 2000);
  };

  const addItem = (section: string, items: EditableItem[], setItems: (v: EditableItem[]) => void) => {
    const newId = items.length > 0 ? Math.max(...items.map(i => i.id)) + 1 : 1;
    const newItem: EditableItem = { id: newId, name: "", description: "", active: true };
    const updated = [...items, newItem];
    setItems(updated);
    setEditingItem(newItem);
  };

  const deleteItem = (section: string, id: number, items: EditableItem[], setItems: (v: EditableItem[]) => void) => {
    const updated = items.filter(i => i.id !== id);
    setItems(updated);
    saveSection(section, updated);
  };

  const moveItem = (items: EditableItem[], setItems: (v: EditableItem[]) => void, section: string, index: number, direction: "up" | "down") => {
    const newItems = [...items];
    const targetIndex = direction === "up" ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newItems.length) return;
    [newItems[index], newItems[targetIndex]] = [newItems[targetIndex], newItems[index]];
    setItems(newItems);
    saveSection(section, newItems);
  };

  const handlePasswordChange = () => {
    const storedPass = localStorage.getItem("admin_password") || "123456";
    if (currentPass !== storedPass) { setPassMsg("Senha atual incorreta"); return; }
    if (newPass.length < 4) { setPassMsg("Nova senha deve ter pelo menos 4 caracteres"); return; }
    if (newPass !== confirmPass) { setPassMsg("As senhas não coincidem"); return; }
    localStorage.setItem("admin_password", newPass);
    setPassMsg("Senha alterada com sucesso!");
    setCurrentPass(""); setNewPass(""); setConfirmPass("");
  };

  const tabs = [
    { id: "stalls", label: "Barracas", icon: Store },
    { id: "carousel", label: "Carrossel", icon: Image },
    { id: "promotions", label: "Promoções", icon: Tag },
    { id: "events", label: "Eventos", icon: Calendar },
    { id: "explore", label: "Explorar", icon: Compass },
    { id: "treasure", label: "Caça Tesouro", icon: Map },
    { id: "trails", label: "Trilhas", icon: TreePine },
    { id: "cities", label: "Cidades", icon: MapPin },
    { id: "password", label: "Senha", icon: Lock },
    { id: "settings", label: "Config", icon: Settings },
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
        <div className="w-full max-w-md bg-card rounded-2xl border border-border shadow-card p-5 space-y-3" onClick={e => e.stopPropagation()}>
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

  return (
    <div className="min-h-screen bg-background">
      <header className="bg-foreground text-background px-4 py-4">
        <div className="max-w-2xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-2">
            <button onClick={() => navigate(`${base}/merchant`)} className="p-1 -ml-1"><ChevronLeft className="w-5 h-5" /></button>
            <h1 className="font-display text-xl font-bold">Painel Admin</h1>
          </div>
          <button onClick={() => navigate(`${base}/merchant`)} className="flex items-center gap-1 text-xs opacity-70 hover:opacity-100">
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
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}>
              <tab.icon className="w-4 h-4" /> {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {!selectedCity && !["cities","password","settings"].includes(activeTab) && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">Selecione um Estado e Cidade acima</p>
              <p className="text-xs text-muted-foreground mt-1">para gerenciar o conteúdo específico</p>
            </div>
          )}

          {(selectedCity || ["cities","password","settings"].includes(activeTab)) && (
            <>
              {activeTab === "stalls" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Barracas Digitais - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie as 40 barracas digitais. Edite nome, descrição e status.</p>
                  {renderList("stalls", stalls, setStalls)}
                </div>
              )}
              {activeTab === "carousel" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Carrossel de Propagandas - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Configure as propagandas do carrossel da página inicial.</p>
                  {renderList("carousel", carousel, setCarousel)}
                </div>
              )}
              {activeTab === "promotions" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Promoções - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie promoções e ofertas.</p>
                  {renderList("promotions", promotions, setPromotions)}
                </div>
              )}
              {activeTab === "events" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Eventos - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie eventos e atividades.</p>
                  {renderList("events", events, setEvents)}
                </div>
              )}
              {activeTab === "explore" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Explorar - Ordem de Exibição - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Defina a ordem dos comércios. Use ▲▼ para reordenar.</p>
                  {renderList("explore", explore, setExplore, true)}
                </div>
              )}
              {activeTab === "treasure" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Caça ao Tesouro - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Configure pistas e prêmios.</p>
                  {renderList("treasure", treasure, setTreasure)}
                </div>
              )}
              {activeTab === "trails" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Trilhas - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie trilhas e rotas turísticas.</p>
                  {renderList("trails", trails, setTrails)}
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
                      <button key={c} onClick={() => { setSelectedState(st.abbr); setSelectedCity(c); setActiveTab("stalls"); }}
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
