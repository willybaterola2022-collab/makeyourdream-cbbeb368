import { serve } from "https://deno.land/std@0.168.0/http/server.ts";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

// Key transposition map (semitones from C)
const KEY_MAP: Record<string, number> = {
  C: 0, "C#": 1, Db: 1, D: 2, "D#": 3, Eb: 3, E: 4, F: 5,
  "F#": 6, Gb: 6, G: 7, "G#": 8, Ab: 8, A: 9, "A#": 10, Bb: 10, B: 11,
};

const STYLE_PRESETS: Record<string, { description: string; tips: string[] }> = {
  pop: { description: "Proyección clara, dicción nítida, vibrato ligero", tips: ["Mantén la voz brillante y frontal", "Usa vibrato sutil al final de frases", "Pronunciación clara y rítmica"] },
  rock: { description: "Potencia, grit controlado, belt sostenido", tips: ["Empuja desde el diafragma", "Añade rasp/grit en los agudos", "Sostén las notas con energía"] },
  jazz: { description: "Improvisación, scatting, tono cálido", tips: ["Relaja la mandíbula para tono cálido", "Experimenta con scat syllables", "Juega con el timing (behind the beat)"] },
  rnb: { description: "Melismas, runs, falsete suave", tips: ["Practica runs en pentatónica", "Transiciones suaves pecho→falsete", "Vibrato amplio y lento"] },
  latin: { description: "Pasión, proyección, ornamentación", tips: ["Canta con el cuerpo completo", "Usa ornamentos melódicos", "Proyecta con pasión en los climax"] },
  classical: { description: "Legato, soporte completo, resonancia", tips: ["Máximo soporte diafragmático", "Busca resonancia en la máscara facial", "Legato conectado entre notas"] },
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const { action, style, original_key, target_key, lyrics } = await req.json();

    if (action === "get_style") {
      const preset = STYLE_PRESETS[style?.toLowerCase()] || STYLE_PRESETS.pop;
      return new Response(JSON.stringify({ style: style || "pop", ...preset }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "transpose") {
      if (!original_key || !target_key) {
        return new Response(JSON.stringify({ error: "original_key and target_key required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const origSemitone = KEY_MAP[original_key] ?? 0;
      const targetSemitone = KEY_MAP[target_key] ?? 0;
      let semitoneShift = targetSemitone - origSemitone;
      if (semitoneShift > 6) semitoneShift -= 12;
      if (semitoneShift < -6) semitoneShift += 12;

      return new Response(JSON.stringify({
        original_key,
        target_key,
        semitone_shift: semitoneShift,
        direction: semitoneShift > 0 ? "up" : semitoneShift < 0 ? "down" : "same",
        tip: semitoneShift > 3 ? "Subida grande — considera usar falsete en los agudos" :
             semitoneShift < -3 ? "Bajada grande — asegúrate de mantener proyección en los graves" :
             "Cambio moderado — debería ser cómodo",
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list_styles") {
      return new Response(JSON.stringify({
        styles: Object.entries(STYLE_PRESETS).map(([key, val]) => ({
          id: key,
          name: key.charAt(0).toUpperCase() + key.slice(1),
          description: val.description,
        })),
      }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use get_style, transpose, or list_styles" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
