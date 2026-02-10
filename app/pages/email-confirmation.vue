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
  let email = route.query.email as string;

  // Si pas d'email en paramètre, récupère depuis localStorage
  if (!email && typeof window !== "undefined") {
    email = localStorage.getItem("pending_email") || "";
  }

  console.log("📧 Email confirmation page mounted:", {
    tokenHash: !!tokenHash,
    type,
    email,
    isUserConnected: !!user.value,
  });

  // Si token présent, vérifier l'email d'abord
  if (tokenHash && (type === "email" || type === "signup")) {
    console.log("🔐 Verifying OTP token...", { tokenHash, type, email });
    const { error } = await supabase.auth.verifyOtp({
      token_hash: tokenHash,
      type: (type as "email" | "signup") || "email",
    });

    if (error) {
      console.error("❌ Verification error:", error);
      loading.value = false;
      errorMsg.value = error.message;
      return;
    } else {
      console.log("✅ Email verified!");

      // Attendre que user.value se mette à jour après verifyOtp
      await new Promise((resolve) => setTimeout(resolve, 500));

      console.log("✅ After verifyOtp - user.value:", user.value?.email);
      loading.value = false;

      // Vérifier si utilisateur est connecté après verifyOtp
      if (user.value) {
        console.log("✅ Same device - User connected:", user.value.email);
        isConnected.value = true;
        // Nettoie localStorage s'il existe
        if (typeof window !== "undefined") {
          localStorage.removeItem("pending_email");
        }
        return;
      } else {
        console.log("📱 Cross-device - Email verified but not connected");
        // Continue to realtime listener below
      }
    }
  }

  // Si pas connecté, écouter en Realtime les modifications du profile
  if (!user.value && email) {
    console.log("📡 Setting up Realtime listener for email:", email);

    let confirmed = false;

    const realtimeListener = supabase
      .channel("profiles")
      .on(
        "postgres_changes",
        {
          event: "UPDATE",
          schema: "public",
          table: "profiles",
        },
        (payload: { new: { email_verified_at: string | null } }) => {
          console.log(
            "🔔 Profile update detected - email_verified_at:",
            payload.new.email_verified_at,
          );

          // Si email_verified_at n'est pas null, l'email a été confirmé
          if (payload.new.email_verified_at && !confirmed) {
            console.log("✅ Email confirmed detected via Realtime!");
            confirmed = true;
            loading.value = false;
            isVerified.value = true;
            // Cleanup localStorage
            if (typeof window !== "undefined") {
              localStorage.removeItem("pending_email");
            }
            realtimeListener.unsubscribe();
          }
        },
      )
      .subscribe((status) => {
        console.log("📡 Realtime subscription status:", status);
        if (status === "SUBSCRIBED") {
          console.log(
            "✅ Realtime listener active - waiting for email confirmation!",
          );
        }
      });

    // Cleanup
    onBeforeUnmount(() => {
      realtimeListener.unsubscribe();
    });
  } else if (user.value) {
    // Si déjà connecté, montrer le template
    loading.value = false;
    isConnected.value = true;
    // Nettoie localStorage s'il existe
    if (typeof window !== "undefined") {
      localStorage.removeItem("pending_email");
    }
  } else if (!email) {
    // Pas d'email et pas de user = problème
    console.error("❌ No email found");
    loading.value = false;
    errorMsg.value = "Email non trouvé. Veuillez vous inscrire à nouveau.";
  }

  // Watcher pour détecter quand l'utilisateur se connecte après le mount
  watch(
    () => user.value,
    (newUser) => {
      if (newUser && !isConnected.value) {
        console.log("👤 User connected after mount:", newUser.email);
        loading.value = false;
        isConnected.value = true;
        if (typeof window !== "undefined") {
          localStorage.removeItem("pending_email");
        }
      }
    },
  );
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
          Votre email a été confirmé avec succès. Connectez-vous pour accéder à
          votre dashboard.
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
