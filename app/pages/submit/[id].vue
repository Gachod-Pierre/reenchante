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
const country = ref("");
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
  if (!country.value) return alert("Veuillez sélectionner votre pays.");
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
        country: country.value,
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

    <label style="display: block; margin: 12px 0 6px">Pays (obligatoire)</label>
    <select v-model="country" style="width: 100%; padding: 8px" required>
      <option value="">-- Sélectionne ton pays --</option>
      <option value="France">France</option>
      <option value="Germany">Germany</option>
      <option value="United Kingdom">United Kingdom</option>
      <option value="Spain">Spain</option>
      <option value="Italy">Italy</option>
      <option value="Poland">Poland</option>
      <option value="Netherlands">Netherlands</option>
      <option value="Belgium">Belgium</option>
      <option value="Portugal">Portugal</option>
      <option value="Greece">Greece</option>
      <option value="Austria">Austria</option>
      <option value="Sweden">Sweden</option>
      <option value="Denmark">Denmark</option>
      <option value="Ireland">Ireland</option>
      <option value="Czech Republic">Czech Republic</option>
      <option value="Nigeria">Nigeria</option>
      <option value="Egypt">Egypt</option>
      <option value="South Africa">South Africa</option>
      <option value="Kenya">Kenya</option>
      <option value="Ethiopia">Ethiopia</option>
      <option value="Angola">Angola</option>
      <option value="Ghana">Ghana</option>
      <option value="Morocco">Morocco</option>
      <option value="Cameroon">Cameroon</option>
      <option value="Tanzania">Tanzania</option>
      <option value="Uganda">Uganda</option>
      <option value="Sudan">Sudan</option>
      <option value="Côte d'Ivoire">Côte d'Ivoire</option>
      <option value="China">China</option>
      <option value="India">India</option>
      <option value="Japan">Japan</option>
      <option value="Indonesia">Indonesia</option>
      <option value="Pakistan">Pakistan</option>
      <option value="Bangladesh">Bangladesh</option>
      <option value="Philippines">Philippines</option>
      <option value="Vietnam">Vietnam</option>
      <option value="Thailand">Thailand</option>
      <option value="South Korea">South Korea</option>
      <option value="Myanmar">Myanmar</option>
      <option value="Malaysia">Malaysia</option>
      <option value="Singapore">Singapore</option>
      <option value="Afghanistan">Afghanistan</option>
      <option value="Iran">Iran</option>
      <option value="Australia">Australia</option>
      <option value="New Zealand">New Zealand</option>
      <option value="Fiji">Fiji</option>
      <option value="Papua New Guinea">Papua New Guinea</option>
      <option value="Solomon Islands">Solomon Islands</option>
      <option value="United States">United States</option>
      <option value="Canada">Canada</option>
      <option value="Mexico">Mexico</option>
      <option value="Guatemala">Guatemala</option>
      <option value="Belize">Belize</option>
      <option value="El Salvador">El Salvador</option>
      <option value="Honduras">Honduras</option>
      <option value="Nicaragua">Nicaragua</option>
      <option value="Costa Rica">Costa Rica</option>
      <option value="Panama">Panama</option>
      <option value="Brazil">Brazil</option>
      <option value="Colombia">Colombia</option>
      <option value="Argentina">Argentina</option>
      <option value="Peru">Peru</option>
      <option value="Venezuela">Venezuela</option>
      <option value="Chile">Chile</option>
      <option value="Ecuador">Ecuador</option>
      <option value="Bolivia">Bolivia</option>
      <option value="Paraguay">Paraguay</option>
      <option value="Uruguay">Uruguay</option>
      <option value="Guyana">Guyana</option>
      <option value="Suriname">Suriname</option>
    </select>

    <label style="display: block; margin: 12px 0 6px"
      >Détails (optionnel)</label
    >
    <textarea v-model="submissionText" rows="5" style="width: 100%" />

    <label style="display: block; margin: 12px 0 6px"
      >Photo / capture (obligatoire)</label
    >
    <input type="file" accept="image/*" @change="onFileChange" />

    <div style="margin-top: 16px">
      <button :disabled="loading" @click="submitProof">
        {{ loading ? "Envoi..." : "Valider la bonne action" }}
      </button>
    </div>
  </div>
</template>
