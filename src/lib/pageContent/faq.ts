import type { Locale } from '../../i18n/utils';

export interface FAQItem {
  question: string;
  answer: string;
}

export interface FAQCategory {
  title: string;
  items: FAQItem[];
}

export interface FAQClosingCopy {
  title: string;
  body: string;
  cta: string;
}

export interface FAQPageContent {
  heroTitle: string;
  heroSubtitle: string;
  categories: FAQCategory[];
  closing: FAQClosingCopy;
}

const faqPageContent = {
  pt: {
    heroTitle: 'Respostas claras para proprietários no estrangeiro.',
    heroSubtitle:
      'Questões frequentes sobre níveis de serviço, SLAs, conformidade AL e operação contínua na Madeira.',
    categories: [
      {
        title: 'Público & Enquadramento',
        items: [
          {
            question: 'Para quem é este serviço?',
            answer:
              'Focamo-nos em proprietários no estrangeiro com 1-3 imóveis na Madeira que querem tranquilidade, proteção do ativo e operação local fiável.',
          },
          {
            question: 'Trabalham com imóveis que não estão sempre em aluguer?',
            answer:
              'Sim. O Tier A (Guarda de Chaves + Home Care) foi desenhado para segunda habitação e imóveis com ocupação parcial, mesmo sem reservas contínuas.',
          },
          {
            question: 'Em que zonas da Madeira atuam?',
            answer:
              'Atuamos em toda a ilha, com operação forte no Funchal e expansão ativa para a costa oeste (Calheta, Ponta do Sol e Ribeira Brava).',
          },
        ],
      },
      {
        title: 'Níveis & Operação',
        items: [
          {
            question: 'Como funcionam os níveis e preços?',
            answer:
              'Tier A: €100-€250/mês. Tier B: 15%-18% da receita bruta. Tier C: 20%-25% da receita bruta. Tier D (white-glove): €50-€150 por estadia. Também existem projetos complementares por escopo.',
          },
          {
            question: 'Quais são os SLAs de resposta?',
            answer:
              'Objetivo de resposta ao proprietário em até 4 horas úteis. Emergências de hóspedes até 30 minutos, e até 15 minutos nos níveis Tier C/D.',
          },
          {
            question: 'Como garantem qualidade na limpeza e turnover?',
            answer:
              'Usamos checklist de 56 pontos com verificação fotográfica antes de cada chegada. Nenhum imóvel entra em estadia sem validação visual.',
          },
        ],
      },
      {
        title: 'Legal & Conformidade',
        items: [
          {
            question: 'Ajudam com AL, SIBA e RNAL?',
            answer:
              'Sim. Apoiamos o caminho de licenciamento AL e a coordenação operacional de conformidade, incluindo reporte de hóspedes via SIBA e gestão de dados RNAL.',
          },
          {
            question: 'Prestam aconselhamento legal ou fiscal?',
            answer:
              'Fornecemos documentação operacional e articulamos com TOC/advogados parceiros, mas não substituímos aconselhamento legal ou fiscal formal.',
          },
        ],
      },
    ],
    closing: {
      title: 'Tem uma dúvida sobre o seu imóvel?',
      body: 'Podemos avaliar a sua situação e sugerir qual nível faz sentido.',
      cta: 'Marcar Chamada de Diagnóstico',
    },
  },
  en: {
    heroTitle: 'Clear answers for overseas owners.',
    heroSubtitle:
      'Common questions on service tiers, SLAs, AL compliance support, and ongoing operations in Madeira.',
    categories: [
      {
        title: 'Fit & Scope',
        items: [
          {
            question: 'Who is this service for?',
            answer:
              'We focus on overseas owners with 1-3 Madeira properties who want peace of mind, asset protection, and reliable local execution.',
          },
          {
            question: 'Do you handle homes that are not rented full-time?',
            answer:
              'Yes. Tier A (Keyholding + Home Care) is designed for second homes and part-time rentals, even without continuous bookings.',
          },
          {
            question: 'What areas of Madeira do you cover?',
            answer:
              'We operate island-wide, with strong Funchal coverage and active expansion into the west coast (Calheta, Ponta do Sol, and Ribeira Brava).',
          },
        ],
      },
      {
        title: 'Tiers & Operations',
        items: [
          {
            question: 'How do your tiers and pricing work?',
            answer:
              'Tier A: €100-€250/month. Tier B: 15%-18% of gross rental income. Tier C: 20%-25% of gross rental income. Tier D (white-glove): €50-€150 per stay. We also run scoped add-on projects.',
          },
          {
            question: 'What response SLAs do you commit to?',
            answer:
              'Owner response target is within 4 business hours. Guest emergencies are handled within 30 minutes, or 15 minutes on Tier C/D.',
          },
          {
            question: 'How do you control turnover quality?',
            answer:
              'We use a 56-point cleaning checklist with photo verification before each arrival. No guest check-in happens without visual QA.',
          },
        ],
      },
      {
        title: 'Legal & Compliance',
        items: [
          {
            question: 'Do you support AL, SIBA, and RNAL workflows?',
            answer:
              'Yes. We support AL licensing workflows plus operational compliance coordination, including SIBA guest reporting and RNAL data handling.',
          },
          {
            question: 'Do you provide legal or tax advice?',
            answer:
              'We provide operational documentation and coordinate with trusted TOC/legal partners, but we do not replace formal legal or tax advice.',
          },
        ],
      },
    ],
    closing: {
      title: 'Have a question about your property?',
      body: "We can look at your situation and suggest which tier makes sense.",
      cta: 'Book Diagnostic Call',
    },
  },
} as const satisfies Record<Locale, FAQPageContent>;

export function getFaqPageContent(lang: Locale): FAQPageContent {
  return faqPageContent[lang];
}
