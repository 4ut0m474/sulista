export interface CityData {
  name: string;
  state: string;
  stateAbbr: string;
  birthday: string;
  description: string;
  festivities: string;
  history: string;
}

export const states = [
  { name: "Paraná", abbr: "PR" },
  { name: "Santa Catarina", abbr: "SC" },
  { name: "Rio Grande do Sul", abbr: "RS" },
];

// Tourist cities first, then alphabetical
export const citiesByState: Record<string, string[]> = {
  PR: [
    // Tourist cities
    "Foz do Iguaçu", "Curitiba", "Morretes", "Ilha do Mel", "Antonina",
    "Guaratuba", "Matinhos", "Paranaguá", "Lapa", "Castro", "Prudentópolis",
    // Other cities
    "Almirante Tamandaré", "Apucarana", "Arapongas", "Araucária",
    "Cambé", "Campo Largo", "Campo Mourão", "Cascavel", "Cianorte",
    "Colombo", "Cornélio Procópio", "Fazenda Rio Grande", "Francisco Beltrão",
    "Guarapuava", "Irati", "Ivaiporã", "Londrina", "Maringá",
    "Palmas", "Paranavaí", "Pato Branco", "Pinhais", "Piraquara",
    "Ponta Grossa", "Rolândia", "São José dos Pinhais", "Sarandi",
    "Telêmaco Borba", "Toledo", "Umuarama", "União da Vitória",
  ],
  SC: [
    // Tourist cities
    "Florianópolis", "Balneário Camboriú", "Bombinhas", "Blumenau",
    "Pomerode", "Penha", "Garopaba", "São Joaquim", "Urubici",
    "Treze Tílias", "Praia Grande", "Porto Belo", "Itapema",
    // Other cities
    "Araranguá", "Biguaçu", "Brusque", "Caçador", "Camboriú",
    "Canoinhas", "Chapecó", "Concórdia", "Criciúma", "Gaspar",
    "Governador Celso Ramos", "Imbituba", "Itajaí", "Jaraguá do Sul",
    "Joinville", "Lages", "Mafra", "Navegantes", "Nova Trento",
    "Palhoça", "Piçarras", "Rio do Sul", "São Bento do Sul",
    "São José", "Tijucas", "Tubarão", "Urussanga",
  ],
  RS: [
    // Tourist cities
    "Gramado", "Canela", "Bento Gonçalves", "Torres", "Cambará do Sul",
    "São Francisco de Paula", "Nova Petrópolis", "Garibaldi", "Carlos Barbosa",
    "Flores da Cunha", "Porto Alegre", "Capão da Canoa",
    // Other cities
    "Alegrete", "Alvorada", "Bagé", "Cachoeira do Sul", "Cachoeirinha",
    "Canoas", "Caxias do Sul", "Cruz Alta", "Erechim", "Esteio",
    "Farroupilha", "Gravataí", "Guaíba", "Ijuí", "Lajeado",
    "Novo Hamburgo", "Passo Fundo", "Pelotas", "Rio Grande",
    "Santa Cruz do Sul", "Santa Maria", "Santana do Livramento",
    "Santo Ângelo", "São Leopoldo", "Sapiranga", "Sapucaia do Sul",
    "Tramandaí", "Uruguaiana", "Venâncio Aires", "Viamão",
  ],
};

