import { useEffect } from "react";
import { motion } from "framer-motion";
import { Heart, Mic } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";

const VocalMatches = () => {
  const { user } = useAuth();
  useEffect(() => { trackEvent(user?.id, "page_view", { page: "matches" }); }, []);

  return (
    <StudioRoom roomId="emotion" heroContent={<div className="text-center"><Heart className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Vocal Matches</h1><p className="text-sm text-muted-foreground">Encuentra voces complementarias</p></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl text-center space-y-4">
          <Mic className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <h2 className="text-lg font-display">Próximamente</h2>
          <p className="text-sm text-muted-foreground">Tinder de voces: encuentra cantantes con voces que complementan la tuya.</p>
          <StageButton variant="glass" disabled>En desarrollo</StageButton>
        </motion.div>
      </div>
    </StudioRoom>
  );
};

export default VocalMatches;
