<script setup lang="ts">
import type { Database } from "../types/database.types";

type GoodDeed = Database["public"]["Tables"]["good_deeds"]["Row"];

defineProps<{
  deed: GoodDeed;
  isDisabled: boolean;
}>();

defineEmits<{
  add: [];
}>();

function getDifficultyColor(difficulty: string | null) {
  switch (difficulty) {
    case "facile":
      return { bg: "bg-green-100", text: "text-green-700" };
    case "moyen":
      return { bg: "bg-amber-100", text: "text-amber-700" };
    case "difficile":
      return { bg: "bg-red-100", text: "text-red-700" };
    default:
      return { bg: "bg-gray-100", text: "text-gray-700" };
  }
}

function getDifficultyLabel(difficulty: string | null) {
  switch (difficulty) {
    case "facile":
      return "🟢 Facile";
    case "moyen":
      return "🟡 Moyen";
    case "difficile":
      return "🔴 Difficile";
    default:
      return "Non défini";
  }
}

function formatCreatedDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
</script>

<template>
  <div
    class="group backdrop-blur-sm border-2 rounded-2xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
    :style="{
      borderColor: '#FF69B4',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    }"
  >
    <!-- Header de la carte -->
    <div class="mb-4">
      <h3
        class="text-lg md:text-xl font-bold mb-2 line-clamp-2"
        :style="{ color: '#FF1493' }"
      >
        {{ deed.title }}
      </h3>
      <p class="text-gray-600 text-sm md:text-base leading-relaxed">
        {{ deed.description }}
      </p>
    </div>

    <!-- Points et Date de création -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div
        class="p-2 rounded-lg justify-center items-center flex"
        :style="{ backgroundColor: 'rgba(255, 105, 180, 0.15)' }"
      >
        <span class="font-bold text-lg text-gray-900">
          {{ deed.points }}
          <span class="text-sm text-gray-500">pts</span>
        </span>
      </div>
      <div class="text-right justify-end items-center flex">
        <div>
          <p class="text-xs text-gray-500">Créée le</p>
          <p class="font-semibold text-gray-900">
            {{ formatCreatedDate(deed.created_at) }}
          </p>
        </div>
      </div>
    </div>

    <!-- Difficulté -->
    <div v-if="deed.difficulty" class="mb-3">
      <span
        :class="[
          'inline-block px-3 py-1 rounded-full text-sm font-semibold',
          getDifficultyColor(deed.difficulty).bg,
          getDifficultyColor(deed.difficulty).text,
        ]"
      >
        {{ getDifficultyLabel(deed.difficulty) }}
      </span>
    </div>

    <!-- Tags -->
    <div
      v-if="deed.tags && deed.tags.length > 0"
      class="mb-4 flex flex-wrap gap-2"
    >
      <span
        v-for="tag in deed.tags"
        :key="tag"
        class="text-xs md:text-sm px-2 py-1 rounded-full text-gray-700"
        :style="{ backgroundColor: '#f0f0f0', color: '#FF1493' }"
      >
        #{{ tag }}
      </span>
    </div>

    <!-- Bouton Ajouter -->
    <button
      :disabled="isDisabled"
      class="w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform text-white text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
      :class="[
        isDisabled
          ? 'bg-gray-300'
          : 'bg-[#FF1493] hover:bg-[#D9187F] hover:shadow-lg hover:scale-105',
      ]"
      @click="$emit('add')"
    >
      {{ isDisabled ? "Limite atteinte" : "Ajouter" }}
    </button>
  </div>
</template>

<style scoped>
/* Animation fadeInUp pour le composant */
.group {
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
}

@keyframes fadeInUp {
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
