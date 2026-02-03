<script setup lang="ts">
import type { Database } from "../types/database.types";
definePageMeta({ middleware: ["auth"] });
const supabase = useSupabaseClient<Database>();

// Get userId FIRST before using it
const {
  data: { user },
} = await supabase.auth.getUser();
const userId = user?.id as string | undefined;
if (!userId) {
  await navigateTo("/login");
}

const { data: myDeeds } = await useAsyncData("myDeeds", async () => {
  const { data, error } = await supabase
    .from("user_deeds")
    .select("id,status,good_deed_id, good_deeds(title,points,description)")
    .eq("user_id", userId!)
    .in("status", ["in_progress", "submitted"])
    .order("selected_at", { ascending: false });

  if (error) throw error;
  return data;
});

// Pagination pour les bonnes actions validées
const perPage = 3; // 2 lignes x 3 colonnes sur desktop

async function deleteDeed(deedId: string) {
  if (!confirm("Êtes-vous sûr de vouloir supprimer cette bonne action ?")) {
    return;
  }

  const { error } = await supabase
    .from("user_deeds")
    .delete()
    .eq("id", deedId)
    .eq("user_id", userId!);

  if (error) {
    alert("Erreur lors de la suppression : " + error.message);
    return;
  }

  // Recharger les données
  await refreshNuxtData("myDeeds");
  alert("Bonne action supprimée ✅");
}

const { data: validatedDeeds } = await useAsyncData(
  "validatedDeeds",
  async () => {
    const { data, error } = await supabase
      .from("user_deeds")
      .select(
        `id,
        status,
        good_deed_id,
        selected_at,
        evidence_url,
        good_deeds(title,points,description,tags,difficulty)`,
      )
      .eq("user_id", userId!)
      .eq("status", "validated")
      .order("selected_at", { ascending: false });

    if (error) throw error;
    return data ?? [];
  },
);

const { data: userProfile } = await useAsyncData("userProfile", async () => {
  const { data, error } = await supabase
    .from("profiles")
    .select("total_points,username,avatar_url")
    .eq("id", userId!)
    .single();

  if (error) throw error;
  return data;
});

// Vérifier la limite quotidienne IMMÉDIATEMENT au chargement de la page (avant onMounted)
const { data: dailyValidationCount } = await useAsyncData(
  "dailyValidationCount",
  async () => {
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const { count, error } = await supabase
      .from("user_deeds")
      .select("id", { count: "exact", head: true })
      .eq("user_id", userId!)
      .eq("status", "validated")
      .gte("validated_at", today.toISOString());

    if (error) throw error;
    return count ?? 0;
  },
);

// État pour l'édition du profil (utilisé par le composant UserProfileCard)
const isEditingProfile = ref(false);
const editedUsername = ref("");
const editedAvatarUrl = ref("");
const isUploadingAvatar = ref(false);

// État pour le filtrage et tri (utilisé par le composant ValidatedDeedsFilter)
const selectedTags = ref<string[]>([]);
const sortBy = ref<"points" | "date" | "difficulty" | "none">("none");
const sortOrder = ref<"asc" | "desc">("desc");
const difficultyLevel = ref<"facile" | "moyen" | "difficile" | "none">("none");

// État du modal et limite quotidienne
const showDailyLimitModal = ref(false);
const hasReachedDailyLimit = computed(() => (dailyValidationCount.value ?? 0) >= 5);

// Afficher le modal quand la limite est atteinte
watch(
  hasReachedDailyLimit,
  (isLimited) => {
    if (isLimited) {
      showDailyLimitModal.value = true;
    }
  },
  { immediate: true },
);

// Initialiser les valeurs d'édition quand le profil se charge
watch(userProfile, (newProfile) => {
  if (newProfile) {
    editedUsername.value = newProfile.username || "";
    editedAvatarUrl.value = newProfile.avatar_url || "";
  }
});

// Handlers pour les événements du composant UserProfileCard
function handleProfileUpdated() {
  refreshNuxtData("userProfile");
}

async function handleSignOut() {
  await supabase.auth.signOut();
  await navigateTo("/login");
}

// Afficher le modal quand la limite est atteinte
watch(hasReachedDailyLimit, (isLimited) => {
  if (isLimited) {
    showDailyLimitModal.value = true;
  }
});

// Computed pour les bonnes actions filtrées et triées
const filteredAndSortedDeeds = computed(() => {
  if (!validatedDeeds.value) return [];

  // Filtrage par tags
  let filtered = validatedDeeds.value;
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter((deed) => {
      const deedTags = deed.good_deeds?.tags ?? [];
      return selectedTags.value.some((tag) => deedTags.includes(tag));
    });
  }

  // Tri
  const sorted = [...filtered];
  if (sortBy.value === "points") {
    sorted.sort((a, b) => {
      const pointsA = a.good_deeds?.points ?? 0;
      const pointsB = b.good_deeds?.points ?? 0;
      return sortOrder.value === "asc" ? pointsA - pointsB : pointsB - pointsA;
    });
  } else if (sortBy.value === "date") {
    sorted.sort((a, b) => {
      const dateA = new Date(a.selected_at).getTime();
      const dateB = new Date(b.selected_at).getTime();
      return sortOrder.value === "asc" ? dateA - dateB : dateB - dateA;
    });
  } else if (sortBy.value === "difficulty") {
    const difficultyOrder = { facile: 1, moyen: 2, difficile: 3 };
    if (difficultyLevel.value === "none") {
      // Trier de facile à difficile
      sorted.sort((a, b) => {
        const diffA =
          difficultyOrder[
            a.good_deeds?.difficulty as keyof typeof difficultyOrder
          ] ?? 0;
        const diffB =
          difficultyOrder[
            b.good_deeds?.difficulty as keyof typeof difficultyOrder
          ] ?? 0;
        return diffA - diffB;
      });
    } else {
      // Filtrer par niveau sélectionné et trier par difficulté restante
      const filtered = sorted.filter(
        (deed) => deed.good_deeds?.difficulty === difficultyLevel.value,
      );
      return filtered;
    }
  }
  // Si sortBy === "none", pas de tri

  return sorted;
});
</script>

