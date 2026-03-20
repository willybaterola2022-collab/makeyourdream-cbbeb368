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
    const { action, user_id, recording_id, caption, song_title, score, post_id, page, limit: pageLimit } = await req.json();

    if (action === "publish") {
      if (!user_id) return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data: post } = await supabase.from("social_feed").insert({
        user_id,
        recording_id: recording_id || null,
        caption: caption || null,
        song_title: song_title || null,
        score: score || null,
      }).select().single();

      await supabase.from("analytics_events").insert({ user_id, event_type: "post_published", metadata: { post_id: post?.id } });

      return new Response(JSON.stringify({ post }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "feed") {
      const pg = page || 1;
      const lim = pageLimit || 20;
      const from = (pg - 1) * lim;

      const { data: posts } = await supabase
        .from("social_feed")
        .select("*, profiles!social_feed_user_id_fkey(display_name, avatar_url)")
        .order("created_at", { ascending: false })
        .range(from, from + lim - 1);

      return new Response(JSON.stringify({ posts: posts || [], page: pg }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "like") {
      if (!post_id) return new Response(JSON.stringify({ error: "post_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      await supabase.rpc("increment_likes", { p_post_id: post_id });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
