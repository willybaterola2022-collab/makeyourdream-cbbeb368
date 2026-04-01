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
    const { action, user_id, recording_id, limit: lim, offset } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("recordings")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .range(offset || 0, (offset || 0) + (lim || 20) - 1);

      if (error) throw error;
      return new Response(JSON.stringify({ recordings: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "stats") {
      const { data: recordings } = await supabase
        .from("recordings")
        .select("id, duration_seconds, module, created_at")
        .eq("user_id", user_id);

      const total = recordings?.length || 0;
      const totalMinutes = (recordings || []).reduce((sum, r) => sum + (r.duration_seconds || 0), 0) / 60;
      const modules = [...new Set((recordings || []).map(r => r.module))];

      return new Response(JSON.stringify({ total, totalMinutes: Math.round(totalMinutes), modules }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "delete") {
      if (!recording_id) {
        return new Response(JSON.stringify({ error: "recording_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { error } = await supabase.from("recordings").delete().eq("id", recording_id).eq("user_id", user_id);
      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: list, stats, delete" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
