import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EXERCISE_POOL = [
  { id: "breathing", name: "Respiración diafragmática", module: "breath-trainer", duration: 3, focus: "breath" },
  { id: "scales", name: "Escalas mayores", module: "pitch-training", duration: 5, focus: "pitch" },
  { id: "vibrato", name: "Control de vibrato", module: "vibrato-coach", duration: 5, focus: "expression" },
  { id: "range_low", name: "Explorar graves", module: "range-explorer", duration: 4, focus: "range" },
  { id: "range_high", name: "Explorar agudos", module: "range-explorer", duration: 4, focus: "range" },
  { id: "harmony", name: "Intervalos de tercera", module: "harmony-trainer", duration: 5, focus: "pitch" },
  { id: "tone_warm", name: "Tono cálido", module: "tone-lab", duration: 4, focus: "expression" },
  { id: "tone_power", name: "Tono potente", module: "tone-lab", duration: 4, focus: "expression" },
  { id: "timing", name: "Ritmo con metrónomo", module: "practice-room", duration: 5, focus: "timing" },
  { id: "warmup", name: "Calentamiento completo", module: "daily-flow", duration: 5, focus: "general" },
  { id: "karaoke_easy", name: "Cantar tema fácil", module: "karaoke", duration: 8, focus: "general" },
  { id: "karaoke_hard", name: "Desafío vocal", module: "karaoke", duration: 8, focus: "general" },
];

function generateWeekPlan(weaknesses: string[]): Record<string, typeof EXERCISE_POOL> {
  const days = ["lunes", "martes", "miércoles", "jueves", "viernes", "sábado", "domingo"];
  const plan: Record<string, typeof EXERCISE_POOL> = {};

  for (const day of days) {
    const dayExercises = [];
    // Always start with warmup
    dayExercises.push(EXERCISE_POOL.find(e => e.id === "warmup")!);
    // Add weakness-focused exercises
    const weakExercises = EXERCISE_POOL.filter(e => weaknesses.includes(e.focus) && e.id !== "warmup");
    dayExercises.push(...weakExercises.slice(0, 2));
    // Add a general exercise
    const general = EXERCISE_POOL.filter(e => e.focus === "general" && e.id !== "warmup");
    if (general.length > 0) dayExercises.push(general[Math.floor(Math.random() * general.length)]);
    plan[day] = dayExercises;
  }
  return plan;
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action, user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "generate") {
      // Get latest fingerprint to find weaknesses
      const { data: fp } = await supabase
        .from("vocal_fingerprints")
        .select("dimensions")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      // Determine weaknesses from dimensions
      const dims = (fp?.dimensions as Record<string, number>) || {};
      const weaknesses: string[] = [];
      if ((dims.pitch || 0) < 60) weaknesses.push("pitch");
      if ((dims.timing || 0) < 60) weaknesses.push("timing");
      if ((dims.expression || 0) < 60) weaknesses.push("expression");
      if ((dims.breath || 0) < 60) weaknesses.push("breath");
      if ((dims.range || 0) < 60) weaknesses.push("range");
      if (weaknesses.length === 0) weaknesses.push("general");

      const plan = generateWeekPlan(weaknesses);

      return new Response(JSON.stringify({ plan, weaknesses, exercise_pool: EXERCISE_POOL }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_exercises") {
      return new Response(JSON.stringify({ exercises: EXERCISE_POOL }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: generate, get_exercises" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