<template>
  <div
    class="relative"
    :style="{
      width: '100%',
      minHeight: '100vh',
      backgroundColor: '#f4f4f4',
      backgroundImage:
        'linear-gradient(rgba(180, 180, 180, 0.2) 1px, transparent 1px), linear-gradient(90deg, rgba(180, 180, 180, 0.2) 1px, transparent 1px)',
      backgroundSize: '60px 60px',
    }"
  >
    <!-- Contenu wrapper ancien div -->
    <!-- Modal limite quotidienne -->
    <DailyLimitModal
      :is-visible="showDailyLimitModal"
      type="limit-daily-5-soft"
      @close="showDailyLimitModal = false"
    />

    <!-- Contenu principal -->
    <div class="pt-16 px-4 md:px-8 lg:px-12 pb-12">
      <div class="max-w-6xl mx-auto">
        <!-- Titre principal -->
        <h1
          class="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-12"
          :style="{
            color: '#FF1493',
            textShadow:
              '0 0 20px rgba(255, 105, 180, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.3)',
          }"
        >
          Dashboard
        </h1>

        <!-- Section Profil et Points combinée -->
        <div class="mb-12 flex flex-col lg:flex-row gap-6">
          <!-- Case 1: Infos Utilisateur + Bouton Déconnexion (composant externalisé) -->
          <UserProfileCard
            :user-profile="userProfile ?? null"
            :user="user"
            :is-editing-profile="isEditingProfile"
            :edited-username="editedUsername"
            :edited-avatar-url="editedAvatarUrl"
            :is-uploading-avatar="isUploadingAvatar"
            :user-id="userId!"
            @update:is-editing-profile="isEditingProfile = $event"
            @update:edited-username="editedUsername = $event"
            @update:edited-avatar-url="editedAvatarUrl = $event"
            @sign-out="handleSignOut"
            @profile-updated="handleProfileUpdated"
          />

          <!-- Case 2: Points de réenchantement (composant externalisé) -->
          <PointsCard :total-points="userProfile?.total_points ?? 0" />
        </div>

        <!-- Section Mes bonnes actions en cours -->
        <div class="mb-12">
          <h2
            class="text-3xl md:text-4xl font-black mb-6"
            :style="{ color: '#FF1493' }"
          >
            Mes bonnes actions en cours
          </h2>

          <div v-if="myDeeds?.length" class="grid gap-4 md:gap-6 grid-cols-1">
            <DeedsInProgressCard
              v-for="ud in myDeeds"
              :key="ud.id"
              :deed="ud"
              :has-reached-daily-limit="hasReachedDailyLimit"
              @delete="deleteDeed"
            />
          </div>
          <div
            v-else
            class="p-8 rounded-2xl border-2 text-center"
            :style="{
              borderColor: '#FF69B4',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }"
          >
            <p class="text-gray-600 text-lg md:text-xl">
              Tu n'as aucune action en cours !
              <NuxtLink
                to="/actions"
                class="font-black transition-colors duration-300 hover:underline ml-2"
                :style="{ color: '#FF1493' }"
              >
                ✨ Page des bonnes actions ✨
              </NuxtLink>
            </p>
          </div>
        </div>

        <!-- Section Mes bonnes actions validées -->
        <div>
          <h2
            class="text-3xl md:text-4xl font-black mb-6"
            :style="{ color: '#FF1493' }"
          >
            Mes bonnes actions validées
          </h2>
          <!-- Composant de filtrage et tri externalisé -->
          <ValidatedDeedsFilter
            v-if="validatedDeeds?.length"
            :selected-tags="selectedTags"
            :sort-by="sortBy"
            :sort-order="sortOrder"
            :difficulty-level="difficultyLevel"
            :filtered-count="filteredAndSortedDeeds.length"
            @update:selected-tags="selectedTags = $event"
            @update:sort-by="sortBy = $event"
            @update:sort-order="sortOrder = $event"
            @update:difficulty-level="difficultyLevel = $event"
          />

          <div
            v-if="!validatedDeeds?.length"
            class="p-8 rounded-2xl border-2 text-center"
            :style="{
              borderColor: '#FF69B4',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }"
          >
            <p class="text-gray-600 text-lg md:text-xl">
              Aucune bonne action validée pour l'instant 🌱
            </p>
          </div>

          <!-- Composant de pagination externalisé -->
          <PaginatedView
            v-else
            :items="filteredAndSortedDeeds"
            :per-page="perPage"
          >
            <template #default="{ items }">
              <div
                class="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              >
                <ValidatedDeedCard
                  v-for="deed in items"
                  :key="deed.id"
                  :deed="deed"
                />
              </div>
            </template>
          </PaginatedView>
        </div>
      </div>
    </div>
  </div>
</template>
