import type { Locale } from '../../i18n/utils';

export interface PricingTier {
  tierLabel: string;
  title: string;
  price: {
    amount: string;
    unit: string;
  } | null;
  audience: string;
  features: string[];
}

export interface PricingPageContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  customQuote: string;
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
      'Planos mensais fixos para operação contínua e add-ons por projeto. Sem taxas escondidas.',
    customQuote: 'Orçamento por escopo',
    tiers: [
      {
        tierLabel: 'Tier A',
        title: 'Guarda de Chaves + Home Care',
        price: {
          amount: '€150',
          unit: '/mês',
        },
        audience: 'Para segunda habitação e proprietários part-time.',
        features: [
          'Visitas regulares com fotos, ventilação, humidade e fugas',
          'Monitorização de correio, utilidades e estado geral do imóvel',
          'Preparação para tempestades e inspeção pós-evento',
        ],
      },
      {
        tierLabel: 'Tier B',
        title: 'Hosting Essentials',
        price: {
          amount: '€300',
          unit: '/mês',
        },
        audience: 'Para quem gere reservas, mas delega operações no terreno.',
        features: [
          'Mensagens e triagem de hóspedes + gestão de check-ins/check-outs',
          'Coordenação de limpezas, lavandaria e reposição entre estadias',
          'Escalação de incidentes e suporte durante a estadia',
        ],
      },
      {
        tierLabel: 'Tier C',
        title: 'Gestão Full-Service',
        price: {
          amount: '€500',
          unit: '/mês',
        },
        audience: 'Para proprietários que querem delegação completa.',
        features: [
          'Gestão de anúncios, calendário e pricing dinâmico',
          'Coordenação de manutenção com controlo de fornecedores',
          'Relatório mensal com receita, despesas e log operacional',
        ],
      },
      {
        tierLabel: 'Projetos',
        title: 'Projetos Complementares',
        price: null,
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
      'Emergências de hóspedes em até 30 minutos (15 min no Tier C)',
      'Regra "sem faturas surpresa" com fotos antes/depois',
    ],
    ctaTitle: 'Recomendamos o nível que encaixa, não o mais caro.',
    ctaBody: 'Conte-nos sobre o imóvel e os seus objetivos. Enviamos uma proposta clara, sem pressão.',
    ctaPrimary: 'Marcar Chamada de Diagnóstico',
    ctaProject: 'Definir Projeto',
  },
  en: {
    heroEyebrow: 'Transparent Model',
    heroTitle: 'Pricing aligned with how your property is actually operated.',
    heroSubtitle:
      'Fixed monthly plans for ongoing operations plus project-based add-ons. No hidden fees.',
    customQuote: 'Scoped Quote',
    tiers: [
      {
        tierLabel: 'Tier A',
        title: 'Keyholding + Home Care',
        price: {
          amount: '€150',
          unit: '/month',
        },
        audience: 'For second homes and part-time rental owners.',
        features: [
          'Scheduled visits with photos, humidity, leak, and ventilation checks',
          'Mail, utility, and general condition monitoring',
          'Storm prep and post-storm inspections',
        ],
      },
      {
        tierLabel: 'Tier B',
        title: 'Hosting Essentials',
        price: {
          amount: '€300',
          unit: '/month',
        },
        audience: 'For owners who self-manage bookings but need local operations.',
        features: [
          'Guest messaging/screening plus check-ins/check-outs',
          'Turnover cleaning, laundry, and restocking coordination',
          'Issue escalation and support during guest stays',
        ],
      },
      {
        tierLabel: 'Tier C',
        title: 'Full-Service Management',
        price: {
          amount: '€500',
          unit: '/month',
        },
        audience: 'For owners who want end-to-end delegation.',
        features: [
          'Listing, calendar, and dynamic pricing management',
          'Maintenance coordination with vendor quality control',
          'Monthly owner report with revenue, costs, and maintenance log',
        ],
      },
      {
        tierLabel: 'Add-ons',
        title: 'Project-Based Add-ons',
        price: null,
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
      'Guest emergency response within 30 minutes (15 mins on Tier C)',
      'No-surprise invoice rule with before/after maintenance photos',
    ],
    ctaTitle: 'We\'ll recommend the tier that fits, not the most expensive one.',
    ctaBody: 'Tell us about your property and goals. We\'ll send back a clear, no-pressure scope.',
    ctaPrimary: 'Book Diagnostic Call',
    ctaProject: 'Scope Add-on Project',
  },
} as const satisfies Record<Locale, PricingPageContent>;

export function getPricingPageContent(lang: Locale): PricingPageContent {
  return pricingPageContent[lang];
}
