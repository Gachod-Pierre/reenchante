<script setup lang="ts">
import {
  ref,
  computed,
  onMounted,
  onBeforeUnmount,
  watch,
  nextTick,
} from "vue";

interface Step {
  title: string;
  description: string;
  refName: string; // Référence à l'élément à spotlight
  buttonLabel: string;
  buttonAction?: () => void;
}

interface Props {
  isOpen: boolean;
  steps: Step[];
  elementRefs: Record<string, HTMLElement | null>;
  storageKey?: string; // Clé localStorage pour persister la completion
}

const props = withDefaults(defineProps<Props>(), {
  storageKey: "dashboard_tutorial_completed",
});

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
}>();

const currentStep = ref(0);
const highlightedElement = ref<HTMLElement | null>(null);
const highlightedElementRect = ref<DOMRect | null>(null);
const previousElement = ref<HTMLElement | null>(null);

// Position du modal
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const modalPosition = computed<any>(() => {
  if (!highlightedElementRect.value) {
    return {
      position: "fixed",
      top: "50%",
      left: "50%",
      transform: "translate(-50%, -50%)",
    };
  }

  const element = highlightedElementRect.value;
  const viewportWidth = window.innerWidth;
  // Dimensions responsive du modal
  const isMobile = viewportWidth < 640;
  const modalWidth = isMobile ? Math.min(280, viewportWidth - 32) : 420;
  const modalHeight = isMobile ? 280 : 320;
  const gap = 20;
  const minMargin = 16;

  // Centrer horizontalement par rapport à l'élément
  let left = element.left + element.width / 2;
  const transform = "translateX(-50%)";

  // S'assurer que le modal ne sort pas du viewport horizontalement
  const leftWithoutTransform = left - modalWidth / 2;
  if (leftWithoutTransform < minMargin) {
    left = minMargin + modalWidth / 2;
  } else if (leftWithoutTransform + modalWidth > viewportWidth - minMargin) {
    left = viewportWidth - minMargin - modalWidth / 2;
  }

  // Essayer au-dessus d'abord
  let top = element.top - gap - modalHeight;
  let isAbove = true;

  // Si pas assez de place en haut, placer en dessous
  if (top < minMargin) {
    top = element.bottom + gap;
    isAbove = false;
  }

  return {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    transform,
    isAbove, // Stocker cette info pour le scroll
  };
});

// Récupérer la position et appliquer le spotlight
function updateHighlightedElement() {
  // Ne rien faire si le tutoriel n'est pas ouvert
  if (!props.isOpen) {
    return;
  }

  // Nettoyer TOUS les éléments qui pourraient avoir un spotlight
  Object.values(props.elementRefs).forEach((element) => {
    if (element) {
      element.style.boxShadow = "";
      element.style.transition = "";
      element.style.pointerEvents = "";
      element.style.position = "";
      element.style.zIndex = "";
    }
  });

  if (currentStep.value < props.steps.length) {
    const step = props.steps[currentStep.value];
    if (step) {
      const element = props.elementRefs[step.refName];
      if (element) {
        highlightedElement.value = element;
        highlightedElementRect.value = element.getBoundingClientRect();

        // Appliquer le spotlight
        element.style.boxShadow = "0 0 0 9999px rgba(0, 0, 0, 0.7)";
        element.style.transition = "box-shadow 0.3s ease";
        element.style.position = "relative";
        element.style.zIndex = "58";
        element.style.pointerEvents = "none";

        previousElement.value = element;

        // Scroller pour montrer l'élément
        nextTick(() => {
          scrollModalIntoView();
        });
      }
    }
  }
}

