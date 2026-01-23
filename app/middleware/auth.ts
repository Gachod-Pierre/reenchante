export default defineNuxtRouteMiddleware(async () => {
  const supabase = useSupabaseClient();
  try {
    const {
      data: { user },
    } = await supabase.auth.getUser();
    if (!user) {
      return navigateTo("/login");
    }
  } catch (error) {
    // Fallback en cas de problème SSR
    return navigateTo("/login");
  }
});
