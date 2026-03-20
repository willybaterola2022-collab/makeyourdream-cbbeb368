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
    const { action, user_id, event_type, metadata, weeks_back } = await req.json();

    if (action === "track") {
      if (!event_type) {
        return new Response(JSON.stringify({ error: "event_type required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      await supabase.from("analytics_events").insert({
        user_id: user_id || null,
        event_type,
        metadata: metadata || {},
      });
      return new Response(JSON.stringify({ ok: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "get_was") {
      const { data, error } = await supabase.rpc("calculate_was", { weeks_back: weeks_back || 0 });
      return new Response(JSON.stringify({ was: data || 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use track or get_was" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
