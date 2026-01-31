<script setup lang="ts">
import type { Database } from "../types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const supabase = useSupabaseClient<Database>();

// Récupérer le top 5 du leaderboard
const { data: topProfiles } = await supabase
  .from("profiles")
  .select("username, total_points")
  .order("total_points", { ascending: false })
  .limit(5);
</script>

<template>
  <section class="py-20 px-4 md:px-8 bg-gradient-to-b from-gray-50 to-white">
    <div class="max-w-6xl mx-auto">
      <div class="text-center mb-12">
        <h2 class="text-4xl md:text-5xl font-baloo font-bold mb-4">
          🏆 Top Réenchanteurs
        </h2>
        <p class="text-gray-600 text-lg">
          Les meilleurs contributeurs de bonne actions
        </p>
      </div>

      <!-- Leaderboard comprimé -->
      <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
        <div
          v-for="(profile, index) in topProfiles as Profile[] | null"
          :key="profile?.username"
          class="rounded-xl p-6 text-center shadow-lg transition-transform hover:scale-105"
          :class="
            index === 0
              ? 'bg-gradient-to-b from-yellow-300 to-yellow-200'
              : index === 1
                ? 'bg-gradient-to-b from-gray-300 to-gray-200'
                : index === 2
                  ? 'bg-gradient-to-b from-orange-300 to-orange-200'
                  : 'bg-gradient-to-b from-pink-100 to-pink-50'
          "
        >
          <div class="text-4xl mb-2">
            {{
              index === 0
                ? "🥇"
                : index === 1
                  ? "🥈"
                  : index === 2
                    ? "🥉"
                    : index === 3
                      ? "4️⃣"
                      : "5️⃣"
            }}
          </div>
          <h3 class="font-bold text-lg mb-2">{{ profile?.username }}</h3>
          <p class="text-2xl font-bold text-green-600">
            ✨ {{ profile?.total_points ?? 0 }} pts
          </p>
        </div>
      </div>

      <!-- Lien vers le classement complet -->
      <div class="text-center">
        <NuxtLink
          to="/leaderboard"
          class="inline-block bg-gradient-to-r from-pink-500 to-pink-600 text-white font-bold px-8 py-3 rounded-full hover:shadow-lg transition-shadow"
        >
          Voir le classement complet →
        </NuxtLink>
      </div>
    </div>
  </section>
</template>
