import type { Locale } from '../i18n/utils';
import type { RouteKey } from '../i18n/routes';
import { pexelsMadeiraImages } from './pexelsImages';

export interface HomeTrustSignal {
  value: string;
  label: string;
}

export interface HomeServiceTile {
  title: string;
  blurb: string;
  image: string;
  alt: string;
  hrefKey: RouteKey;
  span: string;
}

export interface HomeStep {
  step: string;
  title: string;
  detail: string;
}

export interface HomePageContent {
  metaDescription: string;
  heroBackgroundAlt: string;
  finalBackgroundAlt: string;
  heroBadge: string;
  heroTitle: string;
  heroSubtitle: string;
  primaryCta: string;
  secondaryCta: string;
  mediaCards: [
    { image: string; alt: string; caption: string },
    { image: string; alt: string; caption: string },
    { image: string; alt: string; caption: string },
  ];
  trustSignals: HomeTrustSignal[];
  architectureEyebrow: string;
  architectureTitle: string;
  architectureLink: string;
  serviceTiles: HomeServiceTile[];
  processEyebrow: string;
  processTitle: string;
  processLink: string;
  steps: HomeStep[];
  finalEyebrow: string;
  finalTitle: string;
  finalSubtitle: string;
  finalPrimaryCta: string;
  finalSecondaryCta: string;
}

