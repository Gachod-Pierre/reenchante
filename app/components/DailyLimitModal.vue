<script setup lang="ts">
interface Props {
  isVisible: boolean;
  type: "limit-in-progress" | "limit-daily-5" | "success";
}

const props = defineProps<Props>();

const timeRemaining = ref("--:--:--");
const showModal = ref(false);
const autoHideTimer = ref<ReturnType<typeof setTimeout> | null>(null);

// Calculer le temps restant jusqu'à minuit UTC
const updateTimeRemaining = () => {
  const now = new Date();
  const midnight = new Date();
  midnight.setUTCDate(midnight.getUTCDate() + 1);
  midnight.setUTCHours(0, 0, 0, 0);

  const diff = midnight.getTime() - now.getTime();
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60));
  const seconds = Math.floor((diff % (1000 * 60)) / 1000);
  timeRemaining.value = `${String(hours).padStart(2, "0")}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

let _timerInterval: ReturnType<typeof setInterval> | null = null;

const clearAutoHide = () => {
  if (autoHideTimer.value) {
    clearTimeout(autoHideTimer.value);
    autoHideTimer.value = null;
  }
};

const restartAutoHide = () => {
  clearAutoHide();
  // Relancer le timer avec 2 secondes restantes pour que l'user ait le temps de réagir
  if (props.type !== "limit-daily-5") {
    autoHideTimer.value = setTimeout(() => {
      showModal.value = false;
    }, 2000);
  }
};

onMounted(() => {
  if (props.isVisible) {
    showModal.value = true;
    updateTimeRemaining();
    _timerInterval = setInterval(updateTimeRemaining, 1000);

    // Auto-hide pour les messages temporaires (success, limit-in-progress, limit-daily-combined)
    if (props.type !== "limit-daily-5") {
      autoHideTimer.value = setTimeout(() => {
        showModal.value = false;
      }, 3000);
    }
  }
});

onUnmounted(() => {
  if (_timerInterval) {
    clearInterval(_timerInterval);
  }
  clearAutoHide();
});

watch(
  () => props.isVisible,
  (newVal) => {
    if (newVal) {
      showModal.value = true;
      updateTimeRemaining();
      _timerInterval = setInterval(updateTimeRemaining, 1000);

      // Auto-hide pour les messages temporaires
      if (props.type !== "limit-daily-5") {
        clearAutoHide();
        autoHideTimer.value = setTimeout(() => {
          showModal.value = false;
        }, 3000);
      }
    } else {
      showModal.value = false;
      if (_timerInterval) {
        clearInterval(_timerInterval);
      }
      clearAutoHide();
    }
  },
);
</script>

<template>
  <!-- Messages temporaires (bas-right) -->
  <Transition name="fade">
    <div
      v-if="showModal && props.type !== 'limit-daily-5'"
      class="fixed bottom-5 right-5 bg-orange-500 text-white px-6 py-4 rounded-lg max-w-sm shadow-lg z-40 text-sm"
      @mouseenter="clearAutoHide"
      @mouseleave="restartAutoHide"
    >
      <!-- Limite 3 actions en cours -->
      <div v-if="props.type === 'limit-in-progress'" class="space-y-3">
        <div class="font-semibold">⚠️ Limite atteinte</div>
        <div>Vous ne pouvez réaliser que 3 bonnes action à la fois !</div>
        <NuxtLink
          to="/dashboard"
          class="inline-block text-white underline font-semibold hover:opacity-80"
          >Aller au Dashboard →</NuxtLink
        >
      </div>

      <!-- Succès -->
      <div v-if="props.type === 'success'" class="space-y-3">
        <div class="font-semibold text-green-200">
          ✅ Bonne action ajoutée !
        </div>
        <NuxtLink
          to="/dashboard"
          class="inline-block text-white underline font-semibold hover:opacity-80"
          >Aller au Dashboard →</NuxtLink
        >
      </div>
    </div>
  </Transition>

  <!-- Modal fixe limite quotidienne de 5 validées -->
  <Transition name="fade">
    <div
      v-if="showModal && props.type === 'limit-daily-5'"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-30"
    >
      <div
        class="bg-white rounded-lg p-8 max-w-sm shadow-xl text-center text-gray-800"
      >
        <div class="text-3xl mb-4">🌅</div>
        <div class="font-semibold text-lg mb-2">
          Limite quotidienne atteinte
        </div>
        <div class="text-sm mb-6 opacity-85">
          Tu as déjà validé 5 bonnes actions aujourd'hui, reviens demain !
        </div>
        <div class="font-semibold text-base bg-gray-100 px-3 py-2 rounded mb-4">
          Reviens dans: <code class="text-gray-700">{{ timeRemaining }}</code>
        </div>
        <NuxtLink
          to="/dashboard"
          class="inline-block text-blue-600 underline font-semibold hover:text-blue-800"
          >Aller au Dashboard →</NuxtLink
        >
      </div>
    </div>
  </Transition>
</template>

<style scoped>
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}
</style>
