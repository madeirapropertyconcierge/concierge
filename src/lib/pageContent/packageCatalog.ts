export const servicePackageKeys = [
  'essentialCare',
  'managedCare',
  'premiumCare',
  'revenueHosting',
  'onDemand',
  'addOns',
] as const;

export type SiteLocale = 'en' | 'pt';
export type ServicePackageKey = (typeof servicePackageKeys)[number];

export interface LocalizedText {
  en: string;
  pt: string;
}

export interface LocalizedTextList {
  en: string[];
  pt: string[];
}

export interface LocalizedPackagePrice {
  headline: LocalizedText;
  detail: LocalizedText;
}

export interface CmsServicePackageEntry {
  key: ServicePackageKey;
  tierLabel: LocalizedText;
  title: LocalizedText;
  price: LocalizedPackagePrice | null;
  audience: LocalizedText;
  features: LocalizedTextList;
  idealFor: LocalizedText;
  servicesBullets: LocalizedTextList;
  homeBlurb: LocalizedText;
}

export interface CmsServicePackageDocument {
  updatedAt: string;
  packages: CmsServicePackageEntry[];
}

export const defaultServicePackageDocument: CmsServicePackageDocument = {
  updatedAt: '2026-04-03T00:00:00.000Z',
  packages: [
    {
      key: 'essentialCare',
      tierLabel: {
        en: 'Property Care',
        pt: 'Cuidado do Imovel',
      },
      title: {
        en: 'Essential Care Package',
        pt: 'Pacote de Cuidados Essenciais',
      },
      price: {
        headline: {
          en: '€95/month',
          pt: 'EUR95/mes',
        },
        detail: {
          en: '',
          pt: '',
        },
      },
      audience: {
        en: 'Designed for overseas owners who want peace of mind knowing their property is being checked and maintained in their absence.',
        pt: 'Pensado para proprietarios no estrangeiro que querem tranquilidade, sabendo que a sua propriedade esta a ser verificada e mantida na sua ausencia.',
      },
      features: {
        en: [
          'Secure key holding',
          'Monthly interior and exterior property inspection',
          'Ventilation and water run-through to prevent issues',
          'Visual checks for leaks, damp, pests, or weather damage',
          'Monthly storm and adverse weather checks',
          'Photo report sent after each visit',
          'Emergency contact and coordination if an issue arises',
          'Coordination with trusted local trades and service providers',
        ],
        pt: [
          'Guarda segura de chaves',
          'Inspecao mensal ao interior e exterior da propriedade',
          'Ventilacao e circulacao de agua para prevenir problemas',
          'Verificacoes visuais de fugas, humidade, pragas ou danos causados pelo tempo',
          'Verificacoes mensais em caso de tempestade e mau tempo',
          'Relatorio fotografico enviado apos cada visita',
          'Contacto de emergencia e coordenacao caso surja algum problema',
          'Coordenacao com profissionais e prestadores de servicos locais de confianca',
        ],
      },
      idealFor: {
        en: 'Homes that are vacant for extended periods and owners visiting once or twice per year.',
        pt: 'Casas que ficam vazias durante longos periodos e cujos proprietarios visitam uma ou duas vezes por ano.',
      },
      servicesBullets: {
        en: [
          'Secure key holding plus monthly interior and exterior inspections',
          'Ventilation, water run-throughs, and visual checks for damp, leaks, pests, or weather damage',
          'Storm readiness, photo reporting, and coordination with trusted local trades when issues arise',
        ],
        pt: [
          'Guarda de chaves e inspecoes mensais ao interior e exterior',
          'Ventilacao, circulacao de agua e verificacoes visuais de humidade, fugas, pragas ou danos do tempo',
          'Preparacao para tempestades, relatorios fotograficos e coordenacao com fornecedores locais de confianca',
        ],
      },
      homeBlurb: {
        en: 'Secure key holding, monthly inspections, storm checks, and photo reports for vacant homes.',
        pt: 'Guarda de chaves, inspecoes mensais, verificacoes de tempestade e relatorios fotograficos para casas vazias.',
      },
    },
    {
      key: 'managedCare',
      tierLabel: {
        en: 'Guest Turnovers',
        pt: 'Operacao de Hospedes',
      },
      title: {
        en: 'Managed Care Package',
        pt: 'Pacote de Gestao Assistida',
      },
      price: {
        headline: {
          en: '€95/month',
          pt: 'EUR95/mes',
        },
        detail: {
          en: '+ €80 per turnover support',
          pt: '+ EUR80 por suporte de turnover',
        },
      },
      audience: {
        en: 'Our most popular option, offering local coordination for owners living abroad with families and occasional visitors.',
        pt: 'A nossa opcao mais popular, oferecendo coordenacao local para proprietarios que vivem no estrangeiro, com familia e visitantes ocasionais.',
      },
      features: {
        en: [
          'Includes everything in the Essential Care package',
          'Water, gas, and electricity switched on before guest arrival',
          'Water, gas, and electricity switched off after guest departure',
          'Rubbish removal after guest departure',
          'Key handover for arriving guests',
          'Detailed updates and photo reporting',
          'Optional house cleaning and guest-ready prep from €80',
          'Terrace sweeping from €20',
          'Utility management for water, gas, electricity, and Wi-Fi',
        ],
        pt: [
          'Inclui tudo no Pacote de Cuidados Essenciais',
          'Ligar agua, gas e eletricidade antes da chegada dos hospedes',
          'Desligar agua, gas e eletricidade depois da saida dos hospedes',
          'Retirar o lixo apos a saida dos hospedes',
          'Entrega de chaves na chegada dos hospedes',
          'Atualizacoes detalhadas e relatorios fotograficos',
          'Limpeza da casa e preparacao para chegada desde EUR80',
          'Varredura de terracos desde EUR20',
          'Gestao de utilidades: agua, gas, eletricidade e Wi-Fi',
        ],
      },
      idealFor: {
        en: 'Second-home owners and families with occasional visitors.',
        pt: 'Proprietarios de segunda habitacao e familias com visitantes ocasionais.',
      },
      servicesBullets: {
        en: [
          'Builds on Essential Care with guest arrival and departure coordination',
          'Utilities on and off, rubbish removal, key handovers, and detailed photo updates',
          'Optional cleaning, terrace sweeping, and utility management for hosted stays',
        ],
        pt: [
          'Assenta na base dos Cuidados Essenciais com coordenacao de chegadas e saidas',
          'Utilidades ligadas e desligadas, lixo tratado, entrega de chaves e atualizacoes fotograficas',
          'Limpeza opcional, varredura de terracos e gestao de utilidades para estadias com hospedes',
        ],
      },
      homeBlurb: {
        en: 'Arrival and departure coordination, key handovers, utilities, and guest-ready home prep.',
        pt: 'Coordenacao de chegadas e saidas, entrega de chaves, utilidades e preparacao da casa para hospedes.',
      },
    },
    {
      key: 'premiumCare',
      tierLabel: {
        en: 'Proactive Oversight',
        pt: 'Supervisao Proativa',
      },
      title: {
        en: 'Premium Care Package',
        pt: 'Pacote de Cuidados Premium',
      },
      price: {
        headline: {
          en: '€140/month',
          pt: 'EUR140/mes',
        },
        detail: {
          en: '',
          pt: '',
        },
      },
      audience: {
        en: 'A higher-touch service for owners who want more frequent oversight and faster response times. We spot small issues early so they do not become bigger, more expensive problems.',
        pt: 'Um servico mais proximo para proprietarios que querem mais frequencia de supervisao e tempos de resposta mais rapidos. Detetamos pequenos problemas cedo para evitar situacoes maiores e mais dispendiosas.',
      },
      features: {
        en: [
          'Includes Essential Care coverage, plus:',
          'Two property visits per month with interior and exterior checks',
          'Priority response for urgent issues',
          'Minor troubleshooting and minor fixes during visits',
          'Coordination of routine maintenance such as gardeners, cleaners, and basic upkeep',
          'Enhanced photo reporting and updates',
          'Seasonal readiness checks before or after winter, storms, or long vacancy periods',
        ],
        pt: [
          'Inclui a cobertura dos Cuidados Essenciais, mais:',
          'Duas visitas por mes com verificacoes interiores e exteriores',
          'Resposta prioritaria para situacoes urgentes',
          'Pequeno troubleshooting e pequenas correcoes durante as visitas',
          'Coordenacao de manutencao de rotina com jardineiros, limpezas e pequenas tarefas',
          'Relatorios fotograficos e atualizacoes mais detalhados',
          'Verificacoes sazonais antes ou depois do inverno, tempestades ou longos periodos sem ocupacao',
        ],
      },
      idealFor: {
        en: 'Homeowners who want a more proactive, hands-on approach, especially for higher-value homes or long vacancy periods.',
        pt: 'Proprietarios que querem uma abordagem mais proativa e acompanhada, especialmente em casas de maior valor ou com longos periodos de vacancia.',
      },
      servicesBullets: {
        en: [
          'Two property visits per month with enhanced oversight inside and outside the home',
          'Priority handling for urgent issues plus minor troubleshooting during visits',
          'Routine maintenance coordination, enhanced reporting, and seasonal readiness checks',
        ],
        pt: [
          'Duas visitas por mes com supervisao reforcada dentro e fora da propriedade',
          'Tratamento prioritario de situacoes urgentes e pequenas correcoes durante as visitas',
          'Coordenacao de manutencao, reporting reforcado e verificacoes sazonais de prontidao',
        ],
      },
      homeBlurb: {
        en: 'Higher-frequency checks, priority issue handling, and proactive maintenance coordination.',
        pt: 'Mais frequencia de verificacoes, prioridade em incidentes e coordenacao proativa da manutencao.',
      },
    },
    {
      key: 'revenueHosting',
      tierLabel: {
        en: 'Revenue Management',
        pt: 'Receita e Hosting',
      },
      title: {
        en: 'Revenue & Hosting Package',
        pt: 'Pacote de Revenue & Hosting',
      },
      price: {
        headline: {
          en: '€95/month',
          pt: 'EUR95/mes',
        },
        detail: {
          en: '+ 25% of gross rental revenue',
          pt: '+ 25% da receita bruta',
        },
      },
      audience: {
        en: 'A fully managed white-glove service for international owners who want revenue without day-to-day involvement. We handle listings, guest communication, and on-the-ground coordination end to end.',
        pt: 'Um servico white-glove totalmente gerido para proprietarios internacionais que querem gerar receita sem envolvimento diario. Gerimos anuncios, comunicacao com hospedes e coordenacao local de ponta a ponta.',
      },
      features: {
        en: [
          'Includes Managed Care coordination, plus:',
          'Multi-platform listing management across Airbnb, Booking.com, and similar channels',
          'Listing optimisation for copy, user experience, and conversion',
          'Revenue optimisation and dynamic pricing strategy',
          'Guest messaging',
          'Booking management',
          'Performance tracking and monthly reporting',
          'AL licensing and Portuguese compliance support at €35/hour when needed',
          'Multi-platform listing setup: €300 per platform, €500 for Airbnb + Booking.com, €700 for Airbnb + Booking.com + Vrbo',
        ],
        pt: [
          'Inclui a coordenacao da Gestao Assistida, mais:',
          'Gestao de anuncios em varias plataformas como Airbnb, Booking.com e semelhantes',
          'Otimizacao do anuncio ao nivel de copy, experiencia e conversao',
          'Otimizacao de receita e estrategia de precos dinamicos',
          'Mensagens com hospedes',
          'Gestao de reservas',
          'Acompanhamento de desempenho e relatorio mensal',
          'Apoio no licenciamento AL e conformidade portuguesa a EUR35/hora quando necessario',
          'Setup multi-plataforma: EUR300 por plataforma, EUR500 para Airbnb + Booking.com, EUR700 para Airbnb + Booking.com + Vrbo',
        ],
      },
      idealFor: {
        en: 'High-value properties, frequent visitors, or owners who want a hands-off setup focused on occupancy, nightly rate, and annual return.',
        pt: 'Propriedades de maior valor, visitantes frequentes ou proprietarios que querem uma operacao sem intervencao direta, focada em ocupacao, nightly rate e retorno anual.',
      },
      servicesBullets: {
        en: [
          'Managed Care coordination plus multi-platform listings, guest messaging, and booking management',
          'Listing optimisation, dynamic pricing, and monthly performance reporting',
          'Optional AL licensing support and setup for Airbnb, Booking.com, and Vrbo',
        ],
        pt: [
          'Coordenacao da Gestao Assistida mais anuncios multi-plataforma, mensagens e gestao de reservas',
          'Otimizacao de anuncios, precos dinamicos e relatorio mensal de desempenho',
          'Apoio opcional em licenciamento AL e setups para Airbnb, Booking.com e Vrbo',
        ],
      },
      homeBlurb: {
        en: 'Listings, dynamic pricing, guest messaging, booking management, and monthly performance reporting.',
        pt: 'Anuncios, precos dinamicos, mensagens com hospedes, reservas e relatorio mensal de desempenho.',
      },
    },
    {
      key: 'onDemand',
      tierLabel: {
        en: 'Flexible Support',
        pt: 'Apoio Flexivel',
      },
      title: {
        en: 'On-Demand Services',
        pt: 'Servicos Sob Pedido',
      },
      price: {
        headline: {
          en: '€35/hour',
          pt: 'EUR35/hora',
        },
        detail: {
          en: '',
          pt: '',
        },
      },
      audience: {
        en: 'Flexible, on-demand support for situations that require a trusted person on the ground.',
        pt: 'Apoio flexivel e sob pedido para situacoes que exigem uma pessoa de confianca no terreno.',
      },
      features: {
        en: [
          'Emergency call-outs',
          'Additional property visits',
          'Storm checks outside package cover',
          'Waiting for repairs, inspections, or deliveries',
          'Renovation or vendor project coordination',
          'Inventory and condition checks',
          'Furniture or appliance deliveries',
          'Local errands and administrative support',
          'Utility setup for water, gas, electricity, or Wi-Fi at €60 per utility',
          'Ongoing utility management',
          'Assistance navigating local services and bureaucracy',
          'Coordination of licensed tour guides for guests',
          'Interior styling and professional listing photography',
          'Guest welcome preparation from €80',
          'Key handover coordination at €35',
          'Custom monthly retainers are available for ongoing support',
        ],
        pt: [
          'Chamadas de emergencia',
          'Visitas adicionais a propriedade',
          'Verificacoes de tempestade fora da cobertura do pacote',
          'Esperar por reparacoes, inspecoes ou entregas',
          'Coordenacao de renovacao ou projetos com fornecedores',
          'Inventario e verificacoes de estado',
          'Entregas de mobiliario ou eletrodomesticos',
          'Tarefas locais e apoio administrativo',
          'Setup de utilidades de agua, gas, eletricidade ou Wi-Fi a EUR60 por utilidade',
          'Gestao continua de utilidades',
          'Apoio na navegacao de servicos locais e burocracia',
          'Coordenacao de guias turisticos licenciados para hospedes',
          'Styling interior e fotografia profissional',
          'Preparacao de boas-vindas para hospedes desde EUR80',
          'Coordenacao de entrega de chaves a EUR35',
          'Retainers mensais personalizados disponiveis para apoio continuo',
        ],
      },
      idealFor: {
        en: 'Homeowners who do not want a monthly service fee but still need a trusted local bilingual EN/PT person on the ground.',
        pt: 'Proprietarios que nao querem assumir um fee mensal mas precisam de uma pessoa local bilingue EN/PT de confianca no terreno.',
      },
      servicesBullets: {
        en: [
          'Emergency support, extra property visits, storm checks, and waiting time for repairs or deliveries',
          'Inventories, errands, furniture deliveries, utility setup, and local admin support',
          'Guest prep, key handovers, styling, photography, and ongoing retained support when needed',
        ],
        pt: [
          'Suporte de emergencia, visitas extra, verificacoes de tempestade e espera por reparacoes ou entregas',
          'Inventarios, recados, entregas, setup de utilidades e apoio administrativo local',
          'Preparacao para hospedes, entrega de chaves, styling, fotografia e apoio continuado quando necessario',
        ],
      },
      homeBlurb: {
        en: 'Emergency support, extra visits, vendor waiting time, errands, and local coordination without a monthly retainer.',
        pt: 'Suporte de emergencia, visitas extra, espera por fornecedores, recados e coordenacao local sem fee mensal.',
      },
    },
    {
      key: 'addOns',
      tierLabel: {
        en: 'Project Extras',
        pt: 'Projetos Complementares',
      },
      title: {
        en: 'Optional Add-Ons',
        pt: 'Add-Ons Opcionais',
      },
      price: null,
      audience: {
        en: 'Additional support available as needed.',
        pt: 'Apoio adicional disponivel quando necessario.',
      },
      features: {
        en: [
          'Professional photography',
          'Interior styling and staging',
          'Smart lock installation',
          'Guest welcome packs',
          'Linen and hotel-quality upgrades',
        ],
        pt: [
          'Fotografia profissional',
          'Styling interior e staging',
          'Instalacao de smart lock',
          'Welcome packs para hospedes',
          'Upgrade de lencois e padrao hoteleiro',
        ],
      },
      idealFor: {
        en: '',
        pt: '',
      },
      servicesBullets: {
        en: [],
        pt: [],
      },
      homeBlurb: {
        en: 'Photography, styling, smart locks, welcome packs, and finishing upgrades for better guest presentation.',
        pt: 'Fotografia, styling, smart locks, welcome packs e upgrades para elevar a apresentacao ao hospede.',
      },
    },
  ],
};
