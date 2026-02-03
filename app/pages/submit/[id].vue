<script setup lang="ts">
import type { Database } from "../../types/database.types";

definePageMeta({
  middleware: ["auth", "submit-limit"],
});

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
const filePreview = ref<string | null>(null);
const loading = ref(false);

// Modal state
const showModal = ref(false);
const modalMessage = ref("");
const isSuccess = ref(false);

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
  const selectedFile = target.files?.[0] ?? null;
  file.value = selectedFile;

  // Créer une preview de l'image
  if (selectedFile) {
    const reader = new FileReader();
    reader.onload = (event) => {
      filePreview.value = event.target?.result as string;
    };
    reader.readAsDataURL(selectedFile);
  } else {
    filePreview.value = null;
  }
}

async function submitProof() {
  if (!file.value) {
    showModal.value = true;
    modalMessage.value = "Photo/capture obligatoire.";
    isSuccess.value = false;
    return;
  }
  if (!country.value) {
    showModal.value = true;
    modalMessage.value = "Veuillez sélectionner votre pays.";
    isSuccess.value = false;
    return;
  }

  loading.value = true;

  try {
    // 1) Upload dans Storage : path = <user_id>/<userDeedId>.<ext>

    // ✅ récupère l'utilisateur depuis la session (validé via getUser)
    if (!user) {
      loading.value = false;
      showModal.value = true;
      modalMessage.value = "Connecte-toi avant de soumettre.";
      isSuccess.value = false;
      return;
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

    showModal.value = true;
    modalMessage.value =
      "Bonne action validée ✅ Points ajoutés au classement.";
    isSuccess.value = true;

    // Rediriger après 2 secondes
    setTimeout(() => {
      navigateTo("/dashboard");
    }, 2000);
  } catch (e: unknown) {
    const error = e instanceof Error ? e : new Error(String(e));
    console.error("SUBMIT ERROR:", error);
    showModal.value = true;
    modalMessage.value = error.message ?? "Une erreur est survenue";
    isSuccess.value = false;
  } finally {
    loading.value = false;
  }
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
    <!-- Contenu principal -->
    <div class="pt-16 px-4 md:px-8 lg:px-12 pb-12">
      <div class="max-w-2xl mx-auto">
        <!-- Bouton retour vers dashboard -->
        <NuxtLink
          to="/dashboard"
          class="font-semibold text-sm md:text-base px-4 py-2 mt-1 inline-flex rounded-lg items-center bg-transparent border-solid border-2 border-[#FF1493] text-[#FF1493] gap-2 mb-12 transition-all duration-300 hover:scale-105 hover:bg-[#FF1493] hover:text-white"
        >
          ← Retour au dashboard
        </NuxtLink>

        <!-- Formulaire de soumission -->
        <div
          class="p-8 rounded-2xl border-2"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }"
        >
          <!-- Titre -->
          <h1
            class="text-3xl md:text-4xl font-black mb-8"
            :style="{ color: '#FF1493' }"
          >
            Soumettre une preuve ✨
          </h1>

          <!-- Pays -->
          <div class="mb-6">
            <label
              class="block text-sm font-semibold text-gray-700 mb-2"
              :style="{ color: '#FF1493' }"
            >
              Pays <span class="text-red-500">*</span>
            </label>
            <select
              v-model="country"
              class="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300"
              :style="{ borderColor: '#FF69B4' }"
            >
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
          </div>

          <!-- Détails -->
          <div class="mb-6">
            <label
              class="block text-sm font-semibold text-gray-700 mb-2"
              :style="{ color: '#FF1493' }"
            >
              Détails <span class="text-gray-400">(optionnel)</span>
            </label>
            <textarea
              v-model="submissionText"
              rows="5"
              class="w-full px-4 py-3 border-2 rounded-lg focus:outline-none transition-colors duration-300 resize-none"
              :style="{ borderColor: '#FF69B4' }"
              placeholder="Raconte-nous plus sur ta bonne action..."
            />
          </div>

          <!-- Photo/capture -->
          <div class="mb-8">
            <label
              class="block text-sm font-semibold text-gray-700 mb-2"
              :style="{ color: '#FF1493' }"
            >
              Photo / Capture <span class="text-red-500">*</span>
            </label>
            <div
              class="border-2 border-dashed rounded-lg p-6 text-center transition-colors duration-300 cursor-pointer hover:bg-gray-50"
              :style="{ borderColor: '#FF69B4' }"
            >
              <input
                id="file-input"
                type="file"
                accept="image/*"
                class="hidden"
                @change="onFileChange"
              />
              <label for="file-input" class="cursor-pointer">
                <!-- Pas de fichier sélectionné -->
                <div v-if="!filePreview" class="py-4">
                  <p class="text-gray-600 mb-2">
                    📸 Clique pour ajouter une photo
                  </p>
                  <p class="text-xs text-gray-400">(JPG, PNG, WebP)</p>
                </div>
                <!-- Fichier sélectionné -->
                <div v-else class="space-y-4">
                  <img
                    :src="filePreview"
                    alt="Aperçu"
                    class="max-h-64 mx-auto rounded-lg object-cover"
                  />
                  <p class="text-sm text-gray-600 font-semibold">
                    ✅ {{ file?.name }}
                  </p>
                  <p class="text-xs text-gray-400">
                    Clique pour remplacer par une autre image
                  </p>
                </div>
              </label>
            </div>
          </div>

          <div class="flex gap-4 flex-col sm:flex-row">
            <button
              class="flex-1 px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
              :disabled="loading"
              :style="{ backgroundColor: '#FF1493' }"
              @click="submitProof"
            >
              {{ loading ? "Envoi en cours..." : "Valider la bonne action ✨" }}
            </button>
            <NuxtLink
              to="/dashboard"
              class="flex-1 px-6 py-3 rounded-lg font-bold text-center transition-all duration-300 hover:scale-105 bg-gray-500 text-white hover:bg-gray-600"
            >
              Annuler
            </NuxtLink>
          </div>
        </div>
      </div>
    </div>

    <!-- Modal de confirmation/erreur -->
    <SubmissionModal
      :is-open="showModal"
      :message="modalMessage"
      :is-success="isSuccess"
      @close="showModal = false"
    />
  </div>
</template>
