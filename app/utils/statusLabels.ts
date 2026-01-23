/**
 * Map simple pour afficher les statuts de manière lisible à l'utilisateur
 */
export const getStatusLabel = (status: string): string => {
  if (status === "in_progress") return "Réenchantement du monde en cours";
  if (status === "validated") return "Monde réenchanté";
  return status;
};
