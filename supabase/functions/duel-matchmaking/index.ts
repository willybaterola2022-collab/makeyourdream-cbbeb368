import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const DUEL_SONGS = [
  "Bohemian Rhapsody", "Rolling in the Deep", "Don't Stop Believin'",
  "Shallow", "Someone Like You", "Livin' on a Prayer",
  "I Will Always Love You", "Despacito", "Hallelujah",
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action, user_id, duel_id, score } = await req.json();

    if (!user_id) return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

    if (action === "find_match") {
      // Look for an open duel
      const { data: openDuel } = await supabase
        .from("duels")
        .select("*")
        .eq("status", "pending")
        .neq("challenger_id", user_id)
        .is("opponent_id", null)
        .order("created_at", { ascending: true })
        .limit(1)
        .single();

      if (openDuel) {
        // Join existing duel
        const song = openDuel.song_title || DUEL_SONGS[Math.floor(Math.random() * DUEL_SONGS.length)];
        await supabase.from("duels").update({
          opponent_id: user_id,
          status: "active",
          song_title: song,
        }).eq("id", openDuel.id);

        const { data: challenger } = await supabase.from("profiles").select("display_name").eq("user_id", openDuel.challenger_id).single();

        return new Response(JSON.stringify({
          duel_id: openDuel.id,
          opponent: { id: openDuel.challenger_id, display_name: challenger?.display_name || "Retador" },
          song_title: song,
          status: "active",
        }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      // Create new duel
      const song = DUEL_SONGS[Math.floor(Math.random() * DUEL_SONGS.length)];
      const { data: newDuel } = await supabase.from("duels").insert({
        challenger_id: user_id,
        song_title: song,
        status: "pending",
      }).select().single();

      return new Response(JSON.stringify({
        duel_id: newDuel?.id,
        song_title: song,
        status: "waiting",
        message: "Esperando oponente...",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "submit_score") {
      if (!duel_id || score == null) return new Response(JSON.stringify({ error: "duel_id and score required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data: duel } = await supabase.from("duels").select("*").eq("id", duel_id).single();
      if (!duel) return new Response(JSON.stringify({ error: "Duel not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const isChallenger = duel.challenger_id === user_id;
      const update: any = isChallenger ? { challenger_score: score } : { opponent_score: score };

      // Check if other player already scored
      const otherScore = isChallenger ? duel.opponent_score : duel.challenger_score;
      if (otherScore != null && otherScore > 0) {
        // Both scored — determine winner
        const winnerId = score > otherScore ? user_id : (score < otherScore ? (isChallenger ? duel.opponent_id : duel.challenger_id) : null);
        update.status = "completed";
        update.winner_id = winnerId;
      }

      await supabase.from("duels").update(update).eq("id", duel_id);

      // Award XP
      const xpEarned = update.status === "completed" && update.winner_id === user_id ? 50 : 15;
      const { data: progress } = await supabase.from("user_progress").select("xp").eq("user_id", user_id).single();
      if (progress) {
        const newXp = (progress.xp || 0) + xpEarned;
        await supabase.from("user_progress").update({ xp: newXp, level: Math.floor(newXp / 100) + 1 }).eq("user_id", user_id);
      }

      return new Response(JSON.stringify({
        duel_id,
        your_score: score,
        opponent_score: otherScore,
        status: update.status || "waiting_opponent",
        winner_id: update.winner_id || null,
        xp_earned: xpEarned,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
