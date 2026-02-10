<script setup lang="ts">
import type { RealtimeChannel } from "@supabase/supabase-js";

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
  // Note: Supabase envoie type="signup" pour les emails de confirmation de signup
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
    } else {
      console.log("✅ Email verified!", data?.user?.email);
      // Rafraîchir la session après vérification
      const { data: session } = await supabase.auth.getSession();
      if (session?.session?.user) {
        console.log("👤 Session updated after verification");
        loading.value = false;
        isConnected.value = true;
        return;
      }
    }
  }

  // Après vérification (ou si pas de token), vérifier la connexion
  if (user.value) {
    console.log("👤 User already connected:", user.value.email);
    loading.value = false;
    isConnected.value = true;
    return;
  }

  // Écouter les changements de session en temps réel (fonctionne même si confirmé depuis un autre appareil)
  console.log("⏳ Waiting for user connection...");
  let realtimeSubscription: RealtimeChannel | null = null;
  let userId: string | null = null;

  // 1️⃣ Écouter la session auth (même appareil)
  const {
    data: { subscription: authSub },
  } = supabase.auth.onAuthStateChange((_event, session) => {
    console.log("🔄 Auth state changed:", _event, !!session?.user);
    if (session?.user) {
      userId = session.user.id;
      console.log("👤 User connected via auth change:", session.user.email);
      loading.value = false;
      isConnected.value = true;
      authSub?.unsubscribe();
      realtimeSubscription?.unsubscribe();
    }
  });

  // Si user existe déjà, récupérer son ID depuis la session
  if (!userId && user.value) {
    const { data } = await supabase.auth.getSession();
    if (data?.session?.user?.id) {
      userId = data.session.user.id;
    }
  }

  // 2️⃣ Écouter Realtime sur profiles pour détecter email_verified_at (autre appareil)
  if (userId) {
    console.log("📡 Setting up Realtime listener for profiles...");
    realtimeSubscription = supabase
      .channel(`public:profiles:id=eq.${userId}`)
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
          filter: `id=eq.${userId}`,
        },
        (payload: { new: { email_verified_at: string | null } }) => {
          console.log("🔔 Profile updated:", payload.new);
          if (payload.new.email_verified_at) {
            console.log("✅ Email verified detected from another device!");
            loading.value = false;
            isConnected.value = true;
            authSub?.unsubscribe();
            realtimeSubscription?.unsubscribe();
          }
        },
      )
      .subscribe();
  }

  // Cleanup subscriptions quand le composant est démonté
  onBeforeUnmount(() => {
    authSub?.unsubscribe();
    realtimeSubscription?.unsubscribe();
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
