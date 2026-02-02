import { ref, computed } from "vue";
import * as THREE from "three";

export function useSceneAnimation() {
  // ✅ Variables réactives pour les animations d'entrée (fade in)
  const loadingProgress = ref(0); // Valeur 0 à 1, montera progressivement
  const hasLoadingFinished = ref(false); // True quand l'animation de fade est terminée
  const oscillationTime = ref(0); // Temps pour les oscillations
  let loadingStartTime = 0;
  let animationFrameId: number | null = null;
  let renderLoopCallback: (() => void) | null = null;

  // ✅ Opacités animées avec délais échelonnés
  const sunOpacity = computed(() => {
    const delay = 0.04; // 100ms
    const duration = 0.32; // 400ms
    const progress = Math.max(0, (loadingProgress.value - delay) / duration);
    return Math.min(1, progress);
  });

  const planetOpacity = computed(() => {
    const delay = 0; // La planète démarre immédiatement
    const duration = 0.2; // 300ms / durée totale
    const progress = Math.max(0, (loadingProgress.value - delay) / duration);
    return Math.min(1, progress);
  });

  const rainbowOpacity = computed(() => {
    const delay = 0.2; // 200ms
    const duration = 0.4; // 500ms
    const progress = Math.max(0, (loadingProgress.value - delay) / duration);
    return Math.min(1, progress);
  });

  const cloudsOpacity = computed(() => {
    const delay = 0.04; // 350ms
    const duration = 0.2; // 600ms
    const progress = Math.max(0, (loadingProgress.value - delay) / duration);
    return Math.min(1, progress);
  });

  const pingsOpacity = computed(() => {
    const delay = 0; // Démarre immédiatement comme la planète
    const duration = 0.3; // 300ms / durée totale (même que planète)
    const progress = Math.max(0, (loadingProgress.value - delay) / duration);
    return Math.min(1, progress);
  });

  // ✅ Initialiser l'animation et la boucle de rendering
  const startAnimation = (
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    gltf: { scene?: any } | null | undefined,
    onRenderFrame: (elapsedTime: number, progress: number) => void,
  ) => {
    if (animationFrameId !== null) return;
    loadingStartTime = performance.now();

    // ✅ Appliquer opacity à tous les matériaux du GLB
    if (gltf?.scene) {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      gltf.scene.traverse((child: any) => {
        if (child instanceof THREE.Mesh && child.material) {
          if (Array.isArray(child.material)) {
            child.material.forEach((mat) => {
              if (mat instanceof THREE.Material) {
                mat.transparent = true;
              }
            });
          } else if (child.material instanceof THREE.Material) {
            child.material.transparent = true;
          }
        }
      });
    }

    // Créer la callback d'animation
    renderLoopCallback = () => {
      const frameStart = performance.now();

      // ✅ Animer le fade in progressif (0 → 1 en 2.5 secondes)
      const elapsedTime = frameStart - loadingStartTime;
      const progress = Math.min(1, elapsedTime / 2500);
      loadingProgress.value = progress;

      // ✅ Marquer l'animation comme terminée quand on atteint 100%
      if (progress === 1 && !hasLoadingFinished.value) {
        hasLoadingFinished.value = true;
      }

      // ✅ Mettre à jour le temps d'oscillation (commence immédiatement)
      oscillationTime.value += 0.016; // ~60fps

      // ✅ Appliquer planetOpacity aux matériaux du GLB
      if (gltf?.scene) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        gltf?.scene?.traverse((child: any) => {
          if (child instanceof THREE.Mesh && child.material) {
            const opacityValue = planetOpacity.value;
            if (Array.isArray(child.material)) {
              child.material.forEach((mat) => {
                if (mat instanceof THREE.Material) {
                  mat.opacity = opacityValue;
                }
              });
            } else if (child.material instanceof THREE.Material) {
              child.material.opacity = opacityValue;
            }
          }
        });
      }

      // ✅ Appeler la callback personnalisée pour la rotation et autres updates
      onRenderFrame(elapsedTime, progress);
    };
  };

  const stopAnimation = () => {
    if (animationFrameId !== null) {
      cancelAnimationFrame(animationFrameId);
      animationFrameId = null;
    }
    renderLoopCallback = null;
  };

  return {
    loadingProgress,
    hasLoadingFinished,
    oscillationTime,
    sunOpacity,
    planetOpacity,
    rainbowOpacity,
    cloudsOpacity,
    pingsOpacity,
    startAnimation,
    stopAnimation,
    getRenderLoopCallback: () => renderLoopCallback,
    setAnimationFrameId: (id: number | null) => {
      animationFrameId = id;
    },
    getAnimationFrameId: () => animationFrameId,
    // Calcul l'oscillation Y du soleil
    getSunOscillationY: () => {
      // Oscillation lente et douce avec période de 4.5s et amplitude de 0.35
      return Math.sin((oscillationTime.value / 4.5) * Math.PI * 2) * 0.35;
    },
    // Calcul l'oscillation Y d'une couche de nuages basée sur son index
    getCloudOscillationY: (cloudIndex: number) => {
      const layer = Math.floor(cloudIndex / 30) + 1; // Chaque couche a ~30 nuages
      const periods = [2.8, 3.2, 2.5, 3.5, 2.9, 3.1, 2.7]; // Période pour chaque couche
      const period = periods[Math.min(layer - 1, 6)];
      const amplitude = [6, 5, 7, 4, 6, 5, 7][Math.min(layer - 1, 6)] / 100; // Convertir en unités Three.js
      return (
        Math.sin((oscillationTime.value / period) * Math.PI * 2) * amplitude
      );
    },
    // Calcul le slide d'entrée de la planète (animation vers le haut pendant le fade-in)
    getPlanetEntranceSlideY: () => {
      // La planète commence plus bas et glisse vers sa position finale
      // Pendant les 40% premiers de l'animation de fade
      const slideStartDuration = 0.4; // 40% du fade total (2500ms = 1000ms)
      const slideProgress = Math.min(
        1,
        loadingProgress.value / slideStartDuration,
      );

      // Easing OutQuad: rapide au début, ralentit progressivement à la fin
      // Formula: 1 - (1 - t)²
      const easedProgress = 1 - Math.pow(1 - slideProgress, 2);

      const slideDistance = -1.5; // La planète commence 1.5 unités plus bas
      return slideDistance * (1 - easedProgress); // De -1.5 vers 0
    },
  };
}
