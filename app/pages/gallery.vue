<script setup lang="ts">
import type { Database } from "../types/database.types";

definePageMeta({ middleware: ["auth"] });

type UserDeedSubmission = Database["public"]["Tables"]["user_deeds"]["Row"];

type GalleryItem = UserDeedSubmission & {
  good_deeds: Database["public"]["Tables"]["good_deeds"]["Row"] | null;
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

const supabase = useSupabaseClient<Database>();

const { data: galleryItems } = await useAsyncData("gallery", async () => {
  const { data, error } = await supabase
    .from("user_deeds")
    .select(
      `
      id,
      evidence_url,
      submission_text,
      selected_at,
      good_deeds(title, points),
      profiles(username, avatar_url)
    `,
    )
    .eq("status", "validated")
    .order("selected_at", { ascending: false });

  if (error) console.error(error);
  return (data || []) as GalleryItem[];
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
        <!-- Titre principal -->
        <h1
          class="text-4xl md:text-5xl lg:text-6xl font-black leading-tight mb-12"
          :style="{
            color: '#FF1493',
            textShadow:
              '0 0 20px rgba(255, 105, 180, 0.8), 2px 2px 4px rgba(0, 0, 0, 0.3)',
          }"
        >
          Galerie
        </h1>

        <!-- Section avec grille et CTA -->
        <div class="mb-12">
          <div class="flex flex-col lg:flex-row gap-6 mb-12">
            <!-- Texte descriptif (gauche) -->
            <div class="flex-1">
              <p class="text-gray-700 text-lg leading-relaxed">
                Découvrez les bonnes actions réalisées par la communauté !
                Chaque image raconte une histoire d'enchantement et de
                contribution au bien-être collectif.
              </p>
            </div>

            <!-- Bouton CTA (droite) -->
            <NuxtLink
              to="/actions"
              class="h-fit bg-[#FF1493] px-6 py-3 rounded-lg font-bold text-white text-center transition-all duration-300 hover:shadow-lg hover:scale-105 hover:bg-[#D9187F]"
            >
              ✨ Ajouter ta pierre à l'édifice ✨
            </NuxtLink>
          </div>

          <!-- Grille des galeries avec LoadMoreView -->
          <LoadMoreView
            :items="galleryItems ?? []"
            :per-page="40"
            load-more-text="Afficher plus"
            all-loaded-text="Reste connecté, de nouvelles contributions arriveront très prochainement ! 😉"
          >
            <template #default="{ items, initialCount }">
              <div
                class="grid gap-4 md:gap-6 grid-cols-1 md:grid-cols-2 lg:grid-cols-3"
              >
                <GalleryCard
                  v-for="(item, index) in items as GalleryItem[]"
                  :key="item.id"
                  :item="item"
                  :style="{
                    animationDelay: `${index < initialCount ? 0 : (index - initialCount) * 0.1}s`,
                  }"
                />
              </div>
            </template>
          </LoadMoreView>
        </div>

        <!-- Message si aucune galerie -->
        <div
          v-if="galleryItems && galleryItems.length === 0"
          class="p-8 rounded-2xl border-2 text-center"
          :style="{
            borderColor: '#FF69B4',
            backgroundColor: 'rgba(255, 255, 255, 0.8)',
          }"
        >
          <p class="text-gray-600 text-lg md:text-xl mb-4">
            Aucune photo pour le moment, sois le premier ! 📸
          </p>
          <NuxtLink
            to="/actions"
            class="inline-block px-6 py-3 rounded-lg font-bold text-white transition-all duration-300 hover:shadow-lg hover:scale-105"
            :style="{ backgroundColor: '#FF1493' }"
            :class="{ 'hover:bg-[#D9187F]': true }"
          >
            Commencer une bonne action
          </NuxtLink>
        </div>
      </div>
    </div>
  </div>
</template>
