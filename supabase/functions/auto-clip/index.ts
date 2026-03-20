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
    const { recording_id, user_id } = await req.json();

    if (!recording_id || !user_id) {
      return new Response(JSON.stringify({ error: "recording_id and user_id required" }), { status: 400, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get recording metadata
    const { data: recording } = await supabase.from("recordings").select("*").eq("id", recording_id).eq("user_id", user_id).single();
    if (!recording) {
      return new Response(JSON.stringify({ error: "Recording not found" }), { status: 404, headers: { ...corsHeaders, "Content-Type": "application/json" } });
    }

    // Get training session for this recording
    const { data: session } = await supabase.from("training_sessions").select("*").eq("recording_id", recording_id).limit(1).single();

    // Get profile
    const { data: profile } = await supabase.from("profiles").select("display_name").eq("user_id", user_id).single();

    // Find best 15-second segment (mock: use middle of recording)
    const duration = recording.duration_seconds || 30;
    const clipStart = Math.max(0, Math.floor(duration / 2) - 7);
    const clipEnd = Math.min(duration, clipStart + 15);

    const clipMetadata = {
      recording_id,
      recording_url: recording.file_url,
      clip_start_seconds: clipStart,
      clip_end_seconds: clipEnd,
      clip_duration: clipEnd - clipStart,
      aspect_ratio: "9:16",
      title: recording.title || session?.song_title || "Mi Momento",
      artist_name: profile?.display_name || "Cantante",
      score: session?.overall_score || null,
      module: recording.module,
      watermark: "MakeYourDream",
      generated_at: new Date().toISOString(),
    };

    return new Response(JSON.stringify({
      clip: clipMetadata,
      instructions: "Use Canvas API + MediaRecorder on client to render 9:16 video with waveform overlay",
    }), { headers: { ...corsHeaders, "Content-Type": "application/json" } });

  } catch (err) {
    return new Response(JSON.stringify({ error: err.message }), { status: 500, headers: { ...corsHeaders, "Content-Type": "application/json" } });
  }
});
