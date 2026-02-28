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
    metaDescription: 'A premium, image-led concierge experience for Madeira property owners.',
    heroBackgroundAlt: 'Madeira coastal village with terraced vineyards',
    finalBackgroundAlt: 'Aerial sunset over Madeira coastline',
    heroBadge: 'Madeira Property Concierge',
    heroTitle: 'Own The View. We Handle Every Detail.',
    heroSubtitle:
      'High-touch property operations for international owners who expect precision, reliability, and elegant execution on Madeira.',
    primaryCta: 'Book Private Consultation',
    secondaryCta: 'Explore Services',
    mediaCards: [
      {
        image: pexelsMadeiraImages.pontaHikers.src,
        alt: 'Hikers on the Ponta de Sao Lourenco trail',
        caption: 'Coastal Monitoring & Guest Experience',
      },
      {
        image: pexelsMadeiraImages.saoVicenteCoast.src,
        alt: 'Atlantic waves near Sao Vicente in Madeira',
        caption: 'West Coast Properties',
      },
      {
        image: pexelsMadeiraImages.villageAerialShadow.src,
        alt: 'Aerial village nestled in Madeira mountains',
        caption: 'Rural & Hillside Homes',
      },
    ],
    trustSignals: [
      { value: '24h', label: 'Issue response target' },
      { value: 'EN/PT', label: 'Bilingual owner support' },
      { value: '5-Star', label: 'Client-rated execution' },
    ],
    architectureEyebrow: 'Service Architecture',
    architectureTitle: 'Visual-first operations, tailored by ownership style.',
    architectureLink: 'How Our Process Works',
    serviceTiles: [
      {
        title: 'Asset Stewardship',
        blurb: 'Weekly checks, maintenance orchestration, owner reporting.',
        image: pexelsMadeiraImages.treeFramedValleyTown.src,
        alt: 'Madeira valley town framed by pine trees',
        hrefKey: 'services',
        span: 'lg:col-span-5',
      },
      {
        title: 'Short-Stay Operations',
        blurb: 'Turnovers, guest care, dynamic pricing, reputation care.',
        image: pexelsMadeiraImages.tobogganRideFunchal.src,
        alt: 'Traditional toboggan ride in Funchal',
        hrefKey: 'pricing',
        span: 'lg:col-span-7',
      },
      {
        title: 'AL Licensing & Setup',
        blurb: 'Compliance path, contractor coordination, launch readiness.',
        image: pexelsMadeiraImages.mercadoMural.src,
        alt: 'Mercado dos Lavradores mural in Funchal',
        hrefKey: 'guide',
        span: 'lg:col-span-4',
      },
      {
        title: 'Acquisition to Activation',
        blurb: 'For new owners who want a fully operational property fast.',
        image: pexelsMadeiraImages.villageRuggedMountains.src,
        alt: 'Madeira village between rugged mountains',
        hrefKey: 'howItWorks',
        span: 'lg:col-span-4',
      },
      {
        title: 'Founder-Led Oversight',
        blurb: 'Direct accountability and a single point of contact.',
        image: pexelsMadeiraImages.oceanfrontBench.src,
        alt: 'People overlooking the Madeira oceanfront',
        hrefKey: 'about',
        span: 'lg:col-span-4',
      },
    ],
    processEyebrow: 'Concierge Flow',
    processTitle: 'Fast to onboard. Easy to trust.',
    processLink: 'Start Your Onboarding',
    steps: [
      {
        step: '01',
        title: 'Quick Diagnostic',
        detail:
          'A 30-minute consultation to map your property goals, risk points, and operating model.',
      },
      {
        step: '02',
        title: 'Precision Plan',
        detail:
          'You receive a tailored management blueprint with service scope, timelines, and priorities.',
      },
      {
        step: '03',
        title: 'Local Execution',
        detail:
          'We run the full operation on-island while you track outcomes through concise updates.',
      },
    ],
    finalEyebrow: 'Ready To Delegate With Confidence',
    finalTitle: 'Give your Madeira property a local team with premium standards.',
    finalSubtitle:
      'Book a private call and receive a practical roadmap for operations, guest quality, and long-term asset value.',
    finalPrimaryCta: 'Book Consultation',
    finalSecondaryCta: 'View Pricing',
  },
  pt: {
    metaDescription: 'Uma experiência premium e visual para proprietários na Madeira.',
    heroBackgroundAlt: 'Aldeia costeira da Madeira com vinhas em socalcos',
    finalBackgroundAlt: 'Pôr do sol aéreo sobre a costa da Madeira',
    heroBadge: 'Madeira Property Concierge',
    heroTitle: 'Desfrute da vista. Nós tratamos de tudo.',
    heroSubtitle:
      'Operação imobiliária premium para proprietários internacionais que exigem precisão, confiança e execução elegante na Madeira.',
    primaryCta: 'Marcar Consulta Privada',
    secondaryCta: 'Explorar Serviços',
    mediaCards: [
      {
        image: pexelsMadeiraImages.pontaHikers.src,
        alt: 'Caminhantes no trilho da Ponta de Sao Lourenco',
        caption: 'Monitorização Costeira & Experiência do Hóspede',
      },
      {
        image: pexelsMadeiraImages.saoVicenteCoast.src,
        alt: 'Ondas do Atlântico junto a Sao Vicente',
        caption: 'Propriedades na Costa Oeste',
      },
      {
        image: pexelsMadeiraImages.villageAerialShadow.src,
        alt: 'Aldeia encaixada nas montanhas da Madeira',
        caption: 'Casas Rurais & de Encosta',
      },
    ],
    trustSignals: [
      { value: '24h', label: 'Resposta alvo a incidentes' },
      { value: 'EN/PT', label: 'Suporte bilingue ao proprietário' },
      { value: '5 Estrelas', label: 'Execução avaliada por clientes' },
    ],
    architectureEyebrow: 'Arquitetura de Serviço',
    architectureTitle: 'Operação visual-first, ajustada ao seu perfil de propriedade.',
    architectureLink: 'Como Funciona o Processo',
    serviceTiles: [
      {
        title: 'Gestão de Ativo',
        blurb: 'Vistorias semanais, coordenação de manutenção e relatórios ao proprietário.',
        image: pexelsMadeiraImages.treeFramedValleyTown.src,
        alt: 'Aldeia madeirense enquadrada por pinheiros',
        hrefKey: 'services',
        span: 'lg:col-span-5',
      },
      {
        title: 'Operação Alojamento',
        blurb: 'Turnovers, apoio ao hóspede, preços dinâmicos e reputação online.',
        image: pexelsMadeiraImages.tobogganRideFunchal.src,
        alt: 'Carros de cesto tradicionais no Funchal',
        hrefKey: 'pricing',
        span: 'lg:col-span-7',
      },
      {
        title: 'Licenciamento AL & Setup',
        blurb: 'Rota de conformidade, coordenação de fornecedores e preparação de lançamento.',
        image: pexelsMadeiraImages.mercadoMural.src,
        alt: 'Mural do Mercado dos Lavradores no Funchal',
        hrefKey: 'guide',
        span: 'lg:col-span-4',
      },
      {
        title: 'Da Compra à Operação',
        blurb: 'Para novos proprietários que querem o imóvel pronto a operar rapidamente.',
        image: pexelsMadeiraImages.villageRuggedMountains.src,
        alt: 'Aldeia da Madeira entre montanhas escarpadas',
        hrefKey: 'howItWorks',
        span: 'lg:col-span-4',
      },
      {
        title: 'Supervisão Direta da Fundadora',
        blurb: 'Responsabilidade direta e um único ponto de contacto.',
        image: pexelsMadeiraImages.oceanfrontBench.src,
        alt: 'Pessoas a observar o oceano na Madeira',
        hrefKey: 'about',
        span: 'lg:col-span-4',
      },
    ],
    processEyebrow: 'Fluxo Concierge',
    processTitle: 'Integração rápida. Confiança imediata.',
    processLink: 'Iniciar Integração',
    steps: [
      {
        step: '01',
        title: 'Diagnóstico Rápido',
        detail:
          'Consulta de 30 minutos para mapear objetivos, riscos e modelo de operação do seu imóvel.',
      },
      {
        step: '02',
        title: 'Plano de Precisão',
        detail:
          'Recebe um plano de gestão personalizado com escopo, prioridades e cronograma claro.',
      },
      {
        step: '03',
        title: 'Execução Local',
        detail:
          'Executamos toda a operação na ilha enquanto acompanha resultados com atualizações objetivas.',
      },
    ],
    finalEyebrow: 'Pronto Para Delegar Com Confiança',
    finalTitle: 'Dê ao seu imóvel na Madeira uma equipa local com padrões premium.',
    finalSubtitle:
      'Marque uma chamada privada e receba um roteiro prático para operação, experiência do hóspede e valorização do ativo.',
    finalPrimaryCta: 'Marcar Consulta',
    finalSecondaryCta: 'Ver Preços',
  },
};
