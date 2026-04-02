import type { Locale } from '../i18n/utils';
import type { RouteKey } from '../i18n/routes';
import { madeiraImages } from './madeiraImages';
import { loadCoreServicePackages, type ServicePackageKey } from './pageContent/packages';

export interface HomeTrustSignal {
  value: string;
  label: string;
}

export interface HomeServiceTile {
  packageKey: Exclude<ServicePackageKey, 'addOns'>;
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

type StaticHomePageContent = Omit<HomePageContent, 'serviceTiles'>;

const homeTileConfig: Record<
  Exclude<ServicePackageKey, 'addOns'>,
  { image: string; alt: string; hrefKey: RouteKey; span: string }
> = {
  essentialCare: {
    image: madeiraImages.treeFramedValleyTown.src,
    alt: madeiraImages.treeFramedValleyTown.alt,
    hrefKey: 'services',
    span: 'lg:col-span-5',
  },
  managedCare: {
    image: madeiraImages.tobogganRideFunchal.src,
    alt: madeiraImages.tobogganRideFunchal.alt,
    hrefKey: 'pricing',
    span: 'lg:col-span-7',
  },
  premiumCare: {
    image: madeiraImages.saoVicenteCoast.src,
    alt: madeiraImages.saoVicenteCoast.alt,
    hrefKey: 'services',
    span: 'lg:col-span-4',
  },
  revenueHosting: {
    image: madeiraImages.mercadoMural.src,
    alt: madeiraImages.mercadoMural.alt,
    hrefKey: 'pricing',
    span: 'lg:col-span-4',
  },
  onDemand: {
    image: madeiraImages.villageRuggedMountains.src,
    alt: madeiraImages.villageRuggedMountains.alt,
    hrefKey: 'contact',
    span: 'lg:col-span-4',
  },
};

async function buildHomeServiceTiles(locale: Locale): Promise<HomeServiceTile[]> {
  const packages = await loadCoreServicePackages(locale);

  return packages.map((item) => ({
    packageKey: item.key,
    title: item.title,
    blurb: item.homeBlurb,
    ...homeTileConfig[item.key],
  }));
}

const staticHomepageContent: Record<Locale, StaticHomePageContent> = {
  en: {
    metaDescription: 'Boutique hosting and property care in Madeira for overseas owners who want peace of mind.',
    heroBackgroundAlt: madeiraImages.vineyardCoastalVillage.alt,
    finalBackgroundAlt: madeiraImages.coastSunsetAerial.alt,
    heroBadge: 'Madeira Property Concierge',
    heroTitle: 'Boutique Hosting + Property Care. True Peace of Mind.',
    heroSubtitle:
      'Founder-led property management in Madeira for overseas owners. Bilingual EN/PT support, clear reporting, and local execution you can trust.',
    primaryCta: 'Book Diagnostic Call',
    secondaryCta: 'See Service Packages',
    mediaCards: [
      {
        image: madeiraImages.pontaHikers.src,
        alt: madeiraImages.pontaHikers.alt,
        caption: 'Property Care & Preventative Checks',
      },
      {
        image: madeiraImages.saoVicenteCoast.src,
        alt: madeiraImages.saoVicenteCoast.alt,
        caption: 'Guest Experience & Hosting Support',
      },
      {
        image: madeiraImages.villageAerialShadow.src,
        alt: madeiraImages.villageAerialShadow.alt,
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
    processEyebrow: 'Owner Journey',
    processTitle: 'Clear onboarding. Predictable operations.',
    processLink: 'View The Process',
    steps: [
      {
        step: '01',
        title: 'Discovery Call',
        detail:
          'A 30-minute call to map goals, hosting needs, and the level of property support required.',
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
      "Start with a 30-minute diagnostic call. We'll work out whether your property needs care, guest support, revenue management, or flexible on-the-ground help.",
    finalPrimaryCta: 'Book Consultation',
    finalSecondaryCta: 'View Pricing',
  },
  pt: {
    metaDescription: 'Hosting boutique e cuidado de propriedade na Madeira para proprietarios no estrangeiro que querem tranquilidade.',
    heroBackgroundAlt: madeiraImages.vineyardCoastalVillage.alt,
    finalBackgroundAlt: madeiraImages.coastSunsetAerial.alt,
    heroBadge: 'Madeira Property Concierge',
    heroTitle: 'Hosting Boutique + Cuidado de Propriedade. Tranquilidade Real.',
    heroSubtitle:
      'Gestao de propriedade na Madeira, liderada pela fundadora, para proprietarios no estrangeiro. Suporte bilingue EN/PT, reporting claro e execucao local de confianca.',
    primaryCta: 'Marcar Chamada de Diagnostico',
    secondaryCta: 'Ver Pacotes de Servico',
    mediaCards: [
      {
        image: madeiraImages.pontaHikers.src,
        alt: madeiraImages.pontaHikers.alt,
        caption: 'Cuidado de Propriedade e Verificacoes Preventivas',
      },
      {
        image: madeiraImages.saoVicenteCoast.src,
        alt: madeiraImages.saoVicenteCoast.alt,
        caption: 'Experiencia de Hospede e Apoio de Hosting',
      },
      {
        image: madeiraImages.villageAerialShadow.src,
        alt: madeiraImages.villageAerialShadow.alt,
        caption: 'Cobertura em Expansao na Costa Oeste',
      },
    ],
    trustSignals: [
      { value: 'EN/PT', label: 'Bilingue, nascida canadiana-madeirense' },
      { value: '4h', label: 'Objetivo de resposta ao proprietario' },
      { value: '56 pontos', label: 'Checklist de qualidade no turnover' },
    ],
    architectureEyebrow: 'Feito Para Proprietarios no Estrangeiro',
    architectureTitle: 'Pequenos de proposito. Uma responsavel, um ponto de contacto, total responsabilidade.',
    architectureLink: 'Como Operamos',
    processEyebrow: 'Jornada do Proprietario',
    processTitle: 'Integracao clara. Operacao previsivel.',
    processLink: 'Ver O Processo',
    steps: [
      {
        step: '01',
        title: 'Chamada de Descoberta',
        detail:
          'Chamada de 30 minutos para mapear objetivos, necessidades de hosting e o nivel de apoio que o imovel exige.',
      },
      {
        step: '02',
        title: 'Auditoria de Imovel e Risco',
        detail:
          'Avaliacao no local de estado, lacunas de conformidade, necessidades de fornecedores e prontidao.',
      },
      {
        step: '03',
        title: 'Lancamento e Gestao',
        detail:
          'Executamos a operacao diaria com relatorios mensais, registo de manutencao e suporte por SLA.',
      },
    ],
    finalEyebrow: 'Pronto Para Falar?',
    finalTitle: 'Tem imovel na Madeira mas vive fora? Nos tratamos localmente, voce acompanha tudo.',
    finalSubtitle:
      'Comece com uma chamada de diagnostico de 30 minutos. Percebemos se o seu imovel precisa de cuidado, apoio a hospedes, revenue e hosting, ou ajuda flexivel no terreno.',
    finalPrimaryCta: 'Marcar Consulta',
    finalSecondaryCta: 'Ver Precos',
  },
};

export async function getHomepageContent(locale: Locale): Promise<HomePageContent> {
  return {
    ...staticHomepageContent[locale],
    serviceTiles: await buildHomeServiceTiles(locale),
  };
}
