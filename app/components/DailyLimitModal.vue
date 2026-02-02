<script setup lang="ts">
interface Props {
  isVisible: boolean;
  type:
    | "limit-in-progress"
    | "limit-daily-5"
    | "limit-daily-5-soft"
    | "success";
}

const props = defineProps<Props>();
const emit = defineEmits<{
  close: [];
}>();

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
  if (props.type !== "limit-daily-5" && props.type !== "limit-daily-5-soft") {
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

    // Auto-hide pour les messages temporaires (success, limit-in-progress)
    // PAS d'auto-hide pour limit-daily-5 et limit-daily-5-soft
    if (props.type !== "limit-daily-5" && props.type !== "limit-daily-5-soft") {
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

      // Auto-hide pour les messages temporaires (PAS pour limit-daily-5 et limit-daily-5-soft)
      if (
        props.type !== "limit-daily-5" &&
        props.type !== "limit-daily-5-soft"
      ) {
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
  <!-- Messages temporaires (bas-right) - non bloquant -->
  <Transition name="fade">
    <div
      v-if="
        showModal &&
        (props.type === 'limit-in-progress' || props.type === 'success')
      "
      class="fixed bottom-5 right-5 px-6 py-4 rounded-lg max-w-sm shadow-lg z-40 text-sm text-white"
      :class="{
        'bg-orange-500': props.type === 'limit-in-progress',
        'bg-green-500': props.type === 'success',
      }"
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

  <!-- Modal limite quotidienne soft (dashboard) - style daily-5, forme in-progress -->
  <Transition name="fade">
    <div
      v-if="showModal && props.type === 'limit-daily-5-soft'"
      class="fixed bottom-5 right-5 rounded-lg max-w-sm shadow-lg z-40 border-2 p-5"
      :style="{
        backgroundColor: 'rgba(255, 255, 255, 0.95)',
        borderColor: '#FF69B4',
      }"
      @mouseenter="clearAutoHide"
      @mouseleave="restartAutoHide"
    >
      <!-- Header avec titre et croix -->
      <div class="flex justify-between items-start mb-3">
        <div>
          <div class="text-2xl">🌅</div>
        </div>
        <button
          class="text-gray-400 hover:text-gray-600 text-xl leading-none"
          aria-label="Fermer"
          @click="emit('close')"
        >
          ✕
        </button>
      </div>

      <!-- Contenu -->
      <div class="text-gray-800">
        <div class="font-semibold text-base mb-2" :style="{ color: '#FF1493' }">
          Limite quotidienne atteinte
        </div>
        <div class="text-sm text-gray-600 mb-3">
          Tu as validé 5 bonnes actions aujourd'hui, reviens demain !
        </div>
        <div
          class="text-xs text-gray-500 bg-gray-50 px-3 py-2 rounded border border-gray-200"
        >
          Reviens dans:
          <code class="font-semibold text-gray-700">{{ timeRemaining }}</code>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modal fixe bloquant - limite quotidienne de 5 validées (page actions) -->
  <Transition name="fade">
    <div
      v-if="showModal && props.type === 'limit-daily-5'"
      class="fixed inset-0 bg-black bg-opacity-40 flex items-center justify-center z-50"
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
          class="inline-block w-full text-center text-white font-semibold py-2 px-4 rounded-lg bg-[#FF1493] hover:bg-[#D9187F] hover:shadow-lg transition transform hover:scale-105"
        >
          Aller au Dashboard
        </NuxtLink>
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
