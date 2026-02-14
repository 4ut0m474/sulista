import { createContext, useContext, useState, ReactNode } from "react";

type Language = "pt" | "en" | "fr" | "it" | "es" | "de";

interface LanguageContextType {
  language: Language;
  setLanguage: (lang: Language) => void;
  t: (key: string) => string;
}

const translations: Record<Language, Record<string, string>> = {
  pt: {
    selectState: "Selecione o Estado",
    selectCity: "Selecione a Cidade",
    confirmHuman: "Confirmo que sou uma pessoa",
    enterGoogle: "Entrar com Google",
    selectToContinue: "Selecione estado e cidade para continuar",
    termsNotice: "Ao entrar, você concorda com os termos de serviço. Este aplicativo não armazena nenhum dado pessoal do usuário.",
    digitalStalls: "Barracas Digitais",
    topRated: "Mais Votados",
    promosEvents: "Promoções e Eventos",
    promotions: "Promoções",
    events: "Eventos",
    yourOpinion: "Sua Opinião",
    treasureHunt: "Caça ao Tesouro",
    trails: "Trilhas",
    groupBuy: "Compra Coletiva",
    birthday: "Aniversário",
    festivities: "Festas",
    history: "História",
    contact: "Contato",
    home: "Início",
    explore: "Explorar",
    merchant: "Comerciante",
    discoverSouth: "Descubra o Sul do Brasil",
  },
  en: {
    selectState: "Select State",
    selectCity: "Select City",
    confirmHuman: "I confirm I am a person",
    enterGoogle: "Sign in with Google",
    selectToContinue: "Select state and city to continue",
    termsNotice: "By signing in, you agree to the terms of service. This app does not store any personal user data.",
    digitalStalls: "Digital Stalls",
    topRated: "Top Rated",
    promosEvents: "Promos & Events",
    promotions: "Promotions",
    events: "Events",
    yourOpinion: "Your Opinion",
    treasureHunt: "Treasure Hunt",
    trails: "Trails",
    groupBuy: "Group Buy",
    birthday: "Anniversary",
    festivities: "Festivities",
    history: "History",
    contact: "Contact",
    home: "Home",
    explore: "Explore",
    merchant: "Merchant",
    discoverSouth: "Discover Southern Brazil",
  },
  fr: {
    selectState: "Sélectionner l'État",
    selectCity: "Sélectionner la Ville",
    confirmHuman: "Je confirme que je suis une personne",
    enterGoogle: "Se connecter avec Google",
    selectToContinue: "Sélectionnez l'état et la ville pour continuer",
    termsNotice: "En vous connectant, vous acceptez les conditions d'utilisation. Cette application ne stocke aucune donnée personnelle.",
    digitalStalls: "Étals Numériques",
    topRated: "Les Mieux Notés",
    promosEvents: "Promos & Événements",
    promotions: "Promotions",
    events: "Événements",
    yourOpinion: "Votre Avis",
    treasureHunt: "Chasse au Trésor",
    trails: "Sentiers",
    groupBuy: "Achat Groupé",
    birthday: "Anniversaire",
    festivities: "Fêtes",
    history: "Histoire",
    contact: "Contact",
    home: "Accueil",
    explore: "Explorer",
    merchant: "Commerçant",
    discoverSouth: "Découvrez le Sud du Brésil",
  },
  it: {
    selectState: "Seleziona Stato",
    selectCity: "Seleziona Città",
    confirmHuman: "Confermo di essere una persona",
    enterGoogle: "Accedi con Google",
    selectToContinue: "Seleziona stato e città per continuare",
    termsNotice: "Accedendo, accetti i termini di servizio. Questa app non memorizza dati personali.",
    digitalStalls: "Bancarelle Digitali",
    topRated: "I Più Votati",
    promosEvents: "Promo ed Eventi",
    promotions: "Promozioni",
    events: "Eventi",
    yourOpinion: "La Tua Opinione",
    treasureHunt: "Caccia al Tesoro",
    trails: "Sentieri",
    groupBuy: "Acquisto di Gruppo",
    birthday: "Anniversario",
    festivities: "Festività",
    history: "Storia",
    contact: "Contatto",
    home: "Home",
    explore: "Esplora",
    merchant: "Commerciante",
    discoverSouth: "Scopri il Sud del Brasile",
  },
  es: {
    selectState: "Seleccionar Estado",
    selectCity: "Seleccionar Ciudad",
    confirmHuman: "Confirmo que soy una persona",
    enterGoogle: "Entrar con Google",
    selectToContinue: "Seleccione estado y ciudad para continuar",
    termsNotice: "Al entrar, acepta los términos de servicio. Esta aplicación no almacena datos personales.",
    digitalStalls: "Puestos Digitales",
    topRated: "Más Votados",
    promosEvents: "Promos y Eventos",
    promotions: "Promociones",
    events: "Eventos",
    yourOpinion: "Tu Opinión",
    treasureHunt: "Búsqueda del Tesoro",
    trails: "Senderos",
    groupBuy: "Compra Colectiva",
    birthday: "Aniversario",
    festivities: "Fiestas",
    history: "Historia",
    contact: "Contacto",
    home: "Inicio",
    explore: "Explorar",
    merchant: "Comerciante",
    discoverSouth: "Descubre el Sur de Brasil",
  },
  de: {
    selectState: "Bundesland auswählen",
    selectCity: "Stadt auswählen",
    confirmHuman: "Ich bestätige, dass ich ein Mensch bin",
    enterGoogle: "Mit Google anmelden",
    selectToContinue: "Wählen Sie Bundesland und Stadt aus",
    termsNotice: "Mit der Anmeldung stimmen Sie den Nutzungsbedingungen zu. Diese App speichert keine persönlichen Daten.",
    digitalStalls: "Digitale Stände",
    topRated: "Am Besten Bewertet",
    promosEvents: "Aktionen & Events",
    promotions: "Aktionen",
    events: "Veranstaltungen",
    yourOpinion: "Ihre Meinung",
    treasureHunt: "Schatzsuche",
    trails: "Wanderwege",
    groupBuy: "Gruppenkauf",
    birthday: "Jahrestag",
    festivities: "Feste",
    history: "Geschichte",
    contact: "Kontakt",
    home: "Startseite",
    explore: "Erkunden",
    merchant: "Händler",
    discoverSouth: "Entdecken Sie Südbrasilien",
  },
};

const LanguageContext = createContext<LanguageContextType | undefined>(undefined);

export const LanguageProvider = ({ children }: { children: ReactNode }) => {
  const [language, setLanguage] = useState<Language>(() => {
    const stored = localStorage.getItem("sulista-language");
    return (stored as Language) || "pt";
  });

  const handleSetLanguage = (lang: Language) => {
    setLanguage(lang);
    localStorage.setItem("sulista-language", lang);
  };

  const t = (key: string) => translations[language][key] || key;

  return (
    <LanguageContext.Provider value={{ language, setLanguage: handleSetLanguage, t }}>
      {children}
    </LanguageContext.Provider>
  );
};

export const useLanguage = () => {
  const context = useContext(LanguageContext);
  if (!context) throw new Error("useLanguage must be used within LanguageProvider");
  return context;
};

export const languageLabels: Record<Language, string> = {
  pt: "Português",
  en: "English",
  fr: "Français",
  it: "Italiano",
  es: "Español",
  de: "Deutsch",
};
