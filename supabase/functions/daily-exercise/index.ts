import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const EXERCISES = {
  beginner: [
    { name: "Lip Trill Básico", duration: 3, description: "Relaja los labios y emite un zumbido subiendo y bajando", demo_notes: [60, 62, 64, 65, 67, 65, 64, 62, 60] },
    { name: "Sirena Suave", duration: 3, description: "Desliza tu voz de grave a agudo suavemente", demo_notes: [48, 52, 55, 60, 64, 67, 72] },
    { name: "Respiración Diafragmática", duration: 5, description: "Inhala 4 tiempos, sostén 4, exhala 8", demo_notes: [] },
    { name: "Escala Mayor Ascendente", duration: 4, description: "Do-Re-Mi-Fa-Sol-La-Si-Do despacio y afinado", demo_notes: [60, 62, 64, 65, 67, 69, 71, 72] },
  ],
  intermediate: [
    { name: "Escala Cromática", duration: 5, description: "Sube nota por nota en semitonos — trabaja afinación fina", demo_notes: [60, 61, 62, 63, 64, 65, 66, 67, 68, 69, 70, 71, 72] },
    { name: "Arpegio con Dinámica", duration: 5, description: "Canta Do-Mi-Sol-Do variando piano a forte", demo_notes: [60, 64, 67, 72, 67, 64, 60] },
    { name: "Staccato Rítmico", duration: 4, description: "Notas cortas y precisas con metrónomo a 100 BPM", demo_notes: [60, 60, 64, 64, 67, 67, 72, 72] },
    { name: "Vibrato Controlado", duration: 5, description: "Sostén una nota y agrega vibrato gradualmente", demo_notes: [67, 67, 67, 67] },
  ],
  advanced: [
    { name: "Melisma en Pentatónica", duration: 5, description: "Corre por la escala pentatónica con fluidez y velocidad", demo_notes: [60, 62, 64, 67, 69, 72, 69, 67, 64, 62, 60] },
    { name: "Intervalos de 7ma", duration: 5, description: "Saltos grandes para expandir control y rango", demo_notes: [60, 71, 62, 72, 64, 74, 65, 76] },
    { name: "Riff R&B Complejo", duration: 6, description: "Combina runs, slides y ornamentación", demo_notes: [60, 62, 64, 65, 64, 62, 64, 67, 72] },
    { name: "Belt con Mezcla", duration: 5, description: "Transición suave de voz de pecho a voz mixta", demo_notes: [60, 64, 67, 72, 76] },
  ],
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action, user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: progress } = await supabase.from("user_progress").select("level").eq("user_id", user_id).single();
    const level = progress?.level || 1;
    const tier = level <= 3 ? "beginner" : level <= 7 ? "intermediate" : "advanced";
    const pool = EXERCISES[tier];

    // Pick based on day of year for consistency
    const dayOfYear = Math.floor((Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / 86400000);
    const exercise = pool[dayOfYear % pool.length];

    return new Response(JSON.stringify({
      exercise,
      tier,
      level,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
