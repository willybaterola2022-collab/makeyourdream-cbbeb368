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
    const { action, limit: lim, genre, difficulty, query, track_id, user_id } = await req.json();

    if (action === "list") {
      let q = supabase.from("karaoke_tracks").select("*").order("title");
      if (genre) q = q.eq("genre", genre);
      if (difficulty) q = q.eq("difficulty", difficulty);
      q = q.limit(lim || 50);
      const { data, error } = await q;
      if (error) throw error;
      return new Response(JSON.stringify({ tracks: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "search") {
      if (!query) return new Response(JSON.stringify({ error: "query required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      const { data, error } = await supabase
        .from("karaoke_tracks")
        .select("*")
        .or(`title.ilike.%${query}%,artist.ilike.%${query}%`)
        .limit(lim || 20);
      if (error) throw error;
      return new Response(JSON.stringify({ tracks: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "popular") {
      const { data, error } = await supabase
        .from("karaoke_tracks")
        .select("*")
        .order("play_count", { ascending: false })
        .limit(lim || 10);
      if (error) throw error;
      return new Response(JSON.stringify({ tracks: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "log_play") {
      if (!track_id) return new Response(JSON.stringify({ error: "track_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      await supabase.rpc("increment_track_plays", { p_track_id: track_id }).catch(() => {
        // fallback: manual increment
        supabase.from("karaoke_tracks").update({ play_count: supabase.sql`play_count + 1` }).eq("id", track_id);
      });
      if (user_id) {
        await supabase.from("analytics_events").insert({ user_id, event_type: "track_played", metadata: { track_id } });
      }
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: list, search, popular, log_play" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
