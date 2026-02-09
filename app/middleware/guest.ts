export default defineNuxtRouteMiddleware((to) => {
  const user = useSupabaseUser();

  // Ne pas rediriger si on est déjà sur email-confirmation
  if (user.value && to.path !== "/email-confirmation") {
    return navigateTo("/dashboard");
  }
});
