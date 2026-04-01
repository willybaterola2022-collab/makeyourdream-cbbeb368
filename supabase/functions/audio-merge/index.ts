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
    const { action, recording_a_id, recording_b_id, user_id } = await req.json();

    if (action === "merge") {
      if (!recording_a_id || !recording_b_id || !user_id) {
        return new Response(JSON.stringify({ error: "recording_a_id, recording_b_id, user_id required" }), {
          status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // Get both recordings
      const [recA, recB] = await Promise.all([
        supabase.from("recordings").select("file_url, file_path, title").eq("id", recording_a_id).single(),
        supabase.from("recordings").select("file_url, file_path, title").eq("id", recording_b_id).single(),
      ]);

      if (!recA.data || !recB.data) {
        return new Response(JSON.stringify({ error: "One or both recordings not found" }), {
          status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" },
        });
      }

      // For now, create a duet reference record (real audio merging requires ffmpeg/server-side processing)
      // Store as a new recording referencing both originals
      const duetTitle = `Duet: ${recA.data.title || "Track A"} + ${recB.data.title || "Track B"}`;
      const { data: duet, error } = await supabase
        .from("recordings")
        .insert({
          user_id,
          module: "duet",
          title: duetTitle,
          file_path: `duets/${recording_a_id}_${recording_b_id}`,
          file_url: recA.data.file_url, // placeholder - real merge would create new file
          metadata: {
            type: "duet",
            recording_a_id,
            recording_b_id,
            recording_a_url: recA.data.file_url,
            recording_b_url: recB.data.file_url,
          },
        })
        .select()
        .single();

      if (error) throw error;

      await supabase.from("analytics_events").insert({
        user_id,
        event_type: "duet_created",
        metadata: { recording_a_id, recording_b_id, duet_id: duet?.id },
      });

      return new Response(JSON.stringify({ duet, message: "Duet reference created. Audio files available for client-side mixing." }), {
        headers: { ...corsHeaders, "Content-Type": "application/json" },
      });
    }

    if (action === "list_duets") {
      if (!user_id) return new Response(JSON.stringify({ error: "user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });

      const { data } = await supabase
        .from("recordings")
        .select("*")
        .eq("user_id", user_id)
        .eq("module", "duet")
        .order("created_at", { ascending: false });

      return new Response(JSON.stringify({ duets: data || [] }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    return new Response(JSON.stringify({ error: "Invalid action. Use: merge, list_duets" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
