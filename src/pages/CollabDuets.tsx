import { useEffect } from "react";
import { motion } from "framer-motion";
import { Users, Mic, Music } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";

const CollabDuets = () => {
  const { user } = useAuth();
  useEffect(() => { trackEvent(user?.id, "page_view", { page: "duets" }); }, []);

  return (
    <StudioRoom roomId="collab" heroContent={<div className="text-center"><Users className="w-12 h-12 text-primary mx-auto" /><h1 className="text-xl font-display mt-2">Collab Duets</h1><p className="text-sm text-muted-foreground">Canta con otros artistas</p></div>}>
      <div className="max-w-lg mx-auto space-y-6 p-4">
        <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }} className="glass-card p-8 rounded-2xl text-center space-y-4">
          <Music className="w-16 h-16 mx-auto text-muted-foreground/30" />
          <h2 className="text-lg font-display">Próximamente</h2>
          <p className="text-sm text-muted-foreground">Graba tu parte sobre la grabación de otro artista y crea duetos increíbles.</p>
          <StageButton variant="glass" disabled>En desarrollo</StageButton>
        </motion.div>
      </div>
    </StudioRoom>
  );
};

export default CollabDuets;
