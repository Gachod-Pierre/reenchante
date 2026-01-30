import { ref } from "vue";

export interface Cloud {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  opacity: number;
}

/**
 * Generateur de nombre pseudo-aleatoire seeded pour reproducibilité
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed) * 10000;
  return x - Math.floor(x);
}

/**
 * Composable pour générer et gérer les nuages de manière procédurale
 */
export const useCloudGenerator = () => {
  const clouds = ref<Cloud[]>([]);

  /**
   * Génération procédurale des nuages (optimisée avec InstancedMesh)
   */
  const generateClouds = (): Cloud[] => {
    const generatedClouds: Cloud[] = [];

    // COUCHE 1: Très loin (Z: -25 à -20)
    const layer1X = [-28, -20, -12, -4, 4, 12, 20, 28];
    for (let i = 0; i < layer1X.length; i++) {
      const baseSeed = i * 1000 + 1;
      const xVariation = seededRandom(baseSeed) * 4 - 2;
      const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
      const zVariation = seededRandom(baseSeed + 2) * 2;
      const x = layer1X[i]!;

      generatedClouds.push({
        position: [x + xVariation, -2.5 + yVariation, -24 + zVariation],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 1.75 + seededRandom(baseSeed + 6) * 0.2,
        opacity: 0.35 + seededRandom(baseSeed + 7) * 0.1,
      });
    }

    // Ajouter des nuages supplémentaires pour la couche 1
    for (let i = 0; i < 10; i++) {
      const baseSeed = i * 1000 + 2000;
      generatedClouds.push({
        position: [
          seededRandom(baseSeed) * 56 - 28,
          -2.5 + seededRandom(baseSeed + 1) * 1.2,
          -25 + seededRandom(baseSeed + 2) * 3,
        ],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 1.7 + seededRandom(baseSeed + 6) * 0.25,
        opacity: 0.32 + seededRandom(baseSeed + 7) * 0.12,
      });
    }

    // Ajouter plus de nuages à gauche pour la couche 1
    for (let i = 0; i < 6; i++) {
      const baseSeed = i * 1000 + 2100;
      generatedClouds.push({
        position: [
          seededRandom(baseSeed) * 20 - 35,
          -2.5 + seededRandom(baseSeed + 1) * 1.2,
          -25 + seededRandom(baseSeed + 2) * 3,
        ],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 1.75 + seededRandom(baseSeed + 6) * 0.2,
        opacity: 0.33 + seededRandom(baseSeed + 7) * 0.1,
      });
    }

    // COUCHE 2: Très loin (Z: -18 à -14)
    const layer2X = [-30, -22, -14, -6, 2, 10, 18, 26];
    for (let i = 0; i < layer2X.length; i++) {
      const baseSeed = i * 1000 + 3000;
      const xVariation = seededRandom(baseSeed) * 4 - 2;
      const yVariation = seededRandom(baseSeed + 1) * 1 - 0.5;
      const zVariation = seededRandom(baseSeed + 2) * 1.5;
      const x = layer2X[i]!;

      generatedClouds.push({
        position: [x + xVariation, -2.6 + yVariation, -18 + zVariation],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 1.8 + seededRandom(baseSeed + 6) * 0.22,
        opacity: 0.45 + seededRandom(baseSeed + 7) * 0.12,
      });
    }

    // Ajouter plus de nuages à la couche 2
    for (let i = 0; i < 12; i++) {
      const baseSeed = i * 1000 + 3100;
      generatedClouds.push({
        position: [
          seededRandom(baseSeed) * 60 - 30,
          -2.6 + seededRandom(baseSeed + 1) * 1.5,
          -18 + seededRandom(baseSeed + 2) * 2,
        ],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 1.75 + seededRandom(baseSeed + 6) * 0.25,
        opacity: 0.4 + seededRandom(baseSeed + 7) * 0.15,
      });
    }

    // COUCHE 3: Loin (Z: -12 à -8)
    const layer3X = [-26, -18, -10, -2, 6, 14, 22, 30];
    for (let i = 0; i < layer3X.length; i++) {
      const baseSeed = i * 1000 + 4000;
      const xVariation = seededRandom(baseSeed) * 3 - 1.5;
      const yVariation = seededRandom(baseSeed + 1) * 0.8 - 0.4;
      const zVariation = seededRandom(baseSeed + 2) * 1.2;
      const x = layer3X[i]!;

      generatedClouds.push({
        position: [x + xVariation, -2.7 + yVariation, -12 + zVariation],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 1.9 + seededRandom(baseSeed + 6) * 0.25,
        opacity: 0.55 + seededRandom(baseSeed + 7) * 0.15,
      });
    }

    // Ajouter plus de nuages à la couche 3
    for (let i = 0; i < 15; i++) {
      const baseSeed = i * 1000 + 4100;
      generatedClouds.push({
        position: [
          seededRandom(baseSeed) * 64 - 32,
          -2.7 + seededRandom(baseSeed + 1) * 1.8,
          -12 + seededRandom(baseSeed + 2) * 1.5,
        ],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 1.85 + seededRandom(baseSeed + 6) * 0.3,
        opacity: 0.5 + seededRandom(baseSeed + 7) * 0.2,
      });
    }

    return generatedClouds;
  };

  /**
   * Initialise les nuages
   */
  const initializeClouds = () => {
    clouds.value = generateClouds();
  };

  return {
    clouds,
    initializeClouds,
  };
};
