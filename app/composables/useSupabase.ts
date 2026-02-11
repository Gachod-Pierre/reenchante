export const useSupabaseClient = () => {
  const { $supabase } = useNuxtApp();
  if (!$supabase) {
    throw new Error("Supabase client not initialized");
  }
  return $supabase;
};

export const useSupabaseUser = () => {
  const supabase = useSupabaseClient();
  const user = useState("auth.user", () => null);

  // Charger l'utilisateur depuis la session au montage
  const initUser = async () => {
    const {
      data: { session },
    } = await supabase.auth.getSession();
    user.value = session?.user ?? null;
  };

  // Écouter les changements d'authentification
  onMounted(async () => {
    await initUser();

    const {
      data: { subscription },
    } = supabase.auth.onAuthStateChange((_event, session) => {
      user.value = session?.user ?? null;
    });

    onUnmounted(() => {
      subscription?.unsubscribe();
    });
  });

  return user;
};
