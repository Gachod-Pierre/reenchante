<script setup lang="ts">
import type { Database } from "../types/database.types";

type UserDeedSubmission = Database["public"]["Tables"]["user_deeds"]["Row"];

type GalleryItem = UserDeedSubmission & {
  good_deeds: Database["public"]["Tables"]["good_deeds"]["Row"] | null;
  profiles: Database["public"]["Tables"]["profiles"]["Row"] | null;
};

const supabase = useSupabaseClient<Database>();

const result = await supabase
  .from("user_deeds")
  .select(
    `
    id,
    evidence_url,
    selected_at,
    good_deeds(title, points, description),
    profiles(username, avatar_url)
  `,
  )
  .eq("status", "validated")
  .order("selected_at", { ascending: false });

const typedItems = (result.data || []) as GalleryItem[];
</script>

<template>
  <div style="max-width: 1100px; margin: 40px auto">
    <h1 class="text-2xl font-bold mb-10">Galerie</h1>

    <div
      style="
        display: grid;
        grid-template-columns: repeat(auto-fill, minmax(240px, 1fr));
        gap: 12px;
      "
    >
      <div
        v-for="it in typedItems"
        :key="it?.id"
        style="
          border: 1px solid #ddd;
          border-radius: 12px;
          overflow: hidden;
          display: flex;
          flex-direction: column;
        "
      >
        <!-- Hero avec avatar et username -->
        <div
          style="
            display: flex;
            align-items: center;
            gap: 12px;
            padding: 12px;
            background: linear-gradient(135deg, #f3f4f6 0%, #e5e7eb 100%);
            border-bottom: 1px solid #ddd;
          "
        >
          <img
            v-if="it?.profiles?.avatar_url"
            :src="it.profiles.avatar_url ?? ''"
            :alt="it.profiles?.username ?? 'User'"
            style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              object-fit: cover;
            "
          >
          <div
            v-else
            style="
              width: 40px;
              height: 40px;
              border-radius: 50%;
              background: #d1d5db;
              display: flex;
              align-items: center;
              justify-content: center;
              font-weight: bold;
              color: #6b7280;
            "
          >
            {{ it?.profiles?.username?.[0]?.toUpperCase() ?? "?" }}
          </div>
          <div>
            <div style="font-weight: 600; font-size: 14px">
              {{ it?.profiles?.username ?? "Utilisateur" }}
            </div>
          </div>
        </div>
        <!-- Image -->
        <div
          style="
            width: 100%;
            height: 200px;
            background: #f0f0f0;
            display: flex;
            align-items: center;
            justify-content: center;
            overflow: hidden;
          "
        >
          <img
            v-if="it?.evidence_url"
            :src="it.evidence_url"
            :alt="it.good_deeds?.title"
            style="width: 100%; height: 100%; object-fit: cover"
          >
          <span v-else style="opacity: 0.5">Image non disponible</span>
        </div>
        <div
          style="padding: 12px; flex: 1; display: flex; flex-direction: column"
        >
          <h3 style="margin: 0 0 6px; font-size: 16px">
            {{ it?.good_deeds?.title }}
          </h3>
          <div style="opacity: 0.8; font-size: 13px">
            {{ it?.good_deeds?.description }}
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
