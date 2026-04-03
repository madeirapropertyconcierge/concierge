export interface MadeiraImage {
  label: string;
  src: string;
  alt: string;
}

export const madeiraImages = {
  cliffsPeninsula: {
    label: 'Ponta de Sao Lourenco Cliffs',
    src: '/images/madeira/green-ridges.webp',
    alt: 'Cliffs and blue Atlantic water at Ponta de Sao Lourenco in Madeira',
  },
  coastSunsetAerial: {
    label: 'Madeira Coastal Viewpoint',
    src: '/images/madeira/coastal-viewpoint.webp',
    alt: 'Steep viewpoint above the Atlantic coastline in Madeira',
  },
  yachtCoastline: {
    label: 'Madeira Sailboat Coastline',
    src: '/images/madeira/sailboat-cliffs.webp',
    alt: 'Atlantic coastline with a small sailboat below steep cliffs in Madeira',
  },
  funchalBayBoats: {
    label: 'Funchal Bay Hillside',
    src: '/images/madeira/funchal-bay.webp',
    alt: 'Funchal hillside homes overlooking the bay in Madeira',
  },
  mountainRiverValley: {
    label: 'Madeira Valley Villages',
    src: '/images/library/1773415852020-img-0202.webp',
    alt: 'Green valley villages under low clouds in Madeira',
  },
  villageAerialShadow: {
    label: 'Terraced Valley Village',
    src: '/images/library/1773413290313-img-1407.webp',
    alt: 'Terraced valley village surrounded by green mountains in Madeira',
  },
  villageRuggedMountains: {
    label: 'Mountain Village',
    src: '/images/madeira/mountain-village.webp',
    alt: 'Mountain village nestled between steep cliffs in Madeira',
  },
  tobogganRideFunchal: {
    label: 'Madeira Bay View',
    src: '/images/madeira/funchal-bay.webp',
    alt: 'Bay view over hillside homes in Madeira',
  },
  machicoFireFestival: {
    label: 'Sunlit Madeira Cliffs',
    src: '/images/library/img-5830.webp',
    alt: 'Sunlit cliffs and ocean mist on the Madeira coast',
  },
  mercadoMural: {
    label: 'Funchal Hillside and Bay',
    src: '/images/madeira/funchal-bay.webp',
    alt: 'Funchal hillside homes overlooking the bay in Madeira',
  },
  fruitMarketStalls: {
    label: 'Madeira Seaside Village',
    src: '/images/library/img-0919.webp',
    alt: 'Seaside village and sheltered bay on the Madeira coast',
  },
  treeFramedValleyTown: {
    label: 'Madeira Mountain Town',
    src: '/images/madeira/mountain-village.webp',
    alt: 'Mountain village nestled between steep cliffs in Madeira',
  },
  saoVicenteCoast: {
    label: 'Madeira Coastal Path',
    src: '/images/library/img-0747.webp',
    alt: 'Coastal path descending toward the Atlantic in Madeira',
  },
  vineyardCoastalVillage: {
    label: 'Madeira Coastal Village',
    src: '/images/library/img-0919.webp',
    alt: 'Seaside village and sheltered bay on the Madeira coast',
  },
  oceanfrontBench: {
    label: 'Madeira Coastal Path View',
    src: '/images/library/img-0747.webp',
    alt: 'Coastal path descending toward the Atlantic in Madeira',
  },
  pontaHikers: {
    label: 'Ponta de Sao Lourenco View',
    src: '/images/madeira/green-ridges.webp',
    alt: 'Cliffs and blue Atlantic water at Ponta de Sao Lourenco in Madeira',
  },
  hillsideHomes: {
    label: 'Madeira Hillside Homes',
    src: '/images/madeira/funchal-bay.webp',
    alt: 'Funchal hillside homes overlooking the bay in Madeira',
  },
  coastalVillageAerial: {
    label: 'Madeira Coastal Village Road',
    src: '/images/library/img-7941.webp',
    alt: 'Coastal road leading toward the Atlantic in Madeira',
  },
  santanaHouseFacade: {
    label: 'Madeira Valley Homes',
    src: '/images/library/1773413290313-img-1407.webp',
    alt: 'Terraced valley village surrounded by green mountains in Madeira',
  },
  santanaCottageGarden: {
    label: 'Madeira Valley Outlook',
    src: '/images/library/1773415852020-img-0202.webp',
    alt: 'Green valley villages under low clouds in Madeira',
  },
} as const satisfies Record<string, MadeiraImage>;
