<script setup lang="ts">
import { computed } from "vue";
import type { UserDeed } from "../composables/useUserDeedsByContinent";
import { useContinentCountries } from "../composables/useContinentCountries";

interface Props {
  isOpen: boolean;
  continentId: string | null;
  userDeeds: UserDeed[];
  loading: boolean;
}

interface Emits {
  (e: "close"): void;
}

const props = defineProps<Props>();
defineEmits<Emits>();

const { getContinentName } = useContinentCountries();

const continentName = computed(() => {
  return props.continentId ? getContinentName(props.continentId) : "";
});

// État pour le lightbox
const showLightbox = ref(false);
const selectedImageUrl = ref<string | null>(null);

// ✅ Fonction pour corriger les URLs d'avatar Google
const getAvatarUrl = (url: string | null | undefined): string => {
  if (!url) return "";
  // Si c'est une URL Google, ajouter le paramètre de taille
  if (url.includes("googleusercontent.com")) {
    // Ajouter =s96 pour demander une image de 96x96px
    return url.includes("=s") ? url : `${url}=s96`;
  }
  return url;
};

// Fonction pour ouvrir le lightbox
const openImageLightbox = (imageUrl: string) => {
  selectedImageUrl.value = imageUrl;
  showLightbox.value = true;
};
</script>

<template>
  <!-- Overlay de fond -->
  <Transition name="fade">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/50 z-[500]"
      @click="$emit('close')"
    />
  </Transition>

  <!-- Modal -->
  <Transition name="slide-up">
    <div
      v-if="isOpen"
      class="fixed bottom-0 left-0 right-0 max-h-[80vh] bg-white rounded-t-3xl z-[501] overflow-hidden shadow-2xl flex flex-col"
      style="will-change: transform"
    >
      <!-- Header -->
      <div
        class="bg-white border-b px-6 py-4 flex flex-col gap-3 flex-shrink-0"
      >
        <div class="flex justify-between items-center">
          <h2
            class="text-2xl font-bold text-transparent bg-clip-text"
            :style="{
              backgroundImage: 'linear-gradient(90deg, #FF69B4, #FF1493)',
            }"
          >
            {{ continentName }}
          </h2>
          <button
            class="text-gray-500 hover:text-gray-700 text-2xl"
            @click="$emit('close')"
          >
            ✕
          </button>
        </div>
        <NuxtLink
          to="/actions"
          class="text-white font-semibold py-2 px-4 rounded-lg bg-[#FF1493] hover:bg-[#D9187F] hover:shadow-lg transition transform hover:scale-105 text-center w-full lg:w-fit"
          @click="$emit('close')"
        >
          ✨ Réenchanter le monde ✨
        </NuxtLink>
      </div>

      <!-- Contenu -->
      <div
        class="overflow-y-auto flex-1 p-6 space-y-4"
        style="will-change: scroll-position; -webkit-overflow-scrolling: touch"
      >
        <!-- État de chargement -->
        <div v-if="loading" class="flex justify-center py-8">
          <div
            class="animate-spin rounded-full h-12 w-12 border-t-2 border-pink-500"
          />
        </div>

        <!-- Liste vide -->
        <div
          v-else-if="userDeeds.length === 0"
          class="text-center py-8 text-gray-500"
        >
          <p>Aucune action validée dans ce continent pour le moment</p>
        </div>

        <!-- Liste des user_deeds -->
        <div v-else class="space-y-4">
          <div
            v-for="deed in userDeeds"
            :key="deed.id"
            class="border border-[#FF69B4] rounded-lg p-4"
            style="contain: content"
          >
            <!-- En-tête avec utilisateur et action -->
            <div class="flex flex-col gap-3">
              <!-- Groupe user + points -->
              <div class="flex items-center justify-between gap-3">
                <!-- Groupe avatar + nom -->
                <div class="flex items-center gap-3 min-w-0">
                  <img
                    v-if="deed.profiles?.avatar_url"
                    :src="getAvatarUrl(deed.profiles.avatar_url)"
                    :alt="deed.profiles.full_name ?? 'User'"
                    class="w-10 h-10 rounded-full object-cover flex-shrink-0"
                  >
                  <NuxtLink
                    :to="`/user/${deed.user_id}`"
                    class="font-semibold text-gray-900 transition-all duration-300 hover:underline truncate"
                    :style="{ color: '#FF1493' }"
                    @click.stop
                  >
                    {{
                      deed.profiles?.username ||
                      "Anonyme"
                    }}
                  </NuxtLink>
                </div>
                <!-- Points -->
                <div
                  class="text-right bg-[#ff69b426] p-3 rounded-lg flex-shrink-0"
                >
                  <p
                    class="text-gray-900 text-lg mb-0 font-bold whitespace-nowrap"
                  >
                    ✨ +{{ deed.points_awarded ?? deed.good_deeds?.points ?? 0 }}
                    <span class="text-sm text-gray-500">pts</span>
                  </p>
                </div>
              </div>
              <!-- Titre de l'action -->
              <p class="text-lg text-gray-700">
                <strong>{{ deed.good_deeds?.title || "Action" }}</strong>
              </p>
            </div>
            <!-- Détails de la soumission -->
            <div class="space-y-2 text-sm">
              <p v-if="deed.submission_text" class="text-gray-600 text-base">
                Le Réenchanteur dit : "{{
                  deed.submission_text
                }}"
              </p>
              <div class="flex items-center gap-2 text-gray-500">
                <span>📍 {{ deed.country }}</span>
                <span v-if="deed.submitted_at">
                  · {{ new Date(deed.submitted_at).toLocaleDateString() }}
                </span>
              </div>
              <div v-if="deed.evidence_url" class="mt-2">
                <button
                  class="text-pink-500 hover:text-pink-700 text-sm hover:underline font-semibold"
                  @click="openImageLightbox(deed.evidence_url)"
                >
                  Voir la preuve 🖼️
                </button>
              </div>
            </div>

            <!-- Status badge -->
            <div class="mt-3 flex gap-2">
              <span
                v-if="deed.status === 'validated'"
                class="inline-block px-3 py-1 text-xs rounded-full"
                :style="{
                  backgroundColor: 'rgba(255, 20, 147, 0.15)',
                  color: '#FF1493',
                  borderBottom: '1px solid #FF69B4',
                }"
              >
                Monde Réenchanté
              </span>
              <span
                v-else-if="deed.status === 'completed'"
                class="inline-block px-3 py-1 bg-blue-100 text-blue-700 text-xs rounded-full"
              >
                En attente
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  </Transition>

  <!-- Modal Lightbox -->
  <Teleport to="body">
    <div
      v-if="showLightbox"
      class="fixed inset-0 z-[502] bg-black bg-opacity-75 flex items-center justify-center p-4"
      @click="showLightbox = false"
    >
      <img
        v-if="selectedImageUrl"
        :src="selectedImageUrl"
        alt="Preuve"
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
.fade-enter-active,
.fade-leave-active {
  transition: opacity 0.3s ease;
}

.fade-enter-from,
.fade-leave-to {
  opacity: 0;
}

.slide-up-enter-active,
.slide-up-leave-active {
  transition: transform 0.3s ease;
}

.slide-up-enter-from,
.slide-up-leave-to {
  transform: translateY(100%);
}
</style>
