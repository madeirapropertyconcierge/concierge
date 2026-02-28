import type { Locale } from '../../i18n/utils';

export type LegalPageType = 'privacy' | 'terms';

export interface LegalLink {
  label: string;
  href: string;
}

export interface LegalSection {
  title: string;
  body: string;
  items?: string[];
  links?: LegalLink[];
  note?: string;
}

export interface LegalPageContent {
  metaTitle: string;
  metaDescription: string;
  heroEyebrow: string;
  heroTitle: string;
  heroSubtitle: string;
  sections: LegalSection[];
  updatedLabel: string;
}

export interface LegalPageContext {
  legalName: string;
  taxId: string;
  commercialRegistry: string;
  email: string;
  phone: string;
  address: string;
  complaintsBookUrl: string;
  adrInfoUrl: string;
  termsHref: string;
  hasLegalPlaceholders: boolean;
}

const cnpdLink = 'https://www.cnpd.pt/';

export function getLegalPageContent(
  lang: Locale,
  type: LegalPageType,
  context: LegalPageContext,
): LegalPageContent {
  const contentByLocale = {
    en: {
      privacy: {
        metaTitle: 'Privacy Policy | Madeira Property Concierge',
        metaDescription: 'How Madeira Property Concierge collects, uses, and safeguards your data.',
        heroEyebrow: 'Legal',
        heroTitle: 'Privacy Policy',
        heroSubtitle: 'How we process and protect personal data across our website and services.',
        sections: [
          {
            title: 'Data Controller',
            body: 'The data controller for this website and related services is:',
            items: [
              `Controller: ${context.legalName}`,
              `Email: ${context.email}`,
              `Telephone: ${context.phone}`,
              `Postal address: ${context.address}`,
            ],
          },
          {
            title: 'Data We Process',
            body: 'We process personal data that you provide directly when contacting us or requesting services.',
            items: [
              'Identity and contact details (name, email, phone).',
              'Property context details shared in enquiry messages.',
              'Communication history and service-preparation notes.',
              'Technical data required for site operation and security (for example, essential logs).',
            ],
          },
          {
            title: 'Purposes and Legal Bases (GDPR Art. 6)',
            body: 'Your data is processed only where there is a valid legal basis:',
            items: [
              'Responding to pre-contractual requests and providing services: Art. 6(1)(b) GDPR.',
              'Managing invoices and legal accounting/tax duties: Art. 6(1)(c) GDPR.',
              'Protecting our operations and handling legal claims: Art. 6(1)(f) GDPR.',
              'Optional marketing communications (if used): Art. 6(1)(a) GDPR consent.',
            ],
          },
          {
            title: 'Retention Periods',
            body: 'We keep data only for the period necessary for each purpose and legal obligation.',
            items: [
              'Enquiry records: up to 12 months after last contact, unless a contract follows.',
              'Contract, invoicing, and accounting records: according to Portuguese legal retention duties.',
              'Technical/security records: only for operational security and legal defense windows.',
            ],
          },
          {
            title: 'Recipients and International Transfers',
            body: 'Data may be shared with service providers strictly needed to run our operations (for example hosting, email, forms, and scheduling tools).',
            items: [
              'Processors act under contractual confidentiality and data-protection obligations.',
              'If data is transferred outside the EEA, we apply lawful safeguards such as Standard Contractual Clauses.',
            ],
          },
          {
            title: 'Your Rights and Complaints',
            body: 'Under GDPR, you may request access, rectification, erasure, restriction, objection, and portability where applicable.',
            items: [
              `To exercise rights, contact: ${context.email}`,
              'You may withdraw consent at any time where consent is the legal basis.',
              'You may lodge a complaint with the Portuguese supervisory authority (CNPD).',
            ],
            links: [{ label: 'CNPD (Portuguese Data Protection Authority)', href: cnpdLink }],
          },
          {
            title: 'Cookies and Similar Technologies',
            body: 'We use strictly necessary cookies for site operation. Non-essential cookies (such as analytics/marketing) require prior consent.',
            items: [
              'No non-essential cookies should run before your explicit acceptance.',
              'You can change cookie preferences at any time through browser settings and local storage controls.',
            ],
            links: [{ label: 'Terms and cookie details', href: context.termsHref }],
          },
        ],
        updatedLabel: 'Last updated: February 28, 2026',
      },
      terms: {
        metaTitle: 'Terms of Service | Madeira Property Concierge',
        metaDescription: 'Terms governing the use of Madeira Property Concierge services and website.',
        heroEyebrow: 'Legal',
        heroTitle: 'Terms of Service',
        heroSubtitle: 'Commercial and operational terms that apply to our website and service delivery.',
        sections: [
          {
            title: 'Mandatory Provider Information (Portugal)',
            body: 'In line with Decree-Law no. 7/2004 (Article 10), we publish core provider identification details:',
            items: [
              `Legal name: ${context.legalName}`,
              `Registered address: ${context.address}`,
              `Email: ${context.email}`,
              `Tax identification (NIF): ${context.taxId}`,
              `Commercial registry details: ${context.commercialRegistry}`,
            ],
          },
          {
            title: 'Service Scope and Contracting',
            body: 'Service scope, deliverables, and execution timelines are defined in each proposal or signed service agreement.',
            items: [
              'Website information is informational and does not constitute an automatically binding offer.',
              'A service agreement becomes effective only after explicit acceptance by both parties.',
            ],
          },
          {
            title: 'Fees, Billing, and Taxes',
            body: 'Management and project fees are invoiced according to the signed agreement.',
            items: [
              'Third-party vendor costs are disclosed separately when applicable.',
              'Taxes and VAT treatment follow Portuguese law and the applicable invoicing framework.',
              'Any additional mandatory fees are communicated before confirmation.',
            ],
          },
          {
            title: 'Complaints Book and Consumer ADR',
            body: 'Consumer-facing operators in Portugal must provide complaint channels and ADR information.',
            items: [
              'Electronic complaints book access is available through the official Livro de Reclamacoes portal.',
              'Information on consumer ADR entities (RAL) is available on the Portuguese Consumer Portal.',
              'If a sector-specific ADR entity applies to a specific contract, it must be identified in that contract documentation.',
            ],
            links: [
              { label: 'Livro de Reclamacoes Eletronico', href: context.complaintsBookUrl },
              { label: 'Consumer ADR entities (RAL)', href: context.adrInfoUrl },
            ],
          },
          {
            title: 'Liability, Law, and Jurisdiction',
            body: 'We operate with professional care and vetted local partners. Liability limits apply as defined in signed agreements.',
            items: [
              'These terms are governed by Portuguese law.',
              'Unless mandatory consumer rules state otherwise, disputes are handled in the competent courts of Funchal, Madeira.',
            ],
          },
          {
            title: 'Publication Checklist',
            body: 'Before public launch, confirm all corporate and tax identifiers on this page are final and accurate.',
            note: context.hasLegalPlaceholders
              ? 'This website currently contains placeholder legal identifiers. Replace them with final registered data before publication.'
              : undefined,
          },
        ],
        updatedLabel: 'Last updated: February 28, 2026',
      },
    },
    pt: {
      privacy: {
        metaTitle: 'Política de Privacidade | Madeira Property Concierge',
        metaDescription: 'Como a Madeira Property Concierge recolhe, utiliza e protege os seus dados.',
        heroEyebrow: 'Legal',
        heroTitle: 'Política de Privacidade',
        heroSubtitle: 'Como tratamos e protegemos dados pessoais no website e na prestação de serviços.',
        sections: [
          {
            title: 'Responsável pelo Tratamento',
            body: 'O responsável pelo tratamento de dados deste website e serviços associados é:',
            items: [
              `Responsável: ${context.legalName}`,
              `Email: ${context.email}`,
              `Telefone: ${context.phone}`,
              `Morada postal: ${context.address}`,
            ],
          },
          {
            title: 'Dados Tratados',
            body: 'Tratamos dados pessoais fornecidos diretamente por si em contactos e pedidos de serviço.',
            items: [
              'Dados de identificação e contacto (nome, email, telefone).',
              'Contexto do imóvel e necessidades comunicadas em pedidos de contacto.',
              'Histórico de comunicações e notas de preparação de serviço.',
              'Dados técnicos necessários para operação e segurança do website.',
            ],
          },
          {
            title: 'Finalidades e Fundamentos Jurídicos (RGPD Art. 6.º)',
            body: 'Os dados apenas são tratados quando exista fundamento legal aplicável:',
            items: [
              'Resposta a pedidos pré-contratuais e execução de serviços: art. 6.º, n.º 1, al. b) RGPD.',
              'Cumprimento de obrigações legais (faturação/contabilidade/fiscal): art. 6.º, n.º 1, al. c) RGPD.',
              'Defesa de interesses legítimos (segurança, defesa de direitos): art. 6.º, n.º 1, al. f) RGPD.',
              'Comunicações de marketing opcionais (quando aplicável): consentimento, art. 6.º, n.º 1, al. a) RGPD.',
            ],
          },
          {
            title: 'Prazos de Conservação',
            body: 'Conservamos dados apenas durante o período necessário para cada finalidade e obrigação legal.',
            items: [
              'Pedidos de contacto: até 12 meses após o último contacto, salvo celebração de contrato.',
              'Registos contratuais e de faturação: conforme prazos legais portugueses aplicáveis.',
              'Registos técnicos/segurança: apenas enquanto necessários para segurança e defesa jurídica.',
            ],
          },
          {
            title: 'Destinatários e Transferências Internacionais',
            body: 'Os dados podem ser partilhados com subcontratantes estritamente necessários ao funcionamento do serviço (alojamento, email, formulários, agendamento).',
            items: [
              'Os subcontratantes atuam com deveres contratuais de confidencialidade e proteção de dados.',
              'Se houver transferências fora do EEE, aplicamos salvaguardas legais como Cláusulas Contratuais-Tipo.',
            ],
          },
          {
            title: 'Direitos do Titular e Reclamações',
            body: 'Nos termos do RGPD, pode exercer direitos de acesso, retificação, apagamento, limitação, oposição e portabilidade, quando aplicável.',
            items: [
              `Para exercer direitos: ${context.email}`,
              'Pode retirar o consentimento a qualquer momento quando o tratamento se basear em consentimento.',
              'Pode apresentar reclamação à autoridade de controlo portuguesa (CNPD).',
            ],
            links: [{ label: 'CNPD (Comissão Nacional de Proteção de Dados)', href: cnpdLink }],
          },
          {
            title: 'Cookies e Tecnologias Semelhantes',
            body: 'Utilizamos cookies estritamente necessários para operação do website. Cookies não essenciais (analíticos/marketing) exigem consentimento prévio.',
            items: [
              'Não devem ser ativados cookies não essenciais antes da sua aceitação explícita.',
              'Pode alterar preferências de cookies a qualquer momento nas definições do navegador e do armazenamento local.',
            ],
            links: [{ label: 'Termos e informação de cookies', href: context.termsHref }],
          },
        ],
        updatedLabel: 'Última atualização: 28 de fevereiro de 2026',
      },
      terms: {
        metaTitle: 'Termos de Serviço | Madeira Property Concierge',
        metaDescription: 'Termos que regulam o uso dos serviços e website da Madeira Property Concierge.',
        heroEyebrow: 'Legal',
        heroTitle: 'Termos de Serviço',
        heroSubtitle: 'Termos comerciais e operacionais aplicáveis ao website e à execução dos serviços.',
        sections: [
          {
            title: 'Informação Obrigatória do Prestador (Portugal)',
            body: 'Nos termos do Decreto-Lei n.º 7/2004 (artigo 10.º), disponibilizamos os elementos essenciais de identificação:',
            items: [
              `Firma/denominação: ${context.legalName}`,
              `Morada: ${context.address}`,
              `Email: ${context.email}`,
              `NIF: ${context.taxId}`,
              `Registo comercial: ${context.commercialRegistry}`,
            ],
          },
          {
            title: 'Âmbito de Serviço e Contratação',
            body: 'O escopo, entregáveis e prazos são definidos em proposta ou contrato de serviço específico.',
            items: [
              'A informação do website é informativa e não constitui proposta vinculativa automática.',
              'O contrato só produz efeitos após aceitação expressa das partes.',
            ],
          },
          {
            title: 'Honorários, Faturação e Tributos',
            body: 'Mensalidades e projetos são faturados conforme condições contratuais acordadas.',
            items: [
              'Custos de terceiros são discriminados separadamente quando aplicável.',
              'IVA e demais enquadramentos fiscais seguem a lei portuguesa e o regime de faturação aplicável.',
              'Qualquer encargo adicional obrigatório é comunicado antes da confirmação.',
            ],
          },
          {
            title: 'Livro de Reclamações e RAL',
            body: 'Operadores económicos com relação de consumo em Portugal devem disponibilizar canais de reclamação e informação sobre resolução alternativa de litígios.',
            items: [
              'O acesso ao Livro de Reclamações Eletrónico está disponível no portal oficial.',
              'A informação sobre entidades RAL está disponível no Portal do Consumidor.',
              'Quando aplicável, a entidade RAL competente deve ser identificada na documentação contratual.',
            ],
            links: [
              { label: 'Livro de Reclamações Eletrónico', href: context.complaintsBookUrl },
              { label: 'Entidades de RAL (Portal do Consumidor)', href: context.adrInfoUrl },
            ],
          },
          {
            title: 'Responsabilidade, Lei e Foro',
            body: 'Atuamos com diligência profissional e com parceiros locais validados. Limites de responsabilidade aplicam-se conforme contrato assinado.',
            items: [
              'Estes termos regem-se pela lei portuguesa.',
              'Salvo norma imperativa de proteção do consumidor em contrário, o foro competente é o do Funchal, Madeira.',
            ],
          },
          {
            title: 'Checklist de Publicação',
            body: 'Antes de publicar o website, confirme que os identificadores societários e fiscais desta página estão finais e corretos.',
            note: context.hasLegalPlaceholders
              ? 'Este website contém identificadores legais em formato provisório. Substitua-os pelos dados oficiais antes da publicação.'
              : undefined,
          },
        ],
        updatedLabel: 'Última atualização: 28 de fevereiro de 2026',
      },
    },
  } as const satisfies Record<Locale, Record<LegalPageType, LegalPageContent>>;

  return contentByLocale[lang][type];
}
