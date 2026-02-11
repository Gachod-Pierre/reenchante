<script setup lang="ts">
import { useSupabaseClient } from "#imports";

definePageMeta({ ssr: false, middleware: "guest" });

const supabase = useSupabaseClient();
const newPassword = ref("");
const confirmPassword = ref("");
const loading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");
const hasValidToken = ref(false);
const isCheckingToken = ref(true); // 🆕 Loading state

onMounted(async () => {
  // Extraire les tokens du hash (Supabase les met après #)
  const hash = window.location.hash.slice(1); // Enlever le #
  const params = new URLSearchParams(hash);

  const accessToken = params.get("access_token");
  const refreshToken = params.get("refresh_token");
  const type = params.get("type");

  console.log("🔐 Reset password page - checking hash tokens");
  console.log("  access_token exists:", !!accessToken);
  console.log("  refresh_token exists:", !!refreshToken);
  console.log("  type:", type);

  if (!accessToken || type !== "recovery") {
    errorMsg.value = "Code de réinitialisation manquant ou invalide";
    console.error("❌ Missing token or wrong type");
    isCheckingToken.value = false; // 🆕 Stop loading
    return;
  }

  // Créer une session avec les tokens
  try {
    console.log("🔐 Setting session with recovery tokens...");
    const { error } = await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken!,
    });

    if (error) {
      console.error("❌ Error setting session:", error);
      errorMsg.value = "Erreur lors de l'authentification";
      isCheckingToken.value = false; // 🆕 Stop loading
      return;
    }

    hasValidToken.value = true;
    console.log("✅ Session created successfully, ready to reset password");
  } catch (err: unknown) {
    console.error("❌ Session error:", err);
    errorMsg.value = "Erreur lors de l'authentification";
  } finally {
    isCheckingToken.value = false; // 🆕 Always stop loading
  }
});

const handleSubmit = async () => {
  errorMsg.value = "";
  successMsg.value = "";

  // Validation
  if (!newPassword.value || !confirmPassword.value) {
    errorMsg.value = "Tous les champs sont requis";
    return;
  }

  if (newPassword.value.length < 6) {
    errorMsg.value = "Le mot de passe doit contenir au moins 6 caractères";
    return;
  }

  if (newPassword.value !== confirmPassword.value) {
    errorMsg.value = "Les mots de passe ne correspondent pas";
    return;
  }

  loading.value = true;

  try {
    console.log("🔐 Updating password...");

    // Utiliser la session actuelle pour mettre à jour le password
    const { error } = await supabase.auth.updateUser({
      password: newPassword.value,
    });

    if (error) {
      throw error;
    }

    console.log("✅ Password updated successfully");
    successMsg.value = "Mot de passe réinitialisé avec succès!";

    // Attendre 2 secondes et rediriger vers login
    setTimeout(() => {
      navigateTo("/login");
    }, 2000);
  } catch (err: unknown) {
    const error = err as { message?: string };
    errorMsg.value =
      error.message || "Erreur lors de la réinitialisation du mot de passe";
    console.error("❌ Error:", err);
  } finally {
    loading.value = false;
  }
};

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
    <div class="w-full max-w-md">
      <!-- Loading - Vérification du token -->
      <div v-if="isCheckingToken" class="text-center">
        <p class="text-4xl md:text-5xl mb-6">⏳</p>
        <h1
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#FF1493' }"
        >
          Vérification en cours...
        </h1>
        <p class="text-lg text-gray-700">
          Nous vérifions votre lien de réinitialisation
        </p>
      </div>

      <!-- Erreur code manquant -->
      <div v-else-if="!hasValidToken" class="text-center">
        <p class="text-4xl md:text-5xl mb-6">❌</p>
        <h1
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#EF4444' }"
        >
          Oups !
        </h1>
        <p class="text-lg text-gray-700 mb-6">
          Code de réinitialisation manquant ou invalide.
        </p>
        <NuxtLink
          to="/forgot-password"
          class="inline-block px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105"
          :style="{ backgroundColor: '#FF1493' }"
        >
          Demander un nouveau lien
        </NuxtLink>
      </div>

      <!-- Formulaire -->
      <div v-else>
        <div class="text-center mb-8">
          <p class="text-4xl md:text-5xl mb-6">🔑</p>
          <h1
            class="text-2xl md:text-3xl font-bold mb-4"
            :style="{ color: '#FF1493' }"
          >
            Nouveau mot de passe
          </h1>
          <p class="text-lg text-gray-700">Entrez votre nouveau mot de passe</p>
        </div>

        <form class="space-y-4" @submit.prevent="handleSubmit">
          <!-- Nouveau password -->
          <div>
            <label class="block text-gray-700 font-bold mb-2">
              Nouveau mot de passe
            </label>
            <input
              v-model="newPassword"
              type="password"
              placeholder="••••••••"
              required
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-pink-500"
            >
          </div>

          <!-- Confirm password -->
          <div>
            <label class="block text-gray-700 font-bold mb-2">
              Confirmer le mot de passe
            </label>
            <input
              v-model="confirmPassword"
              type="password"
              placeholder="••••••••"
              required
              class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-pink-500"
            >
          </div>

          <!-- Erreur -->
          <div
            v-if="errorMsg"
            class="p-4 bg-red-100 border border-red-500 rounded-lg"
          >
            <p class="text-red-700">❌ {{ errorMsg }}</p>
          </div>

          <!-- Succès -->
          <div
            v-if="successMsg"
            class="p-4 bg-green-100 border border-green-500 rounded-lg"
          >
            <p class="text-green-700">✅ {{ successMsg }}</p>
            <p class="text-green-600 text-sm mt-2">
              Redirection vers la connexion...
            </p>
          </div>

          <!-- Bouton Submit -->
          <button
            type="submit"
            :disabled="loading"
            class="w-full py-3 px-4 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50"
            :style="{ backgroundColor: loading ? '#ccc' : '#FF1493' }"
          >
            {{
              loading ? "Réinitialisation..." : "Réinitialiser le mot de passe"
            }}
          </button>
        </form>
      </div>
    </div>
  </div>
</template>
