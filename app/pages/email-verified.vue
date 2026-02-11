<script setup lang="ts">
definePageMeta({ ssr: false });

const user = useSupabaseUser();

// Style du fond quadrillé
const pageStyle = {
  backgroundColor: "#F3F4F6",
  backgroundImage:
    "linear-gradient(rgba(180, 180, 180, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(180, 180, 180, 0.2) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
};
</script>

<template>
  <div
    :style="pageStyle"
    class="flex items-center justify-center min-h-screen px-4"
  >
    <div class="text-center">
      <p class="text-4xl md:text-5xl mb-6">✅</p>
      <p
        class="text-2xl md:text-3xl font-bold mb-4"
        :style="{ color: '#FF1493' }"
      >
        Email vérifié !
      </p>

      <!-- Texte si pas connecté -->
      <p v-if="!user" class="text-lg text-gray-700 mb-6">
        Votre email a été confirmé avec succès. Vous pouvez fermer cette page ou
        vous connecter.
      </p>

      <!-- Texte si connecté -->
      <p v-else class="text-lg text-gray-700 mb-6">
        Votre email a été confirmé avec succès. Vous pouvez fermer cette page ou
        aller à la Dashboard.
      </p>

      <!-- Bouton Login si pas connecté -->
      <NuxtLink
        v-if="!user"
        to="/login"
        class="inline-block px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105"
        :style="{ backgroundColor: '#FF1493' }"
      >
        Aller à la connexion
      </NuxtLink>

      <!-- Bouton Dashboard si connecté -->
      <NuxtLink
        v-else
        to="/dashboard"
        class="inline-block px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105"
        :style="{ backgroundColor: '#FF1493' }"
      >
        Aller à la Dashboard
      </NuxtLink>
    </div>
  </div>
</template>

<style scoped>
/* Spinner animation */
</style>
