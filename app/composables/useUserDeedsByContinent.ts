import { ref } from "vue";
import type { Tables } from "../types/database.types";
import { useContinentCountries } from "./useContinentCountries";

export type UserDeed = Tables<"user_deeds"> & {
  profiles?: Tables<"profiles"> | null;
  good_deeds?: Tables<"good_deeds"> | null;
};

export function useUserDeedsByContinent() {
  const { getCountriesByContinent } = useContinentCountries();

  const userDeeds = ref<UserDeed[]>([]);
  const loading = ref(false);
  const error = ref<string | null>(null);

  /**
   * Récupère tous les user_deeds validés pour un continent
   */
  const fetchUserDeedsForContinent = async (
    continentId: string,
  ): Promise<UserDeed[]> => {
    // Réinitialiser et démarrer le chargement AU MÊME MOMENT
    userDeeds.value = [];
    loading.value = true;
    error.value = null;

    try {
      const supabase = useSupabaseClient();
      const countries = getCountriesByContinent(continentId);

      if (countries.length === 0) {
        userDeeds.value = [];
        return [];
      }

      // Récupérer tous les user_deeds pour ces pays avec status 'completed' ou 'validated'
      const { data, error: supabaseError } = await supabase
        .from("user_deeds")
        .select(
          "*, profiles(id, username, avatar_url, full_name), good_deeds(id, title, description, points)",
        )
        .in("country", countries)
        .in("status", ["completed", "validated"])
        .order("submitted_at", { ascending: false })
        .limit(50);

      if (supabaseError) {
        error.value = supabaseError.message;
        userDeeds.value = [];
        return [];
      }

      userDeeds.value = (data as UserDeed[]) || [];
      return userDeeds.value;
    } catch (err) {
      error.value = err instanceof Error ? err.message : "Unknown error";
      return [];
    } finally {
      loading.value = false;
    }
  };

  /**
   * Réinitialise les données
   */
  const reset = () => {
    userDeeds.value = [];
    loading.value = false;
    error.value = null;
  };

  return {
    userDeeds,
    loading,
    error,
    fetchUserDeedsForContinent,
    reset,
  };
}
