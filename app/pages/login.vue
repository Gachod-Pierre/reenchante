<script setup lang="ts">
definePageMeta({
  middleware: ["guest"],
});

const email = ref("");
const password = ref("");
const errorMsg = ref("");
const isSignUp = ref(false);
const loading = ref(false);
const planetOffset = ref(0);

const supabase = useSupabaseClient();
const user = useSupabaseUser();
const router = useRouter();
const config = useRuntimeConfig();

onMounted(() => {
  window.addEventListener("scroll", handleParallax);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleParallax);
});

const handleParallax = () => {
  const scrollY = window.scrollY;
  const maxScroll = document.documentElement.scrollHeight - window.innerHeight;

  // Limit parallax movement to prevent overlap with footer
  const parallaxAmount = Math.min(scrollY * 0.3, maxScroll * 0.3);
  planetOffset.value = parallaxAmount;
};

async function signInWithGoogle() {
  const siteUrl =
    typeof window !== "undefined"
      ? window.location.origin
      : config.public.siteUrl;

  const { error } = await supabase.auth.signInWithOAuth({
    provider: "google",
    options: {
      redirectTo: `${siteUrl}/confirm`,
    },
  });
  if (error) errorMsg.value = error.message;
}

async function signUp() {
  errorMsg.value = "";
  loading.value = true;
  try {
    // Construire l'URL de redirection correctement
    const siteUrl =
      typeof window !== "undefined"
        ? window.location.origin
        : config.public.siteUrl;

    const { error } = await supabase.auth.signUp({
      email: email.value,
      password: password.value,
      options: {
        emailRedirectTo: `${siteUrl}/email-verified`,
        // Désactiver PKCE pour forcer OTP flow - meilleur pour cross-device
        shouldCreateUser: true,
      },
    });
    console.log("✅ SignUp result:", {
      error,
      currentUser: user.value?.email || "no user",
    });
    if (error) {
      errorMsg.value = error.message;
      loading.value = false;
    } else {
      console.log("🎯 Storing email and navigating to /email-confirmation");
      // Stocke l'email en localStorage pour la page email-confirmation
      if (typeof window !== "undefined") {
        localStorage.setItem("pending_email", email.value);
      }
      await navigateTo("/email-confirmation");
    }
  } catch (err: unknown) {
    console.error("❌ SignUp error:", err);
    const errorMessage =
      err instanceof Error ? err.message : "Erreur lors de l'inscription";
    errorMsg.value = errorMessage;
    loading.value = false;
  }
}

async function signIn() {
  errorMsg.value = "";
  loading.value = true;
  const { error, data } = await supabase.auth.signInWithPassword({
    email: email.value,
    password: password.value,
  });
  loading.value = false;
  if (error) {
    errorMsg.value = error.message;
  } else if (data.session) {
    await navigateTo("/confirm");
  } else {
    errorMsg.value = "Connexion échouée";
  }
}

