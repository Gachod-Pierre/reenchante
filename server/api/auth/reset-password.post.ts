import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const body = await readBody(event);
  const { accessToken, newPassword } = body;

  if (!accessToken || !newPassword) {
    throw createError({
      statusCode: 400,
      statusMessage: "Access token and new password are required",
    });
  }

  try {
    console.log("🔐 Processing password reset request...");

    // Décode le JWT pour obtenir l'user ID
    console.log("🔓 Decoding JWT token...");
    const tokenParts = accessToken.split(".");
    if (tokenParts.length !== 3) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid token format",
      });
    }

    // Décoder la partie payload du JWT (base64url)
    const payload = JSON.parse(
      Buffer.from(tokenParts[1], "base64url").toString("utf-8"),
    );
    const userId = payload.sub;

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: "Invalid token: missing user ID",
      });
    }

    console.log(`👤 Extracted user ID from token: ${userId}`);

    // Créer un client avec le token de service
    const supabase = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_KEY || "",
    );

    // Mettre à jour le password avec le compte service
    console.log("🔐 Updating password...");
    const { error: updateError } = await supabase.auth.admin.updateUserById(
      userId,
      { password: newPassword },
    );

    if (updateError) {
      console.error("❌ Password update error:", updateError);
      throw createError({
        statusCode: 400,
        statusMessage: updateError.message || "Failed to update password",
      });
    }

    console.log("✅ Password updated successfully");
    return {
      success: true,
      message: "Mot de passe réinitialisé avec succès!",
    };
  } catch (err: unknown) {
    console.error("❌ API error:", err);
    const error = err as {
      message?: string;
      statusCode?: number;
      statusMessage?: string;
    };

    if (error.statusCode) {
      throw createError({
        statusCode: error.statusCode,
        statusMessage:
          error.statusMessage || error.message || "Failed to reset password",
      });
    }

    throw createError({
      statusCode: 500,
      statusMessage: error.message || "Failed to reset password",
    });
  }
});
