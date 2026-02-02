<script setup lang="ts">
definePageMeta({ ssr: false });

const user = useSupabaseUser();

watch(
  user,
  () => {
    if (user.value) {
      return navigateTo("/dashboard");
    }
  },
  { immediate: true },
);
</script>

<template>
  <div style="max-width: 520px; margin: 40px auto">
    <p>Connexion en cours…</p>
  </div>
</template>
