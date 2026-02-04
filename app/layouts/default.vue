<template>
  <div class="layout-default">
    <MyHeader />
    <main class="layout-default__main">
      <slot />
    </main>
    <!-- Footer (ne pas afficher sur la page d'accueil) -->
    <MyFooter v-if="route.path !== '/' && route.path !== '/leaderboard'" class="relative z-[1000]"/>
  </div>
</template>

<script setup lang="ts">
const route = useRoute();
</script>
