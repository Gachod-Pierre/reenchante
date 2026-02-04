<script setup lang="ts">
interface Props {
  deed: {
    id: string;
    status: string;
    selected_at: string;
    evidence_url: string | null;
    good_deeds: {
      title: string;
      points: number;
      description: string;
      tags: string[];
      difficulty: string;
    } | null;
  };
  readOnly?: boolean;
}

defineProps<Props>();

// Fonction pour obtenir la couleur en fonction de la difficulté
const getDifficultyColor = (difficulty: string) => {
  switch (difficulty) {
    case "facile":
      return { bg: "rgba(34, 197, 94, 0.1)", text: "#22C55E" }; // green
    case "moyen":
      return { bg: "rgba(251, 191, 36, 0.1)", text: "#FBB924" }; // amber
    case "difficile":
      return { bg: "rgba(239, 68, 68, 0.1)", text: "#EF4444" }; // red
    default:
      return { bg: "rgba(107, 114, 128, 0.1)", text: "#6B7280" }; // gray
  }
};

// Fonction pour obtenir le label de difficulté
const getDifficultyLabel = (difficulty: string) => {
  switch (difficulty) {
    case "facile":
      return "Facile 🟢";
    case "moyen":
      return "Moyen 🟡";
    case "difficile":
      return "Difficile 🔴";
    default:
      return "Non définie";
  }
};
</script>

<template>
  <div
    class="p-6 md:p-8 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105"
    :style="{
      borderColor: '#FF69B4',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    }"
  >
    <!-- Titre -->
    <h3
      class="text-xl md:text-2xl font-bold mb-3"
      :style="{ color: '#FF1493' }"
    >
      {{ deed.good_deeds?.title }}
    </h3>

    <!-- État -->
    <div class="mb-4 flex items-center gap-2">
      <span class="text-gray-700 font-semibold">État :</span>
      <span
        class="px-3 py-1 rounded-full text-sm font-medium"
        :style="{
          backgroundColor: 'rgba(255, 20, 147, 0.15)',
          color: '#FF1493',
          borderBottom: '1px solid #FF69B4',
        }"
      >
        Monde Réenchanté
      </span>
    </div>

    <!-- Image -->
    <img
      v-if="deed.evidence_url"
      :src="deed.evidence_url"
      alt="preuve"
      class="h-64 w-auto rounded-xl mb-6 object-cover"
    >

    <!-- Points et Date en évidence -->
    <div class="grid grid-cols-2 gap-3 mb-4">
      <div
        class="p-2 rounded-lg justify-center items-center flex"
        :style="{ backgroundColor: 'rgba(255, 105, 180, 0.15)' }"
      >
        <p
          class="text-xl md:text-2xl font-black mb-0"
          :style="{ color: '#FF1493' }"
        >
          +{{ deed.good_deeds?.points }} pts
        </p>
      </div>
      <div class="text-center justify-center items-center flex">
        <p class="text-sm md:text-base font-bold text-gray-700 mb-0">
          {{
            new Date(deed.selected_at).toLocaleDateString("fr-FR", {
              day: "numeric",
              month: "short",
              year: "numeric",
            })
          }}
        </p>
      </div>
    </div>

    <!-- Difficulté -->
    <div class="mb-4 flex items-center gap-2">
      <span class="text-sm font-semibold text-gray-700">Difficulté :</span>
      <span
        class="px-3 py-1 rounded-full text-sm font-medium"
        :style="{
          backgroundColor: getDifficultyColor(deed.good_deeds?.difficulty || '')
            .bg,
          color: getDifficultyColor(deed.good_deeds?.difficulty || '').text,
        }"
      >
        {{ getDifficultyLabel(deed.good_deeds?.difficulty || "") }}
      </span>
    </div>

    <!-- Tags -->
    <div v-if="deed.good_deeds?.tags && deed.good_deeds.tags.length > 0">
      <p class="text-sm font-semibold text-gray-700 mb-2">Tags :</p>
      <div class="flex flex-wrap gap-2">
        <span
          v-for="tag in deed.good_deeds.tags"
          :key="tag"
          class="px-2 py-1 rounded-full text-xs font-semibold"
          :style="{
            backgroundColor: 'rgba(255, 20, 147, 0.1)',
            color: '#FF1493',
            borderBottom: '1px solid #FF69B4',
          }"
        >
          #{{ tag }}
        </span>
      </div>
    </div>
  </div>
</template>
