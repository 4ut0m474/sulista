import { useParams, useNavigate } from "react-router-dom";
import { ChevronLeft, Store, Image, Tag, Calendar, MapPin, Settings, LogOut } from "lucide-react";
import { useState } from "react";
import { states, citiesByState } from "@/data/cities";

const AdminPanel = () => {
  const { state, city } = useParams<{ state: string; city: string }>();
  const navigate = useNavigate();
  const base = `/city/${state}/${city}`;
  const [activeTab, setActiveTab] = useState("stalls");

  const tabs = [
    { id: "stalls", label: "Barracas", icon: Store },
    { id: "carousel", label: "Carrossel", icon: Image },
    { id: "promotions", label: "Promoções", icon: Tag },
    { id: "events", label: "Eventos", icon: Calendar },
    { id: "cities", label: "Cidades", icon: MapPin },
    { id: "settings", label: "Config", icon: Settings },
  ];

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
          {activeTab === "stalls" && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">Gerenciar Barracas Digitais</h2>
              <p className="text-sm text-muted-foreground">Controle fotos, preços e descrições de todas as barracas de todas as cidades.</p>
              {states.map(st => (
                <div key={st.abbr} className="bg-card rounded-xl border border-border p-4 shadow-card">
                  <h3 className="font-bold text-sm text-foreground mb-2">{st.name}</h3>
                  <div className="flex flex-wrap gap-1">
                    {citiesByState[st.abbr].slice(0, 8).map(c => (
                      <span key={c} className="text-[10px] bg-muted text-muted-foreground px-2 py-0.5 rounded-full">{c}</span>
                    ))}
                    <span className="text-[10px] text-muted-foreground">+{citiesByState[st.abbr].length - 8} cidades</span>
                  </div>
                </div>
              ))}
              <div className="bg-primary/5 border border-primary/20 rounded-xl p-4 text-center">
                <p className="text-sm text-muted-foreground">40 barracas por cidade × {Object.values(citiesByState).flat().length} cidades</p>
                <p className="text-2xl font-black text-primary mt-1">{40 * Object.values(citiesByState).flat().length} barracas</p>
              </div>
            </div>
          )}

          {activeTab === "carousel" && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">Gerenciar Carrossel de Propagandas</h2>
              <p className="text-sm text-muted-foreground">Altere imagens e textos do carrossel de cada cidade.</p>
              <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
                <Image className="w-10 h-10 text-primary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Editor de carrossel disponível em breve</p>
              </div>
            </div>
          )}

          {activeTab === "promotions" && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">Gerenciar Promoções</h2>
              <p className="text-sm text-muted-foreground">Adicione, edite ou remova promoções de cada cidade.</p>
              <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
                <Tag className="w-10 h-10 text-secondary mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Editor de promoções disponível em breve</p>
              </div>
            </div>
          )}

          {activeTab === "events" && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">Gerenciar Eventos</h2>
              <p className="text-sm text-muted-foreground">Controle eventos de todas as cidades.</p>
              <div className="bg-card rounded-xl border border-border p-4 shadow-card text-center">
                <Calendar className="w-10 h-10 text-accent mx-auto mb-2" />
                <p className="text-sm text-muted-foreground">Editor de eventos disponível em breve</p>
              </div>
            </div>
          )}

          {activeTab === "cities" && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">Cidades Cadastradas</h2>
              {states.map(st => (
                <div key={st.abbr} className="bg-card rounded-xl border border-border p-4 shadow-card">
                  <h3 className="font-bold text-foreground mb-2">{st.name} ({citiesByState[st.abbr].length} cidades)</h3>
                  <div className="grid grid-cols-2 gap-1">
                    {citiesByState[st.abbr].map(c => (
                      <span key={c} className="text-xs text-muted-foreground">{c}</span>
                    ))}
                  </div>
                </div>
              ))}
            </div>
          )}

          {activeTab === "settings" && (
            <div className="space-y-3">
              <h2 className="font-display text-lg font-bold text-foreground">Configurações Gerais</h2>
              <div className="bg-card rounded-xl border border-border p-4 shadow-card space-y-3">
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">WhatsApp de contato</label>
                  <input defaultValue="(41) 99235-5421" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
                </div>
                <div>
                  <label className="text-xs font-bold text-muted-foreground block mb-1">E-mail de contato</label>
                  <input defaultValue="contato@sulista.com" className="w-full px-3 py-2 rounded-lg border border-border bg-background text-sm text-foreground" />
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
