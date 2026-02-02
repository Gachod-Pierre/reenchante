<script setup lang="ts">
import type { Database } from "../types/database.types";

definePageMeta({ middleware: ["auth"] });

type GoodDeed = Database["public"]["Tables"]["good_deeds"]["Row"];
type UserDeed = Database["public"]["Tables"]["user_deeds"]["Insert"];

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const showDailyLimitModal = ref(false);
const hasReachedDailyLimit = ref(false);
const modalType = ref<"limit-in-progress" | "limit-daily-5" | "success">(
  "success",
);

// Récupérer les IDs des actions déjà prises par l'user
const { data: userDeedIds } = await useAsyncData("userDeedIds", async () => {
  if (!user.value) return [];

  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();
  if (!sessionUser) return [];

  const { data } = await supabase
    .from("user_deeds")
    .select("good_deed_id")
    .eq("user_id", sessionUser.id)
    .in("status", ["in_progress", "validated"]);

  return data?.map((d) => d.good_deed_id) ?? [];
});

const { data: allDeeds } = await useAsyncData("allDeeds", async () => {
  const { data, error } = await supabase
    .from("good_deeds")
    .select("*")
    .order("points", { ascending: false });

  if (error) console.error(error);
  return data ?? [];
});

// Filtrer les deeds pour exclure celles déjà prises
const deeds = computed(() => {
  return (
    allDeeds.value?.filter((d) => !userDeedIds.value?.includes(d.id)) ?? []
  );
});

// Vérifier la limite quotidienne au montage
onMounted(async () => {
  if (user.value) {
    const {
      data: { user: sessionUser },
    } = await supabase.auth.getUser();

    if (sessionUser) {
      const today = new Date();
      today.setUTCHours(0, 0, 0, 0);

      // Récupérer les actions validées du jour
      const { count: validatedCount_val } = await supabase
        .from("user_deeds")
        .select("id", { count: "exact", head: true })
        .eq("user_id", sessionUser.id)
        .eq("status", "validated")
        .gte("validated_at", today.toISOString());

      if ((validatedCount_val ?? 0) >= 5) {
        hasReachedDailyLimit.value = true;
        showDailyLimitModal.value = true;
        modalType.value = "limit-daily-5";
      }
    }
  }
});

async function addDeed(goodDeedId: string) {
  console.log("[actions.vue] addDeed appelé avec goodDeedId:", goodDeedId);
  const {
    data: { user: sessionUser },
  } = await supabase.auth.getUser();

  if (!sessionUser) {
    return alert("Connecte-toi d’abord.");
  }

  // 1) vérifier max 3 EN COURS pour CE user
  const { count } = await supabase
    .from("user_deeds")
    .select("id", { count: "exact", head: true })
    .eq("user_id", sessionUser.id)
    .eq("status", "in_progress");

  if ((count ?? 0) >= 3) {
    modalType.value = "limit-in-progress";
    showDailyLimitModal.value = false;
    await nextTick();
    showDailyLimitModal.value = true;
    return;
  }

  // 2) Vérifier les validées du jour
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);
  const { count: validatedToday } = await supabase
    .from("user_deeds")
    .select("id", { count: "exact", head: true })
    .eq("user_id", sessionUser.id)
    .eq("status", "validated")
    .gte("validated_at", today.toISOString());

  if ((validatedToday ?? 0) >= 5) {
    modalType.value = "limit-daily-5";
    showDailyLimitModal.value = false;
    await nextTick();
    showDailyLimitModal.value = true;
    return;
  }

  // 3) Insérer l'action
  const { error: insErr } = await supabase.from("user_deeds").insert<UserDeed>({
    user_id: sessionUser.id,
    good_deed_id: goodDeedId,
    status: "in_progress",
  });

  if (insErr) return alert(insErr.message);

  // Recharger les IDs des actions pour mettre à jour la liste en temps réel
  await refreshNuxtData("userDeedIds");

  // 4) Afficher le succès
  modalType.value = "success";
  showDailyLimitModal.value = false;
  await nextTick();
  showDailyLimitModal.value = true;
}

