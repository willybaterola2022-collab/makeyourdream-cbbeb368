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
    const { action } = await req.json();

    if (action === "check") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      // Find users with streak > 3 who didn't practice yesterday
      const { data: atRisk } = await supabase
        .from("user_progress")
        .select("user_id, streak_days, last_active_date")
        .gt("streak_days", 3)
        .lt("last_active_date", yesterdayStr);

      const notifications = (atRisk || []).map(u => ({
        user_id: u.user_id,
        type: "streak_warning",
        title: "Tu racha está en peligro",
        body: `Llevas ${u.streak_days} días seguidos. ¡No pierdas tu racha!`,
        metadata: { streak_days: u.streak_days },
      }));

      if (notifications.length > 0) {
        await supabase.from("notifications").insert(notifications);
      }

      return new Response(JSON.stringify({ success: true, at_risk_count: notifications.length }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "get_at_risk") {
      const yesterday = new Date();
      yesterday.setDate(yesterday.getDate() - 1);
      const yesterdayStr = yesterday.toISOString().split("T")[0];

      const { data } = await supabase
        .from("user_progress")
        .select("user_id, streak_days, last_active_date")
        .gt("streak_days", 3)
        .lt("last_active_date", yesterdayStr)
        .order("streak_days", { ascending: false });

      return new Response(JSON.stringify({ users: data || [] }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: check, get_at_risk" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
