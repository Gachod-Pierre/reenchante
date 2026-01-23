<script setup lang="ts">
import type { Database } from "../types/database.types";

type GoodDeed = Database["public"]["Tables"]["good_deeds"]["Row"];
type UserDeed = Database["public"]["Tables"]["user_deeds"]["Insert"];

const supabase = useSupabaseClient<Database>();
const user = useSupabaseUser();
const showDailyLimitModal = ref(false);
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
</script>

<template>
  <div style="max-width: 900px; margin: 40px auto">
    <h1>Bonnes actions</h1>

    <div v-if="!user" style="margin: 12px 0; opacity: 0.8">
      Connecte-toi pour ajouter des actions.
    </div>

    <!-- Composant modal limite quotidienne -->
    <DailyLimitModal :is-visible="showDailyLimitModal" :type="modalType" />

    <ul style="display: grid; gap: 12px; padding: 0; list-style: none">
      <li
        v-for="d in deeds as GoodDeed[] | null"
        :key="d?.id"
        style="border: 1px solid #333; padding: 12px; border-radius: 12px"
      >
        <div style="display: flex; justify-content: space-between; gap: 12px">
          <div>
            <b>{{ d?.title }}</b>
            <div style="opacity: 0.85">{{ d?.description }}</div>
            <div style="margin-top: 6px">✨ {{ d?.points }} points</div>
          </div>
          <button :disabled="!user" @click="d?.id && addDeed(d.id)">
            Ajouter
          </button>
        </div>
      </li>
    </ul>
  </div>
</template>
