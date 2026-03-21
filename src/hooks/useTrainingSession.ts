import { useCallback } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

interface SessionData {
  module: string;
  overall_score?: number;
  pitch_score?: number;
  timing_score?: number;
  expression_score?: number;
  song_title?: string;
}

export function useTrainingSession() {
  const { user } = useAuth();

  const saveSession = useCallback(async (data: SessionData) => {
    if (!user) return null;

    // Save training session
    const { data: session, error } = await supabase
      .from("training_sessions")
      .insert({
        user_id: user.id,
        module: data.module,
        overall_score: data.overall_score ?? 0,
        pitch_score: data.pitch_score ?? 0,
        timing_score: data.timing_score ?? 0,
        expression_score: data.expression_score ?? 0,
        song_title: data.song_title ?? null,
      })
      .select()
      .single();

    if (error) {
      console.warn("Failed to save training session:", error.message);
      return null;
    }

    // Award XP via gamification-engine
    try {
      const xpAmount = Math.max(10, Math.round((data.overall_score ?? 50) / 5));
      await supabase.functions.invoke("gamification-engine", {
        body: { action: "add_xp", user_id: user.id, amount: xpAmount },
      });
    } catch {
      console.warn("Failed to award XP");
    }

    return session;
  }, [user]);

  return { saveSession };
}
