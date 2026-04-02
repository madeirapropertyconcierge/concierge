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
      'Questoes frequentes sobre pacotes de servico, SLAs, conformidade AL e operacao continua na Madeira.',
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
              'Sim. O Pacote de Cuidados Essenciais foi pensado precisamente para segundas habitacoes e imoveis com ocupacao parcial, mesmo sem reservas continuas.',
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
              'Cuidados Essenciais: EUR95/mes. Gestao Assistida: EUR95/mes mais EUR80 por suporte de turnover. Cuidados Premium: EUR140/mes. Revenue & Hosting: EUR95/mes mais 25% da receita bruta. Servicos Sob Pedido: desde EUR35/hora. Add-ons opcionais sao orcamentados por escopo.',
          },
          {
            question: 'Quais são os SLAs de resposta?',
            answer:
              'Objetivo de resposta ao proprietario em ate 4 horas uteis. Situacoes urgentes recebem prioridade reforcada nos pacotes Premium Care e Revenue & Hosting.',
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
      'Common questions on service packages, SLAs, AL compliance support, and ongoing operations in Madeira.',
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
              'Yes. The Essential Care Package is designed for second homes and part-time use, even without continuous bookings.',
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
              'Essential Care is €95/month. Managed Care is €95/month plus €80 per turnover support. Premium Care is €140/month. Revenue & Hosting is €95/month plus 25% of gross rental revenue. On-Demand Services start at €35/hour, and optional add-ons are scoped separately.',
          },
          {
            question: 'What response SLAs do you commit to?',
            answer:
              'Owner response target is within 4 business hours. Urgent issues receive faster escalation on Premium Care and Revenue & Hosting.',
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
