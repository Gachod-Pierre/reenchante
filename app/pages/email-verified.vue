<script setup lang="ts">
definePageMeta({ ssr: false });

const route = useRoute();
const supabase = useSupabaseClient();
const user = useSupabaseUser();

const loading = ref(true);
const errorMsg = ref("");

onMounted(async () => {
  const code = route.query.code as string;
  const email = route.query.email as string;

  console.log("📧 Email verified page mounted:", { code: !!code, email });

  if (!code) {
    loading.value = false;
    errorMsg.value = "Code d'authentification manquant.";
    return;
  }

  try {
    console.log("🔐 Verifying email with code...");
    const { error } = await supabase.auth.verifyOtp({
      token_hash: code,
      type: "email",
    });

    if (error) {
      console.error("❌ Verification error:", error);
      loading.value = false;
      errorMsg.value = error.message;
      return;
    }

    console.log("✅ Email verified successfully!");
    loading.value = false;
  } catch (err) {
    console.error("❌ Unexpected error:", err);
    loading.value = false;
    errorMsg.value = "Une erreur est survenue.";
  }
});
</script>

<template>
  <div
    class="min-h-screen bg-gradient-to-b from-indigo-900 via-purple-900 to-black flex items-center justify-center p-4"
  >
    <div class="w-full max-w-md">
      <!-- Chargement -->
      <div v-if="loading" class="text-center">
        <div
          class="animate-spin rounded-full h-12 w-12 border-b-2 border-white mx-auto mb-4"
        ></div>
        <p class="text-white text-lg">Vérification en cours...</p>
      </div>

      <!-- Erreur -->
      <div
        v-else-if="errorMsg"
        class="bg-red-500 bg-opacity-20 border border-red-500 rounded-lg p-6 text-center"
      >
        <p class="text-white text-lg mb-4">❌ {{ errorMsg }}</p>
        <NuxtLink
          to="/login"
          class="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
        >
          Retour à la connexion
        </NuxtLink>
      </div>

      <!-- Succès -->
      <div
        v-else
        class="bg-green-500 bg-opacity-20 border border-green-500 rounded-lg p-8 text-center"
      >
        <p class="text-4xl mb-4">✅</p>
        <h1 class="text-white text-2xl font-bold mb-2">Email vérifié!</h1>
        <p class="text-gray-300 mb-6">
          Votre adresse email a été confirmée avec succès.
        </p>

        <div class="space-y-3">
          <p class="text-gray-400 text-sm">
            Vous pouvez fermer cette page ou vous connecter.
          </p>
          <NuxtLink
            to="/login"
            class="inline-block px-6 py-2 bg-indigo-600 hover:bg-indigo-700 text-white rounded-lg"
          >
            Aller à la connexion
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
