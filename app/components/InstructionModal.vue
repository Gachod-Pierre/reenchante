<script setup lang="ts">
import { ref, onMounted, onUnmounted } from "vue";

interface Props {
  isVisible: boolean;
  delay?: number; // Délai avant d'afficher le modal (ms)
  showFloatingButton?: boolean; // Afficher le bouton flottant pour réouvrir
}

const props = withDefaults(defineProps<Props>(), {
  delay: 2000, // Par défaut 2 secondes
  showFloatingButton: true,
});

const emit = defineEmits<{
  close: [];
  open: [];
}>();

const showModal = ref(false);
const showHelpButton = ref(false);
let delayTimer: ReturnType<typeof setTimeout> | null = null;

const closeModal = () => {
  showModal.value = false;
  emit("close");
};

const openModal = () => {
  showModal.value = true;
  emit("open");
};

onMounted(() => {
  if (props.isVisible) {
    // Afficher après le délai
    delayTimer = setTimeout(() => {
      showModal.value = true;
    }, props.delay);
  }

  // Toujours afficher le bouton flottant une fois le composant monté
  if (props.showFloatingButton) {
    showHelpButton.value = true;
  }
});

onUnmounted(() => {
  if (delayTimer) {
    clearTimeout(delayTimer);
  }
});
</script>

<template>
  <!-- Modal d'instructions -->
  <Transition name="fade">
    <div
      v-if="showModal"
      class="fixed inset-0 bg-black/50 flex items-center justify-center z-[1050]"
      @click="closeModal"
    >
      <div
        class="bg-white rounded-lg shadow-2xl p-8 max-w-md w-full mx-4 relative"
        @click.stop
      >
        <!-- Bouton fermer -->
        <button
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition"
          aria-label="Fermer"
          @click="closeModal"
        >
          <svg
            class="w-6 h-6"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              stroke-linecap="round"
              stroke-linejoin="round"
              stroke-width="2"
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        </button>

        <!-- Contenu -->
        <div class="space-y-4">
          <h2 class="text-2xl font-bold text-gray-900">
            Bienvenue sur Réenchante ! 🌍
          </h2>

          <div class="space-y-3 text-gray-700">
            <div class="flex items-start space-x-3">
              <span class="text-2xl">🔄</span>
              <p>
                <strong>Tourne la planète</strong> en l'attrapant avec ta souris ou ton doigt
              </p>
            </div>

            <div class="flex items-start space-x-3">
              <span class="text-2xl">🎯</span>
              <p>
                <strong>Clique sur les pastilles roses</strong> pour voir les
                bonnes actions réalisées dans le monde
              </p>
            </div>

            <div class="flex items-start space-x-3">
              <span class="text-2xl">✨</span>
              <p>
                <strong>Soumets tes propres bonnes actions</strong> pour inspirer les
                autres et apparaître sur la carte !
              </p>
            </div>
          </div>

          <button
            class="w-full mt-6 text-white font-semibold py-3 px-4 rounded-lg hover:shadow-lg transition transform hover:scale-105"
            :style="{ backgroundColor: '#FF1493' }"
            @click="closeModal"
          >
            C'est parti ! 🚀
          </button>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Bouton flottant pour rouvrir le modal -->
  <Transition name="fade">
    <button
      v-if="showHelpButton && !showModal"
      class="fixed bottom-8 right-8 z-40 w-16 h-16 rounded-full text-white shadow-lg hover:shadow-xl transition flex items-center justify-center animate-bounce"
      :style="{ backgroundColor: '#FF1493' }"
      aria-label="Aide"
      @click="openModal"
    >
      <svg
        class="w-8 h-8"
        fill="none"
        stroke="currentColor"
        viewBox="0 0 24 24"
      >
        <path
          stroke-linecap="round"
          stroke-linejoin="round"
          stroke-width="2"
          d="M8.228 9c.549-1.165 2.03-2 3.772-2 2.21 0 4 1.343 4 3 0 1.4-1.278 2.575-3.006 2.907-.542.104-.994.54-.994 1.093m0 3h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
        />
      </svg>
    </button>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

@keyframes bounce {
  0%,
  100% {
    transform: translateY(0);
  }
  50% {
    transform: translateY(-8px);
  }
}

.animate-bounce {
  animation: bounce 2s infinite;
}
</style>
