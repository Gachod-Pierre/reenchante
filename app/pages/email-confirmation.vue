<script setup lang="ts">
definePageMeta({ ssr: false });

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const loading = ref(true);
const errorMsg = ref("");
const isConnected = ref(false);

onMounted(async () => {
  const tokenHash = route.query.token_hash as string;
  const type = route.query.type as string;

  console.log("📧 Email confirmation page mounted:", {
    tokenHash: !!tokenHash,
    type,
    isUserConnected: !!user.value,
  });

  // Si token présent, vérifier l'email d'abord
  if (tokenHash && type === "email") {
    console.log("🔐 Verifying OTP token...");
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "email",
    });

    if (error) {
      console.error("❌ Verification error:", error);
      loading.value = false;
      errorMsg.value = error.message;
      return;
    } else {
      console.log("✅ Email verified!");
    }
  }

  // Après vérification (ou si pas de token), vérifier la connexion
  if (user.value) {
    console.log("👤 User already connected:", user.value.email);
    loading.value = false;
    isConnected.value = true;
    return;
  }

  // Sinon attendre la connexion
  console.log("⏳ Waiting for user connection...");
  const unwatch = watch(user, (newUser) => {
    if (newUser) {
      console.log("👤 User connected:", newUser.email);
      loading.value = false;
      isConnected.value = true;
      unwatch();
    }
  });
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

      <!-- Message d'attente -->
      <div v-else-if="loading" class="mb-8">
        <p class="text-4xl md:text-5xl mb-6">📧</p>
        <p
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#FF1493' }"
        >
          Vérifiez votre email !
        </p>
        <p class="text-lg text-gray-700 mb-6">
          Nous avons envoyé un lien de confirmation à votre adresse email, si vous ne voyez rien vérifiez vos spams ! 😉
          <br >
          <br >
          Cliquez sur le lien pour confirmer votre compte et commencer à
          réenchanter le monde ! ✨
          <br >
          <br >
          Si vous n'avez rien reçu, un compte existe déjà avec cette adresse email, essayez de vous connecter directement ou réinitialisez votre mot de passe.
        </p>
      </div>

      <!-- Email confirmé avec bouton -->
      <div v-else-if="isConnected" class="mb-8">
        <p class="text-4xl md:text-5xl mb-6">✨</p>
        <p
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#FF1493' }"
        >
          Email confirmé !
        </p>
        <p class="text-lg text-gray-700 mb-6">
          Votre compte a été créé avec succès. Bienvenue dans Réenchante ! 🌍
        </p>
        <NuxtLink
          to="/dashboard"
          class="inline-block px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg hover:scale-105 bg-[#FF1493] hover:bg-[#D9187F]"
        >
          Aller à la Dashboard
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Spinner */
</style>
