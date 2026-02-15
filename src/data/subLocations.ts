export interface SubLocation {
  name: string;
  district: string;
  description: string;
  image: string;
  highlights: string[];
}

export type SubLocationType = "praias" | "bairros";

export interface SubLocationGroup {
  type: SubLocationType;
  label: string;
  subLocations: SubLocation[];
}

export interface CitySubLocations {
  cityName: string;
  stateAbbr: string;
  label: string;
  groups: SubLocationGroup[];
  subLocations: SubLocation[]; // flattened for compat
}

// Helper to build city entry with groups
function buildCity(
  cityName: string,
  stateAbbr: string,
  groups: SubLocationGroup[]
): CitySubLocations {
  return {
    cityName,
    stateAbbr,
    label: groups[0]?.label || "Locais",
    groups,
    subLocations: groups.flatMap(g => g.subLocations),
  };
}

export const citySubLocations: CitySubLocations[] = [
  // ========== CURITIBA - PR ==========
  buildCity("Curitiba", "PR", [
    {
      type: "bairros",
      label: "Bairros Turísticos",
      subLocations: [
        { name: "Centro Histórico", district: "Centro", description: "Coração de Curitiba com a Rua XV de Novembro, Catedral e Praça Tiradentes. Centro cultural e comercial.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", highlights: ["Rua XV", "Catedral", "Praça Tiradentes"] },
        { name: "Largo da Ordem", district: "Centro", description: "Bairro histórico com feirinha de domingo, bares, galerias de arte e arquitetura colonial.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80", highlights: ["Feira do Largo", "Arte", "Gastronomia"] },
        { name: "Batel", district: "Centro", description: "Bairro nobre com os melhores restaurantes, bares sofisticados e lojas de grife.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", highlights: ["Gastronomia", "Vida noturna", "Compras"] },
        { name: "Santa Felicidade", district: "Norte", description: "Colônia italiana com restaurantes tradicionais, vinícolas e cultura imigrante.", image: "https://images.unsplash.com/photo-1504674900247-0877df9cc836?w=600&q=80", highlights: ["Culinária italiana", "Vinícolas", "Tradição"] },
        { name: "São Francisco", district: "Centro", description: "Bairro boêmio com a famosa Praça de Bolso do Ciclista, bares e vida cultural.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80", highlights: ["Boemia", "Cultura", "Ciclismo"] },
        { name: "Jardim Botânico", district: "Sul", description: "Região do icônico Jardim Botânico com estufa art nouveau e jardins franceses.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", highlights: ["Jardim Botânico", "Estufa", "Parques"] },
        { name: "Mercês", district: "Oeste", description: "Bairro residencial com o Museu Oscar Niemeyer (Museu do Olho) e opções gastronômicas.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", highlights: ["Museu do Olho", "Gastronomia", "Cultura"] },
        { name: "Centro Cívico", district: "Norte", description: "Região administrativa com o Palácio Iguaçu, Museu Paranaense e Bosque João Paulo II.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", highlights: ["Palácio Iguaçu", "Museus", "Bosque"] },
      ],
    },
  ]),

  // ========== FLORIANÓPOLIS - SC ==========
  buildCity("Florianópolis", "SC", [
    {
      type: "praias",
      label: "Praias",
      subLocations: [
        { name: "Jurerê Internacional", district: "Norte", description: "Praia sofisticada com beach clubs, águas calmas e cristalinas.", image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80", highlights: ["Beach clubs", "Águas calmas", "Gastronomia premium"] },
        { name: "Jurerê Tradicional", district: "Norte", description: "Praia familiar com águas tranquilas e infraestrutura completa.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Família", "Águas calmas", "Infraestrutura"] },
        { name: "Canasvieiras", district: "Norte", description: "Uma das praias mais movimentadas do norte, com águas mornas e muitas opções de lazer.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Turismo", "Águas mornas", "Comércio"] },
        { name: "Ingleses", district: "Norte", description: "Praia extensa e popular com ótima infraestrutura, dunas e tradição pesqueira.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Dunas", "Pesca artesanal", "Surf"] },
        { name: "Santinho", district: "Norte", description: "Praia com inscrições rupestres, natureza preservada e excelente surf.", image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=600&q=80", highlights: ["Surf", "Inscrições rupestres", "Resort"] },
        { name: "Daniela", district: "Norte", description: "Praia tranquila com águas rasas e calmas, perfeita para crianças.", image: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&q=80", highlights: ["Tranquilidade", "Águas rasas", "Família"] },
        { name: "Forte", district: "Norte", description: "Praia com mar agitado ideal para surfistas, cercada por vegetação nativa.", image: "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=600&q=80", highlights: ["Surf", "Natureza", "Trilhas"] },
        { name: "Brava", district: "Norte", description: "Praia de ondas fortes, muito procurada por surfistas e com visual deslumbrante.", image: "https://images.unsplash.com/photo-1484291150605-0860ed671f04?w=600&q=80", highlights: ["Surf", "Paisagem", "Jovens"] },
        { name: "Lagoinha", district: "Norte", description: "Pequena e charmosa, com águas calmas e vegetação exuberante.", image: "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=80", highlights: ["Charme", "Águas calmas", "Natureza"] },
        { name: "Ponta das Canas", district: "Norte", description: "Praia familiar com águas calmas e pôr do sol espetacular.", image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&q=80", highlights: ["Pôr do sol", "Família", "Tranquilidade"] },
        { name: "Joaquina", district: "Leste", description: "Famosa mundialmente pelo surf e pelas dunas.", image: "https://images.unsplash.com/photo-1502680390548-bdbac40b3e43?w=600&q=80", highlights: ["Surf profissional", "Dunas", "Sandboard"] },
        { name: "Mole", district: "Leste", description: "Praia jovem e descolada com trilhas, visual incrível e boas ondas.", image: "https://images.unsplash.com/photo-1506953823645-5e1f4706e8d6?w=600&q=80", highlights: ["Jovens", "Trilhas", "Surf"] },
        { name: "Moçambique", district: "Leste", description: "A maior praia da ilha com 12km de extensão e natureza intocada.", image: "https://images.unsplash.com/photo-1468413253725-0d5181091126?w=600&q=80", highlights: ["Extensa", "Natureza preservada", "Surf"] },
        { name: "Barra da Lagoa", district: "Leste", description: "Vila de pescadores com canal, trilha para Prainha e cultura açoriana.", image: "https://images.unsplash.com/photo-1544551763-46a013bb70d5?w=600&q=80", highlights: ["Cultura açoriana", "Trilha da Prainha", "Pesca"] },
        { name: "Galheta", district: "Leste", description: "Praia naturista cercada por mata atlântica, acessível por trilha.", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80", highlights: ["Naturismo", "Trilha", "Mata Atlântica"] },
        { name: "Campeche", district: "Sul", description: "Praia extensa com águas cristalinas e vista para a Ilha do Campeche.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Ilha do Campeche", "Surf", "Extensão"] },
        { name: "Armação", district: "Sul", description: "Praia histórica com tradição pesqueira e ponto de partida para Lagoinha do Leste.", image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=600&q=80", highlights: ["Trilha Lagoinha do Leste", "Pesca", "História"] },
        { name: "Matadeiro", district: "Sul", description: "Praia selvagem acessível por trilha, com rio e ondas fortes.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Selvagem", "Trilha", "Natureza"] },
        { name: "Lagoinha do Leste", district: "Sul", description: "Uma das praias mais bonitas do Brasil, acessível apenas por trilha ou barco.", image: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&q=80", highlights: ["Trilha", "Praia deserta", "Beleza natural"] },
        { name: "Pântano do Sul", district: "Sul", description: "Vila de pescadores autêntica com restaurantes de frutos do mar tradicionais.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Frutos do mar", "Vila de pescadores", "Autenticidade"] },
        { name: "Solidão", district: "Sul", description: "Praia pequena e isolada com visual paradisíaco.", image: "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=80", highlights: ["Isolada", "Paradisíaca", "Tranquilidade"] },
        { name: "Ribeirão da Ilha", district: "Sul", description: "Berço da cultura açoriana, famosa pela produção de ostras.", image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&q=80", highlights: ["Ostras", "Cultura açoriana", "Gastronomia"] },
        { name: "Lagoa da Conceição", district: "Centro", description: "Centro boêmio com lagoa, dunas, restaurantes e vida noturna.", image: "https://images.unsplash.com/photo-1559128010-7c1ad6e1b6a5?w=600&q=80", highlights: ["Vida noturna", "Lagoa", "Dunas"] },
        { name: "Santo Antônio de Lisboa", district: "Centro", description: "Distrito histórico com casario açoriano e pôr do sol memorável.", image: "https://images.unsplash.com/photo-1484291150605-0860ed671f04?w=600&q=80", highlights: ["História", "Pôr do sol", "Gastronomia"] },
        { name: "Centro Histórico", district: "Centro", description: "Coração de Florianópolis com Mercado Público e vida cultural.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", highlights: ["Mercado Público", "Cultura", "Arquitetura"] },
      ],
    },
  ]),

  // ========== PORTO ALEGRE - RS ==========
  buildCity("Porto Alegre", "RS", [
    {
      type: "bairros",
      label: "Bairros Turísticos",
      subLocations: [
        { name: "Centro Histórico", district: "Centro", description: "Mercado Público, Praça da Matriz, Theatro São Pedro e vida cultural intensa.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", highlights: ["Mercado Público", "Theatro", "Praça da Matriz"] },
        { name: "Cidade Baixa", district: "Centro", description: "Bairro boêmio com bares, restaurantes e a melhor vida noturna de Porto Alegre.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", highlights: ["Vida noturna", "Boemia", "Gastronomia"] },
        { name: "Moinhos de Vento", district: "Norte", description: "Bairro nobre com o Parcão, boutiques, restaurantes sofisticados e charme europeu.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", highlights: ["Parcão", "Compras", "Gastronomia"] },
        { name: "Bom Fim", district: "Centro", description: "Bairro cultural com o Parque Farroupilha (Redenção), feiras e diversidade.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80", highlights: ["Redenção", "Brique da Redenção", "Cultura"] },
        { name: "Praia de Belas", district: "Sul", description: "Região com shopping, orla do Guaíba e pôr do sol icônico.", image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&q=80", highlights: ["Orla do Guaíba", "Pôr do sol", "Shopping"] },
        { name: "Ipanema", district: "Sul", description: "Bairro à beira do Guaíba com calçadão, bares e vida ao ar livre.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Guaíba", "Calçadão", "Bares"] },
      ],
    },
  ]),

  // ========== BLUMENAU - SC ==========
  buildCity("Blumenau", "SC", [
    {
      type: "bairros",
      label: "Bairros Turísticos",
      subLocations: [
        { name: "Centro", district: "Centro", description: "Rua XV com arquitetura enxaimel, lojas e gastronomia alemã.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", highlights: ["Rua XV", "Enxaimel", "Gastronomia alemã"] },
        { name: "Vila Germânica", district: "Centro", description: "Complexo turístico sede da Oktoberfest com cervejarias e restaurantes.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", highlights: ["Oktoberfest", "Cervejarias", "Eventos"] },
        { name: "Ponta Aguda", district: "Norte", description: "Bairro com o famoso casarão Moellmann e vista para o Rio Itajaí-Açu.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", highlights: ["Casarão histórico", "Rio Itajaí", "Arquitetura"] },
        { name: "Vila Itoupava", district: "Norte", description: "Colônia alemã preservada com café colonial e trilhas na mata.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80", highlights: ["Café colonial", "Trilhas", "Colônia alemã"] },
      ],
    },
  ]),

  // ========== FOZ DO IGUAÇU - PR ==========
  buildCity("Foz do Iguaçu", "PR", [
    {
      type: "bairros",
      label: "Pontos Turísticos",
      subLocations: [
        { name: "Cataratas do Iguaçu", district: "Sul", description: "Uma das 7 maravilhas da natureza com passarelas sobre as quedas d'água.", image: "https://images.unsplash.com/photo-1589909202802-8f4aadce1849?w=600&q=80", highlights: ["Cataratas", "Parque Nacional", "Trilhas"] },
        { name: "Marco das Três Fronteiras", district: "Centro", description: "Ponto turístico onde se encontram Brasil, Argentina e Paraguai.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", highlights: ["3 Fronteiras", "Mirante", "Show noturno"] },
        { name: "Itaipu", district: "Norte", description: "A maior usina hidrelétrica do mundo com visitas turísticas e iluminação noturna.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", highlights: ["Usina", "Visita técnica", "Iluminação"] },
        { name: "Parque das Aves", district: "Sul", description: "Parque ecológico com aves tropicais em viveiros gigantes na mata.", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80", highlights: ["Aves", "Ecologia", "Mata Atlântica"] },
        { name: "Centro", district: "Centro", description: "Centro comercial com gastronomia multicultural e artesanato de fronteira.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", highlights: ["Gastronomia", "Comércio", "Multicultural"] },
      ],
    },
  ]),

  // ========== GRAMADO - RS ==========
  buildCity("Gramado", "RS", [
    {
      type: "bairros",
      label: "Regiões Turísticas",
      subLocations: [
        { name: "Centro (Rua Coberta)", district: "Centro", description: "Rua Coberta com cafés, chocolaterias e lojas de artesanato.", image: "https://images.unsplash.com/photo-1555396273-367ea4eb4db5?w=600&q=80", highlights: ["Rua Coberta", "Chocolaterias", "Compras"] },
        { name: "Lago Negro", district: "Sul", description: "Lago artificial cercado por hortênsias e mata com pedalinhos.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", highlights: ["Lago Negro", "Pedalinhos", "Natureza"] },
        { name: "Mini Mundo", district: "Norte", description: "Parque temático com réplicas em miniatura de construções famosas.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80", highlights: ["Miniaturas", "Família", "Parque"] },
        { name: "Snowland", district: "Norte", description: "Parque de neve indoor com esqui, snowboard e diversão na neve.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", highlights: ["Neve", "Esqui", "Diversão"] },
      ],
    },
  ]),

  // ========== TORRES - RS ==========
  buildCity("Torres", "RS", [
    {
      type: "praias",
      label: "Praias",
      subLocations: [
        { name: "Praia Grande", district: "Centro", description: "Principal praia com extensa faixa de areia e infraestrutura completa.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Infraestrutura", "Extensão", "Surf"] },
        { name: "Prainha", district: "Centro", description: "Praia charmosa entre morros, com piscinas naturais e visual único.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Piscinas naturais", "Charme", "Morros"] },
        { name: "Praia da Cal", district: "Centro", description: "Praia urbana com calçadão e vista para o Morro do Farol.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Calçadão", "Morro do Farol", "Urbana"] },
        { name: "Praia da Guarita", district: "Sul", description: "Praia paradisíaca dentro do Parque da Guarita, com falésias.", image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=600&q=80", highlights: ["Parque da Guarita", "Falésias", "Natureza"] },
        { name: "Praia Molhes", district: "Sul", description: "Praia na foz do Rio Mampituba com ondas e pescaria.", image: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&q=80", highlights: ["Pesca", "Rio", "Tranquilidade"] },
      ],
    },
  ]),

  // ========== BOMBINHAS - SC ==========
  buildCity("Bombinhas", "SC", [
    {
      type: "praias",
      label: "Praias",
      subLocations: [
        { name: "Praia de Bombinhas", district: "Centro", description: "Praia central com águas cristalinas e infraestrutura turística.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Águas cristalinas", "Mergulho", "Centro"] },
        { name: "Praia de Bombas", district: "Norte", description: "Praia extensa ideal para famílias com águas calmas.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Família", "Águas calmas", "Extensa"] },
        { name: "Praia de Mariscal", district: "Norte", description: "Praia com ondas fortes, procurada por surfistas.", image: "https://images.unsplash.com/photo-1502680390548-bdbac40b3e43?w=600&q=80", highlights: ["Surf", "Jovens", "Ondas"] },
        { name: "Praia da Lagoinha", district: "Sul", description: "Praia preservada com trilha de acesso e águas transparentes.", image: "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=80", highlights: ["Trilha", "Preservada", "Mergulho"] },
        { name: "Praia da Sepultura", district: "Centro", description: "Famosa pelas águas transparentes, ideal para snorkeling.", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80", highlights: ["Snorkeling", "Águas transparentes", "Natureza"] },
        { name: "Praia do Embrulho", district: "Sul", description: "Praia deserta acessível por trilha, visual intocado.", image: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&q=80", highlights: ["Deserta", "Trilha", "Natureza"] },
      ],
    },
  ]),

  // ========== GAROPABA - SC ==========
  buildCity("Garopaba", "SC", [
    {
      type: "praias",
      label: "Praias",
      subLocations: [
        { name: "Praia da Ferrugem", district: "Sul", description: "Praia jovem e badalada com excelentes ondas para surf.", image: "https://images.unsplash.com/photo-1502680390548-bdbac40b3e43?w=600&q=80", highlights: ["Surf", "Jovens", "Badalada"] },
        { name: "Praia do Rosa", district: "Sul", description: "Eleita uma das praias mais bonitas do Brasil, com observação de baleias.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Baleias", "Beleza", "Charme"] },
        { name: "Praia do Silveira", district: "Norte", description: "Praia selvagem com ondas tubulares e campeonatos de surf.", image: "https://images.unsplash.com/photo-1509233725247-49e657c54213?w=600&q=80", highlights: ["Surf profissional", "Ondas tubulares", "Selvagem"] },
        { name: "Praia Central", district: "Centro", description: "Praia da vila com pescadores, barcos coloridos e restaurantes.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Vila", "Pesca", "Gastronomia"] },
        { name: "Praia da Gamboa", district: "Norte", description: "Praia tranquila com trilhas e comunidade alternativa.", image: "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=80", highlights: ["Alternativa", "Trilhas", "Tranquilidade"] },
      ],
    },
  ]),

  // ========== BALNEÁRIO CAMBORIÚ - SC ==========
  buildCity("Balneário Camboriú", "SC", [
    {
      type: "praias",
      label: "Praias",
      subLocations: [
        { name: "Praia Central", district: "Centro", description: "Praia urbana icônica com arranha-céus, teleférico e vida noturna.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Teleférico", "Vida noturna", "Urbana"] },
        { name: "Praia de Laranjeiras", district: "Sul", description: "Acessível por teleférico ou barco, com águas calmas.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Teleférico", "Parque Unipraias", "Águas calmas"] },
        { name: "Praia do Estaleiro", district: "Sul", description: "Praia preservada com natureza exuberante.", image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=600&q=80", highlights: ["Preservada", "Natureza", "Tranquilidade"] },
        { name: "Praia do Estaleirinho", district: "Sul", description: "Praia semi-deserta com ondas e visual paradisíaco.", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80", highlights: ["Semi-deserta", "Ondas", "Visual"] },
        { name: "Praia Taquaras", district: "Sul", description: "Praia familiar com águas calmas e boa estrutura.", image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&q=80", highlights: ["Família", "Águas calmas", "Estrutura"] },
      ],
    },
  ]),

  // ========== CAPÃO DA CANOA - RS ==========
  buildCity("Capão da Canoa", "RS", [
    {
      type: "praias",
      label: "Praias",
      subLocations: [
        { name: "Praia Central", district: "Centro", description: "Principal praia com infraestrutura completa e muita movimentação.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Infraestrutura", "Movimentada", "Verão"] },
        { name: "Praia de Arroio Teixeira", district: "Norte", description: "Praia mais tranquila e familiar ao norte.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Tranquila", "Família", "Norte"] },
        { name: "Praia de Curumim", district: "Sul", description: "Praia residencial com boa estrutura e mar aberto.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Residencial", "Estrutura", "Mar aberto"] },
        { name: "Praia de Atlântida", district: "Sul", description: "Destino jovem e agitado com festas e eventos.", image: "https://images.unsplash.com/photo-1484291150605-0860ed671f04?w=600&q=80", highlights: ["Festas", "Jovens", "Eventos"] },
      ],
    },
  ]),

  // ========== TRAMANDAÍ - RS ==========
  buildCity("Tramandaí", "RS", [
    {
      type: "praias",
      label: "Praias",
      subLocations: [
        { name: "Praia Central", district: "Centro", description: "Praia principal com calçadão e infraestrutura.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Calçadão", "Infraestrutura", "Central"] },
        { name: "Praia de Imbé", district: "Norte", description: "Praia vizinha com opções de lazer e gastronomia.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Lazer", "Gastronomia", "Vizinha"] },
        { name: "Praia Jardim do Éden", district: "Sul", description: "Praia reservada e tranquila para relaxar.", image: "https://images.unsplash.com/photo-1501426026826-31c667bdf23d?w=600&q=80", highlights: ["Reservada", "Tranquila", "Relaxamento"] },
      ],
    },
  ]),

  // ========== GUARATUBA - PR ==========
  buildCity("Guaratuba", "PR", [
    {
      type: "praias",
      label: "Praias",
      subLocations: [
        { name: "Praia Central", district: "Centro", description: "Praia urbana com infraestrutura completa.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Urbana", "Infraestrutura", "Acessível"] },
        { name: "Praia de Caieiras", district: "Norte", description: "Praia com vista para a baía e águas calmas.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Baía", "Águas calmas", "Vista"] },
        { name: "Praia Brejatuba", district: "Sul", description: "Praia extensa e tranquila, ideal para caminhadas.", image: "https://images.unsplash.com/photo-1473116763249-2faaef81ccda?w=600&q=80", highlights: ["Extensa", "Caminhadas", "Tranquilidade"] },
      ],
    },
  ]),

  // ========== MATINHOS - PR ==========
  buildCity("Matinhos", "PR", [
    {
      type: "praias",
      label: "Praias",
      subLocations: [
        { name: "Praia Central", district: "Centro", description: "Praia movimentada com calçadão e comércio.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Calçadão", "Comércio", "Movimentada"] },
        { name: "Praia Mansa", district: "Norte", description: "Praia com águas calmas, ideal para banho em família.", image: "https://images.unsplash.com/photo-1519046904884-53103b34b206?w=600&q=80", highlights: ["Águas calmas", "Família", "Banho"] },
        { name: "Praia Brava", district: "Sul", description: "Praia com ondas fortes cercada por morros.", image: "https://images.unsplash.com/photo-1502680390548-bdbac40b3e43?w=600&q=80", highlights: ["Ondas", "Morros", "Mata Atlântica"] },
        { name: "Caiobá", district: "Sul", description: "Balneário famoso com Morro do Boi e praia agitada.", image: "https://images.unsplash.com/photo-1471922694854-ff1b63b20054?w=600&q=80", highlights: ["Morro do Boi", "Agitada", "Mirante"] },
      ],
    },
  ]),

  // ========== ILHA DO MEL - PR ==========
  buildCity("Ilha do Mel", "PR", [
    {
      type: "praias",
      label: "Praias",
      subLocations: [
        { name: "Praia de Encantadas", district: "Sul", description: "Vila principal com comércio, pousadas e acesso por barco.", image: "https://images.unsplash.com/photo-1507525428034-b723cf961d3e?w=600&q=80", highlights: ["Vila", "Pousadas", "Acesso por barco"] },
        { name: "Praia de Fora", district: "Leste", description: "Praia deserta com ondas e natureza intocada.", image: "https://images.unsplash.com/photo-1505228395891-9a51e7e86bf6?w=600&q=80", highlights: ["Deserta", "Natureza", "Ondas"] },
        { name: "Praia do Farol", district: "Norte", description: "Praia com o histórico Farol das Conchas e trilhas.", image: "https://images.unsplash.com/photo-1520942702018-0862200e6873?w=600&q=80", highlights: ["Farol", "Trilhas", "História"] },
        { name: "Praia da Fortaleza", district: "Norte", description: "Praia junto à Fortaleza de Nossa Senhora dos Prazeres.", image: "https://images.unsplash.com/photo-1510414842594-a61c69b5ae57?w=600&q=80", highlights: ["Fortaleza", "História", "Vista"] },
      ],
    },
  ]),

  // ========== JOINVILLE - SC ==========
  buildCity("Joinville", "SC", [
    {
      type: "bairros",
      label: "Bairros Turísticos",
      subLocations: [
        { name: "Centro", district: "Centro", description: "Rua das Palmeiras, Museu Nacional de Imigração e Estação da Memória.", image: "https://images.unsplash.com/photo-1558618666-fcd25c85cd64?w=600&q=80", highlights: ["Rua das Palmeiras", "Museus", "Cultura"] },
        { name: "Distrito Industrial", district: "Norte", description: "Região da maior Festa das Flores e da tradição industrial.", image: "https://images.unsplash.com/photo-1513364776144-60967b0f800f?w=600&q=80", highlights: ["Festa das Flores", "Indústria", "Turismo"] },
        { name: "Vila da Glória", district: "Sul", description: "Região histórica com casarões coloniais alemães preservados.", image: "https://images.unsplash.com/photo-1506905925346-21bda4d32df4?w=600&q=80", highlights: ["Casarões", "Alemão", "História"] },
      ],
    },
  ]),
];

export function getCitySubLocations(cityName: string, stateAbbr: string): CitySubLocations | undefined {
  return citySubLocations.find(
    c => c.cityName === cityName && c.stateAbbr === stateAbbr
  );
}
