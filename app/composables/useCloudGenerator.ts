import { ref } from "vue";

export interface Cloud {
  position: [number, number, number];
  rotation: [number, number, number];
  scale: number;
  opacity: number;
  color?: string; // Couleur pour debug
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
        color: "#ff0000", // Layer 1 - RED
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
        color: "#ff0000", // Layer 1 - RED
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

    // COUCHE 4: Moyen (Z: -4 à 2) - Plus visible
    const layer4X = [-24, -16, -8, 0, 8, 16, 24];
    for (let i = 0; i < layer4X.length; i++) {
      const baseSeed = i * 1000 + 5000;
      const xVariation = seededRandom(baseSeed) * 2.5 - 1.25;
      const yVariation = seededRandom(baseSeed + 1) * 0.6 - 0.3;
      const zVariation = seededRandom(baseSeed + 2) * 1.5;
      const x = layer4X[i]!;

      generatedClouds.push({
        position: [x + xVariation, -2.8 + yVariation, -4 + zVariation],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 2.1 + seededRandom(baseSeed + 6) * 0.3,
        opacity: 0.65 + seededRandom(baseSeed + 7) * 0.15,
      });
    }

    // Ajouter plus de nuages à la couche 4
    for (let i = 0; i < 18; i++) {
      const baseSeed = i * 1000 + 5100;
      generatedClouds.push({
        position: [
          seededRandom(baseSeed) * 70 - 35,
          -2.8 + seededRandom(baseSeed + 1) * 2,
          -4 + seededRandom(baseSeed + 2) * 2,
        ],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 2.0 + seededRandom(baseSeed + 6) * 0.35,
        opacity: 0.6 + seededRandom(baseSeed + 7) * 0.2,
      });
    }

    // COUCHE 5: Proche (Z: 3 à 8) - Très visible, cache le bas de la planète
    const layer5X = [-22, -14, -6, 2, 10, 18, 26];
    for (let i = 0; i < layer5X.length; i++) {
      const baseSeed = i * 1000 + 6000;
      const xVariation = seededRandom(baseSeed) * 2 - 1;
      const yVariation = seededRandom(baseSeed + 1) * 0.5 - 0.25;
      const zVariation = seededRandom(baseSeed + 2) * 1.5;
      const x = layer5X[i]!;

      generatedClouds.push({
        position: [x + xVariation, -2.9 + yVariation, 3 + zVariation],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 2.25 + seededRandom(baseSeed + 6) * 0.35,
        opacity: 0.75 + seededRandom(baseSeed + 7) * 0.15,
      });
    }

    // Ajouter plus de nuages à la couche 5 (foreground principal)
    for (let i = 0; i < 20; i++) {
      const baseSeed = i * 1000 + 6100;
      generatedClouds.push({
        position: [
          seededRandom(baseSeed) * 75 - 37.5,
          -2.9 + seededRandom(baseSeed + 1) * 2.2,
          3 + seededRandom(baseSeed + 2) * 2.5,
        ],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 2.2 + seededRandom(baseSeed + 6) * 0.4,
        opacity: 0.7 + seededRandom(baseSeed + 7) * 0.25,
      });
    }

    

    // COUCHE 6: Très proche (Z: 5 à 8) - Visible et cache la planète
    for (let i = 0; i < 12; i++) {
      const baseSeed = i * 1000 + 7000;
      generatedClouds.push({
        position: [
          seededRandom(baseSeed) * 80 - 40,
          -3 + seededRandom(baseSeed + 1) * 2,
          5 + seededRandom(baseSeed + 2) * 3,
        ],
        rotation: [
          seededRandom(baseSeed + 3) * Math.PI,
          seededRandom(baseSeed + 4) * Math.PI,
          seededRandom(baseSeed + 5) * Math.PI,
        ],
        scale: 2.4 + seededRandom(baseSeed + 6) * 0.4,
        opacity: 0.8 + seededRandom(baseSeed + 7) * 0.15,
      });
    }

    return generatedClouds;
  };;

  /**
   * Ajoute les couleurs de debug à chaque nuage par couche
   */
  const addDebugColors = (clouds: Cloud[]): Cloud[] => {
    const colors = [
      "#ff0000",
      "#00ff00",
      "#0000ff",
      "#ffff00",
      "#ff00ff",
      "#00ffff",
      "#ff8800",
      "#ff00ff",
    ];
    let colorIndex = 0;
    let currentLayer = -Infinity;
    let nextZ = -Infinity;

    // Grouper par Z et attribuer des couleurs
    const sortedByZ = [...clouds].sort((a, b) => a.position[2] - b.position[2]);

    sortedByZ.forEach((cloud, idx) => {
      // Changer de couleur tous les ~30 nuages (correspond à peu près à une couche)
      if (idx % 30 === 0 && idx > 0) {
        colorIndex = (colorIndex + 1) % colors.length;
      }
      cloud.color = colors[colorIndex];
    });

    return clouds;
  };

  /**
   * Initialise les nuages
   */
  const initializeClouds = () => {
    clouds.value = addDebugColors(generateClouds());
  };

  return {
    clouds,
    initializeClouds,
  };
};
