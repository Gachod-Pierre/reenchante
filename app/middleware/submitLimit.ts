export default defineNuxtRouteMiddleware(async (to) => {
  // Ce middleware s'applique uniquement aux routes /submit/*
  if (!to.path.startsWith("/submit/")) {
    return;
  }

  try {
    const supabase = useSupabaseClient();
    const user = useSupabaseUser();

    if (!user.value) {
      return navigateTo("/login");
    }

    // Vérifier si l'user a atteint la limite quotidienne
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);

    const { count: validatedToday } = await supabase
      .from("user_deeds")
      .select("id", { count: "exact", head: true })
      .eq("user_id", user.value.id)
      .eq("status", "validated")
      .gte("validated_at", today.toISOString());

    console.log("[submitLimit] User validated today:", validatedToday);

    if ((validatedToday ?? 0) >= 5) {
      console.log("[submitLimit] Limite atteinte, redirection vers dashboard");
      return navigateTo("/dashboard");
    }
  } catch (error) {
    console.error("[submitLimit] Erreur dans le middleware:", error);
  }
});
