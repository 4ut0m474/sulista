export interface CityData {
  name: string;
  state: string;
  stateAbbr: string;
  birthday: string;
  description: string;
  festivities: string;
  history: string;
  temperature: number;
  weather: "sunny" | "cloudy" | "rainy" | "partly-cloudy" | "stormy";
}

export const states = [
  { name: "Paraná", abbr: "PR" },
  { name: "Santa Catarina", abbr: "SC" },
  { name: "Rio Grande do Sul", abbr: "RS" },
];

export const citiesByState: Record<string, string[]> = {
  PR: [
    "Curitiba", "Londrina", "Maringá", "Ponta Grossa", "Cascavel", "Foz do Iguaçu",
    "São José dos Pinhais", "Colombo", "Guarapuava", "Paranaguá", "Araucária",
    "Toledo", "Apucarana", "Campo Largo", "Pinhais", "Arapongas", "Almirante Tamandaré",
    "Umuarama", "Piraquara", "Cambé", "Campo Mourão", "Fazenda Rio Grande",
    "Paranavaí", "Sarandi", "Francisco Beltrão", "Pato Branco", "Cianorte",
    "Telêmaco Borba", "Castro", "Rolândia", "Irati", "União da Vitória",
    "Lapa", "Prudentópolis", "Palmas", "Ivaiporã", "Cornélio Procópio",
    "Matinhos", "Morretes", "Antonina", "Guaratuba", "Ilha do Mel",
  ],
  SC: [
    "Florianópolis", "Joinville", "Blumenau", "São José", "Chapecó", "Criciúma",
    "Itajaí", "Jaraguá do Sul", "Palhoça", "Lages", "Balneário Camboriú",
    "Brusque", "Tubarão", "São Bento do Sul", "Caçador", "Concórdia",
    "Navegantes", "Rio do Sul", "Araranguá", "Gaspar", "Mafra",
    "Camboriú", "Canoinhas", "Biguaçu", "Tijucas", "Imbituba",
    "Bombinhas", "Penha", "Piçarras", "Garopaba", "Urussanga",
    "Pomerode", "Treze Tílias", "São Joaquim", "Urubici", "Praia Grande",
    "Governador Celso Ramos", "Porto Belo", "Itapema", "Nova Trento",
  ],
  RS: [
    "Porto Alegre", "Caxias do Sul", "Pelotas", "Canoas", "Santa Maria",
    "Gravataí", "Viamão", "Novo Hamburgo", "São Leopoldo", "Rio Grande",
    "Alvorada", "Passo Fundo", "Sapucaia do Sul", "Uruguaiana", "Cachoeirinha",
    "Bagé", "Bento Gonçalves", "Erechim", "Guaíba", "Cachoeira do Sul",
    "Santa Cruz do Sul", "Lajeado", "Ijuí", "Sapiranga", "Alegrete",
    "Santo Ângelo", "Esteio", "Cruz Alta", "Venâncio Aires", "Santana do Livramento",
    "Gramado", "Canela", "Torres", "Capão da Canoa", "Tramandaí",
    "Garibaldi", "Carlos Barbosa", "São Francisco de Paula", "Cambará do Sul",
    "Flores da Cunha", "Nova Petrópolis", "Farroupilha",
  ],
};

export function getCityData(cityName: string, stateAbbr: string): CityData {
  const weatherOptions: CityData["weather"][] = ["sunny", "cloudy", "rainy", "partly-cloudy"];
  const hash = cityName.length + stateAbbr.charCodeAt(0);
  
  return {
    name: cityName,
    state: states.find(s => s.abbr === stateAbbr)?.name || stateAbbr,
    stateAbbr,
    birthday: `${(hash % 28) + 1}/${(hash % 12) + 1}`,
    description: `${cityName} é uma das belas cidades do ${states.find(s => s.abbr === stateAbbr)?.name}, conhecida por sua cultura, gastronomia e hospitalidade sulista.`,
    festivities: getFestivities(cityName),
    history: `Fundada no século XIX, ${cityName} cresceu com a influência de imigrantes europeus que trouxeram tradições, culinária e arquitetura únicas para a região sul do Brasil.`,
    temperature: 15 + (hash % 18),
    weather: weatherOptions[hash % weatherOptions.length],
  };
}

function getFestivities(city: string): string {
  const festivities: Record<string, string> = {
    "Gramado": "Natal Luz, Festival de Cinema",
    "Blumenau": "Oktoberfest",
    "Curitiba": "Festival de Teatro, Oficina de Música",
    "Florianópolis": "Carnaval, Festival da Ostra",
    "Porto Alegre": "Semana Farroupilha, Feira do Livro",
    "Bento Gonçalves": "Festa da Uva, Fenavinho",
    "Foz do Iguaçu": "Festival das Cataratas",
    "Pomerode": "Festa Pomerana",
    "São Joaquim": "Festa da Maçã",
  };
  return festivities[city] || "Festas tradicionais locais, feiras gastronômicas";
}

export const stallsData = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: `Barraca ${i + 1}`,
  available: i > 4, // first 5 are taken for demo
  owner: i <= 4 ? `Comerciante ${i + 1}` : null,
  products: i <= 4
    ? [
        { name: "Produto Artesanal", price: 29.9, description: "Produto artesanal feito com carinho", image: "" },
        { name: "Especialidade Local", price: 45.0, description: "O melhor da culinária local", image: "" },
      ]
    : [],
}));

export const plans = [
  {
    id: "basic",
    name: "Básico",
    price: 10,
    annualDiscount: 10,
    features: ["Barraca digital", "Exibição de produtos", "Preços e descrições"],
    highlight: false,
  },
  {
    id: "carousel",
    name: "Carrossel",
    price: 20,
    annualDiscount: 15,
    features: ["Espaço no carrossel de imagens", "Propaganda visual", "Mais visibilidade"],
    highlight: false,
  },
  {
    id: "combo",
    name: "Combo",
    price: 30,
    annualDiscount: 20,
    features: ["Barraca digital", "Espaço no carrossel", "Propaganda completa", "Melhor custo-benefício"],
    highlight: true,
  },
  {
    id: "vip",
    name: "VIP",
    price: 59.99,
    annualDiscount: 25,
    features: [
      "Barraca digital especial VIP",
      "Posição de destaque (início)",
      "Espaço no carrossel premium",
      "Mais apresentações",
      "Auxílio via WhatsApp",
      "IA para criar fotos e projetos",
    ],
    highlight: false,
    isVip: true,
  },
];