export function getCityData(cityName: string, stateAbbr: string): CityData {
  const hash = cityName.length + stateAbbr.charCodeAt(0);
  
  return {
    name: cityName,
    state: states.find(s => s.abbr === stateAbbr)?.name || stateAbbr,
    stateAbbr,
    birthday: `${(hash % 28) + 1}/${(hash % 12) + 1}`,
    description: `${cityName} é uma das belas cidades do ${states.find(s => s.abbr === stateAbbr)?.name}, conhecida por sua cultura, gastronomia e hospitalidade sulista.`,
    festivities: getFestivities(cityName),
    history: `Fundada no século XIX, ${cityName} cresceu com a influência de imigrantes europeus que trouxeram tradições, culinária e arquitetura únicas para a região sul do Brasil.`,
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

// Product images for stalls
const productImages = [
  "https://images.unsplash.com/photo-1509440159596-0249088772ff?w=400&q=80", // bread
  "https://images.unsplash.com/photo-1563729784474-d77dbb933a9e?w=400&q=80", // chocolate
  "https://images.unsplash.com/photo-1556909114-f6e7ad7d3136?w=400&q=80", // cheese
  "https://images.unsplash.com/photo-1473093295043-cdd812d0e601?w=400&q=80", // food plate
  "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=400&q=80", // gourmet
  "https://images.unsplash.com/photo-1555939594-58d7cb561ad1?w=400&q=80", // bbq
  "https://images.unsplash.com/photo-1482049016688-2d3e1b311543?w=400&q=80", // food art
  "https://images.unsplash.com/photo-1565299624946-b28f40a0ae38?w=400&q=80", // pizza
  "https://images.unsplash.com/photo-1567620905732-2d1ec7ab7445?w=400&q=80", // pancakes
  "https://images.unsplash.com/photo-1540189549336-e6e99c3679fe?w=400&q=80", // salad
];

const productNames = [
  "Pão Artesanal Colonial", "Chocolate Caseiro", "Queijo Colonial",
  "Prato Típico Regional", "Bolo de Mel", "Churrasco Sulista",
  "Geleia Artesanal", "Vinho Colonial", "Erva-mate Premium",
  "Doce de Leite Caseiro",
];

export const stallsData = Array.from({ length: 40 }, (_, i) => ({
  id: i + 1,
  name: `Barraca ${i + 1}`,
  available: i > 4,
  owner: i <= 4 ? `Comerciante ${i + 1}` : null,
  products: i <= 4
    ? [
        {
          name: productNames[i % productNames.length],
          price: 19.9 + (i * 7.5),
          description: "Produto artesanal feito com carinho e ingredientes selecionados da região sul",
          image: productImages[i % productImages.length],
        },
        {
          name: productNames[(i + 3) % productNames.length],
          price: 25.0 + (i * 5),
          description: "Especialidade local, receita tradicional passada de geração em geração",
          image: productImages[(i + 3) % productImages.length],
        },
        {
          name: productNames[(i + 5) % productNames.length],
          price: 35.0 + (i * 3),
          description: "O melhor da culinária sulista, com sabor autêntico e qualidade premium",
          image: productImages[(i + 5) % productImages.length],
        },
        {
          name: productNames[(i + 7) % productNames.length],
          price: 15.0 + (i * 4),
          description: "Produção artesanal em pequenos lotes para garantir a máxima qualidade",
          image: productImages[(i + 7) % productImages.length],
        },
      ]
    : [],
}));

export const plans = [
  {
    id: "ai-chat",
    name: "Litorânea IA",
    price: 5,
    annualDiscount: 17,
    features: ["Chat ilimitado com a Litorânea", "Secretária IA 24h", "Sem propaganda inclusa", "Suporte por voz"],
    highlight: false,
  },
  {
    id: "basic",
    name: "Básico",
    price: 10,
    annualDiscount: 10,
    features: ["Barraca digital", "Exibição de produtos", "Preços e descrições", "+200 SulCoins na primeira compra"],
    highlight: false,
  },
  {
    id: "carousel",
    name: "Carrossel",
    price: 20,
    annualDiscount: 15,
    features: ["Espaço no carrossel de imagens", "Propaganda visual", "Mais visibilidade", "+500 SulCoins na primeira compra"],
    highlight: false,
  },
  {
    id: "combo",
    name: "Combo",
    price: 30,
    annualDiscount: 20,
    features: ["Barraca digital", "Espaço no carrossel", "Propaganda completa", "Melhor custo-benefício", "+800 SulCoins na primeira compra"],
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
      "+1500 SulCoins na primeira compra",
    ],
    highlight: false,
    isVip: true,
  },
];
