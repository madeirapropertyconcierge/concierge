export const routeMap = {
  en: {
    home: "/en/",
    services: "/en/services",
    about: "/en/about",
    howItWorks: "/en/how-it-works",
    pricing: "/en/pricing",
    blog: "/en/blog",
    contact: "/en/contact",
    faq: "/en/faq",
    guide: "/en/guide",
    privacy: "/en/privacy",
    terms: "/en/terms",
  },
  pt: {
    home: "/pt/",
    services: "/pt/servicos",
    about: "/pt/sobre",
    howItWorks: "/pt/como-funciona",
    pricing: "/pt/precos",
    blog: "/pt/blog",
    contact: "/pt/contacto",
    faq: "/pt/perguntas-frequentes",
    guide: "/pt/guia",
    privacy: "/pt/privacidade",
    terms: "/pt/termos",
  },
} as const;

export type RouteKey = keyof (typeof routeMap)["en"];

export function getAlternateRoute(currentPath: string, targetLocale: "en" | "pt"): string {
  const sourceLocale = currentPath.startsWith("/pt") ? "pt" : "en";
  const sourceRoutes = routeMap[sourceLocale];
  const targetRoutes = routeMap[targetLocale];

  for (const [key, path] of Object.entries(sourceRoutes)) {
    if (currentPath === path || currentPath === path + "/") {
      return targetRoutes[key as RouteKey];
    }
  }

  // For blog posts and dynamic routes, swap the locale prefix
  if (currentPath.startsWith(`/${sourceLocale}/`)) {
    return currentPath.replace(`/${sourceLocale}/`, `/${targetLocale}/`);
  }

  return targetRoutes.home;
}
