/**
 * Mapping des continents (ping IDs) vers les pays
 * Cette structure fait le lien entre les pings 3D et les données Supabase
 */
export const CONTINENT_COUNTRIES_MAP: Record<string, string[]> = {
  europe: [
    "France",
    "Allemagne",
    "Royaume-Uni",
    "Espagne",
    "Italie",
    "Pologne",
    "Pays-Bas",
    "Belgique",
    "Portugal",
    "Grèce",
    "Autriche",
    "Suède",
    "Danemark",
    "Irlande",
    "République Tchèque",
  ],
  afrique: [
    "Nigéria",
    "Égypte",
    "Afrique du Sud",
    "Kenya",
    "Éthiopie",
    "Angola",
    "Ghana",
    "Maroc",
    "Cameroun",
    "Tanzanie",
    "Ouganda",
    "Soudan",
    "Côte d'Ivoire",
  ],
  asie: [
    "Chine",
    "Inde",
    "Japon",
    "Indonésie",
    "Pakistan",
    "Bangladesh",
    "Philippines",
    "Viêt Nam",
    "Thaïlande",
    "Corée du Sud",
    "Birmanie",
    "Malaisie",
    "Singapour",
    "Afghanistan",
    "Iran",
  ],
  océanie: [
    "Australie",
    "Nouvelle-Zélande",
    "Fidji",
    "Papouasie-Nouvelle-Guinée",
    "Îles Salomon",
  ],
  antarctique: [], // Pas de pays réels
  "amérique-nord": [
    "États-Unis",
    "Canada",
    "Mexique",
    "Guatemala",
    "Belize",
    "El Salvador",
    "Honduras",
    "Nicaragua",
    "Costa Rica",
    "Panama",
  ],
  "amérique-sud": [
    "Brésil",
    "Colombie",
    "Argentine",
    "Pérou",
    "Venezuela",
    "Chili",
    "Équateur",
    "Bolivie",
    "Paraguay",
    "Uruguay",
    "Guyana",
    "Suriname",
  ],
};

export function useContinentCountries() {
  /**
   * Récupère les pays associés à un continent
   */
  const getCountriesByContinent = (continentId: string): string[] => {
    return CONTINENT_COUNTRIES_MAP[continentId] || [];
  };

  /**
   * Récupère le nom affichable du continent
   */
  const getContinentName = (continentId: string): string => {
    const names: Record<string, string> = {
      europe: "Europe",
      afrique: "Afrique",
      asie: "Asie",
      océanie: "Océanie",
      antarctique: "Antarctique",
      "amérique-nord": "Amérique du Nord",
      "amérique-sud": "Amérique du Sud",
    };
    return names[continentId] || continentId;
  };

  return {
    getCountriesByContinent,
    getContinentName,
    CONTINENT_COUNTRIES_MAP,
  };
}
