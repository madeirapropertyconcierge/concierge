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
  idealFor?: string;
  showQuoteLabel?: boolean;
}

export interface PricingPageContent {
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  customQuote: string;
  includesLabel: string;
  idealForLabel: string;
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
    includesLabel: 'Inclui',
    idealForLabel: 'Ideal para',
    tiers: [
      {
        tierLabel: 'Tier A',
        title: 'Pacote de Cuidados Essenciais',
        price: {
          amount: '€95',
          unit: '/mês',
        },
        audience:
          'Pensado para proprietários no estrangeiro que querem tranquilidade, sabendo que a sua propriedade está a ser verificada e mantida na sua ausência.',
        features: [
          'Inspeção mensal ao interior e exterior da propriedade',
          'Ventilação e circulação de água para prevenir problemas',
          'Verificação visual de fugas, humidade, pragas ou danos causados pelo tempo',
          'Relatório fotográfico enviado após cada visita',
          'Contacto de emergência e coordenação caso surja algum problema',
        ],
        idealFor:
          'Casas que ficam vazias durante longos períodos e cujos proprietários visitam uma ou duas vezes por ano.',
      },
      {
        tierLabel: 'Tier B',
        title: 'Pacote de Cuidados Standard',
        price: {
          amount: '€180',
          unit: '/mês',
        },
        audience:
          'A nossa opção mais popular, oferecendo monitorização reforçada e coordenação local para proprietários que vivem no estrangeiro.',
        features: [
          'Tudo incluído no pacote Essencial, mais:',
          'Inspeções à propriedade duas vezes por mês',
          'Guarda segura de chaves',
          'Coordenação com profissionais e prestadores de serviços locais de confiança',
          'Verificações em caso de tempestade e condições meteorológicas adversas quando necessário',
          'Apoio ao acesso de hóspedes (entrega de chaves, ligar/desligar utilidades)',
          'Resposta prioritária para situações urgentes',
        ],
        idealFor:
          'Proprietários de segunda habitação e famílias com visitantes ocasionais.',
      },
      {
        tierLabel: 'Tier C',
        title: 'Pacote Concierge Premium',
        price: {
          amount: '€295',
          unit: '/mês',
        },
        audience:
          'Um serviço totalmente gerido para proprietários internacionais que procuram total tranquilidade.',
        features: [
          'Tudo incluído no pacote Standard, mais:',
          'Verificações da propriedade sob pedido',
          'Preparação da casa antes da sua chegada',
          'Inspeções após a sua partida da ilha',
          'Gestão de utilidades (água, gás, eletricidade)',
          'Apoio na navegação de serviços locais e burocracia',
          'Atualizações detalhadas e relatórios fotográficos',
        ],
        idealFor:
          'Propriedades de elevado valor, visitantes frequentes, ou proprietários que querem uma solução sem preocupações e sem intervenção direta.',
      },
      {
        tierLabel: 'Serviços à medida',
        title: 'Serviços Concierge Personalizados Desde',
        price: {
          amount: '€35',
          unit: '/hora',
        },
        audience:
          'Apoio flexível e sob pedido para situações que exigem uma pessoa de confiança no terreno.',
        features: [
          'Exemplos incluem:',
          'Chamadas de emergência',
          'Aguardar reparações, inspeções ou entregas',
          'Coordenação de limpezas',
          'Inventário e verificações de estado',
          'Entregas de mobiliário ou eletrodomésticos',
          'Tarefas locais e apoio administrativo',
          'Assistência em renovações ou setup',
          'Retainers mensais personalizados disponíveis para apoio contínuo.',
        ],
      },
      {
        tierLabel: 'Add-ons',
        title: 'Add-ons Opcionais',
        price: null,
        showQuoteLabel: false,
        audience: 'Serviços extra disponíveis conforme necessário.',
        features: [
          'Visitas adicionais à propriedade: €30 por visita',
          'Inspeção de tempestade (fora do pacote): €40',
          'Preparação de boas-vindas para hóspedes (limpeza e essenciais): desde €75',
          'Relatório anual ou de inspeção pré-compra: desde €150',
          'Coordenação de entrega de chaves: €25',
          'Styling interior e fotografia profissional (orçamento por escopo)',
          'Coordenação de renovação e fornecedores (orçamento por escopo)',
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
    includesLabel: 'Includes',
    idealForLabel: 'Ideal for',
    tiers: [
      {
        tierLabel: 'Tier A',
        title: 'Essential Care Package',
        price: {
          amount: '€95',
          unit: '/month',
        },
        audience:
          'Designed for overseas owners who want peace of mind knowing their property is being checked and maintained in their absence.',
        features: [
          'Monthly interior and exterior property inspection',
          'Ventilation and water run-through to prevent issues',
          'Visual checks for leaks, damp, pests, or weather damage',
          'Photo report sent after each visit',
          'Emergency contact and coordination if an issue arises',
        ],
        idealFor:
          'Homes that are vacant for extended periods and owners visiting once or twice per year.',
      },
      {
        tierLabel: 'Tier B',
        title: 'Standard Care Package',
        price: {
          amount: '€180',
          unit: '/month',
        },
        audience:
          'Our most popular option, offering enhanced monitoring and local coordination for owners living abroad.',
        features: [
          'Includes everything in the Essential package, plus:',
          'Bi-monthly property inspections',
          'Secure key holding',
          'Coordination with trusted local trades and service providers',
          'Storm and adverse weather checks when required',
          'Guest access support (key handover, utilities on/off)',
          'Priority response for urgent situations',
        ],
        idealFor:
          'Second-home owners and families with occasional visitors.',
      },
      {
        tierLabel: 'Tier C',
        title: 'Premium Concierge Package',
        price: {
          amount: '€295',
          unit: '/month',
        },
        audience:
          'A fully managed service for international owners seeking complete peace of mind.',
        features: [
          'Includes everything in the Standard package, plus:',
          'On-demand property checks',
          'Pre-arrival home prep before your visit',
          'Post-departure inspections after you leave the island',
          'Utility management (water, gas, electricity)',
          'Assistance navigating local services and bureaucracy',
          'Detailed updates & photo reporting',
        ],
        idealFor:
          'High-value properties, frequent visitors, or owners who want a hands-off, worry-free solution.',
      },
      {
        tierLabel: 'Bespoke',
        title: 'Bespoke Concierge Services From',
        price: {
          amount: '€35',
          unit: '/hour',
        },
        audience:
          'Flexible, on-demand support for situations that require a trusted person on the ground.',
        features: [
          'Examples include:',
          'Emergency call-outs',
          'Waiting for repairs, inspections, or deliveries',
          'Cleaning coordination',
          'Inventory and condition checks',
          'Furniture or appliance deliveries',
          'Local errands and administrative support',
          'Renovation or setup assistance',
          'Custom monthly retainers are available for ongoing support.',
        ],
      },
      {
        tierLabel: 'Add-ons',
        title: 'Optional Add-Ons',
        price: null,
        showQuoteLabel: false,
        audience: 'Additional support available as needed.',
        features: [
          'Additional property visits: €30 per visit',
          'Storm inspection (outside package): €40',
          'Guest welcome preparation (cleaning & essentials): from €75',
          'Annual or pre-purchase inspection report: from €150',
          'Key handover coordination: €25',
          'Interior styling and professional listing photography (scoped quote)',
          'Renovation/vendor project coordination (scoped quote)',
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
