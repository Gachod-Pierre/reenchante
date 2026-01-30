import { ref, computed } from "vue";
import * as THREE from "three";

export function useSceneAnimation() {
  // ✅ Variables réactives pour les animations d'entrée (fade in)
  const loadingProgress = ref(0); // Valeur 0 à 1, montera progressivement
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
    const duration = 0.3; // 300ms / durée totale
    const progress = Math.max(0, (loadingProgress.value - delay) / duration);
    return Math.min(1, progress);
  });

  const rainbowOpacity = computed(() => {
    const delay = 0.2; // 200ms
    const duration = 0.5; // 500ms
    const progress = Math.max(0, (loadingProgress.value - delay) / duration);
    return Math.min(1, progress);
  });

  const cloudsOpacity = computed(() => {
    const delay = 0.35; // 350ms
    const duration = 0.6; // 600ms
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
  };
}
