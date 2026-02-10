// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: "2025-07-15",
  devtools: { enabled: true },
  css: ["./app/assets/css/main.css"],
  modules: [
    "@nuxt/eslint",
    "@nuxt/icon",
    "@nuxt/image",
    "@nuxtjs/supabase",
    "@nuxtjs/tailwindcss",
    "@tresjs/nuxt",
    "@netlify/nuxt",
  ],
  supabase: {
    redirectOptions: {
      login: "/login",
      callback: "/confirm",
      exclude: ["/", "/gallery", "/email-confirmation"],
    },
  },
  devServer: {
    host: "0.0.0.0",
    port: 3000,
  },
});
