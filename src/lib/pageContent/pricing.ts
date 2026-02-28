import type { Locale } from '../../i18n/utils';

export interface PricingTier {
  title: string;
  price: string | null;
  highlight: boolean;
  audience: string;
  features: string[];
}

export interface PricingPageContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  customQuote: string;
  mostPopular: string;
  tiers: PricingTier[];
  transparencyTitle: string;
  transparencyItems: string[];
  ctaTitle: string;
  ctaBody: string;
  ctaPrimary: string;
  ctaProject: string;
}

const pricingPageContent = {
  pt: {
    heroEyebrow: 'Modelo Transparente',
    heroTitle: 'Preços alinhados com a operação real do seu imóvel.',
    heroSubtitle:
      'Retainer para home care, comissão para operação AL e add-ons por estadia ou projeto. Sem taxas escondidas.',
    customQuote: 'Orçamento por escopo',
    mostPopular: 'Mais Escolhido',
    tiers: [
      {
        title: 'Tier A - Guarda de Chaves + Home Care',
        price: '€100-€250/mês',
        highlight: false,
        audience: 'Para segunda habitação e proprietários part-time.',
        features: [
          'Visitas regulares com fotos, ventilação, humidade e fugas',
          'Monitorização de correio, utilidades e estado geral do imóvel',
          'Preparação para tempestades e inspeção pós-evento',
        ],
      },
      {
        title: 'Tier B - Hosting Essentials',
        price: '15%-18% da receita bruta',
        highlight: false,
        audience: 'Para quem gere reservas, mas delega operações no terreno.',
        features: [
          'Mensagens e triagem de hóspedes + gestão de check-ins/check-outs',
          'Coordenação de limpezas, lavandaria e reposição entre estadias',
          'Escalação de incidentes e suporte durante a estadia',
        ],
      },
      {
        title: 'Tier C - Gestão Full-Service',
        price: '20%-25% da receita bruta',
        highlight: true,
        audience: 'Para proprietários que querem delegação completa.',
        features: [
          'Gestão de anúncios, calendário e pricing dinâmico',
          'Coordenação de manutenção com controlo de fornecedores',
          'Relatório mensal com receita, despesas e log operacional',
        ],
      },
      {
        title: 'Tier D - Premium / White-Glove (Fase 2)',
        price: '€50-€150 por estadia',
        highlight: false,
        audience: 'Camada premium de hospitalidade e concierge.',
        features: [
          'Welcome pack curado, pré-stock e personalização da estadia',
          'Reservas e experiências locais com parceiros validados',
          'SLA acelerado: resposta a emergência em 15 minutos',
        ],
      },
      {
        title: 'Projetos Complementares',
        price: null,
        highlight: false,
        audience: 'Para setup, transformação e valorização pontual.',
        features: [
          'Styling interior e fotografia profissional',
          'Coordenação de renovação e fornecedores',
          'Manual de casa UX + setup de smart lock/noise monitor',
        ],
      },
    ],
    transparencyTitle: 'Padrões operacionais incluídos',
    transparencyItems: [
      'Checklist de limpeza de 56 pontos com verificação fotográfica',
      'Resposta ao proprietário em até 4 horas úteis',
      'Emergências de hóspedes em até 30 minutos (15 min no Tier C/D)',
      'Regra "sem faturas surpresa" com fotos antes/depois',
    ],
    ctaTitle: 'Recomendamos o nível certo para o seu contexto, não o mais caro.',
    ctaBody: 'Partilhe objetivos e estágio do imóvel para receber uma proposta prática e transparente.',
    ctaPrimary: 'Marcar Chamada de Diagnóstico',
    ctaProject: 'Definir Projeto',
  },
  en: {
    heroEyebrow: 'Transparent Model',
    heroTitle: 'Pricing aligned with how your property is actually operated.',
    heroSubtitle:
      'Retainer for home care, commission for AL operations, plus per-stay or project-based add-ons. No hidden fees.',
    customQuote: 'Scoped Quote',
    mostPopular: 'Most Chosen',
    tiers: [
      {
        title: 'Tier A - Keyholding + Home Care',
        price: '€100-€250/month',
        highlight: false,
        audience: 'For second homes and part-time rental owners.',
        features: [
          'Scheduled visits with photos, humidity, leak, and ventilation checks',
          'Mail, utility, and general condition monitoring',
          'Storm prep and post-storm inspections',
        ],
      },
      {
        title: 'Tier B - Hosting Essentials',
        price: '15%-18% of gross rental income',
        highlight: false,
        audience: 'For owners who self-manage bookings but need local operations.',
        features: [
          'Guest messaging/screening plus check-ins/check-outs',
          'Turnover cleaning, laundry, and restocking coordination',
          'Issue escalation and support during guest stays',
        ],
      },
      {
        title: 'Tier C - Full-Service Management',
        price: '20%-25% of gross rental income',
        highlight: true,
        audience: 'For owners who want end-to-end delegation.',
        features: [
          'Listing, calendar, and dynamic pricing management',
          'Maintenance coordination with vendor quality control',
          'Monthly owner report with revenue, costs, and maintenance log',
        ],
      },
      {
        title: 'Tier D - Premium / White-Glove (Phase 2)',
        price: '€50-€150 per stay',
        highlight: false,
        audience: 'Premium hospitality and concierge add-on layer.',
        features: [
          'Curated welcome packs, pre-stocking, and personalized stays',
          'Restaurant/experience coordination with vetted partners',
          'Faster SLA: 15-minute emergency response target',
        ],
      },
      {
        title: 'Project-Based Add-ons',
        price: null,
        highlight: false,
        audience: 'For setup, transformation, and one-off asset upgrades.',
        features: [
          'Interior styling and professional listing photography',
          'Renovation/vendor project coordination',
          'UX house manual plus smart lock/noise setup',
        ],
      },
    ],
    transparencyTitle: 'Operational standards included',
    transparencyItems: [
      '56-point turnover cleaning checklist with photo verification',
      'Owner response target within 4 business hours',
      'Guest emergency response within 30 minutes (15 mins on Tier C/D)',
      'No-surprise invoice rule with before/after maintenance photos',
    ],
    ctaTitle: 'We recommend what fits your context, not the biggest package.',
    ctaBody: 'Share your goals and property stage to receive a practical, transparent scope.',
    ctaPrimary: 'Book Diagnostic Call',
    ctaProject: 'Scope Add-on Project',
  },
} as const satisfies Record<Locale, PricingPageContent>;

export function getPricingPageContent(lang: Locale): PricingPageContent {
  return pricingPageContent[lang];
}
