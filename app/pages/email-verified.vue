<script setup lang="ts">
definePageMeta({ ssr: false });

const route = useRoute();
const router = useRouter();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const loading = ref(true);
const errorMsg = ref("");

// Style du fond quadrillé
const pageStyle = {
  backgroundColor: "#F3F4F6",
  backgroundImage:
    "linear-gradient(rgba(180, 180, 180, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(180, 180, 180, 0.2) 1px, transparent 1px)",
  backgroundSize: "60px 60px",
};

onMounted(async () => {
  const tokenHash = route.query.token_hash as string;
  const type = route.query.type as string;

  console.log("📧 Email verified page mounted:", {
    tokenHash: !!tokenHash,
    type,
    isUserConnected: !!user.value,
  });

  // Si token présent, vérifier l'email et créer la session
  if (tokenHash && (type === "email" || type === "signup")) {
    console.log("🔐 Verifying OTP token...", { tokenHash, type });
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: (type as "email" | "signup") || "email",
    });

    if (error) {
      console.error("❌ Verification error:", error);
      errorMsg.value = error.message;
      loading.value = false;
      return;
    }

    console.log("✅ Email verified and session created!");
    // Attendre que user.value se mette à jour après verifyOtp
    await new Promise((resolve) => setTimeout(resolve, 500));
  }

  loading.value = false;
});

// Redirection automatique vers dashboard si connecté
watch(
  () => user.value,
  (newUser) => {
    if (newUser && !loading.value && !errorMsg.value) {
      console.log("✅ User connected, redirecting to dashboard...");
      router.push("/dashboard");
    }
  },
);
</script>

<template>
  <div
    :style="pageStyle"
    class="flex items-center justify-center min-h-screen px-4"
  >
    <div class="text-center">
      <!-- État de chargement -->
      <div v-if="loading">
        <p class="text-4xl md:text-5xl mb-6">⏳</p>
        <p
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#FF1493' }"
        >
          Vérification en cours...
        </p>
        <p class="text-lg text-gray-700">Veuillez patienter</p>
      </div>

      <!-- État d'erreur -->
      <div v-else-if="errorMsg">
        <p class="text-4xl md:text-5xl mb-6">❌</p>
        <p
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#FF1493' }"
        >
          Erreur de vérification
        </p>
        <p class="text-lg text-red-600 mb-6">{{ errorMsg }}</p>
        <NuxtLink
          to="/login"
          class="inline-block px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105"
          :style="{ backgroundColor: '#FF1493' }"
        >
          Retour à la connexion
        </NuxtLink>
      </div>

      <!-- État de succès - Pas connecté (cross-device) -->
      <div v-else-if="!user">
        <p class="text-4xl md:text-5xl mb-6">✅</p>
        <p
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#FF1493' }"
        >
          Email vérifié !
        </p>
        <p class="text-lg text-gray-700 mb-6">
          Votre email a été confirmé avec succès. Veuillez vous connecter pour
          accéder à votre compte.
        </p>
        <NuxtLink
          to="/login"
          class="inline-block px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105"
          :style="{ backgroundColor: '#FF1493' }"
        >
          Aller à la connexion
        </NuxtLink>
      </div>

      <!-- État de succès - Connecté (même device) -->
      <div v-else>
        <p class="text-4xl md:text-5xl mb-6">✅</p>
        <p
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#FF1493' }"
        >
          Email vérifié !
        </p>
        <p class="text-lg text-gray-700 mb-6">
          Votre email a été confirmé et vous êtes maintenant connecté(e).
          Redirection vers le dashboard...
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Spinner animation */
</style>
