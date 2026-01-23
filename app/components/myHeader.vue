<script setup lang="ts">
const scrollY = ref(0);
const isHeaderHidden = ref(false);
const isHovering = ref(false);
const isMenuOpen = ref(false);

// Distance de scroll avant de cacher le header
const SCROLL_THRESHOLD = 100;

// Écouter le scroll
const handleScroll = () => {
  scrollY.value = window.scrollY;
  isHeaderHidden.value = scrollY.value > SCROLL_THRESHOLD;
};

// Écouter le hover sur la partie cachée
const handleMouseEnter = () => {
  isHovering.value = true;
};

const handleMouseLeave = () => {
  isHovering.value = false;
};

// Gérer l'ouverture/fermeture du menu
const toggleMenu = () => {
  isMenuOpen.value = !isMenuOpen.value;
};

onMounted(() => {
  window.addEventListener("scroll", handleScroll);
});

onUnmounted(() => {
  window.removeEventListener("scroll", handleScroll);
});

// Afficher le header si on hover ou si on n'a pas scrollé assez
const shouldShowHeader = computed(
  () => !isHeaderHidden.value || isHovering.value,
);
</script>

<template>
  <header
    class="fixed top-0 left-0 right-0 z-50"
    @mouseenter="handleMouseEnter"
    @mouseleave="handleMouseLeave"
  >
    <!-- DESKTOP: Bulle ovale du header -->
    <div
      class="hidden lg:flex items-center justify-center mt-6 px-8 py-4 ml-auto mr-4 bg-black rounded-full w-fit transition-transform duration-300 ease-in-out"
      :class="shouldShowHeader ? 'translate-y-0' : '-translate-y-full'"
      style="will-change: transform"
    >
      <nav class="flex items-center gap-8">
        <NuxtLink to="/" class="text-white hover:text-gray-300 transition">
          Home
        </NuxtLink>
        <NuxtLink
          to="/actions"
          class="text-white hover:text-gray-300 transition"
        >
          Actions
        </NuxtLink>
        <NuxtLink
          to="/gallery"
          class="text-white hover:text-gray-300 transition"
        >
          Galerie
        </NuxtLink>
        <NuxtLink
          to="/leaderboard"
          class="text-white hover:text-gray-300 transition"
        >
          Classement
        </NuxtLink>
        <NuxtLink
          to="/dashboard"
          class="text-white hover:text-gray-300 transition"
        >
          Dashboard
        </NuxtLink>
      </nav>
    </div>

    <!-- MOBILE: Burger menu button + Expandable nav -->
    <div class="lg:hidden">
      <!-- Grand fond noir qui s'expande depuis le petit rond (avec clip-path pour garder la forme) -->
      <div
        class="fixed inset-0 bg-black transition-all duration-500 ease-in-out overflow-hidden"
        :style="
          isMenuOpen
            ? 'clip-path: circle(150% at calc(100% - 43px) 45px)'
            : 'clip-path: circle(28px at calc(100% - 43px) 45px)'
        "
        :class="
          shouldShowHeader ? 'opacity: 1' : 'opacity: 0; pointer-events: none'
        "
      >
        <!-- Navigation menu (appears when expanded) -->
        <nav
          v-if="isMenuOpen"
          class="flex flex-col items-end gap-12 pt-32 pr-8 text-white text-2xl w-full h-full"
        >
          <NuxtLink
            to="/"
            class="hover:text-gray-300 transition"
            @click="isMenuOpen = false"
          >
            Home
          </NuxtLink>
          <NuxtLink
            to="/actions"
            class="hover:text-gray-300 transition"
            @click="isMenuOpen = false"
          >
            Actions
          </NuxtLink>
          <NuxtLink
            to="/gallery"
            class="hover:text-gray-300 transition"
            @click="isMenuOpen = false"
          >
            Galerie
          </NuxtLink>
          <NuxtLink
            to="/leaderboard"
            class="hover:text-gray-300 transition"
            @click="isMenuOpen = false"
          >
            Leaderboard
          </NuxtLink>
          <NuxtLink
            to="/dashboard"
            class="hover:text-gray-300 transition"
            @click="isMenuOpen = false"
          >
            Dashboard
          </NuxtLink>
        </nav>
      </div>

      <!-- Burger/Close button (fixed, always on top) -->
      <button
        class="fixed top-6 right-6 p-2 text-white text-2xl flex items-center justify-center z-50 transition-opacity duration-300"
        :style="
          shouldShowHeader ? 'opacity: 1' : 'opacity: 0; pointer-events: none'
        "
        @click="toggleMenu"
      >
        {{ isMenuOpen ? "✕" : "☰" }}
      </button>
    </div>

    <!-- Zone invisible pour le hover quand le header est caché -->
    <div
      v-if="isHeaderHidden"
      class="h-12 w-full pointer-events-auto"
      @mouseenter="handleMouseEnter"
    />
  </header>
</template>