// Scroller pour montrer l'élément et le modal
function scrollModalIntoView() {
  if (!highlightedElement.value) return;

  const element = highlightedElement.value;
  const rect = element.getBoundingClientRect();
  const minMargin = 16;

  // Vérifier si l'élément est visible
  const isVisible =
    rect.top >= minMargin && rect.bottom <= window.innerHeight - minMargin;

  if (!isVisible) {
    // Scroller juste assez pour rendre l'élément visible (ne pas le mettre en haut)
    let targetScroll = window.scrollY;

    if (rect.top < minMargin) {
      // L'élément est au-dessus, scroller vers le haut juste assez
      targetScroll = Math.max(0, rect.top + window.scrollY - minMargin);
    } else if (rect.bottom > window.innerHeight - minMargin) {
      // L'élément est au-dessous, scroller vers le bas juste assez
      targetScroll =
        rect.bottom + window.scrollY - window.innerHeight + minMargin;
    }

    window.scrollTo({
      top: targetScroll,
      behavior: "smooth",
    });

    // Pendant le scroll, mettre à jour la rect en continu pour que le modal suive fluidement
    const handleScroll = () => {
      highlightedElementRect.value = element.getBoundingClientRect();
    };

    window.addEventListener("scroll", handleScroll);

    // Arrêter de suivre après 600ms (fin du scroll smooth)
    setTimeout(() => {
      window.removeEventListener("scroll", handleScroll);
      // Dernière mise à jour pour s'assurer qu'on est bien aligné
      highlightedElementRect.value = element.getBoundingClientRect();
    }, 600);
  }
}

