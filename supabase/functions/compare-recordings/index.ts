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
    const { user_id, recording_a_id, recording_b_id } = await req.json();

    if (!user_id || !recording_a_id || !recording_b_id) {
      return new Response(JSON.stringify({ error: "user_id, recording_a_id, recording_b_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get sessions linked to these recordings
    const { data: sessionA } = await supabase.from("training_sessions").select("*").eq("recording_id", recording_a_id).order("created_at", { ascending: false }).limit(1).single();
    const { data: sessionB } = await supabase.from("training_sessions").select("*").eq("recording_id", recording_b_id).order("created_at", { ascending: false }).limit(1).single();

    const deltaPitch = (sessionB?.pitch_score || 0) - (sessionA?.pitch_score || 0);
    const deltaTiming = (sessionB?.timing_score || 0) - (sessionA?.timing_score || 0);
    const deltaExpression = (sessionB?.expression_score || 0) - (sessionA?.expression_score || 0);
    const deltaOverall = (sessionB?.overall_score || 0) - (sessionA?.overall_score || 0);

    const improvements: string[] = [];
    if (deltaPitch > 0) improvements.push(`afinación +${deltaPitch}%`);
    if (deltaTiming > 0) improvements.push(`timing +${deltaTiming}%`);
    if (deltaExpression > 0) improvements.push(`expresión +${deltaExpression}%`);

    const summary = improvements.length > 0
      ? `¡Mejoraste en ${improvements.join(", ")}! Tu progreso general es de ${deltaOverall > 0 ? "+" : ""}${deltaOverall}%.`
      : deltaOverall === 0
      ? "Tu nivel se mantiene estable. Sigue practicando para ver mejoras."
      : `Hubo una variación de ${deltaOverall}%. Enfócate en las áreas que bajaron.`;

    // Save comparison
    const { data: comparison } = await supabase.from("recording_comparisons").insert({
      user_id,
      recording_a_id,
      recording_b_id,
      delta_pitch: deltaPitch,
      delta_timing: deltaTiming,
      delta_expression: deltaExpression,
      delta_overall: deltaOverall,
      summary,
    }).select().single();

    return new Response(JSON.stringify({
      comparison_id: comparison?.id,
      delta_pitch: deltaPitch,
      delta_timing: deltaTiming,
      delta_expression: deltaExpression,
      delta_overall: deltaOverall,
      summary,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
