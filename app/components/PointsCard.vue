<script setup lang="ts">
// Props
interface Props {
  totalPoints: number | null;
  isOwner?: boolean;
}

withDefaults(defineProps<Props>(), {
  isOwner: true,
});
</script>

<template>
  <div
    class="flex-1 h-full p-6 md:p-8 rounded-3xl border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
    :style="{
      borderColor: '#FF69B4',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    }"
  >
    <h2
      class="text-xl md:text-2xl font-bold mb-3"
      :style="{ color: '#FF1493' }"
    >
      {{
        isOwner ? "Mes points de réenchantement" : "Points de réenchantement"
      }}
    </h2>
    <p class="text-4xl md:text-5xl font-black" :style="{ color: '#FF1493' }">
      ✨ {{ totalPoints ?? 0 }} points
    </p>
  </div>
</template>
