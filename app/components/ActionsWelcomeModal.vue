<script setup lang="ts">
defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
  navigate: [path: string];
}>();

function handleNavigate() {
  localStorage.setItem("actions_welcome_modal_completed", "true");
  emit("navigate", "/gallery");
  emit("update:isOpen", false);
}
</script>

<template>
  <Teleport to="body" v-if="isOpen">
    <!-- Overlay sombre avec box-shadow -->
    <div
      class="fixed inset-0 z-50"
      :style="{
        boxShadow: 'inset 0 0 0 9999px rgba(0, 0, 0, 0.7)',
      }"
    />

    <!-- Modal centré -->
    <div
      class="fixed inset-0 z-50 flex items-center justify-center px-4"
      @click="emit('update:isOpen', false)"
    >
      <div
        class="bg-white rounded-3xl p-8 md:p-12 max-w-md shadow-2xl"
        @click.stop
        :style="{
          animation: 'slideUp 0.3s ease-out',
        }"
      >
        <!-- Contenu -->
        <h2
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#FF1493' }"
        >
          Découvrez les Bonnes Actions
        </h2>

        <p class="text-gray-700 text-base leading-relaxed mb-8">
          Bienvenue sur la page des bonnes actions ! Explorez une multitude
          d'actions positives à accomplir, soumettez des preuves en photo pour
          les faire valider, et gagnez des points de réenchantement !
        </p>

        <!-- Bouton principal -->
        <button
          @click="handleNavigate"
          class="w-full py-3 px-6 rounded-xl font-bold text-white transition-all duration-200 hover:shadow-lg transform hover:scale-105"
          :style="{
            background: 'linear-gradient(135deg, #FF1493, #FF69B4)',
          }"
        >
          Découvrir la galerie →
        </button>

        <!-- Bouton fermer (petit x) -->
        <button
          @click="emit('update:isOpen', false)"
          class="absolute top-4 right-4 text-gray-400 hover:text-gray-600 transition-colors"
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
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes slideUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}
</style>
