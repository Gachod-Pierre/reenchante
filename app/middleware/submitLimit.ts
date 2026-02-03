export default defineNuxtRouteMiddleware((to) => {
  // Ce middleware s'applique uniquement aux routes /submit/*
  if (!to.path.startsWith("/submit/")) {
    return;
  }

  const user = useSupabaseUser();

  // Protection simple: si pas d'utilisateur connecté, rediriger vers login
  if (!user.value) {
    console.log("[submitLimit] User not authenticated, redirecting to login");
    return navigateTo("/login");
  }

  // La vérification de la limite quotidienne est faite dans le dashboard
  // avec le computed hasReachedDailyLimit et le bouton est désactivé côté client
  console.log("[submitLimit] Accès autorisé pour user:", user.value.id);
});
