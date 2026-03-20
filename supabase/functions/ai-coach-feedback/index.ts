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
    const { user_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const { data: sessions } = await supabase
      .from("training_sessions")
      .select("*")
      .eq("user_id", user_id)
      .order("created_at", { ascending: false })
      .limit(20);

    if (!sessions || sessions.length === 0) {
      return new Response(JSON.stringify({
        metrics: [
          { label: "Afinación", value: 0, delta: 0 },
          { label: "Timing", value: 0, delta: 0 },
          { label: "Expresión", value: 0, delta: 0 },
        ],
        observations: ["Aún no tienes sesiones. ¡Empieza a cantar para recibir feedback!"],
        recommended_exercise: { name: "Lip Trill con Escala Mayor", duration: 5, description: "Calentamiento básico para empezar tu entrenamiento vocal" },
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    const now = new Date();
    const weekAgo = new Date(now.getTime() - 7 * 86400000);
    const twoWeeksAgo = new Date(now.getTime() - 14 * 86400000);
    const thisWeek = sessions.filter((s) => new Date(s.created_at) >= weekAgo);
    const lastWeek = sessions.filter((s) => new Date(s.created_at) >= twoWeeksAgo && new Date(s.created_at) < weekAgo);

    const avg = (arr: (number | null)[]) => {
      const v = arr.filter((x): x is number => x != null && x > 0);
      return v.length ? Math.round(v.reduce((a, b) => a + b, 0) / v.length) : 0;
    };

    const pT = avg(thisWeek.map((s) => s.pitch_score));
    const pL = avg(lastWeek.map((s) => s.pitch_score));
    const tT = avg(thisWeek.map((s) => s.timing_score));
    const tL = avg(lastWeek.map((s) => s.timing_score));
    const eT = avg(thisWeek.map((s) => s.expression_score));
    const eL = avg(lastWeek.map((s) => s.expression_score));

    const metrics = [
      { label: "Afinación", value: pT || avg(sessions.map((s) => s.pitch_score)), delta: pT - pL },
      { label: "Timing", value: tT || avg(sessions.map((s) => s.timing_score)), delta: tT - tL },
      { label: "Expresión", value: eT || avg(sessions.map((s) => s.expression_score)), delta: eT - eL },
    ];

    const observations: string[] = [];
    if (pT > pL && pL > 0) observations.push(`Tu afinación mejoró ${pT - pL}% esta semana — ¡sigue así!`);
    if (tT > tL && tL > 0) observations.push(`Tu timing subió ${tT - tL}% — el ritmo va mejor.`);
    if (eT < eL && eL > 0) observations.push("Tu expresividad bajó un poco — intenta variar la dinámica.");
    
    const lowest = [{ n: "afinación", v: pT }, { n: "timing", v: tT }, { n: "expresión", v: eT }].sort((a, b) => a.v - b.v)[0];
    if (lowest.v > 0) observations.push(`Tu punto más débil es ${lowest.n} (${lowest.v}%). Enfócate en eso.`);
    if (thisWeek.length >= 3) observations.push(`Llevas ${thisWeek.length} sesiones esta semana. ¡Gran constancia!`);
    if (observations.length === 0) observations.push("Sigue practicando para generar insights más precisos.");

    const exerciseMap: Record<string, { name: string; duration: number; description: string }> = {
      "afinación": { name: "Escala Cromática con Feedback", duration: 5, description: "Trabaja nota por nota para mejorar tu precisión tonal" },
      "timing": { name: "Ejercicio de Ritmo con Metrónomo", duration: 5, description: "Sincroniza tu voz con el pulso para mejorar timing" },
      "expresión": { name: "Lip Trill con Variación Dinámica", duration: 5, description: "Varía el volumen y la intensidad para ganar expresividad" },
    };

    return new Response(JSON.stringify({
      metrics,
      observations,
      recommended_exercise: exerciseMap[lowest.n] || exerciseMap["afinación"],
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
