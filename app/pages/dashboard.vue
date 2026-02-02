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

// État du modal limite quotidienne
const showDailyLimitModal = ref(false);
const hasReachedDailyLimit = ref(false);

// Pagination pour les bonnes actions validées
const currentPage = ref(1);
const perPage = 3; // 2 lignes x 3 colonnes

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
    .select("total_points,username,avatar_url")
    .eq("id", userId!)
    .single();

  if (error) throw error;
  return data;
});

// État pour l'édition du profil
const isEditingProfile = ref(false);
const editedUsername = ref("");
const editedAvatarUrl = ref("");
const isUploadingAvatar = ref(false);

// Initialiser les valeurs d'édition quand le profil se charge
watch(userProfile, (newProfile) => {
  if (newProfile) {
    editedUsername.value = newProfile.username || "";
    editedAvatarUrl.value = newProfile.avatar_url || "";
  }
});

// Réinitialiser les valeurs quand on rentre en édition
function enterEditMode() {
  editedUsername.value = userProfile.value?.username || "";
  editedAvatarUrl.value = userProfile.value?.avatar_url || "";
  isEditingProfile.value = true;
}

async function handleAvatarUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  isUploadingAvatar.value = true;
  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${userId}-avatar.${fileExt}`;

    console.log("🔄 Uploading avatar:", {
      fileName,
      userId,
      fileSize: file.size,
      fileType: file.type,
    });

    // Essayer d'abord sans upsert
    const { error: uploadError } = await supabase.storage
      .from("avatars")
      .upload(fileName, file, { upsert: true });

    if (uploadError) {
      console.error("❌ Upload error:", uploadError);
      throw uploadError;
    }

    console.log("✅ Upload successful");

    const {
      data: { publicUrl },
    } = supabase.storage.from("avatars").getPublicUrl(fileName);

    console.log("🖼️ Public URL:", publicUrl);
    editedAvatarUrl.value = publicUrl;
  } catch (error) {
    console.error("💥 Full error:", error);
    alert("Erreur lors de l'upload : " + (error as Error).message);
  } finally {
    isUploadingAvatar.value = false;
  }
}

async function saveProfileChanges() {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        username: editedUsername.value,
        avatar_url: editedAvatarUrl.value,
      })
      .eq("id", userId!);

    if (error) throw error;

    await refreshNuxtData("userProfile");
    isEditingProfile.value = false;
    alert("Profil mis à jour ✅");
  } catch (error) {
    alert("Erreur : " + (error as Error).message);
  }
}

// Vérifier la limite quotidienne au montage
onMounted(async () => {
  const today = new Date();
  today.setUTCHours(0, 0, 0, 0);

  const { count: validatedToday } = await supabase
    .from("user_deeds")
    .select("id", { count: "exact", head: true })
    .eq("user_id", userId!)
    .eq("status", "validated")
    .gte("validated_at", today.toISOString());

  if ((validatedToday ?? 0) >= 5) {
    hasReachedDailyLimit.value = true;
    showDailyLimitModal.value = true;
  }
});

// Computed pour les bonnes actions affichées (paginées)
const displayedValidatedDeeds = computed(() => {
  const start = (currentPage.value - 1) * perPage;
  const end = start + perPage;
  return validatedDeeds.value?.slice(start, end) ?? [];
});

// Computed pour le nombre total de pages
const totalPages = computed(() => {
  return Math.ceil((validatedDeeds.value?.length ?? 0) / perPage);
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
          <!-- Case 1: Infos Utilisateur + Bouton Déconnexion -->
          <div
            class="p-6 md:p-8 rounded-3xl border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
            :style="{
              borderColor: '#FF69B4',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }"
          >
            <div class="flex flex-col md:flex-row md:items-center gap-6">
              <!-- Avatar -->
              <div class="flex-shrink-0 relative">
                <!-- Preview après upload en édition -->
                <img
                  v-if="editedAvatarUrl && isEditingProfile"
                  :src="editedAvatarUrl"
                  :alt="editedUsername || 'Avatar'"
                  class="w-24 h-24 rounded-full object-cover border-2"
                  :style="{ borderColor: '#FF69B4' }"
                >
                <!-- Avatar existant en mode lecture -->
                <img
                  v-else-if="userProfile?.avatar_url && !isEditingProfile"
                  :src="userProfile.avatar_url"
                  :alt="userProfile.username || 'Avatar'"
                  class="w-24 h-24 rounded-full object-cover border-2"
                  :style="{ borderColor: '#FF69B4' }"
                >
                <!-- Placeholder -->
                <div
                  v-else
                  class="w-24 h-24 rounded-full flex items-center justify-center text-4xl font-black text-white"
                  :style="{ backgroundColor: '#FF1493' }"
                >
                  {{ isEditingProfile ? "📸" : "✨" }}
                </div>
                <!-- Bouton pour changer l'avatar en édition -->
                <label
                  v-if="isEditingProfile"
                  class="cursor-pointer absolute bottom-0 right-0"
                >
                  <div
                    class="w-8 h-8 rounded-full flex items-center justify-center text-lg font-bold text-white transition-all duration-300 hover:scale-110 bg-[#FF1493] border-2 border-white"
                  >
                    +
                  </div>
                  <input
                    type="file"
                    accept="image/*"
                    class="hidden"
                    :disabled="isUploadingAvatar"
                    @change="handleAvatarUpload"
                  >
                </label>
              </div>

              <!-- Infos et Bouton déconnexion -->
              <div
                class="flex-1 flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4"
              >
                <div>
                  <div v-if="!isEditingProfile">
                    <h2
                      class="text-2xl md:text-3xl font-black mb-2"
                      :style="{ color: '#FF1493' }"
                    >
                      {{ userProfile?.username || "Utilisateur" }}
                    </h2>
                    <p class="text-gray-600 mb-4">{{ user?.email }}</p>
                  </div>
                  <div v-else class="mb-4">
                    <label
                      class="block text-sm font-semibold text-gray-700 mb-2"
                    >
                      Nom d'utilisateur
                    </label>
                    <input
                      v-model="editedUsername"
                      type="text"
                      class="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
                      :style="{ borderColor: '#FF69B4' }"
                      placeholder="Votre nom d'utilisateur"
                    >
                  </div>

                  <!-- Boutons d'action (Modifier/Enregistrer/Annuler) -->
                  <div class="flex gap-2 flex-wrap">
                    <button
                      v-if="!isEditingProfile"
                      class="px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold text-sm md:text-base text-white transition-all duration-300 hover:scale-105 bg-[#FF1493] hover:bg-[#D9187F]"
                      @click="enterEditMode"
                    >
                      ✏️ Modifier
                    </button>
                    <template v-else>
                      <button
                        class="px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold text-sm md:text-base text-white transition-all duration-300 hover:scale-105 bg-[#FF1493] hover:bg-[#D9187F]"
                        @click="saveProfileChanges"
                      >
                        💾 Enregistrer
                      </button>
                      <button
                        class="px-3 py-2 md:px-4 md:py-2 rounded-lg font-semibold text-sm md:text-base text-white bg-gray-500 hover:bg-gray-600 transition-all duration-300 hover:scale-105"
                        @click="isEditingProfile = false"
                      >
                        ✕ Annuler
                      </button>
                    </template>
                  </div>
                </div>

                <!-- Bouton Se déconnecter -->
                <button
                  class="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white text-sm md:text-base"
                  @click="signOut"
                >
                  Se déconnecter 😓
                </button>
              </div>
            </div>
          </div>

          <!-- Case 2: Points de réenchantement -->
          <div
            class="flex-1 p-6 md:p-8 rounded-3xl border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-xl"
            :style="{
              borderColor: '#FF69B4',
              backgroundColor: 'rgba(255, 255, 255, 0.8)',
            }"
          >
            <h2
              class="text-xl md:text-2xl font-bold mb-3"
              :style="{ color: '#FF1493' }"
            >
              Mes points de réenchantement
            </h2>
            <p
              class="text-4xl md:text-5xl font-black"
              :style="{ color: '#FF1493' }"
            >
              ✨ {{ userProfile?.total_points ?? 0 }} points
            </p>
          </div>
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
            <div
              v-for="ud in myDeeds"
              :key="ud.id"
              class="p-6 md:p-8 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105"
              :style="{
                borderColor: '#FF69B4',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }"
            >
              <h3
                class="text-xl md:text-2xl font-bold mb-3"
                :style="{ color: '#FF1493' }"
              >
                {{ ud.good_deeds?.title }}
              </h3>
              <p
                class="text-gray-600 text-sm md:text-base mb-4 leading-relaxed"
              >
                {{ ud.good_deeds?.description }}
              </p>
              <div class="mb-4 flex items-center gap-2">
                <span class="text-gray-700 font-semibold">État :</span>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :style="{
                    backgroundColor: 'rgba(255, 20, 147, 0.15)',
                    color: '#FF1493',
                  }"
                >
                  {{ getStatusLabel(ud.status) }}
                </span>
              </div>
              <div class="flex flex-col sm:flex-row gap-3 mt-6">
                <NuxtLink
                  :to="`/submit/${ud.id}`"
                  :class="[
                    'px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-white transition-all duration-300 hover:scale-105 text-center',
                    hasReachedDailyLimit
                      ? 'bg-gray-400 cursor-not-allowed opacity-50'
                      : 'bg-[#FF1493] hover:bg-[#D9187F] hover:shadow-lg',
                  ]"
                  :style="{
                    pointerEvents: hasReachedDailyLimit ? 'none' : 'auto',
                  }"
                >
                  Soumettre la preuve
                </NuxtLink>
                <button
                  v-if="ud.status === 'in_progress'"
                  class="px-4 py-2 md:px-6 md:py-3 rounded-lg font-semibold text-white bg-red-500 hover:bg-red-600 transition-all duration-300 hover:shadow-lg hover:scale-105"
                  @click="deleteDeed(ud.id)"
                >
                  Supprimer
                </button>
              </div>
            </div>
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
          <div
            v-else
            class="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
          >
            <div
              v-for="deed in displayedValidatedDeeds"
              :key="deed.id"
              class="p-6 md:p-8 rounded-2xl border-2 backdrop-blur-sm transition-all duration-300 hover:shadow-xl hover:scale-105"
              :style="{
                borderColor: '#FF69B4',
                backgroundColor: 'rgba(255, 255, 255, 0.8)',
              }"
            >
              <h3
                class="text-xl md:text-2xl font-bold mb-3"
                :style="{ color: '#FF1493' }"
              >
                {{ deed.good_deeds?.title }}
              </h3>
              <div class="mb-4 flex items-center gap-2">
                <span class="text-gray-700 font-semibold">État :</span>
                <span
                  class="px-3 py-1 rounded-full text-sm font-medium"
                  :style="{
                    backgroundColor: 'rgba(255, 20, 147, 0.15)',
                    color: '#FF1493',
                  }"
                >
                  {{ getStatusLabel(deed.status) }}
                </span>
              </div>
              <img
                v-if="deed.evidence_url"
                :src="deed.evidence_url"
                alt="preuve"
                class="h-64 w-auto rounded-xl mb-6 object-cover"
              >

              <!-- Points et Date en évidence -->
              <div class="grid grid-cols-2 gap-3 pt-3 border-t border-gray-200">
                <div
                  class="text-center p-2 rounded-lg justify-center items-center flex"
                  :style="{ backgroundColor: 'rgba(255, 20, 147, 0.1)' }"
                >
                  <p
                    class="text-xl md:text-2xl font-black mb-0"
                    :style="{ color: '#FF1493' }"
                  >
                    +{{ deed.good_deeds?.points }} pts
                  </p>
                </div>
                <div
                  class="text-center p-2 rounded-lg justify-center items-center flex"
                  :style="{ backgroundColor: 'rgba(255, 20, 147, 0.1)' }"
                >
                  <p class="text-sm md:text-base font-bold text-gray-700 mb-0">
                    {{
                      new Date(deed.selected_at).toLocaleDateString("fr-FR", {
                        day: "numeric",
                        month: "short",
                        year: "numeric",
                      })
                    }}
                  </p>
                </div>
              </div>
            </div>
          </div>

          <!-- Pagination -->
          <div v-if="validatedDeeds && validatedDeeds.length > 0" class="mt-8">
            <MyPagination v-model="currentPage" :total-pages="totalPages" />
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
