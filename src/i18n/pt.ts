import en from "./en";
import { getContactServiceLabels } from "../lib/pageContent/packages";

const contactServiceOptions = getContactServiceLabels("pt");

const pt = {
  // Site-wide
  site: {
    title: "Madeira Property Concierge",
    description: "Hosting boutique e cuidado de propriedade na Madeira para proprietários no estrangeiro que querem tranquilidade. Suporte bilingue EN/PT e execução liderada pela fundadora.",
  },

  // Navigation
  nav: {
    home: "Início",
    services: "Serviços",
    about: "Sobre",
    howItWorks: "Como Funciona",
    pricing: "Preços",
    blog: "Blog",
    contact: "Contacto",
    faq: "FAQ",
    guide: "Guia AL",
    cta: "Marcar Chamada de Diagnóstico",
    languageToggle: "EN",
  },

  testimonials: {
    title: "O Que Dizem os Nossos Clientes",
    subtitle: "O que dizem os proprietários com quem trabalhamos.",
  },

  // Footer
  footer: {
    description: "Hosting boutique e cuidado de propriedade na Madeira para proprietários no estrangeiro que procuram um parceiro local de confiança.",
    services: "Serviços",
    company: "Empresa",
    legal: "Legal",
    contact: "Contacto",
    privacy: "Política de Privacidade",
    terms: "Termos de Serviço",
    copyright: "© 2025 Madeira Property Concierge. Todos os direitos reservados.",
    madeWith: "Feito com carinho no Funchal, Madeira",
  },

  // Services page
  services: {
    title: "Os Nossos Serviços",
    metaTitle: "Serviços de Gestão de Propriedades | Madeira Property Concierge",
    metaDescription: "Pacotes de servico na Madeira para proprietarios no estrangeiro: Cuidados Essenciais, Gestao Assistida, Cuidados Premium, Revenue & Hosting, Servicos Sob Pedido e add-ons opcionais.",
    hero: {
      title: "Gestão de Propriedades Que Funciona",
      subtitle: "Cada serviço é pensado para o seu imóvel e para a forma como quer geri-lo.",
    },
  },

  // About page
  about: {
    title: "Sobre a Lisa",
    metaTitle: "Sobre a Lisa | Madeira Property Concierge",
    metaDescription: "Conheça a Lisa, fundadora da Madeira Property Concierge. Experiência em UX, bilingue EN/PT, raízes madeirenses e 3+ anos a viver na ilha.",
    hero: {
      title: "Com Quem Vai Trabalhar",
      subtitle: "Uma pessoa gere tudo. Vai saber sempre quem é responsável.",
    },
    story: {
      title: "A Minha História",
      p1: "Sou a Lisa. Os meus pais são da Madeira, e grande parte da minha família continua aqui. Emigraram para o Canadá, onde nasci e cresci, e mais tarde construí a minha carreira em Londres a liderar equipas de UX.",
      p2: "Depois de a minha filha nascer, senti um forte chamamento às nossas raízes e voltei para a Madeira. A viver na ilha, construí uma rede local de confiança e continuei a ver o mesmo padrão para quem vive fora: falhas de comunicação, qualidade irregular e custos inesperados.",
      p3: "Já fazia a gestão de duas propriedades da família na Madeira e percebi que era o momento certo para expandir. Foi por isso que fundei a Madeira Property Concierge: um serviço pequeno, liderado pela fundadora, com níveis claros, relatórios claros e uma pessoa a quem pode pedir responsabilidades.",
    },
    whyDifferent: {
      title: "Porque Sou Diferente",
      bilingual: {
        title: "Verdadeiramente Bilingue",
        description: "Inglês e Português nativos. Trato das diferenças culturais que causam mal-entendidos caros entre proprietários e fornecedores locais.",
      },
      design: {
        title: "Abordagem Design Thinking",
        description: "15 anos em UX significam que deteto o que vai falhar antes de ser problema, e crio processos que se mantêm.",
      },
      personal: {
        title: "Pessoalmente Investida",
        description: "Vivo na Madeira e crio aqui a minha filha. A minha reputação é local, visível e diretamente ligada aos seus resultados.",
      },
      network: {
        title: "Rede Local Madeirense",
        description: "Raízes familiares e anos de relações locais. Recebe fornecedores validados com padrões claros e documentação.",
      },
    },
    promise: {
      title: "A Minha Promessa",
      text: "Trato cada propriedade como se fosse minha. Aviso antes dos problemas crescerem e não corto nos cantos. Se algo correr mal, vai ouvir primeiro de mim, com uma solução já a caminho.",
    },
  },

  // How It Works page
  howItWorks: {
    title: "Como Funciona",
    metaTitle: "Como Funciona | Madeira Property Concierge",
    metaDescription: "Integração e operação lideradas pela fundadora: chamada de diagnóstico, auditoria do imóvel, setup e gestão mensal com SLAs claros.",
    hero: {
      title: "Direto do Início ao Fim",
      subtitle: "Da primeira chamada à gestão completa, eis o que esperar.",
    },
    steps: {
      step1: {
        title: "Chamada de Diagnóstico",
        description: "Começamos com uma chamada de 30 minutos para mapear objetivos, risco e modelo operacional do imóvel.",
      },
      step2: {
        title: "Auditoria de Imóvel e Risco",
        description: "Avaliamos a condicao do imovel, lacunas de conformidade, estrutura de fornecedores e o pacote mais adequado a forma como a propriedade e usada.",
      },
      step3: {
        title: "Setup de Sistemas",
        description: "Ativamos fluxos operacionais, templates de comunicação, padrões de fornecedores e rotinas de reporte.",
      },
      step4: {
        title: "Operação Mensal",
        description: "Recebe relatório mensal, log de manutenção e suporte por SLA com um único ponto de contacto responsável.",
      },
    },
  },

  // Pricing page
  pricing: {
    title: "Preços",
    metaTitle: "Preços | Madeira Property Concierge",
    metaDescription: "Precos transparentes por pacote: Cuidados Essenciais a EUR95/mes, Gestao Assistida a EUR95/mes mais suporte de turnover, Cuidados Premium a EUR140/mes, Revenue & Hosting a EUR95/mes mais revenue share, e apoio sob pedido desde EUR35/hora.",
    hero: {
      title: "Preços Claros, Sem Surpresas",
      subtitle: "Sem taxas ocultas. Escolha o nível que se adequa ao que precisa.",
    },
    popular: "Mais Popular",
    perMonth: "/mês",
    getStarted: "Começar",
    contactUs: "Contacte-nos",
  },

  // FAQ page
  faq: {
    title: "Perguntas Frequentes",
    metaTitle: "FAQ | Madeira Property Concierge",
    metaDescription: "Perguntas frequentes sobre propriedade a distancia na Madeira, pacotes de servico, apoio de conformidade AL, SLAs e integracao.",
  },

  // Contact page
  contact: {
    title: "Contacte-nos",
    metaTitle: "Contacto | Madeira Property Concierge",
    metaDescription: "Marque uma chamada de diagnóstico para o seu imóvel na Madeira. Apoiamos proprietários no estrangeiro com operação bilingue EN/PT e execução local.",
    hero: {
      title: "Vamos Falar Sobre a Sua Propriedade",
      subtitle: "Marque uma consulta gratuita de 30 minutos ou envie-nos uma mensagem. Respondemos normalmente em 24 horas.",
    },
    form: {
      name: "Nome Completo",
      email: "Endereço de Email",
      phone: "Telefone / WhatsApp (opcional)",
      propertyType: "Tipo de Propriedade",
      propertyTypes: {
        apartment: "Apartamento",
        villa: "Moradia / Casa",
        commercial: "Comercial",
        land: "Terreno",
        other: "Outro",
      },
      service: "Serviço de Interesse",
      serviceOptions: {
        essentialCare: contactServiceOptions.essentialCare,
        managedCare: contactServiceOptions.managedCare,
        premiumCare: contactServiceOptions.premiumCare,
        revenueHosting: contactServiceOptions.revenueHosting,
        onDemand: contactServiceOptions.onDemand,
        addOns: contactServiceOptions.addOns,
        notSure: "Ainda Não Tenho a Certeza",
      },
      message: "Conte-nos sobre a sua propriedade e necessidades",
      submit: "Enviar Mensagem",
      sending: "A enviar...",
      success: "Mensagem enviada! Responderemos em 24 horas.",
      error: "Algo correu mal. Por favor tente novamente ou envie-nos email diretamente.",
    },
    directContact: {
      title: "Ou Contacte-nos Diretamente",
      email: "Email",
      phone: "Telefone",
      whatsapp: "WhatsApp",
      location: "Localização",
      hours: "Disponível Seg–Sáb, 9h–18h WET",
    },
  },

  // Guide page
  guide: {
    title: "Guia Alojamento Local",
    metaTitle: "Guia Completo de Licenciamento AL na Madeira | Madeira Property Concierge",
    metaDescription: "O guia completo para licenciamento de Alojamento Local na Ilha da Madeira. Requisitos, processo, custos e dicas de especialistas.",
  },

  // Blog
  blog: {
    title: "Blog",
    metaTitle: "Blog | Madeira Property Concierge",
    metaDescription: "Artigos práticos sobre gestão de propriedades na Madeira, licenciamento AL, investimento e vida na ilha.",
    readMore: "Ler Mais",
    publishedOn: "Publicado em",
    backToBlog: "← Voltar ao Blog",
  },

  // Common
  common: {
    learnMore: "Saber Mais",
    getStarted: "Começar",
    bookConsultation: "Marcar Chamada de Diagnóstico",
    viewServices: "Ver Serviços",
    readMore: "Ler Mais",
    backToTop: "Voltar ao topo",
  },

  // Cookie Consent
  cookies: {
    message: "Utilizamos cookies essenciais para o funcionamento do website. Cookies opcionais de analítica ou marketing só são usados após o seu consentimento explícito.",
    accept: "Aceitar",
    decline: "Recusar",
    learnMore: "Saber Mais",
  },

  // 404
  notFound: {
    title: "Página Não Encontrada",
    description: "A página que procura não existe ou foi movida.",
    cta: "Ir para o Início",
  },
} as const;

export default pt;