async function signOut() {
  await supabase.auth.signOut();
}

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
  <div :style="pageStyle" class="relative overflow-hidden">
    <!-- Logo en arrière-plan avec parallax -->
    <div
      class="fixed lg:bottom-[-30%] md:bottom-[-20%] lg:right-[-30%] z-5 pointer-events-none planet-animation"
      :style="{ transform: `translateY(${planetOffset}px)` }"
    >
      <div class="w-full h-full flex items-center justify-center">
        <NuxtImg
          src="/images/réenchanter.png"
          alt="Réenchanter"
          class="w-full h-full min-w-[100rem] object-cover planet-rotate"
        />
      </div>
    </div>

    <!-- Contenu principal (au-dessus du logo) -->
    <div
      class="min-h-screen flex items-center justify-center px-4 py-12 relative z-10"
    >
      <div class="w-full max-w-3xl">
        <!-- Titre -->
        <div class="text-center mb-12 mt-16">
          <h1
            class="text-5xl md:text-6xl font-black mb-2"
            :style="{ color: '#FF1493' }"
          >
            Réenchante
          </h1>
          <p class="text-gray-600 text-base md:text-lg">le monde 🌍✨</p>
        </div>

        <!-- Texte explicatif -->
        <div
          class="mb-10 p-5 md:p-8 lg:p-10 rounded-2xl border-2"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.9)',
          }"
        >
          <p class="text-gray-700 text-sm md:text-base leading-relaxed">
            Réenchante est une plateforme communautaire où chacun peut réaliser
            des bonnes actions et contribuer à rendre le monde un peu plus beau.
            <br />
            <br />
            Soumets tes preuves de bienveillance, accumule des points et grimpe
            le classement mondial ! 💛
          </p>
        </div>

        <!-- Carte de login/signup -->
        <div
          class="p-5 md:p-8 lg:p-10 rounded-2xl border-2 mb-6"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.95)',
          }"
        >
          <div v-if="!user">
            <!-- Tabs pour basculer entre Sign In et Sign Up -->
            <div
              class="flex gap-4 mb-6 border-b-2"
              :style="{ borderColor: '#FF69B4' }"
            >
              <button
                class="flex-1 py-3 font-bold transition-all duration-75"
                :style="{
                  color: !isSignUp ? '#FF1493' : '#999',
                  borderBottom: !isSignUp ? '3px solid #FF1493' : 'none',
                  marginBottom: '-2px',
                }"
                @click="isSignUp = false"
              >
                Connexion
              </button>
              <button
                class="flex-1 py-3 font-bold transition-all duration-75"
                :style="{
                  color: isSignUp ? '#FF1493' : '#999',
                  borderBottom: isSignUp ? '3px solid #FF1493' : 'none',
                  marginBottom: '-2px',
                }"
                @click="isSignUp = true"
              >
                Inscription
              </button>
            </div>

            <!-- Formulaire -->
            <div class="space-y-4 mb-6">
              <div>
                <label
                  class="block text-sm font-semibold text-gray-700 mb-2"
                  :style="{ color: '#FF1493' }"
                >
                  Email
                </label>
                <input
                  v-model="email"
                  type="email"
                  placeholder="ton@email.com"
                  class="w-full px-3 md:px-5 lg:px-8 py-3 border-2 rounded-lg outline-none transition-all duration-300 text-base focus:bg-gray-100 focus:shadow-[0_0_0_3px_rgba(255,105,180,0.2)]"
                  :style="{
                    borderColor: '#FF69B4',
                  }"
                />
              </div>

              <div>
                <label
                  class="block text-sm font-semibold text-gray-700 mb-2"
                  :style="{ color: '#FF1493' }"
                >
                  Mot de passe
                </label>
                <input
                  v-model="password"
                  type="password"
                  placeholder="••••••••"
                  class="w-full px-3 md:px-5 lg:px-8 py-3 border-2 rounded-lg outline-none transition-all duration-300 text-base focus:bg-gray-100 focus:shadow-[0_0_0_3px_rgba(255,105,180,0.2)]"
                  :style="{
                    borderColor: '#FF69B4',
                  }"
                />
                <div v-if="!isSignUp" class="mt-2">
                  <NuxtLink
                    to="/forgot-password"
                    class="text-sm font-semibold transition-all duration-300 hover:underline"
                    :style="{ color: '#FF1493' }"
                  >
                    Mot de passe oublié ?
                  </NuxtLink>
                </div>
              </div>
            </div>

            <!-- Messages d'erreur/succès -->
            <div
              v-if="errorMsg"
              class="mb-6 p-4 rounded-lg text-sm"
              :style="{
                backgroundColor: errorMsg.includes('réussie')
                  ? 'rgba(34, 197, 94, 0.1)'
                  : 'rgba(239, 68, 68, 0.1)',
                color: errorMsg.includes('réussie') ? '#16a34a' : '#dc2626',
                borderLeft: `4px solid ${
                  errorMsg.includes('réussie') ? '#22c55e' : '#ef4444'
                }`,
              }"
            >
              {{ errorMsg }}
            </div>

            <!-- Boutons -->
            <div
              class="space-y-3 flex flex-col pt-5 items-center md:max-w-sm md:mx-auto"
            >
              <button
                class="w-full md:w-full px-6 py-3 rounded-lg font-bold text-white disabled:opacity-50 disabled:cursor-not-allowed bg-[#FF1493] transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-[#D9187F]"
                :disabled="loading"
                @click="isSignUp ? signUp() : signIn()"
              >
                {{
                  loading
                    ? "Chargement..."
                    : isSignUp
                      ? "S'inscrire"
                      : "Se connecter"
                }}
              </button>

              <button
                class="w-full md:w-full px-6 py-3 rounded-lg font-bold border-2 flex items-center justify-center gap-3 transition-all duration-300 hover:shadow-lg hover:scale-105 bg-[#ff69b40d] hover:bg-[#ff69b432]"
                :style="{
                  borderColor: '#FF69B4',
                  color: '#FF1493',
                }"
                @click="signInWithGoogle"
              >
                <svg class="h-5 w-5" viewBox="0 0 24 24" fill="currentColor">
                  <path
                    d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                    fill="#4285F4"
                  />
                  <path
                    d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                    fill="#34A853"
                  />
                  <path
                    d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                    fill="#FBBC05"
                  />
                  <path
                    d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                    fill="#EA4335"
                  />
                </svg>
                Continuer avec Google
              </button>
            </div>

            <!-- Texte d'aide -->
            <p class="text-center text-xs text-gray-500 mt-4">
              {{
                isSignUp
                  ? "Crée un compte pour commencer à réenchanter le monde 🌟"
                  : "Connecte-toi pour accéder à ton espace"
              }}
            </p>
          </div>

          <!-- Cas utilisateur connecté -->
          <div v-else class="text-center">
            <p class="text-gray-700 mb-4">
              Connecté en tant que :
              <b :style="{ color: '#FF1493' }">{{ user.email }}</b>
            </p>
            <button
              class="w-full px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105"
              :style="{ backgroundColor: '#FF1493' }"
              @click="signOut"
            >
              Se déconnecter
            </button>
          </div>
        </div>

        <!-- Footer -->
        <p class="text-center text-xs text-gray-500">
          En t'inscrivant, tu acceptes nos conditions d'utilisation 📋
        </p>
      </div>
    </div>
  </div>
</template>

<style scoped>
@keyframes fadeInMoveUp {
  from {
    opacity: 0;
    bottom: -40%;
  }
  to {
    opacity: 1;
    bottom: -30%;
  }
}

.planet-animation {
  animation: fadeInMoveUp 1s ease-in-out forwards;
}

@keyframes rotatePlanet {
  from {
    transform: rotate(0deg);
  }
  to {
    transform: rotate(360deg);
  }
}

.planet-rotate {
  animation: rotatePlanet 150s linear infinite;
  transform-origin: center;
}
</style>
