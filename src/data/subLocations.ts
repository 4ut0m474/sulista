export interface SubLocation {
  name: string;
  district: string;
  description: string;
  image: string;
  highlights: string[];
}

export interface CitySubLocations {
  cityName: string;
  stateAbbr: string;
  label: string; // e.g. "Praias", "Distritos"
  subLocations: SubLocation[];
}

export const citySubLocations: CitySubLocations[] = [
  {
    cityName: "Florianópolis",
    stateAbbr: "SC",
    label: "Praias",
    subLocations: [
      // Norte
      { name: "Jurerê Internacional", district: "Norte", description: "Praia sofisticada com beach clubs, águas calmas e cristalinas. Destino preferido para quem busca conforto e agito.", image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80", highlights: ["Beach clubs", "Águas calmas", "Gastronomia premium"] },
      { name: "Jurerê Tradicional", district: "Norte", description: "Praia familiar com águas tranquilas e infraestrutura completa. Ideal para famílias com crianças.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Família", "Águas calmas", "Infraestrutura"] },
      { name: "Canasvieiras", district: "Norte", description: "Uma das praias mais movimentadas do norte, com águas mornas e muitas opções de lazer e gastronomia.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Turismo", "Águas mornas", "Comércio"] },
      { name: "Ingleses", district: "Norte", description: "Praia extensa e popular com ótima infraestrutura, dunas e forte tradição pesqueira.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Dunas", "Pesca artesanal", "Surf"] },
      { name: "Santinho", district: "Norte", description: "Praia com inscrições rupestres, cercada por natureza preservada e excelente para surf.", image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=600&q=80", highlights: ["Surf", "Inscrições rupestres", "Resort"] },
      { name: "Daniela", district: "Norte", description: "Praia tranquila com águas rasas e calmas, perfeita para crianças e banho relaxante.", image: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&q=80", highlights: ["Tranquilidade", "Águas rasas", "Família"] },
      { name: "Forte", district: "Norte", description: "Praia com mar agitado ideal para surfistas, cercada por vegetação nativa.", image: "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=600&q=80", highlights: ["Surf", "Natureza", "Trilhas"] },
      { name: "Brava", district: "Norte", description: "Praia de ondas fortes, muito procurada por surfistas e com visual deslumbrante.", image: "https://images.unsplash.com/photo-1484291150605-0860ed671f04?w=600&q=80", highlights: ["Surf", "Paisagem", "Jovens"] },
      { name: "Lagoinha", district: "Norte", description: "Pequena e charmosa, com águas calmas e vegetação exuberante ao redor.", image: "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=80", highlights: ["Charme", "Águas calmas", "Natureza"] },
      { name: "Ponta das Canas", district: "Norte", description: "Praia familiar com águas calmas e pôr do sol espetacular.", image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&q=80", highlights: ["Pôr do sol", "Família", "Tranquilidade"] },
      // Leste
      { name: "Joaquina", district: "Leste", description: "Famosa mundialmente pelo surf e pelas dunas. Palco de campeonatos internacionais.", image: "https://images.unsplash.com/photo-1502680390548-bdbac40b3e43?w=600&q=80", highlights: ["Surf profissional", "Dunas", "Sandboard"] },
      { name: "Mole", district: "Leste", description: "Praia jovem e descolada com trilhas, visual incrível e boas ondas para surf.", image: "https://images.unsplash.com/photo-1506953823645-5e1f4706e8d6?w=600&q=80", highlights: ["Jovens", "Trilhas", "Surf"] },
      { name: "Moçambique", district: "Leste", description: "A maior praia da ilha com 12km de extensão, natureza intocada e mar aberto.", image: "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=600&q=80", highlights: ["Extensa", "Natureza preservada", "Surf"] },
      { name: "Barra da Lagoa", district: "Leste", description: "Vila de pescadores com canal, trilha para Prainha e muita cultura açoriana.", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80", highlights: ["Cultura açoriana", "Trilha da Prainha", "Pesca"] },
      { name: "Galheta", district: "Leste", description: "Praia naturista cercada por mata atlântica, acessível por trilha a partir da Mole.", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80", highlights: ["Naturismo", "Trilha", "Mata Atlântica"] },
      // Sul
      { name: "Campeche", district: "Sul", description: "Praia extensa com águas cristalinas, vista para a Ilha do Campeche e excelente surf.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Ilha do Campeche", "Surf", "Extensão"] },
      { name: "Armação", district: "Sul", description: "Praia histórica com forte tradição pesqueira e ponto de partida para a Lagoinha do Leste.", image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=600&q=80", highlights: ["Trilha Lagoinha do Leste", "Pesca", "História"] },
      { name: "Matadeiro", district: "Sul", description: "Praia selvagem acessível por trilha, com rio, natureza exuberante e ondas fortes.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Selvagem", "Trilha", "Natureza"] },
      { name: "Lagoinha do Leste", district: "Sul", description: "Considerada uma das praias mais bonitas do Brasil, acessível apenas por trilha ou barco.", image: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&q=80", highlights: ["Trilha", "Praia deserta", "Beleza natural"] },
      { name: "Pântano do Sul", district: "Sul", description: "Vila de pescadores autêntica com restaurantes de frutos do mar tradicionais.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Frutos do mar", "Vila de pescadores", "Autenticidade"] },
      { name: "Solidão", district: "Sul", description: "Praia pequena e isolada com visual paradisíaco e poucas pessoas.", image: "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=80", highlights: ["Isolada", "Paradisíaca", "Tranquilidade"] },
      { name: "Ribeirão da Ilha", district: "Sul", description: "Berço da cultura açoriana em Floripa, famosa pela produção de ostras e gastronomia.", image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&q=80", highlights: ["Ostras", "Cultura açoriana", "Gastronomia"] },
      // Centro/Continente
      { name: "Lagoa da Conceição", district: "Centro", description: "Centro boêmio da ilha com lagoa, dunas, restaurantes e vida noturna agitada.", image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80", highlights: ["Vida noturna", "Lagoa", "Dunas"] },
      { name: "Santo Antônio de Lisboa", district: "Centro", description: "Distrito histórico com casario açoriano, restaurantes de frutos do mar e pôr do sol memorável.", image: "https://images.unsplash.com/photo-1484291150605-0860ed671f04?w=600&q=80", highlights: ["História", "Pôr do sol", "Gastronomia"] },
      { name: "Centro Histórico", district: "Centro", description: "Coração de Florianópolis com Mercado Público, Catedral Metropolitana e vida cultural.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", highlights: ["Mercado Público", "Cultura", "Arquitetura"] },
    ],
  },
  {
    cityName: "Torres",
    stateAbbr: "RS",
    label: "Praias",
    subLocations: [
      { name: "Praia Grande", district: "Centro", description: "Principal praia de Torres com extensa faixa de areia e infraestrutura completa.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Infraestrutura", "Extensão", "Surf"] },
      { name: "Prainha", district: "Centro", description: "Praia charmosa entre os morros, com piscinas naturais e visual único.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Piscinas naturais", "Charme", "Morros"] },
      { name: "Praia da Cal", district: "Centro", description: "Praia urbana com calçadão, boa para caminhadas e com vista para o Morro do Farol.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Calçadão", "Morro do Farol", "Urbana"] },
      { name: "Praia da Guarita", district: "Sul", description: "Praia paradisíaca dentro do Parque da Guarita, com falésias e formações rochosas.", image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=600&q=80", highlights: ["Parque da Guarita", "Falésias", "Natureza"] },
      { name: "Praia Molhes", district: "Sul", description: "Praia na foz do Rio Mampituba com ondas e pescaria.", image: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&q=80", highlights: ["Pesca", "Rio", "Tranquilidade"] },
    ],
  },
  {
    cityName: "Bombinhas",
    stateAbbr: "SC",
    label: "Praias",
    subLocations: [
      { name: "Praia de Bombinhas", district: "Centro", description: "Praia central com águas cristalinas e infraestrutura turística completa.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Águas cristalinas", "Mergulho", "Centro"] },
      { name: "Praia de Bombas", district: "Norte", description: "Praia extensa ideal para famílias com águas calmas e areia fina.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Família", "Águas calmas", "Extensa"] },
      { name: "Praia de Mariscal", district: "Norte", description: "Praia com ondas fortes, procurada por surfistas e jovens.", image: "https://images.unsplash.com/photo-1502680390548-bdbac40b3e43?w=600&q=80", highlights: ["Surf", "Jovens", "Ondas"] },
      { name: "Praia da Lagoinha", district: "Sul", description: "Praia pequena e preservada com trilha de acesso e águas transparentes.", image: "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=80", highlights: ["Trilha", "Preservada", "Mergulho"] },
      { name: "Praia da Sepultura", district: "Centro", description: "Famosa pelas águas transparentes, ideal para snorkeling e mergulho.", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80", highlights: ["Snorkeling", "Águas transparentes", "Natureza"] },
      { name: "Praia do Embrulho", district: "Sul", description: "Praia deserta acessível por trilha, visual intocado e paz.", image: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&q=80", highlights: ["Deserta", "Trilha", "Natureza"] },
    ],
  },
  {
    cityName: "Garopaba",
    stateAbbr: "SC",
    label: "Praias",
    subLocations: [
      { name: "Praia da Ferrugem", district: "Sul", description: "Praia jovem e badalada com excelentes ondas para surf.", image: "https://images.unsplash.com/photo-1502680390548-bdbac40b3e43?w=600&q=80", highlights: ["Surf", "Jovens", "Badalada"] },
      { name: "Praia do Rosa", district: "Sul", description: "Eleita uma das praias mais bonitas do Brasil, com observação de baleias.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Baleias", "Beleza", "Charme"] },
      { name: "Praia do Silveira", district: "Norte", description: "Praia selvagem com ondas tubulares e campeonatos de surf.", image: "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=600&q=80", highlights: ["Surf profissional", "Ondas tubulares", "Selvagem"] },
      { name: "Praia Central", district: "Centro", description: "Praia da vila com pescadores, barcos coloridos e restaurantes.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Vila", "Pesca", "Gastronomia"] },
      { name: "Praia da Gamboa", district: "Norte", description: "Praia tranquila com trilhas e comunidade alternativa.", image: "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=80", highlights: ["Alternativa", "Trilhas", "Tranquilidade"] },
    ],
  },
  {
    cityName: "Balneário Camboriú",
    stateAbbr: "SC",
    label: "Praias",
    subLocations: [
      { name: "Praia Central", district: "Centro", description: "Praia urbana icônica com arranha-céus, teleférico e vida noturna agitada.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Teleférico", "Vida noturna", "Urbana"] },
      { name: "Praia de Laranjeiras", district: "Sul", description: "Acessível por teleférico ou barco, com águas calmas e parque temático.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Teleférico", "Parque Unipraias", "Águas calmas"] },
      { name: "Praia do Estaleiro", district: "Sul", description: "Praia preservada com natureza exuberante e pouca movimentação.", image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=600&q=80", highlights: ["Preservada", "Natureza", "Tranquilidade"] },
      { name: "Praia do Estaleirinho", district: "Sul", description: "Praia semi-deserta com ondas e visual paradisíaco.", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80", highlights: ["Semi-deserta", "Ondas", "Visual"] },
      { name: "Praia Taquaras", district: "Sul", description: "Praia familiar com águas calmas e boa estrutura.", image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&q=80", highlights: ["Família", "Águas calmas", "Estrutura"] },
    ],
  },
  {
    cityName: "Capão da Canoa",
    stateAbbr: "RS",
    label: "Praias",
    subLocations: [
      { name: "Praia Central", district: "Centro", description: "Principal praia com infraestrutura completa e muita movimentação no verão.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Infraestrutura", "Movimentada", "Verão"] },
      { name: "Praia de Arroio Teixeira", district: "Norte", description: "Praia mais tranquila e familiar ao norte de Capão.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Tranquila", "Família", "Norte"] },
      { name: "Praia de Curumim", district: "Sul", description: "Praia residencial com boa estrutura e mar aberto.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Residencial", "Estrutura", "Mar aberto"] },
      { name: "Praia de Atlântida", district: "Sul", description: "Destino jovem e agitado com festas e eventos no verão.", image: "https://images.unsplash.com/photo-1484291150605-0860ed671f04?w=600&q=80", highlights: ["Festas", "Jovens", "Eventos"] },
    ],
  },
  {
    cityName: "Tramandaí",
    stateAbbr: "RS",
    label: "Praias",
    subLocations: [
      { name: "Praia Central", district: "Centro", description: "Praia principal com calçadão e infraestrutura para turistas.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Calçadão", "Infraestrutura", "Central"] },
      { name: "Praia de Imbé", district: "Norte", description: "Praia vizinha com opções de lazer e gastronomia.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Lazer", "Gastronomia", "Vizinha"] },
      { name: "Praia Jardim do Éden", district: "Sul", description: "Praia mais reservada e tranquila para relaxar.", image: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&q=80", highlights: ["Reservada", "Tranquila", "Relaxamento"] },
    ],
  },
  {
    cityName: "Guaratuba",
    stateAbbr: "PR",
    label: "Praias",
    subLocations: [
      { name: "Praia Central", district: "Centro", description: "Praia urbana com infraestrutura completa e fácil acesso.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Urbana", "Infraestrutura", "Acessível"] },
      { name: "Praia de Caieiras", district: "Norte", description: "Praia com vista para a baía e águas calmas.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Baía", "Águas calmas", "Vista"] },
      { name: "Praia Brejatuba", district: "Sul", description: "Praia extensa e mais tranquila, ideal para longas caminhadas.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Extensa", "Caminhadas", "Tranquilidade"] },
    ],
  },
  {
    cityName: "Matinhos",
    stateAbbr: "PR",
    label: "Praias",
    subLocations: [
      { name: "Praia Central", district: "Centro", description: "Praia movimentada com calçadão e comércio.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Calçadão", "Comércio", "Movimentada"] },
      { name: "Praia Mansa", district: "Norte", description: "Praia com águas calmas, ideal para banho em família.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Águas calmas", "Família", "Banho"] },
      { name: "Praia Brava", district: "Sul", description: "Praia com ondas fortes cercada por morros e mata atlântica.", image: "https://images.unsplash.com/photo-1502680390548-bdbac40b3e43?w=600&q=80", highlights: ["Ondas", "Morros", "Mata Atlântica"] },
      { name: "Caiobá", district: "Sul", description: "Balneário famoso com Morro do Boi e praia agitada.", image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&q=80", highlights: ["Morro do Boi", "Agitada", "Mirante"] },
    ],
  },
  {
    cityName: "Ilha do Mel",
    stateAbbr: "PR",
    label: "Praias",
    subLocations: [
      { name: "Praia de Encantadas", district: "Sul", description: "Vila principal com comércio, pousadas e acesso por barco.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Vila", "Pousadas", "Acesso por barco"] },
      { name: "Praia de Fora", district: "Leste", description: "Praia deserta com ondas e natureza intocada.", image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=600&q=80", highlights: ["Deserta", "Natureza", "Ondas"] },
      { name: "Praia do Farol", district: "Norte", description: "Praia com o histórico Farol das Conchas e trilhas.", image: "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=80", highlights: ["Farol", "Trilhas", "História"] },
      { name: "Praia da Fortaleza", district: "Norte", description: "Praia junto à Fortaleza de Nossa Senhora dos Prazeres.", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80", highlights: ["Fortaleza", "História", "Vista"] },
    ],
  },
];

export function getCitySubLocations(cityName: string, stateAbbr: string): CitySubLocations | undefined {
  return citySubLocations.find(
    c => c.cityName === cityName && c.stateAbbr === stateAbbr
  );
}
