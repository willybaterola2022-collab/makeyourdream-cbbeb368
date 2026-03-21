import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response(null, { headers: corsHeaders });

  try {
    const { action, user_id } = await req.json();
    const supabaseUrl = Deno.env.get("SUPABASE_URL")!;
    const serviceKey = Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!;
    const supabase = createClient(supabaseUrl, serviceKey);

    if (action === "analyze") {
      // Get user's vocal fingerprint
      const { data: fingerprint } = await supabase
        .from("vocal_fingerprints")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .maybeSingle();

      // Get training sessions aggregate
      const { data: sessions } = await supabase
        .from("training_sessions")
        .select("pitch_score, timing_score, expression_score, overall_score, module")
        .eq("user_id", user_id);

      // Calculate dimensions from real data
      const dims = calculateDimensions(fingerprint, sessions || []);
      const vocalDNA = Math.round(dims.reduce((s, d) => s + d.value, 0) / dims.length);

      // Check for talent alerts (any dimension > 85)
      const alerts: any[] = [];
      for (const dim of dims) {
        if (dim.value >= 85) {
          alerts.push({
            user_id,
            alert_type: "dimension_high",
            dimension: dim.label,
            score: dim.value,
            percentile: dim.percentile,
          });
        }
      }

      // Generate AI talent report if any high scores
      let aiReport = null;
      if (alerts.length > 0 || vocalDNA >= 75) {
        const LOVABLE_API_KEY = Deno.env.get("LOVABLE_API_KEY");
        if (LOVABLE_API_KEY) {
          const topDims = dims.sort((a, b) => b.value - a.value).slice(0, 3);
          const prompt = `Eres un scout de talento vocal profesional. Analiza estos datos de un cantante y genera un reporte breve (3-4 frases) en español:
- Vocal DNA Score: ${vocalDNA}/100
- Mejores dimensiones: ${topDims.map(d => `${d.label}: ${d.value}/100 (top ${d.percentile}%)`).join(", ")}
- Rango vocal: ${fingerprint?.vocal_range_low ? `${Math.round(fingerprint.vocal_range_low)}Hz - ${Math.round(fingerprint.vocal_range_high)}Hz` : "No medido"}
- Clasificación: ${fingerprint?.classification || "No clasificada"}
- Sesiones completadas: ${sessions?.length || 0}

Sé específico sobre su potencial y da una recomendación concreta de desarrollo.`;

          try {
            const aiResponse = await fetch("https://ai.gateway.lovable.dev/v1/chat/completions", {
              method: "POST",
              headers: { Authorization: `Bearer ${LOVABLE_API_KEY}`, "Content-Type": "application/json" },
              body: JSON.stringify({
                model: "google/gemini-3-flash-preview",
                messages: [{ role: "user", content: prompt }],
              }),
            });

            if (aiResponse.ok) {
              const aiData = await aiResponse.json();
              aiReport = aiData.choices?.[0]?.message?.content || null;
            }
          } catch (e) {
            console.error("AI report generation failed:", e);
          }
        }
      }

      // Insert talent alerts
      if (alerts.length > 0) {
        for (const alert of alerts) {
          alert.ai_report = aiReport;
          await supabase.from("talent_alerts").insert(alert);
        }
      }

      // Upsert demo reel talent score
      await supabase.from("demo_reels").upsert(
        { user_id, talent_score: vocalDNA, updated_at: new Date().toISOString() },
        { onConflict: "user_id" }
      );

      return new Response(JSON.stringify({ dimensions: dims, vocalDNA, alerts, aiReport }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_talent_feed") {
      // Get top talents with their profiles
      const { data: reels } = await supabase
        .from("demo_reels")
        .select("*")
        .order("talent_score", { ascending: false })
        .limit(50);

      if (!reels || reels.length === 0) {
        return new Response(JSON.stringify({ talents: [] }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get profiles for these users
      const userIds = reels.map(r => r.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url, vocal_level")
        .in("user_id", userIds);

      // Get fingerprints for dimensions
      const { data: fingerprints } = await supabase
        .from("vocal_fingerprints")
        .select("user_id, dimensions, classification, global_score")
        .in("user_id", userIds);

      const talents = reels.map(reel => {
        const profile = profiles?.find(p => p.user_id === reel.user_id);
        const fp = fingerprints?.find(f => f.user_id === reel.user_id);
        return {
          ...reel,
          display_name: profile?.display_name || "Anónimo",
          avatar_url: profile?.avatar_url,
          vocal_level: profile?.vocal_level,
          classification: fp?.classification,
          dimensions: fp?.dimensions,
        };
      });

      return new Response(JSON.stringify({ talents }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_my_alerts") {
      const { data: alerts } = await supabase
        .from("talent_alerts")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(10);

      return new Response(JSON.stringify({ alerts: alerts || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Unknown action" }), {
      status: 400,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  } catch (e) {
    console.error("talent-scout error:", e);
    return new Response(JSON.stringify({ error: e instanceof Error ? e.message : "Unknown error" }), {
      status: 500,
      headers: { ...corsHeaders, "Content-Type": "application/json" },
    });
  }
});

function calculateDimensions(fingerprint: any, sessions: any[]) {
  // Aggregate session scores
  const avgPitch = sessions.length > 0
    ? Math.round(sessions.reduce((s, t) => s + (t.pitch_score || 0), 0) / sessions.length)
    : 50;
  const avgTiming = sessions.length > 0
    ? Math.round(sessions.reduce((s, t) => s + (t.timing_score || 0), 0) / sessions.length)
    : 45;
  const avgExpression = sessions.length > 0
    ? Math.round(sessions.reduce((s, t) => s + (t.expression_score || 0), 0) / sessions.length)
    : 40;

  // Extract fingerprint dimensions
  const fpDims = fingerprint?.dimensions || {};
  const range = fingerprint?.vocal_range_high && fingerprint?.vocal_range_low
    ? Math.min(100, Math.round(((fingerprint.vocal_range_high - fingerprint.vocal_range_low) / 800) * 100))
    : 45;
  const power = fpDims.power || fpDims.potencia || 50;
  const control = fpDims.control || avgTiming;
  const creativity = fpDims.creativity || fpDims.creatividad || Math.min(100, sessions.length * 3 + 30);

  // Estimate percentiles (simplified — would be calculated from all users in production)
  const estimatePercentile = (score: number) => Math.max(1, Math.round(100 - score));

  return [
    { label: "Pitch", value: Math.min(100, avgPitch), percentile: estimatePercentile(avgPitch) },
    { label: "Rango", value: Math.min(100, range), percentile: estimatePercentile(range) },
    { label: "Potencia", value: Math.min(100, power), percentile: estimatePercentile(power) },
    { label: "Control", value: Math.min(100, control), percentile: estimatePercentile(control) },
    { label: "Expresión", value: Math.min(100, avgExpression), percentile: estimatePercentile(avgExpression) },
    { label: "Creatividad", value: Math.min(100, creativity), percentile: estimatePercentile(creativity) },
  ];
}
