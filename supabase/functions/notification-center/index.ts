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
    const { action, user_id, notification_id, limit: lim } = await req.json();

    if (!user_id) {
      return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "list") {
      const { data, error } = await supabase
        .from("notifications")
        .select("*")
        .eq("user_id", user_id)
        .order("created_at", { ascending: false })
        .limit(lim || 50);

      if (error) throw error;
      return new Response(JSON.stringify({ notifications: data }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "count_unread") {
      const { count, error } = await supabase
        .from("notifications")
        .select("id", { count: "exact", head: true })
        .eq("user_id", user_id)
        .eq("read", false);

      if (error) throw error;
      return new Response(JSON.stringify({ unread: count || 0 }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "mark_read") {
      if (!notification_id) {
        return new Response(JSON.stringify({ error: "notification_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
      }
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("id", notification_id)
        .eq("user_id", user_id);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    if (action === "mark_all_read") {
      const { error } = await supabase
        .from("notifications")
        .update({ read: true })
        .eq("user_id", user_id)
        .eq("read", false);

      if (error) throw error;
      return new Response(JSON.stringify({ success: true }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: list, count_unread, mark_read, mark_all_read" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
