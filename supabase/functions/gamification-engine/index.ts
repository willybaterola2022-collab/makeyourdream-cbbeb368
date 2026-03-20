import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action, user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get_progress") {
      const { data: progress } = await supabase.from("user_progress").select("*").eq("user_id", user_id).single();

      if (!progress) {
        return new Response(JSON.stringify({
          xp: 0, level: 1, streak_days: 0, longest_streak: 0, badges: [],
          next_level_xp: 100, xp_to_next: 100,
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const level = Math.floor((progress.xp || 0) / 100) + 1;
      const nextLevelXp = level * 100;
      const xpToNext = nextLevelXp - (progress.xp || 0);

      // Count total sessions and recordings
      const { count: sessionCount } = await supabase.from("training_sessions").select("*", { count: "exact", head: true }).eq("user_id", user_id);
      const { count: recordingCount } = await supabase.from("recordings").select("*", { count: "exact", head: true }).eq("user_id", user_id);

      return new Response(JSON.stringify({
        xp: progress.xp || 0,
        level,
        streak_days: progress.streak_days || 0,
        longest_streak: progress.longest_streak || 0,
        badges: progress.badges || [],
        next_level_xp: nextLevelXp,
        xp_to_next: xpToNext,
        total_sessions: sessionCount || 0,
        total_recordings: recordingCount || 0,
        last_active_date: progress.last_active_date,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "add_xp") {
      const { amount } = await req.json();
      const { data: progress } = await supabase.from("user_progress").select("xp").eq("user_id", user_id).single();
      const newXp = ((progress?.xp) || 0) + (amount || 0);
      await supabase.from("user_progress").update({
        xp: newXp,
        level: Math.floor(newXp / 100) + 1,
      }).eq("user_id", user_id);

      return new Response(JSON.stringify({ xp: newXp, level: Math.floor(newXp / 100) + 1 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use get_progress or add_xp" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
