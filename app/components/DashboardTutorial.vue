<script setup lang="ts">
import { ref, computed, onMounted, watch, nextTick } from "vue";

interface Step {
  title: string;
  description: string;
  refName: string;
  buttonLabel: string;
  buttonAction?: () => void;
}

interface Props {
  isOpen: boolean;
  steps: Step[];
  elementRefs: Record<string, HTMLElement | null>;
}

const props = withDefaults(defineProps<Props>(), {});

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
  const viewportHeight = window.innerHeight;
  const viewportWidth = window.innerWidth;
  const modalWidth = 420;
  const modalHeight = 320;
  const gap = 20;
  const minMargin = 16; // Marge minimale pour éviter d'être coupé

  let top = element.bottom + gap;
  let left = element.left + element.width / 2;
  let transform = "translateX(-50%)";

  // Si pas assez de place en bas
  if (top + modalHeight > viewportHeight - minMargin) {
    top = element.top - gap - modalHeight;

    // Si pas assez non plus en haut, placer à côté
    if (top < minMargin) {
      top = Math.max(minMargin, element.top + element.height / 2);
      transform = "translateY(-50%)";

      // Si l'élément est à droite, placer le modal à gauche
      if (element.left > viewportWidth / 2) {
        left = element.left - gap - modalWidth;
        // Si le modal ne rentre pas à gauche, le placer à droite avec moins de gap
        if (left < minMargin) {
          left = element.right + gap;
          // Si toujours pas de place, centrer horizontalement et accepter le chevauchement
          if (left + modalWidth > viewportWidth - minMargin) {
            left = viewportWidth / 2;
            transform = "translate(-50%, -50%)";
          }
        }
      } else {
        // L'élément est à gauche, placer le modal à droite
        left = element.right + gap;
        // Si le modal sort à droite, le ramener
        if (left + modalWidth > viewportWidth - minMargin) {
          left = Math.max(minMargin, element.left - gap - modalWidth);
          // Si toujours pas de place, centrer
          if (left < minMargin) {
            left = viewportWidth / 2;
            transform = "translate(-50%, -50%)";
          }
        }
      }
    }
  }

  // Sécurité verticale finale
  top = Math.max(
    minMargin,
    Math.min(top, viewportHeight - modalHeight - minMargin),
  );

  // Sécurité horizontale finale - repositionner si le modal sort à droite
  if (left + modalWidth / 2 > viewportWidth - minMargin) {
    left = viewportWidth - minMargin - modalWidth / 2;
  }
  if (left - modalWidth / 2 < minMargin) {
    left = minMargin + modalWidth / 2;
  }

  return {
    position: "fixed",
    top: `${top}px`,
    left: `${left}px`,
    transform,
  };
});

// Récupérer la position et appliquer le spotlight
function updateHighlightedElement() {
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

        // Appliquer un box-shadow qui couvre tout l'écran
        element.style.boxShadow = "0 0 0 9999px rgba(0, 0, 0, 0.7)";
        element.style.transition = "box-shadow 0.3s ease";
        element.style.position = "relative";
        element.style.zIndex = "58";
        element.style.pointerEvents = "none";

        previousElement.value = element;

        // Attendre que le DOM soit mis à jour, puis mettre à jour la rect du modal
        nextTick(() => {
          highlightedElementRect.value = element.getBoundingClientRect();
          // Scroller l'élément au centre de l'écran
          element.scrollIntoView({ behavior: "smooth", block: "center" });
        });
      }
    }
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

  if (import.meta.client) {
    localStorage.setItem("dashboard_tutorial_completed", "true");
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

onMounted(() => {
  window.addEventListener("resize", updateHighlightedElement);
  nextTick(() => updateHighlightedElement());

  return () => {
    window.removeEventListener("resize", updateHighlightedElement);
  };
});
</script>

<template>
  <Teleport to="body">
    <div v-if="isOpen" class="fixed inset-0" style="z-index: 59">
      <!-- Modal d'explication -->
      <div
        class="bg-white rounded-2xl p-6 shadow-2xl animate-scaleIn"
        :style="{ ...modalPosition, maxWidth: '450px', zIndex: 59 }"
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
</style>
