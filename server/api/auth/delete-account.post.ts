import { createClient } from '@supabase/supabase-js'

export default defineEventHandler(async (event) => {
  try {
    const { userId } = await readBody(event)

    if (!userId) {
      throw createError({
        statusCode: 400,
        statusMessage: 'User ID is required',
      })
    }

    // Créer un client Supabase avec la clé service (côté serveur)
    const supabaseUrl = process.env.SUPABASE_URL
    const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY

    if (!supabaseUrl || !supabaseServiceKey) {
      throw createError({
        statusCode: 500,
        statusMessage: 'Supabase environment variables not configured',
      })
    }

    const supabase = createClient(supabaseUrl, supabaseServiceKey, {
      auth: {
        autoRefreshToken: false,
        persistSession: false,
      },
    })

    // Supprimer l'utilisateur via l'Admin API
    const { error } = await supabase.auth.admin.deleteUser(userId)

    if (error) {
      throw error
    }

    return {
      success: true,
      message: 'Utilisateur supprimé avec succès',
    }
  } catch (error) {
    console.error('Erreur lors de la suppression du compte:', error)
    throw createError({
      statusCode: 500,
      statusMessage: (error as Error).message || 'Erreur lors de la suppression du compte',
    })
  }
})
