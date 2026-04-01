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
    const { action, user_id, season_id, xp_amount } = await req.json();

    if (action === "get_current") {
      const today = new Date().toISOString().split("T")[0];
      const { data } = await supabase
        .from("seasonal_events")
        .select("*")
        .lte("start_date", today)
        .gte("end_date", today)
        .eq("status", "active")
        .limit(1)
        .single();

      return new Response(JSON.stringify({ season: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get_leaderboard") {
      if (!season_id) return new Response(JSON.stringify({ error: "season_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data } = await supabase
        .from("seasonal_progress")
        .select("user_id, xp_earned, rank, profiles!seasonal_progress_user_id_fkey(display_name, avatar_url)")
        .eq("season_id", season_id)
        .order("xp_earned", { ascending: false })
        .limit(50);

      return new Response(JSON.stringify({ leaderboard: data || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "join") {
      if (!user_id || !season_id) return new Response(JSON.stringify({ error: "user_id and season_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data, error } = await supabase
        .from("seasonal_progress")
        .upsert({ user_id, season_id, xp_earned: 0 }, { onConflict: "user_id,season_id" })
        .select()
        .single();

      if (error) throw error;
      return new Response(JSON.stringify({ progress: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "add_xp") {
      if (!user_id || !season_id || !xp_amount) return new Response(JSON.stringify({ error: "user_id, season_id, xp_amount required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data: existing } = await supabase
        .from("seasonal_progress")
        .select("xp_earned")
        .eq("user_id", user_id)
        .eq("season_id", season_id)
        .single();

      const newXp = (existing?.xp_earned || 0) + xp_amount;
      const { data } = await supabase
        .from("seasonal_progress")
        .upsert({ user_id, season_id, xp_earned: newXp }, { onConflict: "user_id,season_id" })
        .select()
        .single();

      return new Response(JSON.stringify({ progress: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get_my_progress") {
      if (!user_id) return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data } = await supabase
        .from("seasonal_progress")
        .select("*, seasonal_events(*)")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false });

      return new Response(JSON.stringify({ seasons: data || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: get_current, get_leaderboard, join, add_xp, get_my_progress" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
