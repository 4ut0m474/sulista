import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Store, Image, Tag, Calendar, MapPin, Settings, LogOut, Compass, Map, TreePine, Lock, Eye, EyeOff, GripVertical } from "lucide-react";
import { useState } from "react";
import { states, citiesByState } from "@/data/cities";

const AdminPanel = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;

  const [activeTab, setActiveTab] = useState("stalls");
  const [selectedState, setSelectedState] = useState(state || "");
  const [selectedCity, setSelectedCity] = useState(city ? decodeURIComponent(city) : "");

  // Password change
  const [currentPass, setCurrentPass] = useState("");
  const [newPass, setNewPass] = useState("");
  const [confirmPass, setConfirmPass] = useState("");
  const [showPassFields, setShowPassFields] = useState(false);
  const [passMsg, setPassMsg] = useState("");
  const [showCurrent, setShowCurrent] = useState(false);
  const [showNew, setShowNew] = useState(false);

  const availableCities = selectedState ? citiesByState[selectedState] || [] : [];

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

  const handlePasswordChange = () => {
    const storedPass = localStorage.getItem("admin_password") || "123456";
    if (currentPass !== storedPass) {
      setPassMsg("Senha atual incorreta");
      return;
    }
    if (newPass.length < 4) {
      setPassMsg("Nova senha deve ter pelo menos 4 caracteres");
      return;
    }
    if (newPass !== confirmPass) {
      setPassMsg("As senhas não coincidem");
      return;
    }
    localStorage.setItem("admin_password", newPass);
    setPassMsg("Senha alterada com sucesso!");
    setCurrentPass("");
    setNewPass("");
    setConfirmPass("");
  };

  // Placeholder commerce items for Explore ordering
  const [exploreItems] = useState([
    { id: 1, name: "Restaurante Colonial", category: "Restaurante", plan: "VIP" },
    { id: 2, name: "Pousada Serra Verde", category: "Pousada", plan: "Combo" },
    { id: 3, name: "Café & Confeitaria", category: "Café", plan: "Básico" },
    { id: 4, name: "Artesanato do Sul", category: "Artesanato", plan: "Carrossel" },
    { id: 5, name: "Churrascaria Gaúcha", category: "Restaurante", plan: "VIP" },
    { id: 6, name: "Hotel Colonial", category: "Pousada", plan: "Básico" },
  ]);

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
            <select
              value={selectedState}
              onChange={e => { setSelectedState(e.target.value); setSelectedCity(""); }}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-bold"
            >
              <option value="">Selecione o Estado</option>
              {states.map(st => (
                <option key={st.abbr} value={st.abbr}>{st.name}</option>
              ))}
            </select>
            <select
              value={selectedCity}
              onChange={e => setSelectedCity(e.target.value)}
              className="flex-1 px-3 py-2 rounded-lg border border-border bg-background text-foreground text-sm font-bold"
              disabled={!selectedState}
            >
              <option value="">Selecione a Cidade</option>
              {availableCities.map(c => (
                <option key={c} value={c}>{c}</option>
              ))}
            </select>
          </div>
          {selectedCity && (
            <p className="text-xs text-primary font-bold mt-2 text-center">
              Administrando: {selectedCity} - {selectedState}
            </p>
          )}
        </div>

        {/* Tabs */}
        <div className="flex gap-1 overflow-x-auto p-3 border-b border-border bg-card">
          {tabs.map(tab => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold whitespace-nowrap transition-all ${
                activeTab === tab.id ? "bg-primary text-primary-foreground" : "text-muted-foreground hover:bg-muted"
              }`}
            >
              <tab.icon className="w-4 h-4" />
              {tab.label}
            </button>
          ))}
        </div>

        <div className="p-4 space-y-4">
          {!selectedCity && activeTab !== "cities" && activeTab !== "password" && activeTab !== "settings" && (
            <div className="bg-primary/5 border border-primary/20 rounded-xl p-6 text-center">
              <MapPin className="w-10 h-10 text-primary mx-auto mb-2" />
              <p className="text-sm font-bold text-foreground">Selecione um Estado e Cidade acima</p>
              <p className="text-xs text-muted-foreground mt-1">para gerenciar o conteúdo específico</p>
            </div>
          )}

          {(selectedCity || activeTab === "cities" || activeTab === "password" || activeTab === "settings") && (
            <>
              {activeTab === "stalls" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Barracas Digitais - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie as 40 barracas digitais de {selectedCity}.</p>
                  <div className="grid grid-cols-2 gap-2">
                    {Array.from({ length: 8 }, (_, i) => (
                      <div key={i} className="bg-card rounded-xl border border-border p-3 shadow-card">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-xs font-bold text-foreground">Barraca {i + 1}</span>
                          <span className={`text-[10px] px-2 py-0.5 rounded-full ${i < 3 ? "bg-primary/10 text-primary" : "bg-muted text-muted-foreground"}`}>
                            {i < 3 ? "Ocupada" : "Livre"}
                          </span>
                        </div>
                        <p className="text-[10px] text-muted-foreground">{i < 3 ? "Editar produtos e fotos" : "Disponível para venda"}</p>
                      </div>
                    ))}
                  </div>
                  <p className="text-xs text-muted-foreground text-center">Mostrando 8 de 40 barracas</p>
                </div>
              )}

              {activeTab === "carousel" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Carrossel de Propagandas - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Configure as propagandas do carrossel da página inicial de {selectedCity}.</p>
                  {["Restaurante Colonial", "Pousada Serra Verde", "Artesanato Local", "Café & Confeitaria"].map((ad, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-3 shadow-card flex items-center gap-3">
                      <div className="w-16 h-12 rounded-lg bg-muted flex items-center justify-center">
                        <Image className="w-5 h-5 text-muted-foreground" />
                      </div>
                      <div className="flex-1">
                        <p className="text-sm font-bold text-foreground">{ad}</p>
                        <p className="text-[10px] text-muted-foreground">Posição {i + 1}</p>
                      </div>
                      <button className="text-xs text-primary font-bold">Editar</button>
                    </div>
                  ))}
                  <button className="w-full py-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    + Adicionar Propaganda
                  </button>
                </div>
              )}

              {activeTab === "promotions" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Promoções - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie promoções e ofertas de {selectedCity}.</p>
                  {["20% OFF Restaurante Colonial", "Combo Especial Pousada", "Happy Hour Café"].map((promo, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-3 shadow-card flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Tag className="w-4 h-4 text-secondary" />
                        <span className="text-sm font-bold text-foreground">{promo}</span>
                      </div>
                      <button className="text-xs text-primary font-bold">Editar</button>
                    </div>
                  ))}
                  <button className="w-full py-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    + Adicionar Promoção
                  </button>
                </div>
              )}

              {activeTab === "events" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Eventos - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie eventos e atividades de {selectedCity}.</p>
                  {["Festival Gastronômico - 15/03", "Feira de Artesanato - 20/03", "Noite Cultural - 25/03"].map((evt, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-3 shadow-card flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Calendar className="w-4 h-4 text-accent" />
                        <span className="text-sm font-bold text-foreground">{evt}</span>
                      </div>
                      <button className="text-xs text-primary font-bold">Editar</button>
                    </div>
                  ))}
                  <button className="w-full py-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    + Adicionar Evento
                  </button>
                </div>
              )}

              {activeTab === "explore" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Explorar - Ordem de Exibição - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Defina a ordem dos comércios na aba Explorar. Comércios com planos superiores podem ser colocados nas primeiras posições.</p>
                  <div className="space-y-2">
                    {exploreItems.map((item, i) => (
                      <div key={item.id} className="bg-card rounded-xl border border-border p-3 shadow-card flex items-center gap-3">
                        <GripVertical className="w-4 h-4 text-muted-foreground cursor-grab" />
                        <span className="text-sm font-bold text-foreground w-6">{i + 1}º</span>
                        <div className="flex-1">
                          <p className="text-sm font-bold text-foreground">{item.name}</p>
                          <p className="text-[10px] text-muted-foreground">{item.category}</p>
                        </div>
                        <span className={`text-[10px] px-2 py-0.5 rounded-full font-bold ${
                          item.plan === "VIP" ? "bg-secondary/10 text-secondary" :
                          item.plan === "Combo" ? "bg-primary/10 text-primary" :
                          item.plan === "Carrossel" ? "bg-accent/10 text-accent" :
                          "bg-muted text-muted-foreground"
                        }`}>
                          {item.plan}
                        </span>
                        <div className="flex flex-col gap-1">
                          <button className="text-[10px] text-primary font-bold">▲</button>
                          <button className="text-[10px] text-primary font-bold">▼</button>
                        </div>
                      </div>
                    ))}
                  </div>
                  <button className="w-full py-2.5 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                    Salvar Ordem
                  </button>
                </div>
              )}

              {activeTab === "treasure" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Caça ao Tesouro - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Configure pistas e prêmios da caça ao tesouro de {selectedCity}.</p>
                  {["Pista 1 - Praça Central", "Pista 2 - Igreja Matriz", "Pista 3 - Mirante"].map((pista, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-3 shadow-card flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <Map className="w-4 h-4 text-primary" />
                        <span className="text-sm font-bold text-foreground">{pista}</span>
                      </div>
                      <button className="text-xs text-primary font-bold">Editar</button>
                    </div>
                  ))}
                  <button className="w-full py-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    + Adicionar Pista
                  </button>
                </div>
              )}

              {activeTab === "trails" && (
                <div className="space-y-3">
                  <h2 className="font-display text-lg font-bold text-foreground">Trilhas - {selectedCity}</h2>
                  <p className="text-sm text-muted-foreground">Gerencie trilhas e rotas turísticas de {selectedCity}.</p>
                  {["Trilha da Serra", "Caminho das Cachoeiras", "Rota Histórica"].map((trail, i) => (
                    <div key={i} className="bg-card rounded-xl border border-border p-3 shadow-card flex items-center justify-between">
                      <div className="flex items-center gap-2">
                        <TreePine className="w-4 h-4 text-accent" />
                        <span className="text-sm font-bold text-foreground">{trail}</span>
                      </div>
                      <button className="text-xs text-primary font-bold">Editar</button>
                    </div>
                  ))}
                  <button className="w-full py-2 rounded-lg border-2 border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors">
                    + Adicionar Trilha
                  </button>
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
                      <button
                        key={c}
                        onClick={() => { setSelectedState(st.abbr); setSelectedCity(c); setActiveTab("stalls"); }}
                        className="text-xs text-left text-muted-foreground hover:text-primary transition-colors"
                      >
                        {c}
                      </button>
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
                    <input
                      type={showCurrent ? "text" : "password"}
                      value={currentPass}
                      onChange={e => setCurrentPass(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground pr-10"
                    />
                    <button onClick={() => setShowCurrent(!showCurrent)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showCurrent ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Nova senha</label>
                  <div className="relative">
                    <input
                      type={showNew ? "text" : "password"}
                      value={newPass}
                      onChange={e => setNewPass(e.target.value)}
                      className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground pr-10"
                    />
                    <button onClick={() => setShowNew(!showNew)} className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground">
                      {showNew ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                    </button>
                  </div>
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">Confirmar nova senha</label>
                  <input
                    type="password"
                    value={confirmPass}
                    onChange={e => setConfirmPass(e.target.value)}
                    className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground"
                  />
                </div>
                {passMsg && (
                  <p className={`text-xs font-semibold ${passMsg.includes("sucesso") ? "text-primary" : "text-destructive"}`}>
                    {passMsg}
                  </p>
                )}
                <button onClick={handlePasswordChange} className="w-full py-2 rounded-lg bg-primary text-primary-foreground font-bold text-sm">
                  Alterar Senha
                </button>
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
    </div>
  );
};

export default AdminPanel;
