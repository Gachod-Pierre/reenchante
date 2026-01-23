<script setup lang="ts">
import type { Database } from "../types/database.types";

type Profile = Database["public"]["Tables"]["profiles"]["Row"];

const supabase = useSupabaseClient<Database>();

const { data: rows, error } = await supabase
  .from("profiles")
  .select("username, total_points")
  .order("total_points", { ascending: false })
  .limit(50);

if (error) console.error(error);
</script>

<template>
  <div style="max-width: 700px; margin: 40px auto">
    <h1>🏆 Classement de réenchantement</h1>

    <ul style="list-style: none; padding: 0">
      <li
        v-for="(r, index) in rows as Profile[] | null"
        :key="r?.username"
        style="
          display: flex;
          align-items: center;
          gap: 12px;
          padding: 16px;
          border-bottom: 1px solid #e5e7eb;
          background: index === 0 ? '#fef3c7' : index === 1 ? '#f3f4f6' : index === 2 ? '#fed7aa' : 'white';
        "
      >
        <div
          style="
            font-size: 20px;
            font-weight: bold;
            min-width: 40px;
            text-align: center;
          "
        >
          {{
            index === 0
              ? "🥇"
              : index === 1
                ? "🥈"
                : index === 2
                  ? "🥉"
                  : index + 1
          }}
        </div>
        <div style="flex: 1">
          <b style="font-size: 16px">{{ r?.username }}</b>
        </div>
        <div style="font-weight: bold; font-size: 18px; color: #059669">
          ✨ {{ r?.total_points ?? 0 }} pts
        </div>
      </li>
    </ul>

    <div
      v-if="!rows?.length"
      style="text-align: center; padding: 40px; opacity: 0.6"
    >
      Aucun utilisateur encore 🌱
    </div>
  </div>
</template>
