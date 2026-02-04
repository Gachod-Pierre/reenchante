// Logique des paliers de "réenchantement" et interpolation de couleurs

export interface Tier {
  threshold: number;
  label: string;
}

export interface TierState {
  tierIndex: number;
  tierProgress: number; // 0..1 dans le palier en cours
  currentThreshold: number;
  nextThreshold: number;
  currentLabel: string;
  nextLabel: string;
}

// Configuration des paliers
export const TIERS: Tier[] = [
  { threshold: 0, label: "Monde endormi" },
  { threshold: 1000, label: "Le ciel s'éclaircit" },
  { threshold: 3000, label: "Le soleil renaît" },
  { threshold: 7000, label: "L'herbe reverdit" },
  { threshold: 12000, label: "Les nuages deviennent doux" },
  { threshold: 20000, label: "Le paysage s'illumine" },
];

// Utilitaires math
export const clamp01 = (n: number): number => Math.max(0, Math.min(1, n));

export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

// Lerp couleur hex sans librairie externe
// Format: "#RRGGBB" -> interpole chaque canal RGB
export const lerpColorHex = (
  fromHex: string,
  toHex: string,
  t: number,
): string => {
  t = clamp01(t);

  // Parse hex to RGB
  const fromRgb = {
    r: parseInt(fromHex.slice(1, 3), 16),
    g: parseInt(fromHex.slice(3, 5), 16),
    b: parseInt(fromHex.slice(5, 7), 16),
  };

  const toRgb = {
    r: parseInt(toHex.slice(1, 3), 16),
    g: parseInt(toHex.slice(3, 5), 16),
    b: parseInt(toHex.slice(5, 7), 16),
  };

  // Lerp each channel
  const r = Math.round(lerp(fromRgb.r, toRgb.r, t));
  const g = Math.round(lerp(fromRgb.g, toRgb.g, t));
  const b = Math.round(lerp(fromRgb.b, toRgb.b, t));

  return `#${r.toString(16).padStart(2, "0")}${g.toString(16).padStart(2, "0")}${b.toString(16).padStart(2, "0")}`;
};

// Calcule l'état du palier en fonction des points
export const computeTier = (
  points: number,
  tiers: Tier[] = TIERS,
): TierState => {
  if (!tiers || tiers.length === 0) throw new Error("TIERS array is empty");

  let tierIndex = 0;

  // Trouver le palier actuel
  for (let i = tiers.length - 1; i >= 0; i--) {
    const tier = tiers[i];
    if (tier !== undefined && points >= tier.threshold) {
      tierIndex = i;
      break;
    }
  }

  // Calculer la progression dans le palier actuel
  const currentTier = tiers[tierIndex];
  if (currentTier === undefined)
    throw new Error(`Invalid tier index: ${tierIndex}`);

  const currentThreshold = currentTier.threshold;
  const nextTier =
    tierIndex < tiers.length - 1 ? tiers[tierIndex + 1] : undefined;
  const nextThreshold =
    nextTier !== undefined ? nextTier.threshold : currentTier.threshold + 10000;
  const tierProgress = clamp01(
    (points - currentThreshold) / (nextThreshold - currentThreshold),
  );

  const nextLabel = nextTier !== undefined ? nextTier.label : currentTier.label;

  return {
    tierIndex,
    tierProgress,
    currentThreshold,
    nextThreshold,
    currentLabel: currentTier.label,
    nextLabel,
  };
};

// Palette de couleurs pour chaque élément du décor
export interface ColorPalette {
  sky: string;
  sun: string;
  clouds: string;
  grass: string;
  soil: string;
  trees: string;
  foliage: string;
}

// Calcule la palette de couleurs en fonction des points
export const computePalette = (points: number): ColorPalette => {
  const tier = computeTier(points);
  const t = tier.tierProgress;

  // Debug logging
  if (points > 0) {
    console.log(
      `[computePalette] points=${points}, tierIndex=${tier.tierIndex}, tierProgress=${t.toFixed(2)}, label=${tier.currentLabel}`,
    );
  }

  // Couleurs "ternies" - vraiment grises et ternes (palier 0 = monde endormi)
  const grayedSky = "#808080"; // gris neutre
  const grayedSun = "#999999"; // gris clair
  const grayedClouds = "#a0a0a0"; // gris
  const grayedGrass = "#6b6b6b"; // gris foncé
  const grayedSoil = "#757575"; // gris moyen
  const grayedTrees = "#5a5a5a"; // gris très foncé
  const grayedFoliage = "#696969"; // gris foncé

  // Couleurs "réenchantées"
  const vividSky = "#87ceeb";
  const vividSun = "#ff69b4";
  const vividClouds = "#ffe4f1";
  const vividGrass = "#22dd88";
  const vividSoil = "#d2a25f";
  const vividFoliage = "#22dd88";

  // Récupérer les couleurs interpolées en fonction du palier
  let sky = grayedSky;
  let sun = grayedSun;
  let clouds = grayedClouds;
  let grass = grayedGrass;
  let soil = grayedSoil;
  let trees = grayedTrees;
  let foliage = grayedFoliage;

  // Palier 0->1 : ciel s'éclaircit
  // Commence dès qu'on franchit le seuil (tierIndex >= 1)
  if (tier.tierIndex >= 1) {
    const skyT = tier.tierIndex > 1 ? 1 : clamp01(t + 0.8); // Boost à 0.8 pour rendre la couleur visible immédiatement
    sky = lerpColorHex(grayedSky, vividSky, skyT);
  }

  // Palier 1->2 : soleil renaît
  if (tier.tierIndex >= 2) {
    const sunT = tier.tierIndex > 2 ? 1 : clamp01(t + 0.8);
    sun = lerpColorHex(grayedSun, vividSun, sunT);
  }

  // Palier 2->3 : herbe reverdit
  if (tier.tierIndex >= 3) {
    const grassT = tier.tierIndex > 3 ? 1 : clamp01(t + 0.8);
    grass = lerpColorHex(grayedGrass, vividGrass, grassT);
    foliage = lerpColorHex(grayedFoliage, vividFoliage, grassT);
  }

  // Palier 3->4 : nuages deviennent doux
  if (tier.tierIndex >= 4) {
    const cloudsT = tier.tierIndex > 4 ? 1 : clamp01(t + 0.8);
    clouds = lerpColorHex(grayedClouds, vividClouds, cloudsT);
  }

  // Palier 4->5 : magie globale (hausse saturation générale)
  if (tier.tierIndex >= 5) {
    const soilT = tier.tierIndex > 5 ? 1 : clamp01(t + 0.8);
    soil = lerpColorHex(grayedSoil, vividSoil, soilT);
    trees = lerpColorHex(grayedTrees, "#8b7355", soilT);
  }

  return {
    sky,
    sun,
    clouds,
    grass,
    soil,
    trees,
    foliage,
  };
};

export const useEnchantTiers = () => {
  return {
    TIERS,
    computeTier,
    computePalette,
    lerpColorHex,
    clamp01,
    lerp,
  };
};
