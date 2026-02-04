<script setup lang="ts">
import type { Database } from "../types/database.types";

defineOptions({
  inheritAttrs: false,
});

type UserDeedSubmission = Database["public"]["Tables"]["user_deeds"]["Row"];

type GalleryItem = UserDeedSubmission & {
  good_deeds: Database["public"]["Tables"]["good_deeds"]["Row"] | null;
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

defineProps<{
  item: GalleryItem;
}>();

const showLightbox = ref(false);

function formatDate(dateString: string) {
  return new Date(dateString).toLocaleDateString("fr-FR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}
</script>

<template>
  <!-- Card principale -->
  <div
    v-bind="$attrs"
    class="group relative border-2 rounded-2xl overflow-hidden transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer h-screen max-h-[600px] md:max-h-[700px]"
    :style="{
      borderColor: '#FF69B4',
      backgroundColor: 'rgba(255, 255, 255, 0.8)',
    }"
    @click="showLightbox = true"
  >
    <!-- Image de la preuve (centrale et grande) -->
    <img
      v-if="item.evidence_url"
      :src="item.evidence_url"
      :alt="item.good_deeds?.title"
      class="w-full h-full object-cover"
    >
    <div
      v-else
      class="w-full h-full bg-gray-100 flex items-center justify-center"
    >
      <span class="text-gray-400 text-sm">Image non disponible</span>
    </div>

    <!-- Header en position absolue avec gradient -->
    <div
      class="absolute top-0 left-0 right-0 px-4 py-6 z-10 flex items-center gap-3"
      :style="{
        background:
          'linear-gradient(to bottom, rgba(255, 255, 255, 0.95) 0%, rgba(255, 255, 255, 0.95) 80%, transparent 95%)',
        paddingBottom: '40px',
      }"
    >
      <img
        v-if="item.profiles?.avatar_url"
        :src="item.profiles.avatar_url"
        :alt="item.profiles?.username ?? 'User'"
        class="w-10 h-10 rounded-full object-cover"
      >
      <div
        v-else
        class="w-10 h-10 rounded-full bg-gray-300 flex items-center justify-center font-bold text-gray-700 flex-shrink-0"
      >
        {{ item.profiles?.username?.[0]?.toUpperCase() ?? "?" }}
      </div>
      <div class="min-w-0">
        <NuxtLink
          :to="`/user/${item.user_id}`"
          class="mb-0 font-semibold text-base truncate transition-all duration-300 hover:underline block"
          :style="{ color: '#FF1493' }"
          @click.stop
        >
          {{ item.profiles?.username ?? "Utilisateur" }}
        </NuxtLink>
      </div>
    </div>

    <!-- Footer en position absolue avec gradient -->
    <div
      class="absolute bottom-0 left-0 right-0 px-6 py-8 z-10"
      :style="{
        background:
          'linear-gradient(to bottom, transparent 5%, rgba(255, 255, 255, 0.95) 20%, rgba(255, 255, 255, 0.95) 100%)',
        paddingTop: '80px',
      }"
    >
      <!-- Titre -->
      <h3
        class="font-bold text-lg md:text-2xl mb-3 line-clamp-2"
        :style="{ color: '#FF1493' }"
      >
        {{ item.good_deeds?.title ?? "Action" }}
      </h3>

      <!-- Texte de submission -->
      <p
        v-if="item.submission_text"
        class="text-sm md:text-base text-gray-700 leading-relaxed mb-4 line-clamp-3"
      >
        <strong>Le Réenchanteur dit</strong> : "{{ item.submission_text }}"
      </p>

      <!-- Points et Date -->
      <div class="flex items-center justify-between gap-3">
        <!-- Points avec fond rose -->
        <div
          class="px-4 py-3 rounded-lg flex items-center gap-2"
          :style="{ backgroundColor: 'rgba(255, 105, 180, 0.15)' }"
        >
          <span class="text-2xl">✨</span>
          <span class="font-bold text-gray-900 text-base">
            +{{ item.good_deeds?.points }} <span class="text-sm text-gray-500">pts</span>
          </span>
        </div>

        <!-- Date -->
        <p class="text-sm text-gray-600 font-medium whitespace-nowrap">
          {{ formatDate(item.selected_at) }}
        </p>
      </div>
    </div>
  </div>

  <!-- Modal Lightbox -->
  <Teleport to="body">
    <div
      v-if="showLightbox"
      class="fixed inset-0 z-[61] bg-black bg-opacity-75 flex items-center justify-center p-4"
      @click="showLightbox = false"
    >
      <img
        v-if="item.evidence_url"
        :src="item.evidence_url"
        :alt="item.good_deeds?.title"
        class="w-full h-auto max-h-screen object-contain rounded-lg"
      >
      <!-- Bouton fermer en fixed -->
      <button
        class="fixed top-6 right-6 z-[62] bg-black bg-opacity-50 hover:bg-opacity-75 text-white text-2xl font-bold w-12 h-12 rounded-full flex items-center justify-center transition-all leading-none"
        @click.stop="showLightbox = false"
      >
        ✕
      </button>
    </div>
  </Teleport>
</template>

<style scoped>
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
