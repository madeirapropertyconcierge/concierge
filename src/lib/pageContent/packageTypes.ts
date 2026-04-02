export const servicePackageKeys = [
  'essentialCare',
  'managedCare',
  'premiumCare',
  'revenueHosting',
  'onDemand',
  'addOns',
] as const;

export type SiteLocale = 'en' | 'pt';
export type ServicePackageKey = (typeof servicePackageKeys)[number];
