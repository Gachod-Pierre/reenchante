/**
 * Mapping des continents (ping IDs) vers les pays
 * Cette structure fait le lien entre les pings 3D et les données Supabase
 */
export const CONTINENT_COUNTRIES_MAP: Record<string, string[]> = {
  europe: [
    "France",
    "Germany",
    "United Kingdom",
    "Spain",
    "Italy",
    "Poland",
    "Netherlands",
    "Belgium",
    "Portugal",
    "Greece",
    "Austria",
    "Sweden",
    "Denmark",
    "Ireland",
    "Czech Republic",
  ],
  afrique: [
    "Nigeria",
    "Egypt",
    "South Africa",
    "Kenya",
    "Ethiopia",
    "Angola",
    "Ghana",
    "Morocco",
    "Cameroon",
    "Tanzania",
    "Uganda",
    "Sudan",
    "Côte d'Ivoire",
  ],
  asie: [
    "China",
    "India",
    "Japan",
    "Indonesia",
    "Pakistan",
    "Bangladesh",
    "Philippines",
    "Vietnam",
    "Thailand",
    "South Korea",
    "Myanmar",
    "Malaysia",
    "Singapore",
    "Afghanistan",
    "Iran",
  ],
  océanie: [
    "Australia",
    "New Zealand",
    "Fiji",
    "Papua New Guinea",
    "Solomon Islands",
  ],
  antarctique: [], // Pas de pays réels
  "amérique-nord": [
    "United States",
    "Canada",
    "Mexico",
    "Guatemala",
    "Belize",
    "El Salvador",
    "Honduras",
    "Nicaragua",
    "Costa Rica",
    "Panama",
  ],
  "amérique-sud": [
    "Brazil",
    "Colombia",
    "Argentina",
    "Peru",
    "Venezuela",
    "Chile",
    "Ecuador",
    "Bolivia",
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
