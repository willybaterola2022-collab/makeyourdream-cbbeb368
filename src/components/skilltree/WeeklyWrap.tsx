import { motion } from "framer-motion";
import { Share2 } from "lucide-react";
import { toast } from "sonner";

interface WeeklyWrapProps {
  minutesSung: number;
  pitchImprovement: number;
  sessionsCompleted: number;
  topModule: string;
  onClose: () => void;
}

export function WeeklyWrap({ minutesSung, pitchImprovement, sessionsCompleted, topModule, onClose }: WeeklyWrapProps) {
  const handleShare = async () => {
    const text = `🎤 Mi semana en MakeYourDream: ${sessionsCompleted} sesiones, ${minutesSung} min cantados, score promedio ${pitchImprovement}%`;
    if (navigator.share) {
      try { await navigator.share({ title: "Mi Semana Vocal", text }); } catch {}
    } else {
      await navigator.clipboard.writeText(text);
      toast.success("Copiado al portapapeles");
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9, y: 10 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.95, y: -10 }}
      className="p-5 rounded-2xl border border-border/40 bg-card relative overflow-hidden"
    >
      <motion.div
        className="absolute inset-0 pointer-events-none"
        style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.05), transparent)" }}
      />
      <button onClick={onClose} className="absolute top-3 right-3 text-muted-foreground text-xs hover:text-foreground transition-colors">
        <span className="sr-only">Cerrar</span>✕
      </button>

      <p className="text-[10px] font-bold text-primary uppercase tracking-widest mb-1">Tu Semana Vocal</p>
      <h3 className="text-lg font-bold text-foreground font-serif mb-4">Weekly Wrapped</h3>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Minutos cantados", value: `${minutesSung}`, icon: "🎤" },
          { label: "Score promedio", value: `${pitchImprovement}%`, icon: "📈" },
          { label: "Sesiones", value: `${sessionsCompleted}`, icon: "🎯" },
          { label: "Top módulo", value: topModule, icon: "⭐" },
        ].map((stat) => (
          <div key={stat.label} className="px-3 py-2.5 rounded-xl bg-muted/30 border border-border/40">
            <span className="text-base">{stat.icon}</span>
            <p className="text-sm font-bold text-foreground mt-1 font-mono">{stat.value}</p>
            <p className="text-[9px] text-muted-foreground uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>

      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={handleShare}
        className="mt-4 w-full py-2.5 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium flex items-center justify-center gap-2 transition-transform duration-200"
      >
        <Share2 className="h-4 w-4" /> Compartir resumen
      </motion.button>
    </motion.div>
  );
}
