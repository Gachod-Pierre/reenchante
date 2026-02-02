import { ref, computed } from "vue";
import * as THREE from "three";
import gsap from "gsap";

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
      const period = periods[Math.min(layer - 1, 6)] ?? 2.8; // Default to 2.8 if undefined
      const amplitude =
        ([6, 5, 7, 4, 6, 5, 7][Math.min(layer - 1, 6)] ?? 6) / 100; // Convertir en unités Three.js
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
    // ✅ Animation du titre letter-by-letter avec GSAP
    animateTitleLetters: (titleRef: HTMLElement | null) => {
      if (!titleRef) return;

      const spans = titleRef.querySelectorAll("span") || [];
      const tl = gsap.timeline();

      // Animation d'entrée des lettres
      tl.to(spans, {
        opacity: 1,
        y: 0,
        stagger: 0.08,
        duration: 0.6,
        ease: "back.out(1.7)",
      });

      // Animation de la respiration fluide du glow (sans à-coup)
      gsap.to(titleRef, {
        textShadow:
          "0 0 40px rgba(255, 105, 180, 1.2), 2px 2px 4px rgba(0, 0, 0, 0.3)",
        duration: 1.8,
        ease: "sine.inOut",
        yoyo: true,
        repeat: -1,
      });

      // ✨ Animation SVG sur certaines lettres
      const svgIndices = [14]; // Index du "o" de "Monde"
      svgIndices.forEach((index) => {
        if (spans[index]) {
          const span = spans[index] as HTMLElement;

          // ✨ Vider le contenu du span
          span.textContent = "";

          // Créer l'SVG
          const svg = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "svg",
          );
          svg.setAttribute("width", "0.8em");
          svg.setAttribute("height", "0.8em");
          svg.setAttribute("viewBox", "0 0 24 24");
          svg.setAttribute("fill", "none");
          svg.setAttribute("stroke", "currentColor");
          svg.setAttribute("stroke-width", "2");
          svg.style.display = "inline-block";
          svg.style.verticalAlign = "middle";
          svg.style.marginLeft = "4px";
          svg.style.marginRight = "4px";
          svg.style.opacity = "0";

          // Star SVG path
          const starPath =
            "M12 2l3.09 6.26L22 9.27l-5 4.87 1.18 6.88L12 17.77l-6.18 3.25L7 14.14 2 9.27l6.91-1.01L12 2z";

          const path = document.createElementNS(
            "http://www.w3.org/2000/svg",
            "path",
          );
          path.setAttribute("d", starPath);
          svg.appendChild(path);
          span.appendChild(svg);

          // Animation de révélation du SVG avec rotation
          gsap.to(svg, {
            opacity: 1,
            rotation: 360,
            duration: 0.8,
            delay: 0.5 + index * 0.08,
            ease: "back.out(1.7)",
          });

          // Animation de rotation continue + pulse
          gsap.to(svg, {
            rotation: 360,
            duration: 2,
            delay: 0.5 + index * 0.08 + 0.8,
            repeat: -1,
            ease: "sine.inOut",
          });

          // Animation de pulse (scale)
          gsap.to(svg, {
            scale: 1.15,
            duration: 1,
            delay: 0.5 + index * 0.08 + 0.8,
            yoyo: true,
            repeat: -1,
            ease: "sine.inOut",
          });
        }
      });

      // Effet hover - dispersion des lettres
      titleRef.addEventListener("mouseenter", () => {
        gsap.to(spans, {
          x: () => (Math.random() - 0.5) * 40,
          y: () => (Math.random() - 0.5) * 40,
          rotation: () => (Math.random() - 0.5) * 45,
          duration: 0.5,
          ease: "back.out(1.5)",
        });

        // L'étoile tourne plus vite au hover (sans écraser l'animation continue)
        spans.forEach((span: Element) => {
          const svg = span.querySelector("svg");
          if (svg) {
            // Accélérer la rotation sans interrompre l'animation continue
            gsap.to(svg, {
              rotation: "+=720", // Ajoute 720° à la rotation actuelle
              duration: 0.3,
              ease: "power2.inOut",
              overwrite: "auto", // Permet aux animations de coexister
            });
          }
        });
      });

      // Effet hover out - retour à la position
      titleRef.addEventListener("mouseleave", () => {
        gsap.to(spans, {
          x: 0,
          y: 0,
          rotation: 0,
          duration: 0.6,
          ease: "elastic.out(1, 0.5)",
        });
      });
    },
  };
}
