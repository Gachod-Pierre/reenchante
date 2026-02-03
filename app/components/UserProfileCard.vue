<script setup lang="ts">
import type { Database } from "../types/database.types";

// Props
interface Props {
  userProfile: {
    username: string | null;
    avatar_url: string | null;
    total_points: number | null;
  } | null;
  user: {
    email?: string;
  } | null;
  isEditingProfile: boolean;
  editedUsername: string;
  editedAvatarUrl: string;
  isUploadingAvatar: boolean;
  userId: string;
  isOwner?: boolean;
}

// Emit
const emit = defineEmits<{
  "update:isEditingProfile": [value: boolean];
  "update:editedUsername": [value: string];
  "update:editedAvatarUrl": [value: string];
  signOut: [];
  profileUpdated: [];
}>();

const props = withDefaults(defineProps<Props>(), {
  isOwner: true,
});

const supabase = useSupabaseClient<Database>();

// Réinitialiser les valeurs quand on rentre en édition
function enterEditMode() {
  emit("update:editedUsername", props.userProfile?.username || "");
  emit("update:editedAvatarUrl", props.userProfile?.avatar_url || "");
  emit("update:isEditingProfile", true);
}

// Gérer l'upload d'avatar
async function handleAvatarUpload(event: Event) {
  const target = event.target as HTMLInputElement;
  const file = target.files?.[0];
  if (!file) return;

  try {
    const fileExt = file.name.split(".").pop();
    const fileName = `${props.userId}-avatar.${fileExt}`;

    console.log("🔄 Uploading avatar:", {
      fileName,
      userId: props.userId,
      fileSize: file.size,
      fileType: file.type,
    });

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
    emit("update:editedAvatarUrl", publicUrl);
  } catch (error) {
    console.error("💥 Full error:", error);
    alert("Erreur lors de l'upload : " + (error as Error).message);
  }
}

// Sauvegarder les modifications du profil
async function saveProfileChanges() {
  try {
    const { error } = await supabase
      .from("profiles")
      .update({
        username: props.editedUsername,
        avatar_url: props.editedAvatarUrl,
      })
      .eq("id", props.userId);

    if (error) throw error;

    emit("update:isEditingProfile", false);
    emit("profileUpdated");
    alert("Profil mis à jour ✅");
  } catch (error) {
    alert("Erreur : " + (error as Error).message);
  }
}

// Annuler l'édition
function cancelEdit() {
  emit("update:isEditingProfile", false);
}

// Se déconnecter
function handleSignOut() {
  emit("signOut");
}
</script>

<template>
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
            <p v-if="props.isOwner" class="text-gray-600 mb-4">
              {{ user?.email }}
            </p>
            <p v-else class="text-gray-700 text-base mb-4">
              Découvrez les bonnes actions réalisées par
              <strong>{{ userProfile?.username }}</strong> !
            </p>
          </div>
          <div v-else class="mb-4">
            <label class="block text-sm font-semibold text-gray-700 mb-2">
              Nom d'utilisateur
            </label>
            <input
              :value="editedUsername"
              type="text"
              class="w-full px-4 py-2 border-2 rounded-lg focus:outline-none"
              :style="{ borderColor: '#FF69B4' }"
              placeholder="Votre nom d'utilisateur"
              @input="
                emit(
                  'update:editedUsername',
                  ($event.target as HTMLInputElement).value,
                )
              "
            >
          </div>

          <!-- Boutons d'action (Modifier/Enregistrer/Annuler) - seulement si isOwner -->
          <div v-if="props.isOwner" class="flex gap-2 flex-wrap">
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
                @click="cancelEdit"
              >
                ✕ Annuler
              </button>
            </template>
          </div>
        </div>

        <!-- Bouton Se déconnecter - seulement si isOwner -->
        <button
          v-if="props.isOwner"
          class="w-full sm:w-auto px-4 py-2 md:px-6 md:py-3 rounded-lg font-bold transition-all duration-300 hover:shadow-lg hover:scale-105 border-2 border-red-500 bg-transparent text-red-500 hover:bg-red-500 hover:text-white text-sm md:text-base"
          @click="handleSignOut"
        >
          Se déconnecter 😓
        </button>
      </div>
    </div>
  </div>
</template>
