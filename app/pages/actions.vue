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

// État pour la recherche, filtrage et tri
const search = ref<string>("");
const selectedTags = ref<string[]>([]);
const sortBy = ref<"points" | "date" | "difficulty" | "none">("none");
const sortOrder = ref<"asc" | "desc">("desc");
const difficultyLevel = ref<"facile" | "moyen" | "difficile" | "none">("none");

// Computed pour les bonnes actions filtrées et triées
const filteredAndSortedDeeds = computed(() => {
  if (!deeds.value) return [];

  // Filtrage par recherche (titre, description, date de création)
  let filtered = deeds.value;
  if (search.value.trim().length > 0) {
    const keyword = search.value.toLowerCase().trim();
    filtered = filtered.filter((deed) => {
      const title = (deed.title ?? "").toLowerCase();
      const description = (deed.description ?? "").toLowerCase();
      const createdDate = new Date(deed.created_at)
        .toLocaleDateString("fr-FR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
        .toLowerCase();
      return (
        title.includes(keyword) ||
        description.includes(keyword) ||
        createdDate.includes(keyword)
      );
    });
  }

  // Filtrage par tags
  if (selectedTags.value.length > 0) {
    filtered = filtered.filter((deed) => {
      const deedTags = deed.tags ?? [];
      return selectedTags.value.some((tag) => deedTags.includes(tag));
    });
  }

  // Tri
  const sorted = [...filtered];
  if (sortBy.value === "points") {
    sorted.sort((a, b) => {
      const pointsA = a.points ?? 0;
      const pointsB = b.points ?? 0;
      return sortOrder.value === "asc" ? pointsA - pointsB : pointsB - pointsA;
    });
  } else if (sortBy.value === "date") {
    sorted.sort((a, b) => {
      const dateA = new Date(a.created_at).getTime();
      const dateB = new Date(b.created_at).getTime();
      return sortOrder.value === "asc" ? dateA - dateB : dateB - dateA;
    });
  } else if (sortBy.value === "difficulty") {
    const difficultyOrder = { facile: 1, moyen: 2, difficile: 3 };
    if (difficultyLevel.value === "none") {
      // Trier de facile à difficile
      sorted.sort((a, b) => {
        const diffA =
          difficultyOrder[a.difficulty as keyof typeof difficultyOrder] ?? 0;
        const diffB =
          difficultyOrder[b.difficulty as keyof typeof difficultyOrder] ?? 0;
        return diffA - diffB;
      });
    } else {
      // Filtrer par niveau sélectionné
      const filtered = sorted.filter(
        (deed) => deed.difficulty === difficultyLevel.value,
      );
      return filtered;
    }
  }

  return sorted;
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

        <!-- Composant de recherche -->
        <DeedsSearchBar v-model="search" />

        <!-- Composant de filtrage et tri -->
        <ValidatedDeedsFilter
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

        <!-- Grille des actions avec paginación "Afficher plus" -->
        <LoadMoreView
          :items="filteredAndSortedDeeds"
          :per-page="40"
          load-more-text="Afficher plus"
          all-loaded-text="Reste connecté, de nouvelles bonnes actions arriveront très prochainement ! 😉"
        >
          <template #default="{ items, initialCount }">
            <div
              class="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
            >
              <GoodDeedCard
                v-for="(d, index) in items as GoodDeed[]"
                :key="d.id"
                :deed="d"
                :is-disabled="!user || hasReachedDailyLimit"
                :style="{
                  animationDelay: `${index < initialCount ? 0 : (index - initialCount) * 0.1}s`,
                }"
                @add="d.id && addDeed(d.id)"
              />
            </div>
          </template>
        </LoadMoreView>

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
</style>