// Style du fond quadrillé
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
  <div :style="pageStyle" class="relative">
    <!-- Contenu principal avec padding pour le header -->
    <div class="pt-16 px-4 md:px-8 lg:px-12 pb-12">
      <div class="max-w-6xl mx-auto">
        <!-- Titre principal -->
        <h1
          class="text-3xl md:text-4xl lg:text-5xl font-black leading-tight mb-12"
          :style="{
            color: '#FF1493',
            textShadow:
              '0 0 20px rgba(255, 105, 180, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.3)',
          }"
        >
          Bonnes actions
        </h1>

        <!-- Message si pas connecté -->
        <div
          v-if="!user"
          class="mb-8 p-6 rounded-2xl border-2"
          :style="{
            borderColor: '#FF1493',
            backgroundColor: 'rgba(255, 20, 147, 0.05)',
          }"
        >
          <p
            class="text-center text-lg font-semibold"
            :style="{ color: '#FF1493' }"
          >
            🔐 Connecte-toi pour ajouter des actions et réenchanter le monde !
          </p>
        </div>

        <!-- Composant modal limite quotidienne -->
        <DailyLimitModal :is-visible="showDailyLimitModal" :type="modalType" />

        <!-- Grille des actions -->
        <div
          class="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
        >
          <div
            v-for="d in deeds as GoodDeed[] | null"
            :key="d?.id"
            class="group backdrop-blur-sm border-2 rounded-2xl p-5 md:p-6 transition-all duration-300 hover:shadow-xl hover:scale-105 cursor-pointer"
            :style="{
              borderColor: '#FF69B4',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }"
          >
            <!-- Header de la carte -->
            <div class="mb-4">
              <h3
                class="text-lg md:text-xl font-bold mb-2 line-clamp-2"
                :style="{ color: '#FF1493' }"
              >
                {{ d?.title }}
              </h3>
              <p class="text-gray-600 text-sm md:text-base leading-relaxed">
                {{ d?.description }}
              </p>
            </div>

            <!-- Points -->
            <div
              class="flex items-center justify-between mb-4 pt-4 border-t border-gray-200"
            >
              <div class="flex items-center gap-2">
                <span class="text-2xl">✨</span>
                <span class="font-bold text-lg text-gray-900">
                  {{ d?.points }}
                  <span class="text-sm text-gray-500">points</span>
                </span>
              </div>
            </div>

            <!-- Bouton Ajouter -->
            <button
              :disabled="!user || hasReachedDailyLimit"
              class="w-full py-2 px-4 rounded-lg font-semibold transition-all duration-300 transform text-white text-sm md:text-base disabled:opacity-50 disabled:cursor-not-allowed"
              :class="[
                !user || hasReachedDailyLimit
                  ? 'bg-gray-300'
                  : 'bg-[#FF1493] hover:bg-[#D9187F] hover:shadow-lg hover:scale-105',
              ]"
              @click="d?.id && addDeed(d.id)"
            >
              {{
                !user
                  ? "Connecte-toi"
                  : hasReachedDailyLimit
                    ? "Limite atteinte"
                    : "Ajouter"
              }}
            </button>
          </div>
        </div>

        <!-- Message si aucune action disponible -->
        <div
          v-if="allDeeds && deeds?.length === 0 && allDeeds.length > 0"
          class="mt-12 text-center py-12"
        >
          <p class="text-2xl font-bold mb-2" :style="{ color: '#FF1493' }">
            🎉 Bravo !
          </p>
          <p class="text-gray-600 text-lg">
            Tu as complété toutes les actions disponibles. Reviens bientôt pour
            de nouvelles missions !
          </p>
        </div>
      </div>
    </div>
  </div>
</template>

<style scoped>
/* Smooth scroll behavior */
html {
  scroll-behavior: smooth;
}

/* Animations */
@keyframes fadeInUp {
  from {
    opacity: 0;
    transform: translateY(20px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
}

.group {
  opacity: 0;
  animation: fadeInUp 0.5s ease-out forwards;
}

/* Stagger animation pour les cartes */
.group:nth-child(1) {
  animation-delay: 0s;
}
.group:nth-child(2) {
  animation-delay: 0.1s;
}
.group:nth-child(3) {
  animation-delay: 0.2s;
}
.group:nth-child(4) {
  animation-delay: 0.3s;
}
.group:nth-child(5) {
  animation-delay: 0.4s;
}
.group:nth-child(6) {
  animation-delay: 0.5s;
}
</style>
