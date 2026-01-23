<script setup lang="ts">
import type { Database } from "../../types/database.types";

const supabase = useSupabaseClient<Database>();
const route = useRoute();
const {
  data: { user },
} = await supabase.auth.getUser();

if (!user) {
  await navigateTo("/login");
}

const userDeedId = route.params.id as string;
const submissionText = ref("");
const file = ref<File | null>(null);
const loading = ref(false);

const { data: ud, error: udError } = await supabase
  .from("user_deeds")
  .select("id, good_deed_id, status, good_deeds(points)")
  .eq("id", userDeedId)
  .single();

if (!ud || udError) {
  throw createError({ statusCode: 404, statusMessage: "Action introuvable" });
}

function onFileChange(e: Event) {
  const target = e.target as HTMLInputElement;
  file.value = target.files?.[0] ?? null;
}

async function submitProof() {
  if (!file.value) return alert("Photo/capture obligatoire.");
  loading.value = true;

  try {
    // 1) Upload dans Storage : path = <user_id>/<userDeedId>.<ext>

    // ✅ récupère l'utilisateur depuis la session (validé via getUser)
    if (!user) {
      loading.value = false;
      return alert("Connecte-toi avant de soumettre.");
    }

    const ext = file.value.name.split(".").pop()?.toLowerCase() || "jpg";
    const path = `${user.id}/${userDeedId}.${ext}`;

    console.log("UPLOAD PATH:", path);

    console.log("UPLOAD start");

    const { error: upErr } = await supabase.storage
      .from("evidence")
      .upload(path, file.value, { upsert: true });

    console.log("UPLOAD done", upErr);
    if (upErr) throw upErr;

    console.log("UPDATE start");

    // 2) URL publique (bucket public)
    const { data: pub } = supabase.storage.from("evidence").getPublicUrl(path);
    const evidenceUrl = pub.publicUrl;

    // 3) Validation auto : update user_deeds
    const points = ud!.good_deeds?.points ?? 0;

    const { error: updErr } = await supabase
      .from("user_deeds")
      .update({
        submission_text: submissionText.value || null,
        evidence_url: evidenceUrl,
        status: "validated",
        points_awarded: points,
        submitted_at: new Date().toISOString(),
        validated_at: new Date().toISOString(),
        validation_method: "auto",
      })
      .eq("id", userDeedId);

    console.log("UPDATE done", updErr);
    if (updErr) throw updErr;

    alert("Bonne action validée ✅ Points ajoutés au classement.");
    await navigateTo("/dashboard");
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("SUBMIT ERROR:", error);
    alert(error.message ?? "Erreur");
  } finally {
    loading.value = false;
  }
}
</script>

<template>
  <div style="max-width: 700px; margin: 40px auto">
    <h1>Soumettre une preuve</h1>

    <label style="display: block; margin: 12px 0 6px"
      >Détails (optionnel)</label
    >
    <textarea v-model="submissionText" rows="5" style="width: 100%" />

    <label style="display: block; margin: 12px 0 6px"
      >Photo / capture (obligatoire)</label
    >
    <input type="file" accept="image/*" @change="onFileChange" >

    <div style="margin-top: 16px">
      <button :disabled="loading" @click="submitProof">
        {{ loading ? "Envoi..." : "Valider la bonne action" }}
      </button>
    </div>
  </div>
</template>
