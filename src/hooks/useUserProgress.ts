import { useQuery } from "@tanstack/react-query";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const PHASES = [
  { levels: [1, 2], name: "¿Puedo cantar?", emoji: "🌱", color: "#4A90D9" },
  { levels: [3, 4], name: "Estoy encontrando mi voz", emoji: "🌿", color: "#7B68EE" },
  { levels: [5, 6], name: "Ya sueno bien", emoji: "🔥", color: "#D4A853" },
  { levels: [7, 8], name: "Soy único", emoji: "⭐", color: "#C47D4E" },
  { levels: [9, 10], name: "Me escuchan", emoji: "👑", color: "#E8D5B7" },
  { levels: [11, 12], name: "Soy Leyenda", emoji: "🏆", color: "#F5EFE0" },
];

export function getPhase(level: number) {
  return PHASES.find((p) => p.levels.includes(level)) || PHASES[0];
}

export function useUserProgress() {
  const { user } = useAuth();
  return useQuery({
    queryKey: ["user-progress", user?.id],
    queryFn: async () => {
      if (!user?.id) return null;
      const { data } = await supabase.functions.invoke("gamification-engine", {
        body: { action: "get_progress", user_id: user.id },
      });
      return data;
    },
    enabled: !!user?.id,
    staleTime: 30_000,
  });
}
