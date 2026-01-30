import { ref } from "vue";
import type { TablesInsert } from "../types/database.types";

export type UserDeedInsert = TablesInsert<"user_deeds">;

export const COUNTRIES = [
  // Europe
  "France",
  "Germany",
  "United Kingdom",
  "Spain",
  "Italy",
  "Poland",
  "Netherlands",
  "Belgium",
  "Portugal",
  "Greece",
  "Austria",
  "Sweden",
  "Denmark",
  "Ireland",
  "Czech Republic",
  // Afrique
  "Nigeria",
  "Egypt",
  "South Africa",
  "Kenya",
  "Ethiopia",
  "Angola",
  "Ghana",
  "Morocco",
  "Cameroon",
  "Tanzania",
  "Uganda",
  "Sudan",
  "Côte d'Ivoire",
  // Asie
  "China",
  "India",
  "Japan",
  "Indonesia",
  "Pakistan",
  "Bangladesh",
  "Philippines",
  "Vietnam",
  "Thailand",
  "South Korea",
  "Myanmar",
  "Malaysia",
  "Singapore",
  "Afghanistan",
  "Iran",
  // Océanie
  "Australia",
  "New Zealand",
  "Fiji",
  "Papua New Guinea",
  "Solomon Islands",
  // Amérique du Nord
  "United States",
  "Canada",
  "Mexico",
  "Guatemala",
  "Belize",
  "El Salvador",
  "Honduras",
  "Nicaragua",
  "Costa Rica",
  "Panama",
  // Amérique du Sud
  "Brazil",
  "Colombia",
  "Argentina",
  "Peru",
  "Venezuela",
  "Chile",
  "Ecuador",
  "Bolivia",
  "Paraguay",
  "Uruguay",
  "Guyana",
  "Suriname",
].sort();

export function useUserDeedSubmission() {
  const formData = ref<Partial<UserDeedInsert>>({
    submission_text: "",
    country: "",
    evidence_url: "",
    status: "submitted",
  });

  const loading = ref(false);
  const error = ref<string | null>(null);
  const success = ref(false);

  /**
   * Soumet une nouvelle bonne action
   */
  const submitUserDeed = async (
    userId: string,
    goodDeedId: string,
  ): Promise<boolean> => {
    if (!formData.value.country || !formData.value.submission_text) {
      error.value = "Veuillez remplir tous les champs obligatoires";
      return false;
    }

    loading.value = true;
    error.value = null;
    success.value = false;

    try {
      const supabase = useSupabaseClient();

      const { error: supabaseError } = await supabase
        .from("user_deeds")
        .insert({
          user_id: userId,
          good_deed_id: goodDeedId,
          country: formData.value.country,
          submission_text: formData.value.submission_text,
          evidence_url: formData.value.evidence_url || null,
          status: "submitted",
          submitted_at: new Date().toISOString(),
        });

      if (supabaseError) {
        error.value = supabaseError.message;
        return false;
      }

      success.value = true;
      resetForm();
      return true;
    } catch (err) {
      error.value =
        err instanceof Error ? err.message : "Erreur lors de la soumission";
      return false;
    } finally {
      loading.value = false;
    }
  };

  /**
   * Réinitialise le formulaire
   */
  const resetForm = () => {
    formData.value = {
      submission_text: "",
      country: "",
      evidence_url: "",
      status: "submitted",
    };
    error.value = null;
    success.value = false;
  };

  return {
    formData,
    loading,
    error,
    success,
    submitUserDeed,
    resetForm,
    COUNTRIES,
  };
}
