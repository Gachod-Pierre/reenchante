<script setup lang="ts">
import { ref, onMounted } from "vue";

const isOnboardingOpen = ref(false);

// Afficher le wizard au premier chargement si pas encore complété
onMounted(() => {
  if (import.meta.client) {
    const hasCompletedOnboarding = localStorage.getItem("onboarding_completed");
    if (!hasCompletedOnboarding) {
      isOnboardingOpen.value = true;
    }
  }
});

// Fonction pour réouvrir le wizard (appelée depuis PlanetScene)
const openOnboarding = () => {
  isOnboardingOpen.value = true;
};

// Exposer la fonction globalement pour que les composants enfants puissent l'appeler
provide("openOnboarding", openOnboarding);
</script>

<template>
  <div>
    <NuxtLayout>
      <NuxtPage />
    </NuxtLayout>
    <OnboardingWizard v-model:is-open="isOnboardingOpen" />
  </div>
</template>
