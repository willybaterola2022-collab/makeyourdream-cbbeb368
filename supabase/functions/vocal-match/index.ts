import { serve } from "https://deno.land/std@0.168.0/http/server.ts";
import { createClient } from "https://esm.sh/@supabase/supabase-js@2";

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Headers": "authorization, x-client-info, apikey, content-type, x-supabase-client-platform, x-supabase-client-platform-version, x-supabase-client-runtime, x-supabase-client-runtime-version",
};

function calculateCompatibility(a: Record<string, number>, b: Record<string, number>): number {
  const keys = Object.keys(a);
  if (keys.length === 0) return 0;
  // Complementary voices score higher (different strengths)
  let complementScore = 0;
  for (const key of keys) {
    const diff = Math.abs((a[key] || 0) - (b[key] || 0));
    complementScore += diff > 30 ? 1 : diff > 15 ? 0.5 : 0.2;
  }
  return Math.round((complementScore / keys.length) * 100);
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    const supabase = createClient(Deno.env.get("SUPABASE_URL")!, Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!);
    const { action, user_id, limit: lim } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "find_matches") {
      // Get user's latest fingerprint
      const { data: myFp } = await supabase
        .from("vocal_fingerprints")
        .select("dimensions, vocal_range_low, vocal_range_high")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(1)
        .single();

      if (!myFp || !myFp.dimensions) {
        return new Response(JSON.stringify({ matches: [], message: "Complete your Vocal DNA test first" }), {
          headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get other users' fingerprints
      const { data: others } = await supabase
        .from("vocal_fingerprints")
        .select("user_id, dimensions, vocal_range_low, vocal_range_high")
        .neq("user_id", user_id)
        .not("dimensions", "is", null)
        .order("created_at", { ascending: false });

      // Deduplicate by user_id (keep latest)
      const seen = new Set<string>();
      const unique = (others || []).filter(o => {
        if (seen.has(o.user_id)) return false;
        seen.add(o.user_id);
        return true;
      });

      // Calculate compatibility
      const myDims = (myFp.dimensions as Record<string, number>) || {};
      const matches = unique
        .map(o => ({
          user_id: o.user_id,
          compatibility: calculateCompatibility(myDims, (o.dimensions as Record<string, number>) || {}),
          range: { low: o.vocal_range_low, high: o.vocal_range_high },
        }))
        .sort((a, b) => b.compatibility - a.compatibility)
        .slice(0, lim || 10);

      // Enrich with profiles
      const userIds = matches.map(m => m.user_id);
      const { data: profiles } = await supabase
        .from("profiles")
        .select("user_id, display_name, avatar_url")
        .in("user_id", userIds);

      const enriched = matches.map(m => ({
        ...m,
        profile: (profiles || []).find(p => p.user_id === m.user_id) || null,
      }));

      return new Response(JSON.stringify({ matches: enriched }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: find_matches" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
