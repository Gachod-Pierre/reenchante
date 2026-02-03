<script setup lang="ts" generic="T">
// Props
interface Props {
  items: T[];
  perPage?: number;
}

const props = withDefaults(defineProps<Props>(), {
  perPage: 6,
});

// Pagination state
const currentPage = ref(1);

// Reset to page 1 when items change
watch(
  () => props.items.length,
  () => {
    currentPage.value = 1;
  },
);

// Computed properties
const displayedItems = computed(() => {
  const start = (currentPage.value - 1) * props.perPage;
  const end = start + props.perPage;
  return props.items.slice(start, end);
});

const totalPages = computed(() => {
  return Math.ceil(props.items.length / props.perPage);
});
</script>

<template>
  <div class="w-full">
    <!-- Slot pour le contenu paginé -->
    <slot
      :items="displayedItems"
      :current-page="currentPage"
      :total-pages="totalPages"
    />

    <!-- Pagination (visible seulement s'il y a plusieurs pages) -->
    <div v-if="totalPages > 1" class="mt-8">
      <MyPagination v-model="currentPage" :total-pages="totalPages" />
    </div>
  </div>
</template>
