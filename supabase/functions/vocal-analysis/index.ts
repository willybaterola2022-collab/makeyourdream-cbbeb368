import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function getGrade(score: number): string {
  if (score >= 95) return "S";
  if (score >= 88) return "A";
  if (score >= 80) return "B+";
  if (score >= 70) return "B";
  if (score >= 55) return "C";
  if (score >= 40) return "D";
  return "F";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { user_id, pitch_samples, onset_times_ms, expected_beat_ms, expression_score, song_title, module } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // --- Pitch score ---
    let pitchScore = 70;
    if (pitch_samples && pitch_samples.length > 0) {
      const cents = pitch_samples.map((s: { cents_off?: number }) => Math.abs(s.cents_off ?? 0));
      const rawScores = cents.map((c: number) => Math.max(0, 1 - c / 50));
      pitchScore = Math.round((rawScores.reduce((a: number, b: number) => a + b, 0) / rawScores.length) * 100);
    }

    // --- Timing score ---
    let timingScore = 70;
    if (onset_times_ms && expected_beat_ms && onset_times_ms.length > 0) {
      const diffs = onset_times_ms.map((t: number, i: number) => {
        const expected = expected_beat_ms[i] ?? expected_beat_ms[expected_beat_ms.length - 1];
        return Math.abs(t - expected);
      });
      const avgDiff = diffs.reduce((a: number, b: number) => a + b, 0) / diffs.length;
      timingScore = Math.round(Math.max(0, 1 - avgDiff / 200) * 100);
    }

    // --- Expression score ---
    const exprScore = typeof expression_score === "number" ? Math.round(expression_score) : 65;

    // --- Overall ---
    const overall = Math.round(pitchScore * 0.45 + timingScore * 0.3 + exprScore * 0.25);
    const grade = getGrade(overall);
    const xpEarned = Math.round(overall * 0.5) + (grade === "S" ? 25 : grade === "A" ? 15 : 5);

    // Save training session
    await supabase.from("training_sessions").insert({
      user_id,
      pitch_score: pitchScore,
      timing_score: timingScore,
      expression_score: exprScore,
      overall_score: overall,
      song_title: song_title || null,
      module: module || "karaoke",
    });

    // Update user_progress
    const { data: progress } = await supabase
      .from("user_progress")
      .select("*")
      .eq("user_id", user_id)
      .single();

    if (progress) {
      const today = new Date().toISOString().split("T")[0];
      const lastActive = progress.last_active_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      let streakDays = progress.streak_days || 0;
      if (lastActive === yesterday) streakDays += 1;
      else if (lastActive !== today) streakDays = 1;
      const longestStreak = Math.max(progress.longest_streak || 0, streakDays);
      const newXp = (progress.xp || 0) + xpEarned;

      await supabase.from("user_progress").update({
        xp: newXp,
        level: Math.floor(newXp / 100) + 1,
        streak_days: streakDays,
        longest_streak: longestStreak,
        last_active_date: today,
      }).eq("user_id", user_id);
    }

    // Track analytics
    await supabase.from("analytics_events").insert({
      user_id,
      event_type: "session_completed",
      metadata: { module: module || "karaoke", overall, grade },
    });

    return new Response(JSON.stringify({
      analysis: { pitch: pitchScore, timing: timingScore, expression: exprScore, overall },
      grade,
      xp_earned: xpEarned,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
