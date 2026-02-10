<script setup lang="ts">
definePageMeta({ ssr: false });

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();
const loading = ref(true);
const errorMsg = ref("");
const isConnected = ref(false);
const isVerified = ref(false);

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
      loading.value = false;
      
      // Vérifier si utilisateur est connecté après verifyOtp
      if (user.value) {
        console.log("✅ Same device - User connected:", user.value.email);
        isConnected.value = true;
      } else {
        console.log("📱 Cross-device - Email verified but not connected");
        isVerified.value = true;
      }
      return;
    }
  }

  // Si pas de token mais déjà connecté
  if (user.value) {
    console.log("👤 User already connected:", user.value.email);
    loading.value = false;
    isConnected.value = true;
    return;
  }

  // Sinon attendre la connexion (cas rare: token absent et pas d'utilisateur)
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
          Nous avons envoyé un lien de confirmation à votre adresse email.
          <br >
          <br >
          Cliquez sur le lien pour confirmer votre compte et commencer à
          réenchanter le monde ! ✨
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
          class="inline-block px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105"
          :style="{ backgroundColor: '#FF1493' }"
        >
          Aller à la Dashboard
        </NuxtLink>
      </div>

      <!-- Email vérifié (audit-device) - bouton se connecter -->
      <div v-else-if="isVerified && !isConnected" class="mb-8">
        <p class="text-4xl md:text-5xl mb-6">✅</p>
        <p
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#FF1493' }"
        >
          Email vérifié !
        </p>
        <p class="text-lg text-gray-700 mb-6">
          Votre email a été confirmé avec succès. Connectez-vous pour accéder à votre dashboard.
        </p>
        <NuxtLink
          to="/login"
          class="inline-block px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105"
          :style="{ backgroundColor: '#FF1493' }"
        >
          Se connecter
        </NuxtLink>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Spinner */
</style>