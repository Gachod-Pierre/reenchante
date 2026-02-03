<script setup lang="ts">
import { getStatusLabel } from "../utils/statusLabels";

// Props
interface Props {
  deed: {
    id: string;
    status: string;
    good_deeds?: {
      title: string;
      description: string;
      points: number;
    } | null;
  };
  hasReachedDailyLimit: boolean;
}

// Emit
const emit = defineEmits<{
  delete: [deedId: string];
}>();

const props = defineProps<Props>();

// Handler for delete
function handleDelete() {
  emit("delete", props.deed.id);
}
</script>

<template>
  <div
    class="p-6 md:p-8 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105"
    :style="{
      borderColor: '#FF69B4',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    }"
  >
    <!-- Titre et points potentiels -->
    <div class="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3 mb-3">
      <h3
        class="text-xl md:text-2xl font-bold"
        :style="{ color: '#FF1493' }"
      >
        {{ deed.good_deeds?.title }}
      </h3>
      <div
        class="px-3 py-2 rounded-lg font-bold text-sm md:text-base whitespace-nowrap"
        :style="{
          backgroundColor: 'rgba(255, 20, 147, 0.15)',
          color: '#FF1493',
        }"
      >
        +{{ deed.good_deeds?.points }} pts
      </div>
    </div>

    <!-- Description -->
    <p
      class="text-gray-600 text-sm md:text-base mb-4 leading-relaxed"
    >
      {{ deed.good_deeds?.description }}
    </p>

    <!-- État -->
    <div class="mb-4 flex items-center gap-2">
      <span class="text-gray-700 font-semibold">État :</span>
      <span
        class="px-3 py-1 rounded-full text-sm font-medium"
        :style="{
          backgroundColor: 'rgba(255, 20, 147, 0.15)',
          color: '#FF1493',
        }"
      >
        {{ getStatusLabel(deed.status) }}
      </span>
    </div>

    <!-- Actions -->
    <div class="flex flex-col sm:flex-row gap-3 mt-6">
      <NuxtLink
        :to="`/submit/${deed.id}`"
        :class="[
          'px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 text-center',
          hasReachedDailyLimit
            ? 'bg-gray-400 cursor-not-allowed opacity-50'
            : 'bg-[#FF1493] hover:bg-[#D9187F] hover:shadow-lg',
        ]"
        :style="{
          pointerEvents: hasReachedDailyLimit ? 'none' : 'auto',
        }"
      >
        Soumettre la preuve
      </NuxtLink>
      <button
        v-if="deed.status === 'in_progress'"
        class="px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-300 hover:shadow-lg hover:scale-105"
        @click="handleDelete"
      >
        Supprimer
      </button>
    </div>
  </div>
</template>
