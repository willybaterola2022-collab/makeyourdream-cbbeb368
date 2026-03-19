import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Mic, Headphones, Music, FlaskConical, Trophy, User } from "lucide-react";

const zones = [
  { icon: Mic, label: "Karaoke", path: "/karaoke", emoji: "🎤", color: "from-primary/20 to-primary/5" },
  { icon: Headphones, label: "Practicar", path: "/exercises", emoji: "🎧", color: "from-secondary/20 to-secondary/5" },
  { icon: Music, label: "Crear", path: "/song-sketch", emoji: "🎼", color: "from-primary/15 to-secondary/10" },
  { icon: FlaskConical, label: "Analizar", path: "/diagnostico", emoji: "🔬", color: "from-secondary/15 to-primary/5" },
  { icon: Trophy, label: "Competir", path: "/challenges", emoji: "🏆", color: "from-primary/20 to-primary/5" },
  { icon: User, label: "Mi Perfil", path: "/portfolio", emoji: "👤", color: "from-muted/30 to-muted/10" },
];

export function StudioGrid() {
  const navigate = useNavigate();

  return (
    <div className="grid grid-cols-3 gap-3 md:gap-4 max-w-md mx-auto">
      {zones.map((zone, i) => (
        <motion.button
          key={zone.label}
          onClick={() => navigate(zone.path)}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: i * 0.08, duration: 0.4 }}
          whileTap={{ scale: 0.93 }}
          whileHover={{ scale: 1.05 }}
          className={`glass-card p-4 md:p-5 flex flex-col items-center gap-2 md:gap-3 hover:border-primary/30 transition-all bg-gradient-to-b ${zone.color}`}
        >
          <span className="text-3xl md:text-4xl">{zone.emoji}</span>
          <span className="text-xs md:text-sm font-bold uppercase tracking-wider text-foreground">
            {zone.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}
