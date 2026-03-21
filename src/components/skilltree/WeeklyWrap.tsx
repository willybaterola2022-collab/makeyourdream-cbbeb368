import { motion } from "framer-motion";

interface WeeklyWrapProps {
  minutesSung: number;
  pitchImprovement: number;
  sessionsCompleted: number;
  topModule: string;
  onClose: () => void;
}

export function WeeklyWrap({ minutesSung, pitchImprovement, sessionsCompleted, topModule, onClose }: WeeklyWrapProps) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.95 }}
      className="p-5 rounded-2xl border border-white/10 relative overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1E1E2E, #0A0A0F)" }}
    >
      <button onClick={onClose} className="absolute top-3 right-3 text-white/30 text-xs hover:text-white/60">✕</button>

      <p className="text-[10px] font-bold text-[#FF3CAC] uppercase tracking-widest mb-1">📊 Tu Semana Vocal</p>
      <h3 className="text-lg font-bold text-white mb-4" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
        Weekly Wrapped
      </h3>

      <div className="grid grid-cols-2 gap-3">
        {[
          { label: "Minutos cantados", value: `${minutesSung}`, icon: "🎤" },
          { label: "Mejora pitch", value: `+${pitchImprovement}%`, icon: "📈" },
          { label: "Sesiones", value: `${sessionsCompleted}`, icon: "🎯" },
          { label: "Top módulo", value: topModule, icon: "⭐" },
        ].map((stat) => (
          <div key={stat.label} className="px-3 py-2.5 rounded-xl bg-white/5 border border-white/[0.06]">
            <span className="text-base">{stat.icon}</span>
            <p className="text-sm font-bold text-white mt-1" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {stat.value}
            </p>
            <p className="text-[9px] text-[#A0A0B0] uppercase tracking-wider">{stat.label}</p>
          </div>
        ))}
      </div>
    </motion.div>
  );
}
