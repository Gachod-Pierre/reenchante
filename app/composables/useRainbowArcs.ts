import { ref } from "vue";
import * as THREE from "three";

export interface RainbowArc {
  geometry: THREE.BufferGeometry;
  color: string;
}

export function useRainbowArcs() {
  const rainbowArcs = ref<RainbowArc[]>([]);

  const createRainbowArcs = (windowWidth: number): RainbowArc[] => {
    // Disposer les anciennes géométries pour éviter les fuites mémoire
    rainbowArcs.value.forEach((arc) => {
      arc.geometry.dispose();
    });

    const rainbowColors = [
      "#FF0000", // Rouge
      "#FF7F00", // Orange
      "#FFFF00", // Jaune
      "#00FF00", // Vert
      "#0000FF", // Bleu
      "#4B0082", // Indigo
      "#9400D3", // Violet
    ];

    // Paramètres responsifs
    const isMobile = windowWidth < 768;
    const arcHeight = isMobile ? 5.5 : 7.5;
    const arcWidth = isMobile ? 32 : 48;
    const yStartOffset = isMobile ? -1.5 : -1.5;
    const zPosition = isMobile ? -8 : -8;

    const arcs = rainbowColors.map((color, index) => {
      const segments = 32;
      const points: THREE.Vector3[] = [];

      const yOffset = yStartOffset + index * 0.3;

      for (let i = 0; i <= segments; i++) {
        const t = i / segments;
        const angle = t * Math.PI;
        const x = (t - 0.5) * arcWidth;
        const y = Math.sin(angle) * arcHeight + yOffset;
        const z = zPosition;
        points.push(new THREE.Vector3(x, y, z));
      }

      const curve = new THREE.CatmullRomCurve3(points);
      const tubeGeometry = new THREE.TubeGeometry(curve, 32, 0.3, 4, false);

      return { geometry: tubeGeometry, color };
    });

    return arcs;
  };

  const updateRainbowArcs = (windowWidth: number) => {
    rainbowArcs.value = createRainbowArcs(windowWidth);
  };

  const dispose = () => {
    rainbowArcs.value.forEach((arc) => {
      arc.geometry.dispose();
    });
    rainbowArcs.value = [];
  };

  return {
    rainbowArcs,
    updateRainbowArcs,
    dispose,
  };
}
