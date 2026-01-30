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
        class="bg-white border-b px-6 py-4 flex justify-between items-center flex-shrink-0"
      >
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
            class="border rounded-lg p-4"
            style="contain: content"
          >
            <!-- En-tête avec utilisateur et action -->
            <div class="flex items-start gap-3 mb-3">
              <img
                v-if="deed.profiles?.avatar_url"
                :src="deed.profiles.avatar_url"
                :alt="deed.profiles.full_name ?? 'User'"
                class="w-10 h-10 rounded-full object-cover"
              />
              <div class="flex-1">
                <p class="font-semibold text-gray-900">
                  {{
                    deed.profiles?.full_name ||
                    deed.profiles?.username ||
                    "Anonyme"
                  }}
                </p>
                <p class="text-sm text-gray-600">
                  {{ deed.good_deeds?.title || "Action" }}
                </p>
              </div>
              <div class="text-right">
                <p class="font-bold text-pink-500 text-lg">
                  +{{ deed.points_awarded ?? deed.good_deeds?.points ?? 0 }} pts
                </p>
              </div>
            </div>

            <!-- Détails de la soumission -->
            <div class="space-y-2 text-sm">
              <p v-if="deed.submission_text" class="text-gray-700">
                {{ deed.submission_text }}
              </p>
              <div class="flex items-center gap-2 text-gray-500">
                <span>📍 {{ deed.country }}</span>
                <span v-if="deed.submitted_at">
                  · {{ new Date(deed.submitted_at).toLocaleDateString() }}
                </span>
              </div>
              <div v-if="deed.evidence_url" class="mt-2">
                <a
                  :href="deed.evidence_url"
                  target="_blank"
                  rel="noopener noreferrer"
                  class="text-pink-500 hover:text-pink-700 text-sm underline"
                >
                  Voir la preuve
                </a>
              </div>
            </div>

            <!-- Status badge -->
            <div class="mt-3 flex gap-2">
              <span
                v-if="deed.status === 'validated'"
                class="inline-block px-3 py-1 bg-green-100 text-green-700 text-xs rounded-full"
              >
                ✓ Validé
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
