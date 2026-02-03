<script setup lang="ts">
import type { Database } from "../../types/database.types";

definePageMeta({ middleware: ["auth"] });

const route = useRoute();
const supabase = useSupabaseClient<Database>();

// Get current authenticated user
const {
  data: { user: currentUser },
} = await supabase.auth.getUser();

// Types pour les données
interface UserProfile {
  total_points: number;
  username: string | null;
  avatar_url: string | null;
}

interface ValidatedDeed {
  id: string;
  status: string;
  good_deed_id: string;
  selected_at: string;
  evidence_url: string | null;
  good_deeds: {
    title: string;
    points: number;
    description: string;
    tags: string[];
    difficulty: "facile" | "moyen" | "difficile";
  } | null;
}

// État pour les données
const userProfile = ref<UserProfile | null>(null);
const validatedDeeds = ref<ValidatedDeed[]>([]);
const dataLoading = ref(true);
const dataError = ref<Error | null>(null);

// Computed userId
const userId = computed(() => {
  const id = route.params.id;
  return Array.isArray(id) ? id[0] : id;
});

// Fonction pour charger les données
const loadUserData = async (userId: string) => {
  if (!userId || userId === "undefined") {
    console.error("Invalid user ID:", userId);
    dataError.value = new Error("ID utilisateur invalide");
    return;
  }

  dataLoading.value = true;
  dataError.value = null;

  try {
    console.log("Fetching user data for ID:", userId);

    const [profileRes, deedsRes] = await Promise.all([
      supabase
        .from("profiles")
        .select("total_points,username,avatar_url")
        .eq("id", userId)
        .single(),
      supabase
        .from("user_deeds")
        .select(
          `id,
          status,
          good_deed_id,
          selected_at,
          evidence_url,
          good_deeds(title,points,description,tags,difficulty)`,
        )
        .eq("user_id", userId)
        .eq("status", "validated")
        .order("selected_at", { ascending: false }),
    ]);

    if (profileRes.error) {
      console.error("Profile fetch error:", profileRes.error);
      dataError.value = new Error(
        `Impossible de charger le profil: ${profileRes.error.message}`,
      );
      userProfile.value = null;
      return;
    }

    if (deedsRes.error) {
      console.error("Deeds fetch error:", deedsRes.error);
    }

    console.log("Profile data:", profileRes.data);
    console.log("Deeds data:", deedsRes.data);

    userProfile.value = profileRes.data as UserProfile;
    validatedDeeds.value = deedsRes.data as ValidatedDeed[];
  } catch (e) {
    console.error("Unexpected error:", e);
    dataError.value = e as Error;
  } finally {
    dataLoading.value = false;
  }
};

// Watch la source de la route directement, sans immediate:true
watch(
  () => route.params.id,
  (newId) => {
    if (newId) {
      const id = Array.isArray(newId) ? newId[0] : (newId as string);
      if (id) {
        // Rediriger vers dashboard si c'est le propre profil
        if (id === currentUser?.id) {
          navigateTo("/dashboard");
          return;
        }
        loadUserData(id);
      }
    }
  },
);

// Charger les données au montage du composant
onMounted(() => {
  // Rediriger vers dashboard si c'est le propre profil
  if (userId.value === currentUser?.id) {
    navigateTo("/dashboard");
    return;
  }
  if (userId.value) {
    loadUserData(userId.value);
  }
});

// État pour la recherche, filtrage et tri
const search = ref<string>("");
const selectedTags = ref<string[]>([]);
const sortBy = ref<"points" | "date" | "difficulty" | "none">("none");
const sortOrder = ref<"asc" | "desc">("desc");
const difficultyLevel = ref<"facile" | "moyen" | "difficile" | "none">("none");

