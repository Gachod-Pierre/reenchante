<script setup lang="ts">
definePageMeta({ middleware: "guest" });

const email = ref("");
const loading = ref(false);
const errorMsg = ref("");
const successMsg = ref("");

const handleSubmit = async () => {
  loading.value = true;
  errorMsg.value = "";
  successMsg.value = "";

  try {
    const { success, message } = await $fetch("/api/auth/forgot-password", {
      method: "POST",
      body: { email: email.value },
    });

    if (success) {
      successMsg.value = message;
      email.value = "";
      setTimeout(() => {
        navigateTo("/login");
      }, 3000);
    }
  } catch (err: unknown) {
    const error = err as { data?: { statusMessage?: string } };
    errorMsg.value =
      error.data?.statusMessage || "Erreur lors de l'envoi du lien";
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
      <div class="text-center mb-8">
        <p class="text-4xl md:text-5xl mb-6">🔐</p>
        <h1
          class="text-2xl md:text-3xl font-bold mb-4"
          :style="{ color: '#FF1493' }"
        >
          Réinitialiser le mot de passe
        </h1>
        <p class="text-lg text-gray-700">
          Entrez votre email pour recevoir un lien de réinitialisation
        </p>
      </div>

      <!-- Formulaire -->
      <form class="space-y-4" @submit.prevent="handleSubmit">
        <!-- Email -->
        <div>
          <label class="block text-gray-700 font-bold mb-2">Email</label>
          <input
            v-model="email"
            type="email"
            placeholder="votre@email.com"
            required
            class="w-full px-4 py-3 rounded-lg border-2 border-gray-300 focus:outline-none focus:border-pink-500"
          />
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
          {{ loading ? "Envoi en cours..." : "Envoyer le lien" }}
        </button>
      </form>

      <!-- Lien retour -->
      <div class="text-center mt-6">
        <p class="text-gray-700">
          Vous vous souvenez de votre mot de passe ?
          <NuxtLink to="/login" class="font-bold" :style="{ color: '#FF1493' }">
            Retour à la connexion
          </NuxtLink>
        </p>
      </div>
    </div>
  </div>
</template>
