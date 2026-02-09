<script setup lang="ts">
definePageMeta({ ssr: false });

const user = useSupabaseUser();
const loading = ref(true);
const errorMsg = ref("");

onMounted(() => {
  // Si déjà connecté, rediriger immédiatement
  if (user.value) {
    navigateTo("/dashboard");
    return;
  }

  // Sinon attendre la connexion
  const unwatch = watch(user, (newUser) => {
    if (newUser) {
      unwatch();
      navigateTo("/dashboard");
    }
  });

  // Timeout après 10 secondes
  setTimeout(() => {
    if (loading.value) {
      errorMsg.value = "Connexion expirée, veuillez réessayer";
      loading.value = false;
      unwatch();
    }
  }, 10000);
});

const pageStyle = {
  width: "100%",
  minHeight: "100vh",
  backgroundColor: "#f4f4f4",
  backgroundImage:
    "linear-gradient(rgba(180, 180, 180, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(180, 180, 180, 0.2) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
};
</script>

<template>
  <div
    :style="pageStyle"
    class="flex items-center justify-center min-h-screen px-4"
    style="cursor: default"
  >
    <div class="text-center">
      <!-- Erreur -->
      <div v-if="errorMsg" class="mb-8">
        <p
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#EF4444' }"
        >
          Oups ! ❌
        </p>
        <p class="text-lg text-gray-700 mb-6">
          {{ errorMsg }}
        </p>
        <NuxtLink
          to="/login"
          class="inline-block px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105"
          :style="{ backgroundColor: '#FF1493' }"
        >
          Retour à la connexion
        </NuxtLink>
      </div>

      <!-- Chargement -->
      <div v-else-if="loading" class="mb-8">
        <div class="flex justify-center mb-8">
          <svg
            class="spinner-svg"
            viewBox="0 0 50 50"
            xmlns="http://www.w3.org/2000/svg"
          >
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#ff69b4"
              stroke-width="4"
            />
            <circle
              cx="25"
              cy="25"
              r="20"
              fill="none"
              stroke="#ff1493"
              stroke-width="4"
              stroke-dasharray="31.4 125.6"
            />
          </svg>
        </div>
        <p class="text-2xl md:text-3xl font-bold" :style="{ color: '#FF1493' }">
          Direction le Réenchantement du monde ! 😁
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
.spinner-svg {
  width: 50px;
  height: 50px;
  animation: spin 1s linear infinite;
  outline: none !important;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
