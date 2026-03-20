import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const CHALLENGE_TEMPLATES = [
  { title: "Canta una canción completa", description: "Elige tu favorita y cántala de principio a fin", challenge_type: "sing", reward_xp: 50 },
  { title: "Afina 10 notas seguidas", description: "Mantén cada nota dentro del rango verde", challenge_type: "pitch", reward_xp: 40 },
  { title: "Haz un warm-up de 5 minutos", description: "Completa un calentamiento vocal completo", challenge_type: "warmup", reward_xp: 30 },
  { title: "Graba con vibrato", description: "Sostén 3 notas con vibrato controlado", challenge_type: "technique", reward_xp: 45 },
  { title: "Improvisa 60 segundos", description: "Canta freestyle sin parar por un minuto", challenge_type: "expression", reward_xp: 50 },
  { title: "Canta en un estilo nuevo", description: "Prueba un género que nunca hayas cantado", challenge_type: "create", reward_xp: 55 },
  { title: "Practica una escala 3 veces", description: "Repite la escala mayor completa 3 veces seguidas", challenge_type: "technique", reward_xp: 35 },
];

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action, user_id } = await req.json();

    const today = new Date().toISOString().split("T")[0];

    if (action === "get_today") {
      // Find today's challenge
      let { data: challenge } = await supabase
        .from("daily_challenges")
        .select("*")
        .eq("active_date", today)
        .limit(1)
        .single();

      // Auto-generate if none exists
      if (!challenge) {
        const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
        const template = CHALLENGE_TEMPLATES[dayOfYear % CHALLENGE_TEMPLATES.length];
        const { data: created } = await supabase.from("daily_challenges").insert({
          ...template,
          active_date: today,
        }).select().single();
        challenge = created;
      }

      // Check if user completed it
      let completed = false;
      if (user_id && challenge) {
        const { data: completion } = await supabase
          .from("challenge_completions")
          .select("id")
          .eq("user_id", user_id)
          .eq("challenge_id", challenge.id)
          .limit(1)
          .single();
        completed = !!completion;
      }

      return new Response(JSON.stringify({
        challenge,
        completed,
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "complete") {
      if (!user_id) {
        return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }

      const { challenge_id, score } = await req.json();
      const { data } = await supabase.from("challenge_completions").insert({
        user_id,
        challenge_id,
        score: score || 0,
      }).select().single();

      // Award XP
      const { data: ch } = await supabase.from("daily_challenges").select("reward_xp").eq("id", challenge_id).single();
      if (ch) {
        const { data: progress } = await supabase.from("user_progress").select("xp").eq("user_id", user_id).single();
        if (progress) {
          const newXp = (progress.xp || 0) + ch.reward_xp;
          await supabase.from("user_progress").update({ xp: newXp, level: Math.floor(newXp / 100) + 1 }).eq("user_id", user_id);
        }
      }

      return new Response(JSON.stringify({ completion: data, xp_earned: ch?.reward_xp || 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
