import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { email } = body;

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email is required",
    });
  }

  try {
    console.log("📧 Starting reset password for email:", email);

    // Créer un client public (méthode recommandée par Supabase)
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_KEY || "",
    );

    // Utiliser la vraie méthode Supabase recommandée
    console.log(
      "🔐 Sending reset password email via resetPasswordForEmail()...",
    );
    const { data: _, error } = await supabase.auth.resetPasswordForEmail(email, {
      redirectTo: `${process.env.NUXT_PUBLIC_SITE_URL || "http://localhost:3000"}/reset-password`,
    });

    if (error) {
      console.error("❌ resetPasswordForEmail error:", error);
      throw createError({
        statusCode: 400,
        statusMessage: error.message || "Failed to send reset password email",
      });
    }

    console.log(`✅ Reset password email sent to ${email}`);

    return { success: true, message: "Email de réinitialisation envoyé" };
  } catch (err: unknown) {
    console.error("❌ API error:", err);
    const error = err as { message?: string; data?: { statusMessage?: string } };
    const message =
      error?.message ||
      error?.data?.statusMessage ||
      "Failed to send reset password email";
    throw createError({
      statusCode: 500,
      statusMessage: message,
    });
  }
});