// Computed pour les actions filtrées et triées
const filteredAndSortedDeeds = computed(() => {
  if (!validatedDeeds.value) return [];

  let filtered = validatedDeeds.value;

  // Filtrage par recherche
  if (search.value.trim().length > 0) {
    const keyword = search.value.toLowerCase().trim();
    filtered = filtered.filter((deed) => {
      const title = (deed.good_deeds?.title ?? "").toLowerCase();
      const description = (deed.good_deeds?.description ?? "").toLowerCase();
      const selectedDate = new Date(deed.selected_at)
        .toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        .toLowerCase();
      return (
        title.includes(keyword) ||
        description.includes(keyword) ||
        selectedDate.includes(keyword)
      );
    });
  }

  // Filtrage par tags
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
      const filtered = sorted.filter(
        (deed) => deed.good_deeds?.difficulty === difficultyLevel.value,
      );
      return filtered;
    }
  }

  return sorted;
});

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
    <!-- Contenu principal -->
    <div class="pt-16 px-4 md:px-8 lg:px-12 pb-12">
      <div class="max-w-6xl mx-auto">
        <!-- Bouton retour -->
        <NuxtLink
          to="/gallery"
          class="font-semibold text-sm md:text-base px-4 py-2 mt-1 inline-flex rounded-lg items-center bg bg-transparent border-solid border-2 border-[#FF1493] text-[#FF1493] gap-2 mb-12 transition-all duration-300 hover:scale-105 hover:bg-[#FF1493] hover:text-white"
        >
          ← Retour à la galerie
        </NuxtLink>

        <!-- Loading state -->
        <div v-if="dataLoading" class="text-center py-12">
          <p class="text-xl font-semibold text-gray-600">
            Chargement du profil...
          </p>
        </div>

        <!-- Message d'erreur -->
        <div v-else-if="dataError" class="text-center py-12">
          <p class="text-xl font-semibold text-red-600">
            Erreur: {{ dataError.message }}
          </p>
        </div>

        <!-- Erreur si profil vide -->
        <div v-else-if="!userProfile" class="text-center py-12">
          <p class="text-xl font-semibold text-gray-600">
            Utilisateur non trouvé 😔
          </p>
        </div>

        <!-- Profil et Points en layout flex comme sur la dashboard -->
        <div v-else class="mb-12 flex flex-col lg:flex-row gap-6">
          <!-- UserProfileCard en mode read-only (viewer) -->
          <UserProfileCard
            :user-profile="userProfile"
            :user="{ email: '' }"
            :is-editing-profile="false"
            :edited-username="''"
            :edited-avatar-url="''"
            :is-uploading-avatar="false"
            :user-id="userId as string"
            :is-owner="false"
          />

          <!-- Case 2: Points de réenchantement -->
          <PointsCard
            :total-points="userProfile?.total_points ?? 0"
            :is-owner="false"
          />
        </div>

        <!-- Titre section actions -->
        <h2
          v-if="userProfile && !dataLoading"
          class="text-2xl md:text-3xl font-bold mb-6"
          :style="{ color: '#FF1493' }"
        >
          Actions accomplies
        </h2>

        <!-- Composant de recherche -->
        <DeedsSearchBar v-if="userProfile && !dataLoading" v-model="search" />

        <!-- Composant de filtrage et tri -->
        <ValidatedDeedsFilter
          v-if="userProfile && !dataLoading"
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

        <!-- Grille des actions validées -->
        <PaginatedView
          v-if="userProfile && !dataLoading"
          :items="filteredAndSortedDeeds"
          :per-page="3"
        >
          <template #default="{ items }">
            <div
              class="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              <ValidatedDeedCard
                v-for="(deed, index) in items"
                :key="deed.id"
                :deed="deed"
                :read-only="true"
                :style="{
                  animationDelay: `${index * 0.1}s`,
                }"
              />
            </div>
          </template>
        </PaginatedView>

        <!-- Message si aucune action -->
        <div
          v-if="
            userProfile && !dataLoading && filteredAndSortedDeeds.length === 0
          "
          class="mt-12 text-center py-12"
        >
          <p class="text-xl font-semibold text-gray-600">
            Aucune action validée pour le moment 🌟
          </p>
        </div>
      </div>
    </div>
  </div>
</template>
