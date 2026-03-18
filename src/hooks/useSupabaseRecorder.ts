import { useState, useCallback } from "react";
import { useRecorder } from "./useRecorder";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { toast } from "sonner";

interface UploadResult {
  fileUrl: string;
  filePath: string;
  recordingId: string;
}

export function useSupabaseRecorder(module: string) {
  const { user } = useAuth();
  const recorder = useRecorder();
  const [isUploading, setIsUploading] = useState(false);
  const [savedResult, setSavedResult] = useState<UploadResult | null>(null);
  const [needsAuth, setNeedsAuth] = useState(false);

  const saveRecording = useCallback(
    async (title?: string, metadata?: Record<string, any>) => {
      if (!recorder.audioBlob) {
        toast.error("No hay grabación para guardar");
        return null;
      }
      if (!user) {
        setNeedsAuth(true);
        return null;
      }

      setIsUploading(true);
      try {
        const ext = "webm";
        const fileName = `${Date.now()}.${ext}`;
        const filePath = `${user.id}/${module}/${fileName}`;

        // Upload to storage
        const { error: uploadError } = await supabase.storage
          .from("recordings")
          .upload(filePath, recorder.audioBlob, {
            contentType: "audio/webm",
            upsert: false,
          });

        if (uploadError) throw uploadError;

        const { data: urlData } = supabase.storage
          .from("recordings")
          .getPublicUrl(filePath);

        const fileUrl = urlData.publicUrl;

        // Save metadata to DB
        const { data: rec, error: dbError } = await supabase
          .from("recordings")
          .insert({
            user_id: user.id,
            module,
            title: title || `${module} - ${new Date().toLocaleDateString()}`,
            file_url: fileUrl,
            file_path: filePath,
            duration_seconds: recorder.duration,
            metadata: metadata || {},
          })
          .select("id")
          .single();

        if (dbError) throw dbError;

        const result: UploadResult = {
          fileUrl,
          filePath,
          recordingId: rec.id,
        };
        setSavedResult(result);
        toast.success("¡Grabación guardada en la nube! ☁️");
        return result;
      } catch (err: any) {
        console.error("Upload error:", err);
        toast.error("Error al guardar: " + (err.message || "desconocido"));
        return null;
      } finally {
        setIsUploading(false);
      }
    },
    [recorder.audioBlob, recorder.duration, user, module]
  );

  return {
    ...recorder,
    isUploading,
    savedResult,
    saveRecording,
  };
}
