<script setup lang="ts" generic="T">
const props = withDefaults(
  defineProps<{
    items: T[];
    perPage?: number;
    loadMoreText?: string;
    allLoadedText?: string;
  }>(),
  {
    perPage: 40,
    loadMoreText: "Afficher plus",
    allLoadedText:
      "Reste connecté, de nouvelles bonnes actions arriveront très prochainement ! 😉",
  },
);

// Garder une liste des items chargés pour éviter de re-render les anciens
const loadedItems = ref<T[]>([]);

// Initialiser avec les premiers items
watch(
  () => props.items,
  (newItems) => {
    loadedItems.value = newItems.slice(0, props.perPage);
  },
  { immediate: true },
);

// Vérifier s'il y a plus d'items à afficher
const hasMore = computed(() => {
  return loadedItems.value.length < props.items.length;
});

// Nombre d'items restants
const remainingCount = computed(() => {
  return Math.min(props.perPage, props.items.length - loadedItems.value.length);
});

// Charger plus d'items (ajouter aux anciens sans re-render)
function loadMore() {
  const nextItems = props.items.slice(
    loadedItems.value.length,
    loadedItems.value.length + props.perPage,
  ) as T[];
  loadedItems.value = [...loadedItems.value, ...nextItems] as T[];
}
</script>

<template>
  <div class="load-more-view">
    <!-- Contenu via slot avec tracking des anciens vs nouveaux items -->
    <slot :items="loadedItems" :initial-count="perPage" />

    <!-- Bouton "Afficher plus" ou message si tout est chargé -->
    <div v-if="items.length > 0" class="mt-8 text-center">
      <button
        v-if="hasMore"
        class="px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
        :style="{
          backgroundColor: '#FF1493',
        }"
        :class="{ 'hover:bg-[#D9187F]': hasMore }"
        @click="loadMore"
      >
        {{ loadMoreText }} ({{ remainingCount }} restant{{
          remainingCount > 1 ? "s" : ""
        }})
      </button>
      <p v-else class="text-lg font-semibold text-gray-600 mt-4">
        {{ allLoadedText }}
      </p>
    </div>
  </div>
</template>

<style scoped>
.load-more-view {
  width: 100%;
}
</style>