export const homepageContent: Record<Locale, HomePageContent> = {
  en: {
    metaDescription: 'Boutique hosting and property care in Madeira for overseas owners who want peace of mind.',
    heroBackgroundAlt: 'Madeira coastal village with terraced vineyards',
    finalBackgroundAlt: 'Aerial sunset over Madeira coastline',
    heroBadge: 'Madeira Property Concierge',
    heroTitle: 'Boutique Hosting + Property Care. True Peace of Mind.',
    heroSubtitle:
      'Founder-led property management in Madeira for overseas owners. Bilingual EN/PT support, clear reporting, and local execution you can trust.',
    primaryCta: 'Book Diagnostic Call',
    secondaryCta: 'See Service Tiers',
    mediaCards: [
      {
        image: pexelsMadeiraImages.pontaHikers.src,
        alt: 'Hikers on the Ponta de Sao Lourenco trail',
        caption: 'Property Care & Preventative Checks',
      },
      {
        image: pexelsMadeiraImages.saoVicenteCoast.src,
        alt: 'Atlantic waves near Sao Vicente in Madeira',
        caption: 'Guest Experience & Concierge',
      },
      {
        image: pexelsMadeiraImages.villageAerialShadow.src,
        alt: 'Aerial view of a village in Madeira mountains',
        caption: 'West Coast Expansion Coverage',
      },
    ],
    trustSignals: [
      { value: 'EN/PT', label: 'Bilingual, born Canadian-Madeiran' },
      { value: '4h', label: 'Owner response target' },
      { value: '56-point', label: 'Turnover quality checklist' },
    ],
    architectureEyebrow: 'Built For Overseas Owners',
    architectureTitle: 'Small on purpose. One owner, one point of contact, full accountability.',
    architectureLink: 'How We Operate',
    serviceTiles: [
      {
        title: 'Keyholding + Home Care',
        blurb: 'Scheduled visits, humidity/leak checks, storm readiness, and photo reports.',
        image: pexelsMadeiraImages.treeFramedValleyTown.src,
        alt: 'Madeira valley town framed by pine trees',
        hrefKey: 'services',
        span: 'lg:col-span-5',
      },
      {
        title: 'Hosting Essentials',
        blurb: 'Guest messaging, check-ins, turnovers, restocking, and escalation handling.',
        image: pexelsMadeiraImages.tobogganRideFunchal.src,
        alt: 'Traditional toboggan ride in Funchal',
        hrefKey: 'pricing',
        span: 'lg:col-span-7',
      },
      {
        title: 'Full-Service AL Management',
        blurb: 'Listings, pricing, maintenance coordination, and AL/SIBA compliance support.',
        image: pexelsMadeiraImages.mercadoMural.src,
        alt: 'Mercado dos Lavradores mural in Funchal',
        hrefKey: 'guide',
        span: 'lg:col-span-4',
      },
      {
        title: 'Premium White-Glove (Phase 2)',
        blurb: 'Welcome packs, family-friendly concierge, and local experiences with vetted partners.',
        image: pexelsMadeiraImages.villageRuggedMountains.src,
        alt: 'Madeira village between rugged mountains',
        hrefKey: 'howItWorks',
        span: 'lg:col-span-4',
      },
      {
        title: 'Founder-Led Accountability',
        blurb: 'One WhatsApp line, monthly owner reporting, and no-surprise invoices.',
        image: pexelsMadeiraImages.oceanfrontBench.src,
        alt: 'People overlooking the Madeira oceanfront',
        hrefKey: 'about',
        span: 'lg:col-span-4',
      },
    ],
    processEyebrow: 'Owner Journey',
    processTitle: 'Clear onboarding. Predictable operations.',
    processLink: 'View The Process',
    steps: [
      {
        step: '01',
        title: 'Discovery Call',
        detail:
          'A 30-minute call to map goals, rental model, and property-care priorities.',
      },
      {
        step: '02',
        title: 'Property & Risk Audit',
        detail:
          'On-site assessment of condition, compliance gaps, vendor needs, and launch readiness.',
      },
      {
        step: '03',
        title: 'Launch & Management',
        detail:
          'We run day-to-day operations with monthly reports, maintenance logs, and SLA-driven support.',
      },
    ],
    finalEyebrow: 'Ready To Talk?',
    finalTitle: 'Own property in Madeira but live abroad? We handle it locally, you stay in the loop.',
    finalSubtitle:
      'Start with a 30-minute diagnostic call. We\'ll map out what your property needs for care, hosting, or compliance.',
    finalPrimaryCta: 'Book Consultation',
    finalSecondaryCta: 'View Pricing',
  },
  pt: {
    metaDescription: 'Hosting boutique e cuidado de propriedade na Madeira para proprietários no estrangeiro que querem tranquilidade.',
    heroBackgroundAlt: 'Aldeia costeira da Madeira com vinhas em socalcos',
    finalBackgroundAlt: 'Pôr do sol aéreo sobre a costa da Madeira',
    heroBadge: 'Madeira Property Concierge',
    heroTitle: 'Hosting Boutique + Cuidado de Propriedade. Tranquilidade Real.',
    heroSubtitle:
      'Gestão de propriedade na Madeira, liderada pela fundadora, para proprietários no estrangeiro. Suporte bilingue EN/PT, reporting claro e execução local de confiança.',
    primaryCta: 'Marcar Chamada de Diagnóstico',
    secondaryCta: 'Ver Níveis de Serviço',
    mediaCards: [
      {
        image: pexelsMadeiraImages.pontaHikers.src,
        alt: 'Caminhantes no trilho da Ponta de Sao Lourenco',
        caption: 'Cuidado de Propriedade & Verificações Preventivas',
      },
      {
        image: pexelsMadeiraImages.saoVicenteCoast.src,
        alt: 'Ondas do Atlântico junto a Sao Vicente',
        caption: 'Experiência de Hóspede & Concierge',
      },
      {
        image: pexelsMadeiraImages.villageAerialShadow.src,
        alt: 'Vista aérea de uma aldeia nas montanhas da Madeira',
        caption: 'Cobertura em Expansão na Costa Oeste',
      },
    ],
    trustSignals: [
      { value: 'EN/PT', label: 'Bilingue, nascida canadiana-madeirense' },
      { value: '4h', label: 'Objetivo de resposta ao proprietário' },
      { value: '56 pontos', label: 'Checklist de qualidade no turnover' },
    ],
    architectureEyebrow: 'Feito Para Proprietários no Estrangeiro',
    architectureTitle: 'Pequenos de propósito. Uma responsável, um ponto de contacto, total responsabilidade.',
    architectureLink: 'Como Operamos',
    serviceTiles: [
      {
        title: 'Guarda de Chaves + Home Care',
        blurb: 'Visitas programadas, verificações de humidade/fugas, preparação para tempestades e fotos.',
        image: pexelsMadeiraImages.treeFramedValleyTown.src,
        alt: 'Aldeia madeirense enquadrada por pinheiros',
        hrefKey: 'services',
        span: 'lg:col-span-5',
      },
      {
        title: 'Hosting Essentials',
        blurb: 'Mensagens de hóspedes, check-ins, turnovers, reposição e gestão de incidentes.',
        image: pexelsMadeiraImages.tobogganRideFunchal.src,
        alt: 'Carros de cesto tradicionais no Funchal',
        hrefKey: 'pricing',
        span: 'lg:col-span-7',
      },
      {
        title: 'Gestão AL Full-Service',
        blurb: 'Anúncios, pricing, coordenação de manutenção e apoio de conformidade AL/SIBA.',
        image: pexelsMadeiraImages.mercadoMural.src,
        alt: 'Mural do Mercado dos Lavradores no Funchal',
        hrefKey: 'guide',
        span: 'lg:col-span-4',
      },
      {
        title: 'Premium White-Glove (Fase 2)',
        blurb: 'Welcome packs, concierge familiar e experiências locais com parceiros validados.',
        image: pexelsMadeiraImages.villageRuggedMountains.src,
        alt: 'Aldeia da Madeira entre montanhas escarpadas',
        hrefKey: 'howItWorks',
        span: 'lg:col-span-4',
      },
      {
        title: 'Responsabilidade Direta da Fundadora',
        blurb: 'Um número WhatsApp, relatório mensal ao proprietário e zero surpresas em faturas.',
        image: pexelsMadeiraImages.oceanfrontBench.src,
        alt: 'Pessoas a observar o oceano na Madeira',
        hrefKey: 'about',
        span: 'lg:col-span-4',
      },
    ],
    processEyebrow: 'Jornada do Proprietário',
    processTitle: 'Integração clara. Operação previsível.',
    processLink: 'Ver O Processo',
    steps: [
      {
        step: '01',
        title: 'Chamada de Descoberta',
        detail:
          'Chamada de 30 minutos para mapear objetivos, modelo de arrendamento e prioridades de cuidado.',
      },
      {
        step: '02',
        title: 'Auditoria de Imóvel e Risco',
        detail:
          'Avaliação no local de estado, lacunas de conformidade, necessidades de fornecedores e prontidão.',
      },
      {
        step: '03',
        title: 'Lançamento e Gestão',
        detail:
          'Executamos a operação diária com relatórios mensais, registo de manutenção e suporte por SLA.',
      },
    ],
    finalEyebrow: 'Pronto Para Falar?',
    finalTitle: 'Tem imóvel na Madeira mas vive fora? Nós tratamos localmente, você acompanha tudo.',
    finalSubtitle:
      'Comece com uma chamada de diagnóstico de 30 minutos. Mapeamos o que o seu imóvel precisa em cuidado, hosting ou conformidade.',
    finalPrimaryCta: 'Marcar Consulta',
    finalSecondaryCta: 'Ver Preços',
  },
};
