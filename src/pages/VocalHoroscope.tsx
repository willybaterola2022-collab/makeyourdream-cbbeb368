import { useEffect, useState, useMemo } from "react";
import { motion } from "framer-motion";
import { Sparkles, Share2 } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";

const MESSAGES: Record<string, string[]> = {
  soprano: ["Tu voz está brillante hoy. Ideal para pop y musical.", "Las notas altas te esperan. Intenta un riff ascendente."],
  mezzo: ["Tu rango medio es tu superpoder. Perfecto para soul.", "Hoy es día de baladas. Tu vibrato será mágico."],
  contralto: ["Tu profundidad vocal es rara y hermosa.", "Explora el jazz hoy. Tu timbre lo agradecerá."],
  tenor: ["Energía alta detectada. Rock o R&B son tu match.", "Tu voz tiene brillo natural. Aprovéchalo con escalas."],
  baritone: ["Tu voz cálida es perfecta para baladas íntimas.", "Día ideal para explorar tu registro medio-grave."],
  bass: ["Tu gravedad es tu firma. Experimenta con armónicos.", "Las frecuencias bajas son tu reino. Domínalas hoy."],
};

const VocalHoroscope = () => {
  const { user } = useAuth();
  const [classification, setClassification] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    trackEvent(user?.id, "page_view", { page: "vocal-horoscope" });
    if (!user?.id) { setLoading(false); return; }
    supabase.functions.invoke("vocal-fingerprint", { body: { action: "get_latest", user_id: user.id } })
      .then(({ data }) => { setClassification(data?.fingerprint?.classification || null); setLoading(false); })
      .catch(() => setLoading(false));
  }, [user?.id]);

  const message = useMemo(() => {
    const msgs = MESSAGES[classification || "mezzo"] || MESSAGES.mezzo;
    const dayIdx = new Date().getDate() % msgs.length;
    return msgs[dayIdx];
  }, [classification]);

  return (
    <StudioRoom roomId="emotion" heroContent={<div className="text-center"><Sparkles className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Horóscopo Vocal</h1></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        {loading ? (
          <div className="flex justify-center py-12"><div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" /></div>
        ) : (
          <motion.div initial={{ opacity: 0, y: 30 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl text-center space-y-6">
            <p className="text-6xl">✨</p>
            <p className="text-sm text-primary uppercase tracking-widest">{new Date().toLocaleDateString("es", { weekday: "long", day: "numeric", month: "long" })}</p>
            <p className="text-lg leading-relaxed">{message}</p>
            {classification && <p className="text-xs text-muted-foreground capitalize">Tu tipo vocal: {classification}</p>}
            <StageButton variant="glass"><Share2 className="w-4 h-4 mr-2" /> Compartir</StageButton>
          </motion.div>
        )}
      </div>
    </StudioRoom>
  );
};

export default VocalHoroscope;
