import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { code, newPassword } = body;

  if (!code || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "Code and new password are required",
    });
  }

  try {
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_KEY || "",
    );

    // Vérifier et traiter le code de recovery
    const { data, error: verifyError } = await supabase.auth.verifyOtp({
      token_hash: code,
      type: "recovery",
    });

    if (verifyError) {
      console.error("❌ OTP verification error:", verifyError);
      throw createError({
        statusCode: 400,
        statusMessage: "Code invalid or expired",
      });
    }

    // Si la session existe, mettre à jour le password
    if (data.session && data.user) {
      const { error: updateError } = await supabase.auth.admin.updateUserById(
        data.user.id,
        { password: newPassword },
      );

      if (updateError) {
        console.error("❌ Password update error:", updateError);
        throw createError({
          statusCode: 400,
          statusMessage: updateError.message,
        });
      }

      console.log("✅ Password reset successfully");
      return {
        success: true,
        message: "Mot de passe réinitialisé avec succès",
      };
    }

    throw createError({
      statusCode: 400,
      statusMessage: "Failed to create session",
    });
  } catch (err) {
    console.error("❌ API error:", err);
    throw createError({
      statusCode: 500,
      statusMessage: "Failed to reset password",
    });
  }
});