function nextStep() {
  if (currentStep.value < props.steps.length - 1) {
    currentStep.value++;
  } else {
    // Dernière étape
    const lastStep = props.steps[currentStep.value];
    if (lastStep?.buttonAction) {
      lastStep.buttonAction();
    }
    completeTutorial();
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function completeTutorial() {
  // Nettoyer l'élément actuellement en spotlight
  if (highlightedElement.value) {
    highlightedElement.value.style.boxShadow = "";
    highlightedElement.value.style.transition = "";
    highlightedElement.value.style.position = "";
    highlightedElement.value.style.pointerEvents = "";
    highlightedElement.value.style.zIndex = "";
    highlightedElement.value = null;
  }

  // Nettoyer TOUS les éléments (au cas où)
  Object.values(props.elementRefs).forEach((element) => {
    if (element) {
      element.style.boxShadow = "";
      element.style.transition = "";
      element.style.position = "";
      element.style.pointerEvents = "";
      element.style.zIndex = "";
    }
  });

  if (import.meta.client) {
    localStorage.setItem(props.storageKey, "true");
  }
  emit("update:isOpen", false);
}

function computeDotsStyle(index: number) {
  return {
    backgroundColor: index === currentStep.value ? "#FF1493" : "#FF69B4",
    width: index === currentStep.value ? "24px" : "8px",
  };
}

// Watchers
watch(
  () => currentStep.value,
  () => {
    nextTick(() => updateHighlightedElement());
  },
);

// Re-appliquer le spotlight quand les refs changent
watch(
  () => props.elementRefs,
  () => {
    nextTick(() => updateHighlightedElement());
  },
  { deep: true },
);

// Nettoyer complètement quand le modal se ferme
watch(
  () => props.isOpen,
  (newVal) => {
    if (newVal) {
      // Bloquer le scroll quand le tutorial s'ouvre
      document.documentElement.style.overflow = "hidden";
    } else {
      // Rétablir le scroll quand le tutorial se ferme
      document.documentElement.style.overflow = "";

      // Nettoyer l'élément actuellement en spotlight
      if (highlightedElement.value) {
        highlightedElement.value.style.boxShadow = "";
        highlightedElement.value.style.transition = "";
        highlightedElement.value.style.position = "";
        highlightedElement.value.style.pointerEvents = "";
        highlightedElement.value.style.zIndex = "";
        highlightedElement.value = null;
      }

      // Nettoyer TOUS les éléments
      Object.values(props.elementRefs).forEach((element) => {
        if (element) {
          element.style.boxShadow = "";
          element.style.transition = "";
          element.style.position = "";
          element.style.pointerEvents = "";
          element.style.zIndex = "";
        }
      });

      // Réinitialiser l'étape courante à 0 pour la prochaine visite
      currentStep.value = 0;
    }
  },
);

onMounted(() => {
  window.addEventListener("resize", updateHighlightedElement);
  nextTick(() => updateHighlightedElement());

  return () => {
    window.removeEventListener("resize", updateHighlightedElement);
  };
});

// Nettoyer complètement quand le composant est démonté
onBeforeUnmount(() => {
  // Rétablir le scroll au cas où le tutorial serait encore ouvert
  document.documentElement.style.overflow = "";

  // Nettoyer l'élément actuellement en spotlight
  if (highlightedElement.value) {
    highlightedElement.value.style.boxShadow = "";
    highlightedElement.value.style.transition = "";
    highlightedElement.value.style.position = "";
    highlightedElement.value.style.pointerEvents = "";
    highlightedElement.value.style.zIndex = "";
    highlightedElement.value = null;
  }

  // Nettoyer TOUS les éléments
  Object.values(props.elementRefs).forEach((element) => {
    if (element) {
      element.style.boxShadow = "";
      element.style.transition = "";
      element.style.position = "";
      element.style.pointerEvents = "";
      element.style.zIndex = "";
    }
  });

  // Retirer l'event listener du resize
  window.removeEventListener("resize", updateHighlightedElement);
});
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0" style="z-index: 59">
      <!-- Modal d'explication -->
      <div
        class="bg-white rounded-2xl p-6 shadow-2xl animate-scaleIn"
        :style="{
          ...modalPosition,
          width: '90%',
          maxWidth: '450px',
          zIndex: 59,
        }"
      >
        <!-- Numéro de l'étape -->
        <div class="mb-3">
          <span
            class="inline-block px-3 py-1 rounded-full text-sm font-bold text-white"
            :style="{ backgroundColor: '#FF1493' }"
          >
            Étape {{ currentStep + 1 }} / {{ steps.length }}
          </span>
        </div>

        <!-- Titre et description -->
        <h3 class="text-2xl font-black mb-2" :style="{ color: '#FF1493' }">
          {{ steps[currentStep]?.title }}
        </h3>
        <p class="text-gray-700 text-sm mb-6 leading-relaxed">
          {{ steps[currentStep]?.description }}
        </p>

        <!-- Boutons de navigation -->
        <div class="flex gap-3 justify-end mb-4">
          <button
            v-if="currentStep > 0"
            class="px-4 py-2 rounded-lg font-semibold text-gray-700 bg-gray-200 hover:bg-gray-300 transition-all duration-300"
            @click="prevStep"
          >
            ← Précédent
          </button>
          <button
            class="px-4 py-2 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105"
            :style="{ backgroundColor: '#FF1493' }"
            @click="nextStep"
          >
            {{
              currentStep === steps.length - 1
                ? steps[currentStep]?.buttonLabel || "Terminer"
                : "Suivant →"
            }}
          </button>
        </div>

        <!-- Points de navigation -->
        <div class="flex justify-center gap-2">
          <button
            v-for="(_, index) in steps"
            :key="index"
            class="h-2 rounded-full transition-all duration-300"
            :style="computeDotsStyle(index)"
            @click="currentStep = index"
          />
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scaleIn {
  animation: scaleIn 0.3s ease-out;
}

/* Mobile responsive */
@media (max-width: 640px) {
  :deep(.bg-white) {
    padding: 1rem;
  }

  :deep(h3) {
    font-size: 1.25rem;
    margin-bottom: 0.75rem;
  }

  :deep(p) {
    font-size: 0.85rem;
    margin-bottom: 1rem;
    line-height: 1.4;
  }

  :deep(button) {
    padding: 0.5rem 0.75rem;
    font-size: 0.875rem;
  }
}
</style>
