import { createClient } from "@supabase/supabase-js";

export default defineEventHandler(async (event) => {
  const query = getQuery(event);
  const email = query.email as string;

  if (!email) {
    throw createError({
      statusCode: 400,
      statusMessage: "Email parameter is required",
    });
  }

  try {
    const supabaseAdmin = createClient(
      process.env.SUPABASE_URL || "",
      process.env.SUPABASE_SERVICE_ROLE_KEY || "",
    );

    // Vérifie si le profil a email_verified_at rempli
    const { data, error } = await supabaseAdmin
      .from("profiles")
      .select("id, email_verified_at")
      .eq("email", email)
      .single();

    if (error) {
      console.error("❌ Error checking email:", error);
      return { verified: false };
    }

    const verified = !!data?.email_verified_at;
    console.log(`📧 Email verification check for ${email}: ${verified}`);

    return { verified };
  } catch (err) {
    console.error("❌ API error:", err);
    return { verified: false };
  }
});
