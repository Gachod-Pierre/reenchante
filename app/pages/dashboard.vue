<script setup lang="ts">
import type { Database } from "../types/database.types";
import { getStatusLabel } from "../utils/statusLabels";
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
async function signOut() {
  await supabase.auth.signOut();
  await navigateTo("/login");
}

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
        good_deeds(title,points,description)`,
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
    .select("total_points")
    .eq("id", userId!)
    .single();

  if (error) throw error;
  return data;
});
</script>
<template>
  <div style="max-width: 900px; margin: 40px auto">
    <h1>Dashboard</h1>
    <div
      style="
        display: flex;
        justify-content: space-between;
        align-items: center;
        margin-bottom: 24px;
      "
    >
      <div>
        <h2 style="margin: 0">Mes points de réenchantement</h2>
        <div style="font-size: 32px; font-weight: bold; color: #1f2937">
          ✨ {{ userProfile?.total_points ?? 0 }} points
        </div>
      </div>
      <button @click="signOut">Se déconnecter</button>
    </div>
    <h2>Mes bonnes actions en cours</h2>
    <ul
      v-if="myDeeds?.length"
      style="display: grid; gap: 12px; list-style: none; padding: 0"
    >
      <li
        v-for="ud in myDeeds"
        :key="ud.id"
        style="border: 1px solid #333; padding: 12px; border-radius: 12px"
      >
        <b>{{ ud.good_deeds?.title }}</b>
        <div style="opacity: 0.85">{{ ud.good_deeds?.description }}</div>
        <div style="margin: 6px 0">
          État : <code>{{ getStatusLabel(ud.status) }}</code>
        </div>
        <div style="display: flex; gap: 8px; margin-top: 8px">
          <NuxtLink :to="`/submit/${ud.id}`">Soumettre la preuve</NuxtLink>
          <button
            v-if="ud.status === 'in_progress'"
            style="
              background-color: #ef4444;
              color: white;
              padding: 4px 8px;
              border: none;
              border-radius: 4px;
              cursor: pointer;
            "
            @click="deleteDeed(ud.id)"
          >
            Supprimer
          </button>
        </div>
      </li>
    </ul>
    <p v-else>Tu n’as aucune action en cours.</p>
    <section style="margin-top: 40px">
      <h2>Mes bonnes actions validées</h2>
      <p v-if="!validatedDeeds?.length">
        Aucune bonne action validée pour l’instant 🌱
      </p>
      <ul v-else style="display: grid; gap: 16px">
        <li
          v-for="deed in validatedDeeds"
          :key="deed.id"
          style="border: 1px solid #ddd; padding: 12px"
        >
          <h3>{{ deed.good_deeds?.title }}</h3>
          <div style="margin: 6px 0">
            État : <code>{{ getStatusLabel(deed.status) }}</code>
          </div>
          <img
            v-if="deed.evidence_url"
            :src="deed.evidence_url"
            alt="preuve"
            style="
              max-width: 300px;
              display: block;
              margin: 12px 0;
              border-radius: 8px;
            "
          >
          <p>
            +{{ deed.good_deeds?.points }} points •
            {{ new Date(deed.selected_at).toLocaleDateString() }}
          </p>
        </li>
      </ul>
    </section>
  </div>
</template>
