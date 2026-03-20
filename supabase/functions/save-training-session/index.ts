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

    const { user_id, scores, module, song_title, recording_id } = await req.json();
    if (!user_id || !scores) {
      return new Response(JSON.stringify({ error: "user_id and scores required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const overall = Math.round((scores.pitch || 0) * 0.45 + (scores.timing || 0) * 0.3 + (scores.expression || 0) * 0.25);
    const grade = getGrade(overall);
    const xpEarned = Math.round(overall * 0.5) + (grade === "S" ? 25 : grade === "A" ? 15 : 5);

    const { data: session } = await supabase.from("training_sessions").insert({
      user_id,
      pitch_score: scores.pitch || 0,
      timing_score: scores.timing || 0,
      expression_score: scores.expression || 0,
      overall_score: overall,
      module: module || "karaoke",
      song_title: song_title || null,
      recording_id: recording_id || null,
    }).select("id").single();

    // Update progress
    const { data: progress } = await supabase.from("user_progress").select("*").eq("user_id", user_id).single();
    if (progress) {
      const today = new Date().toISOString().split("T")[0];
      const lastActive = progress.last_active_date;
      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      let streakDays = progress.streak_days || 0;
      if (lastActive === yesterday) streakDays += 1;
      else if (lastActive !== today) streakDays = 1;

      const newXp = (progress.xp || 0) + xpEarned;
      const badges = Array.isArray(progress.badges) ? [...progress.badges] : [];

      // Badge checks
      if (streakDays >= 7 && !badges.includes("streak_7")) badges.push("streak_7");
      if (streakDays >= 30 && !badges.includes("streak_30")) badges.push("streak_30");
      if (grade === "S" && !badges.includes("first_s_rank")) badges.push("first_s_rank");
      if (newXp >= 1000 && !badges.includes("xp_1000")) badges.push("xp_1000");

      await supabase.from("user_progress").update({
        xp: newXp,
        level: Math.floor(newXp / 100) + 1,
        streak_days: streakDays,
        longest_streak: Math.max(progress.longest_streak || 0, streakDays),
        last_active_date: today,
        badges,
      }).eq("user_id", user_id);
    }

    await supabase.from("analytics_events").insert({
      user_id,
      event_type: "session_completed",
      metadata: { module: module || "karaoke", overall, grade },
    });

    return new Response(JSON.stringify({
      session_id: session?.id,
      overall,
      grade,
      xp_earned: xpEarned,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
