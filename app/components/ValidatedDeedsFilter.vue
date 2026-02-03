<script setup lang="ts">
// Constante des tags disponibles
const AVAILABLE_TAGS = [
  "environnement",
  "eco_geste",
  "zero_dechet",
  "alimentation",
  "solidarite",
  "entraide",
  "communaute",
  "bienveillance",
  "bien_etre",
  "sante",
  "creativite",
  "culture",
  "numerique",
  "apprentissage",
] as const;

// Props
interface Props {
  selectedTags: string[];
  sortBy: "points" | "date" | "none";
  sortOrder: "asc" | "desc";
  filteredCount: number;
}

// Emit
const emit = defineEmits<{
  "update:selectedTags": [tags: string[]];
  "update:sortBy": [sort: "points" | "date" | "none"];
  "update:sortOrder": [order: "asc" | "desc"];
}>();

const props = defineProps<Props>();

// Handlers
const toggleTag = (tag: string) => {
  const newTags = props.selectedTags.includes(tag)
    ? props.selectedTags.filter((t) => t !== tag)
    : [...props.selectedTags, tag];
  emit("update:selectedTags", newTags);
};
</script>

<template>
  <div
    class="mb-8 p-6 rounded-2xl border-2 backdrop-blur-sm"
    :style="{
      borderColor: '#FF69B4',
      backgroundColor: 'rgba(255, 255, 255, 0.5)',
    }"
  >
    <!-- Filtrage par Tags -->
    <div class="mb-6">
      <h3 class="text-lg font-bold mb-3" :style="{ color: '#FF1493' }">
        Filtrer par tags
      </h3>
      <div class="flex flex-wrap gap-2">
        <button
          v-for="tag in AVAILABLE_TAGS"
          :key="tag"
          :class="[
            'px-3 py-2 rounded-full text-sm font-semibold transition-all duration-300 hover:scale-105',
            props.selectedTags.includes(tag)
              ? 'text-white'
              : 'bg-white text-gray-700 border-2',
          ]"
          :style="{
            backgroundColor: props.selectedTags.includes(tag)
              ? '#FF1493'
              : 'transparent',
            borderColor: props.selectedTags.includes(tag)
              ? '#FF1493'
              : '#FF69B4',
            color: props.selectedTags.includes(tag) ? 'white' : '#FF1493',
          }"
          @click="toggleTag(tag)"
        >
          {{ tag }}
        </button>
      </div>
    </div>

    <!-- Tris -->
    <div class="flex flex-col sm:flex-row gap-6">
      <!-- Tri par Points/Date/Aucun -->
      <div>
        <label class="text-sm font-semibold text-gray-700 block mb-2">
          Trier par
        </label>
        <div class="flex gap-2">
          <button
            :class="[
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
              props.sortBy === 'none'
                ? 'text-white'
                : 'bg-white text-gray-700 border-2',
            ]"
            :style="{
              backgroundColor:
                props.sortBy === 'none' ? '#FF1493' : 'transparent',
              borderColor: props.sortBy === 'none' ? '#FF1493' : '#FF69B4',
              color: props.sortBy === 'none' ? 'white' : '#FF1493',
            }"
            @click="emit('update:sortBy', 'none')"
          >
            Aucun
          </button>
          <button
            :class="[
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
              props.sortBy === 'points'
                ? 'text-white'
                : 'bg-white text-gray-700 border-2',
            ]"
            :style="{
              backgroundColor:
                props.sortBy === 'points' ? '#FF1493' : 'transparent',
              borderColor: props.sortBy === 'points' ? '#FF1493' : '#FF69B4',
              color: props.sortBy === 'points' ? 'white' : '#FF1493',
            }"
            @click="emit('update:sortBy', 'points')"
          >
            Points
          </button>
          <button
            :class="[
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
              props.sortBy === 'date'
                ? 'text-white'
                : 'bg-white text-gray-700 border-2',
            ]"
            :style="{
              backgroundColor:
                props.sortBy === 'date' ? '#FF1493' : 'transparent',
              borderColor: props.sortBy === 'date' ? '#FF1493' : '#FF69B4',
              color: props.sortBy === 'date' ? 'white' : '#FF1493',
            }"
            @click="emit('update:sortBy', 'date')"
          >
            Date
          </button>
        </div>
      </div>

      <!-- Ordre croissant/Décroissant (visible seulement si tri actif) -->
      <div v-if="props.sortBy !== 'none'">
        <label class="text-sm font-semibold text-gray-700 block mb-2">
          Ordre
        </label>
        <div class="flex gap-2">
          <button
            :class="[
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
              props.sortOrder === 'asc'
                ? 'text-white'
                : 'bg-white text-gray-700 border-2',
            ]"
            :style="{
              backgroundColor:
                props.sortOrder === 'asc' ? '#FF1493' : 'transparent',
              borderColor: props.sortOrder === 'asc' ? '#FF1493' : '#FF69B4',
              color: props.sortOrder === 'asc' ? 'white' : '#FF1493',
            }"
            @click="emit('update:sortOrder', 'asc')"
          >
            {{ props.sortBy === "points" ? "⬆️ Croissant" : "📅 Ancien" }}
          </button>
          <button
            :class="[
              'px-4 py-2 rounded-lg font-semibold text-sm transition-all',
              props.sortOrder === 'desc'
                ? 'text-white'
                : 'bg-white text-gray-700 border-2',
            ]"
            :style="{
              backgroundColor:
                props.sortOrder === 'desc' ? '#FF1493' : 'transparent',
              borderColor: props.sortOrder === 'desc' ? '#FF1493' : '#FF69B4',
              color: props.sortOrder === 'desc' ? 'white' : '#FF1493',
            }"
            @click="emit('update:sortOrder', 'desc')"
          >
            {{ props.sortBy === "points" ? "⬇️ Décroissant" : "📅 Récent" }}
          </button>
        </div>
      </div>
    </div>

    <!-- Badge nombre de résultats -->
    <div class="mt-4 text-sm font-semibold text-gray-600">
      {{ props.filteredCount }} résultat(s)
    </div>
  </div>
</template>
