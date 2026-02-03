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
  <div
    :style="pageStyle"
    class="flex items-center justify-center min-h-screen px-4"
  >
    <div class="text-center">
      <!-- Spinner -->
      <div class="flex justify-center mb-8">
        <div class="spinner" />
      </div>

      <!-- Texte -->
      <p class="text-2xl md:text-3xl font-bold" :style="{ color: '#FF1493' }">
        Direction le Réenchantement du monde ! 😁
      </p>
    </div>
  </div>
</template>

<style scoped>
.spinner {
  width: 50px;
  height: 50px;
  border: 4px solid #ff69b4;
  border-top-color: #ff1493;
  border-radius: 50%;
  animation: spin 1s linear infinite;
}

@keyframes spin {
  to {
    transform: rotate(360deg);
  }
}
</style>
