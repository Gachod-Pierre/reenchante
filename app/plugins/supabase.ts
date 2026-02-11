import { createBrowserClient } from "@supabase/ssr";

export default defineNuxtPlugin(() => {
  const config = useRuntimeConfig();

  // Créer le client Supabase avec SSR
  // SSR stocke le code verifier et les tokens en cookies au lieu de localStorage
  // Ça permet au PKCE flow de fonctionner en cross-device
  const supabase = createBrowserClient(
    config.public.supabaseUrl,
    config.public.supabaseKey,
    {
      // Supabase Auth va automatiquement utiliser les cookies pour :
      // - Stocker le PKCE code verifier (permet cross-device)
      // - Persister la session entre les rechargements
      // - Synchroniser l'auth entre les onglets/devices
      isSsr: true,
      cookieOptions: {
        name: "sb-auth",
        lifetime: 60 * 60 * 8, // 8 heures
        domain: "",
        path: "/",
        sameSite: "Lax",
        secure: process.env.NODE_ENV === "production",
      },
    },
  );

  return {
    provide: {
      supabase,
    },
  };
});
