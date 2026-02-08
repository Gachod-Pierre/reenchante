<script setup lang="ts">
import { ref } from "vue";

defineProps<{
  isOpen: boolean;
}>();

const emit = defineEmits<{
  "update:isOpen": [value: boolean];
}>();

const currentStep = ref(0);

const steps = [
  {
    title: "Bienvenue sur Reenchante !",
    description:
      "Une plateforme collaborative où les bonnes actions réenchantent le monde !",
    icon: "🌍",
  },
  {
    title: "Comment ça marche ?",
    description:
      "Chaque utilisateur connecté partage avec le monde entier la réalisation de ses bonnes actions préalablement choisies depuis la page d'actions.",
    icon: "✨",
  },
  {
    title: "Explorez la planète",
    description:
      "Avec la souris ou votre doigt, attrapez la planète et faites-la tourner ! Cliquez sur une pastille rose (sur ordinateur) ou appuyez dessus de façon prolongée (sur mobile) pour découvrir les bonnes actions réalisées par d'autres utilisateurs dans le monde !",
    icon: "🌐",
  },
  {
    title: "Participez aux actions",
    description:
      "Connectez-vous et explorez le catalogue de bonnes actions. Soumettez vos bonnes actions avec une preuve en image pour gagner des points et grimper dans le classement mondial !",
    icon: "🎯",
  },
  {
    title: "Illumiez le monde",
    description:
      "Les points des utilisateurs du monde entier permettent de faire grimper le classement global mondial, d'atteindre des palliers et d'illuminer le monde ! Visitez régulièrement la page de classement pour voir l'évolution du monde et votre impact personnel !",
    icon: "🏆",
  },
];

const totalSteps = steps.length;

function nextStep() {
  if (currentStep.value < totalSteps - 1) {
    currentStep.value++;
  } else {
    completeOnboarding();
  }
}

function prevStep() {
  if (currentStep.value > 0) {
    currentStep.value--;
  }
}

function completeOnboarding() {
  localStorage.setItem("onboarding_completed", "true");
  emit("update:isOpen", false);
  currentStep.value = 0;
}

function closeWizard() {
  localStorage.setItem("onboarding_completed", "true");
  emit("update:isOpen", false);
  currentStep.value = 0;
}
</script>

<template>
  <!-- Teleport pour afficher le wizard en dehors de la hiérarchie du composant -->
  <Teleport to="body">
    <div
      v-if="isOpen"
      class="fixed inset-0 bg-black/40 flex items-center justify-center z-[51] p-4"
      @click.self="closeWizard"
    >
      <div
        class="bg-white rounded-3xl p-8 md:p-12 max-w-lg w-full animate-scaleIn"
      >
        <!-- Header avec fermture -->
        <div class="flex justify-between items-center mb-8">
          <div class="text-5xl">
            {{ steps[currentStep]?.icon }}
          </div>
          <button
            class="text-gray-400 hover:text-gray-600 text-2xl transition-colors"
            @click="closeWizard"
          >
            ✕
          </button>
        </div>

        <!-- Contenu de l'étape -->
        <div class="mb-8">
          <!-- Numéro de l'étape -->
          <div class="mb-3">
            <span
              class="inline-block px-3 py-1 rounded-full text-sm font-bold text-white"
              :style="{ backgroundColor: '#FF1493' }"
            >
              Étape {{ currentStep + 1 }} / {{ totalSteps }}
            </span>
          </div>

          <h2 class="text-3xl font-black mb-4" :style="{ color: '#FF1493' }">
            {{ steps[currentStep]?.title }}
          </h2>
          <p class="text-gray-700 text-lg leading-relaxed">
            {{ steps[currentStep]?.description }}
          </p>
        </div>

        <!-- Indicateur de progression (points) -->
        <div class="flex justify-center gap-2 mb-8">
          <button
            v-for="(step, index) in steps"
            :key="index"
            class="h-2 rounded-full transition-all duration-300"
            :class="
              index === currentStep
                ? 'bg-[#FF1493] w-8'
                : index < currentStep
                  ? 'bg-[#FF1493] w-2'
                  : 'bg-gray-300 w-2'
            "
            @click="currentStep = index"
          />
        </div>

        <!-- Boutons de navigation -->
        <div class="flex gap-3 justify-between">
          <button
            v-if="currentStep > 0"
            class="px-6 py-3 rounded-lg font-bold text-white bg-gray-500 hover:bg-gray-600 transition-all duration-300 hover:scale-105"
            @click="prevStep"
          >
            ← Précédent
          </button>
          <div v-else class="flex-1" />

          <button
            v-if="currentStep < totalSteps - 1"
            class="px-6 py-3 rounded-lg font-bold text-white bg-[#FF1493] hover:bg-[#D9187F] transition-all duration-300 hover:scale-105"
            @click="nextStep"
          >
            Suivant →
          </button>
          <button
            v-else
            class="px-6 py-3 rounded-lg font-bold text-white bg-[#FF1493] hover:bg-[#D9187F] transition-all duration-300 hover:scale-105"
            @click="completeOnboarding"
          >
            C'est parti ! 🚀
          </button>
        </div>
      </div>
    </div>
  </Teleport>
</template>

<style scoped>
@keyframes scaleIn {
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
}

.animate-scaleIn {
  animation: scaleIn 0.3s ease-out;
}
</style>
