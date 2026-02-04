// Logique de récupération du leaderboard et points globaux depuis Supabase

import { ref } from "vue";

export interface LeaderboardUser {
  id: string;
  username: string;
  total_points: number;
  avatar_url?: string | null;
  full_name?: string | null;
}

interface ProfileRow {
  id: string;
  username: string | null;
  total_points: number | null;
  avatar_url: string | null;
  full_name: string | null;
}

export const useLeaderboard = () => {
  const client = useSupabaseClient();
  const leaderboard = ref<LeaderboardUser[]>([]);
  const globalPoints = ref(0);
  const loading = ref(true);
  const error = ref<string | null>(null);
  let subscription: ReturnType<typeof client.channel> | null = null;
  let isInitialLoad = true;

  // Récupérer le top 5 des utilisateurs
  const fetchLeaderboard = async (limit = 5) => {
    try {
      // Afficher loading seulement à la première charge
      if (isInitialLoad) {
        loading.value = true;
      }
      error.value = null;

      const { data, error: err } = await client
        .from("profiles")
        .select("id, username, total_points, avatar_url, full_name")
        .order("total_points", { ascending: false })
        .limit(limit);

      if (err) throw err;

      // Type-safe mapping
      const typedData = (data || []) as unknown as (ProfileRow | null)[];
      leaderboard.value = typedData
        .filter(
          (user): user is ProfileRow => user !== null && user.username !== null,
        )
        .map((user: ProfileRow) => ({
          id: user.id,
          username: user.username || "Utilisateur",
          total_points: user.total_points || 0,
          avatar_url: user.avatar_url,
          full_name: user.full_name,
        }));
    } catch (err: unknown) {
      const errMsg =
        err instanceof Error
          ? err.message
          : "Erreur lors du chargement du leaderboard";
      error.value = errMsg;
      console.error("Leaderboard error:", err);
    } finally {
      if (isInitialLoad) {
        loading.value = false;
        isInitialLoad = false; // Plus jamais loading après première charge
      }
    }
  };

  // Récupérer la somme totale des points via RPC
  const fetchGlobalPoints = async () => {
    try {
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const { data, error: err } = await (client.rpc as any)(
        "get_global_points",
      );

      if (err) throw err;

      globalPoints.value = (data as number) || 0;
      console.log(`[fetchGlobalPoints] total=${data}`);
    } catch (err: unknown) {
      console.error("Global points error:", err);
    }
  };

  // Démarrer la subscription real-time
  const startPolling = () => {
    // Fetch initial
    fetchLeaderboard();
    fetchGlobalPoints();

    // Subscription real-time pour leaderboard et globalPoints
    subscription = client
      .channel("public:profiles", {
        config: {
          broadcast: { self: true },
          presence: { key: "profiles" },
        },
      })
      .on(
        "postgres_changes",
        { event: "*", schema: "public", table: "profiles" },
        (payload) => {
          console.log(
            "[postgres_changes] Profile changed:",
            payload.eventType,
            payload,
          );
          // Quand profiles change, mettre à jour leaderboard ET globalPoints
          fetchLeaderboard();
          fetchGlobalPoints();
        },
      )
      .subscribe((status) => {
        console.log(`[subscription] Status: ${status}`);
        if (status === "SUBSCRIBED") {
          console.log("[subscription] Successfully subscribed to profiles");
        }
      });

    console.log("[startPolling] Real-time subscription démarrée");
  };

  // Arrêter la subscription
  const stopPolling = () => {
    if (subscription) {
      client.removeChannel(subscription);
      subscription = null;
    }
  };

  return {
    leaderboard,
    globalPoints,
    loading,
    error,
    fetchLeaderboard,
    fetchGlobalPoints,
    startPolling,
    stopPolling,
  };
};
