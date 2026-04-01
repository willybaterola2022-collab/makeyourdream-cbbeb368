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

    if (action === "generate") {
      const weekAgo = new Date();
      weekAgo.setDate(weekAgo.getDate() - 7);
      const weekStart = weekAgo.toISOString().split("T")[0];

      // Gather week's data
      const [sessions, recordings, progress] = await Promise.all([
        supabase.from("training_sessions").select("*").eq("user_id", user_id).gte("created_at", weekAgo.toISOString()),
        supabase.from("recordings").select("id, duration_seconds, module").eq("user_id", user_id).gte("created_at", weekAgo.toISOString()),
        supabase.from("user_progress").select("*").eq("user_id", user_id).single(),
      ]);

      const totalSessions = sessions.data?.length || 0;
      const totalRecordings = recordings.data?.length || 0;
      const totalMinutes = Math.round((recordings.data || []).reduce((s, r) => s + (r.duration_seconds || 0), 0) / 60);
      const avgScore = totalSessions > 0
        ? Math.round((sessions.data || []).reduce((s, t) => s + (t.overall_score || 0), 0) / totalSessions)
        : 0;
      const modulesUsed = [...new Set((sessions.data || []).map(s => s.module))];

      const reportData = {
        totalSessions,
        totalRecordings,
        totalMinutes,
        avgScore,
        modulesUsed,
        streak: progress.data?.streak_days || 0,
        xp: progress.data?.xp || 0,
        level: progress.data?.level || 1,
      };

      const { data: report, error } = await supabase
        .from("weekly_reports")
        .upsert({ user_id, week_start: weekStart, data: reportData }, { onConflict: "user_id,week_start" })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ report }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get_latest") {
      const { data } = await supabase
        .from("weekly_reports")
        .select("*")
        .eq("user_id", user_id)
        .order("week_start", { ascending: false })
        .limit(1)
        .single();

      return new Response(JSON.stringify({ report: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "history") {
      const { data } = await supabase
        .from("weekly_reports")
        .select("*")
        .eq("user_id", user_id)
        .order("week_start", { ascending: false })
        .limit(12);

      return new Response(JSON.stringify({ reports: data || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: generate, get_latest, history" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
