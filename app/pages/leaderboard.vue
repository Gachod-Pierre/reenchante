<script setup lang="ts">
import { onMounted, onUnmounted, computed, ref } from "vue";
import { useLeaderboard } from "~/composables/useLeaderboard";
import {
  computeTier,
  type TierState,
  TIERS,
} from "~/composables/useEnchantTiers";

// Define auth middleware
definePageMeta({
  middleware: ["auth"],
});

// Composables
const { leaderboard, globalPoints, loading, error, startPolling, stopPolling } =
  useLeaderboard();

// Computed tier state - dépend de globalPoints.value
const currentTier = computed((): TierState => computeTier(globalPoints.value));

// Computed pour points réactif
const pointsForLandscape = computed(() => globalPoints.value);

// État du modal de bienvenue du classement
const isLeaderboardWelcomeModalOpen = ref(false);

// Lifecycle
onMounted(() => {
  startPolling();

  // Afficher le modal de bienvenue si c'est la première visite
  if (import.meta.client) {
    const hasWelcomeModalSeen = localStorage.getItem(
      "leaderboard_welcome_modal_completed",
    );
    if (!hasWelcomeModalSeen) {
      isLeaderboardWelcomeModalOpen.value = true;
    }
  }
});

onUnmounted(() => {
  stopPolling();
});
</script>

<template>
  <div>
    <!-- Modal de bienvenue du classement -->
    <LeaderboardWelcomeModal
      :is-open="isLeaderboardWelcomeModalOpen"
      @update:is-open="isLeaderboardWelcomeModalOpen = $event"
    />

    <!-- Leaderboard page with enchant landscape background -->
    <div class="relative w-full min-h-screen">
      <!-- Background landscape (fixed, low z-index) -->
      <div class="fixed inset-0 z-0 pointer-events-none">
        <EnchantLandscape :points="pointsForLandscape" />
      </div>

      <!-- Overlay cards (scrollable, relative to page flow) -->
      <div class="relative z-10">
        <div class="max-w-6xl mx-auto px-4 py-6 w-full pt-20">
          <div class="grid grid-cols-1 md:grid-cols-2 gap-4 md:gap-6 py-12">
            <!-- CARD A: LEADERBOARD -->
            <div
              class="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl shadow-lg p-6 md:p-8"
            >
              <h2 class="text-2xl md:text-3xl font-black text-white mb-6">
                Leaderboard
              </h2>

              <!-- Loading state -->
              <div v-if="loading" class="text-center text-white/80 py-8">
                <p>Chargement...</p>
              </div>

              <!-- Error state -->
              <div v-else-if="error" class="text-center text-red-300 py-8">
                <p>{{ error }}</p>
              </div>

              <!-- Leaderboard list -->
              <div v-else class="space-y-3">
                <NuxtLink
                  v-for="(user, index) in leaderboard"
                  :key="user.id"
                  :to="`/user/${user.id}`"
                  class="flex items-center gap-3 p-3 rounded-lg bg-white/5 hover:bg-white/10 transition-colors"
                >
                  <!-- Rank -->
                  <div
                    class="text-lg font-black text-[#FF1493] min-w-[2rem] text-center"
                  >
                    {{ index + 1 }}
                  </div>

                  <!-- Avatar -->
                  <div
                    class="w-10 h-10 rounded-full bg-gradient-to-br from-[#FF1493] to-[#FF69B4] flex items-center justify-center text-white font-bold text-sm flex-shrink-0 overflow-hidden"
                  >
                    <img
                      v-if="user.avatar_url"
                      :src="user.avatar_url"
                      :alt="user.username"
                      class="w-full h-full object-cover"
                    >
                    <span v-else>{{
                      user.username.charAt(0).toUpperCase()
                    }}</span>
                  </div>

                  <!-- Username -->
                  <div class="flex-1 min-w-0">
                    <p class="text-white mb-0 font-semibold truncate">
                      {{ user.username }}
                    </p>
                  </div>

                  <!-- Points -->
                  <div class="text-right">
                    <p class="text-lg mb-0 font-black text-[#FF1493]">
                      {{ user.total_points }}
                    </p>
                    <p class="text-xs text-white/60">pts</p>
                  </div>
                </NuxtLink>

                <!-- Empty state -->
                <div
                  v-if="leaderboard.length === 0"
                  class="text-center text-white/60 py-8"
                >
                  <p>Aucun utilisateur pour le moment</p>
                </div>
              </div>
            </div>

            <!-- CARD B: GLOBAL POINTS & TIERS -->
            <div
              class="bg-white/10 backdrop-blur-md border border-white/15 rounded-2xl shadow-lg p-6 md:p-8"
            >
              <h2 class="text-2xl md:text-3xl font-black text-white mb-6">
                Points Globaux
              </h2>

              <!-- Loading state -->
              <div v-if="loading" class="text-center text-white/80 py-8">
                <p>Chargement...</p>
              </div>

              <!-- Global points display -->
              <div v-else>
                <div class="mb-6 p-4 rounded-lg bg-white/5 text-center">
                  <p class="text-white/80 text-sm mb-2">Somme totale</p>
                  <p class="text-4xl md:text-5xl font-black text-[#FF1493]">
                    {{ globalPoints.toLocaleString("fr-FR") }}
                  </p>
                </div>

                <!-- Tier info -->
                <div class="mb-6 p-4 rounded-lg bg-white/5">
                  <p class="text-white/80 text-sm mb-1">Étape actuelle</p>
                  <p class="text-xl md:text-2xl font-black text-white mb-3">
                    {{ currentTier.currentLabel }}
                  </p>

                  <!-- Progress bar -->
                  <div
                    class="w-full bg-white/10 rounded-full h-2 overflow-hidden mb-3"
                  >
                    <div
                      class="bg-gradient-to-r from-[#FF1493] to-[#FF69B4] h-full transition-all duration-300"
                      :style="{ width: `${currentTier.tierProgress * 100}%` }"
                    />
                  </div>

                  <!-- Progress text -->
                  <div class="flex justify-between text-xs text-white/60 mb-2">
                    <span>{{
                      currentTier.currentThreshold.toLocaleString("fr-FR")
                    }}</span>
                    <span>{{
                      currentTier.nextThreshold.toLocaleString("fr-FR")
                    }}</span>
                  </div>

                  <!-- Next tier preview -->
                  <p class="text-sm text-white/80">
                    Prochaine étape:
                    <span class="font-semibold text-white">{{
                      currentTier.nextLabel
                    }}</span>
                  </p>
                </div>

                <!-- Tier milestones (mini chips) -->
                <div class="space-y-2">
                  <p class="text-white/80 text-sm font-semibold mb-3">
                    Jalons de réenchantement
                  </p>
                  <div class="space-y-2">
                    <div
                      v-for="(tier, index) in TIERS"
                      :key="index"
                      class="flex items-center gap-3 p-2 rounded text-xs transition-all"
                      :class="[
                        globalPoints >= tier.threshold
                          ? 'bg-[#FF1493]/20 text-white'
                          : 'bg-white/5 text-white/50',
                      ]"
                    >
                      <div
                        class="w-2 h-2 rounded-full flex-shrink-0"
                        :class="
                          globalPoints >= tier.threshold
                            ? 'bg-[#FF1493]'
                            : 'bg-white/30'
                        "
                      />
                      <span class="flex-1">{{ tier.label }}</span>
                      <span class="font-semibold">{{
                        tier.threshold.toLocaleString("fr-FR")
                      }}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
