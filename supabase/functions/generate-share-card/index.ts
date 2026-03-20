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
    const { user_id, fingerprint_id } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get fingerprint data
    let fingerprint;
    if (fingerprint_id) {
      const { data } = await supabase.from("vocal_fingerprints").select("*").eq("id", fingerprint_id).single();
      fingerprint = data;
    } else {
      const { data } = await supabase.from("vocal_fingerprints").select("*").eq("user_id", user_id).order("created_at", { ascending: false }).limit(1).single();
      fingerprint = data;
    }

    if (!fingerprint) {
      return new Response(JSON.stringify({ error: "No fingerprint found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get profile
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("user_id", user_id).single();

    // Build share card data
    const cardData = {
      userName: profile?.display_name || "Cantante",
      dimensions: fingerprint.dimensions || {},
      globalScore: fingerprint.global_score || 0,
      classification: fingerprint.classification || "Voz Única",
      similarArtists: fingerprint.similar_artists || [],
      vocalRange: {
        low: fingerprint.vocal_range_low,
        high: fingerprint.vocal_range_high,
      },
      generatedAt: new Date().toISOString(),
    };

    // Save share card record
    const { data: card } = await supabase.from("share_cards").insert({
      user_id,
      fingerprint_id: fingerprint.id,
      card_type: "fingerprint",
      card_data: cardData,
    }).select().single();

    return new Response(JSON.stringify({
      card_id: card?.id,
      card_data: cardData,
      share_text: `🎤 Mi voz es ${fingerprint.similar_artists?.[0] ? `similar a ${fingerprint.similar_artists[0]}` : "única"} — Score: ${fingerprint.global_score}/100 | MakeYourDream`,
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
