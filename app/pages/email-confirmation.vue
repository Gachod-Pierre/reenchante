<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js";

definePageMeta({ ssr: false });

const route = useRoute();
const supabase = useSupabaseClient();
const loading = ref(true);
const errorMsg = ref("");
const isConnected = ref(false);

let realtimeSubscription: RealtimeChannel | null = null;

onBeforeUnmount(() => {
  if (realtimeSubscription) {
    realtimeSubscription.unsubscribe();
  }
});

onMounted(async () => {
  const tokenHash = route.query.token_hash as string;
  const type = route.query.type as string;

  console.log("📧 Email confirmation page mounted");

  // Vérifier la session actuelle
  const { data: session } = await supabase.auth.getSession();
  const currentUserId = session?.session?.user?.id;
  console.log("🔍 Current session user:", currentUserId || "none");

  // Si déjà connecté et email confirmé
  if (currentUserId) {
    console.log("✅ Already connected with verified email");
    loading.value = false;
    isConnected.value = true;
    return;
  }

  // Si token présent, vérifier l'email
  if (tokenHash && (type === "signup" || type === "email")) {
    console.log("🔐 Verifying OTP token...");
    const { error, data } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: "signup",
    });

    if (error) {
      console.error("❌ Verification error:", error);
      loading.value = false;
      errorMsg.value = error.message;
      return;
    }

    console.log("✅ Email verified! User:", data?.user?.email);
    await new Promise((resolve) => setTimeout(resolve, 500));
    loading.value = false;
    isConnected.value = true;
    return;
  }

  // Écouter les changements d'authentification
  console.log("📡 Listening for auth state changes...");
  const { data } = supabase.auth.onAuthStateChange((event, newSession) => {
    console.log("🔄 Auth state change:", event, newSession?.user?.email);

    if (event === "SIGNED_IN" && newSession?.user) {
      console.log("✅ User signed in:", newSession.user.email);
      loading.value = false;
      isConnected.value = true;
      if (realtimeSubscription) {
        realtimeSubscription.unsubscribe();
      }
    }
  });

  // Cleanup
  onBeforeUnmount(() => {
    data?.subscription?.unsubscribe();
    if (realtimeSubscription) {
      realtimeSubscription.unsubscribe();
    }
  });

  // Setup Realtime pour les changements cross-device
  if (currentUserId) {
    console.log("📡 Setting Realtime listener for cross-device detection");
    realtimeSubscription = supabase
      .channel(`profiles-${currentUserId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${currentUserId}`,
        },
        (payload: { new: { email_verified_at: string | null } }) => {
          console.log("🔔 Profile updated:", payload);
          if (payload.new.email_verified_at) {
            console.log("✅ Email verified from other device!");
            isConnected.value = true;
            loading.value = false;
          }
        },
      )
      .subscribe((status) => {
        console.log("📡 Realtime status:", status);
      });
  }
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
          Nous avons envoyé un lien de confirmation à votre adresse email, si
          vous ne voyez rien vérifiez vos spams ! 😉
          <br >
          <br >
          Cliquez sur le lien pour confirmer votre compte et commencer à
          réenchanter le monde ! ✨
          <br >
          <br >
          Si vous n'avez rien reçu, un compte existe déjà avec cette adresse
          email, essayez de vous connecter directement ou réinitialisez votre
          mot de passe.
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
