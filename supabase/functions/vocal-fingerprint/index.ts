import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

const ARTIST_MAP: Record<string, string[]> = {
  soprano: ["Ariana Grande", "Mariah Carey", "Whitney Houston"],
  mezzo: ["Adele", "Lady Gaga", "Beyoncé"],
  contralto: ["Amy Winehouse", "Nina Simone", "Tina Turner"],
  tenor: ["Freddie Mercury", "Bruno Mars", "The Weeknd"],
  baritone: ["Frank Sinatra", "Elvis Presley", "Michael Bublé"],
  bass: ["Barry White", "Johnny Cash", "Leonard Cohen"],
};

function classify(rangeLow: number, rangeHigh: number): string {
  const mid = (rangeLow + rangeHigh) / 2;
  if (mid >= 260) return "soprano";
  if (mid >= 196) return "mezzo";
  if (mid >= 165) return "contralto";
  if (mid >= 131) return "tenor";
  if (mid >= 98) return "baritone";
  return "bass";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action, user_id, dimensions, vocal_range_low, vocal_range_high, recording_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get_latest") {
      const { data } = await supabase
        .from("vocal_fingerprints")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      return new Response(JSON.stringify({ fingerprint: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Default action: save
    const low = vocal_range_low || 130;
    const high = vocal_range_high || 520;
    const classification = classify(low, high);
    const artists = ARTIST_MAP[classification] || ["Artista Desconocido"];
    const globalScore = dimensions
      ? Math.round(dimensions.reduce((a: number, d: { value: number }) => a + d.value, 0) / dimensions.length)
      : 0;

    const { data: fp } = await supabase.from("vocal_fingerprints").insert({
      user_id,
      dimensions: dimensions || [],
      vocal_range_low: low,
      vocal_range_high: high,
      classification,
      similar_artists: artists,
      global_score: globalScore,
      recording_id: recording_id || null,
    }).select().single();

    await supabase.from("analytics_events").insert({
      user_id,
      event_type: "fingerprint_created",
      metadata: { classification, global_score: globalScore },
    });

    return new Response(JSON.stringify({
      fingerprint: fp,
      classification,
      similar_artists: artists,
      global_score: globalScore,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
