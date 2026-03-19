import { motion } from "framer-motion";
import { CheckCircle2, Circle, Play, Flame, Target, TrendingUp, Award } from "lucide-react";
import { StudioRoom } from "@/components/studio/StudioRoom";

const weekDays = [
  { day: "L", done: true }, { day: "M", done: true }, { day: "X", done: true },
  { day: "J", done: false, today: true }, { day: "V", done: false }, { day: "S", done: false }, { day: "D", done: false },
];

const exercises = [
  { name: "Warm-up: Lip Trills", duration: "3 min", status: "done", emoji: "💋" },
  { name: "Escala Cromática", duration: "5 min", status: "active", emoji: "🎵" },
  { name: "Notas Largas", duration: "4 min", status: "pending", emoji: "🎶" },
];

const Exercises = () => {
  return (
    <StudioRoom
      roomId="exercises"
      heroContent={
        <motion.div className="flex flex-col items-center z-10"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          {/* Streak flame hero */}
          <motion.div
            className="text-8xl md:text-[140px]"
            animate={{ scale: [1, 1.08, 1], y: [-3, 3, -3] }}
            transition={{ duration: 2, repeat: Infinity }}
          >
            🔥
          </motion.div>
          <motion.p
            className="mt-4 text-3xl md:text-4xl font-bold"
            style={{ color: "hsl(15 80% 55%)" }}
          >
            3 DÍAS
          </motion.p>
          <motion.p
            className="text-lg font-bold uppercase tracking-[0.25em]"
            style={{ color: "hsl(15 80% 55%)" }}
            animate={{ opacity: [0.5, 1, 0.5] }}
            transition={{ duration: 1.5, repeat: Infinity }}
          >
            ⚡ NO PARES ⚡
          </motion.p>
        </motion.div>
      }
    >
      {/* Week calendar */}
      <div className="glass-card p-4 rounded-2xl">
        <div className="flex justify-between">
          {weekDays.map((d) => (
            <div key={d.day} className="flex flex-col items-center gap-2">
              <span className="text-[10px] text-muted-foreground uppercase">{d.day}</span>
              <motion.div
                whileTap={{ scale: 0.9 }}
                className={`h-11 w-11 rounded-full flex items-center justify-center ${
                  d.done ? "stage-gradient text-primary-foreground" :
                  d.today ? "border-2 border-primary text-primary" : "bg-muted text-muted-foreground"
                }`}
              >
                {d.done ? <CheckCircle2 className="h-5 w-5" /> : <Circle className="h-5 w-5" />}
              </motion.div>
            </div>
          ))}
        </div>
      </div>

      {/* Today's routine */}
      <div className="space-y-2">
        {exercises.map((ex, i) => (
          <motion.div key={ex.name}
            initial={{ opacity: 0, x: -10 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}
            className={`glass-card p-4 flex items-center gap-4 ${
              ex.status === "active" ? "border-orange-500/30 shadow-[0_0_20px_-8px_hsl(15_80%_55%/0.3)]" : ""
            }`}>
            <span className="text-2xl">{ex.emoji}</span>
            <div className="flex-1 min-w-0">
              <p className={`text-sm font-bold ${ex.status === "done" ? "text-muted-foreground line-through" : "text-foreground"}`}>{ex.name}</p>
              <p className="text-xs text-muted-foreground">{ex.duration}</p>
            </div>
            {ex.status === "active" && (
              <motion.button whileTap={{ scale: 0.93 }}
                className="h-10 w-10 rounded-full stage-gradient flex items-center justify-center text-primary-foreground shadow-[0_0_15px_hsl(var(--primary)/0.3)]"
                animate={{ scale: [1, 1.1, 1] }} transition={{ duration: 1.5, repeat: Infinity }}>
                <Play className="h-4 w-4 ml-0.5" />
              </motion.button>
            )}
            {ex.status === "done" && <CheckCircle2 className="h-5 w-5 text-emerald-400" />}
          </motion.div>
        ))}
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 gap-3">
        {[
          { value: "5", label: "Sesiones", emoji: "🎯" },
          { value: "+14%", label: "Mejora", emoji: "📈" },
          { value: "21d", label: "Racha max", emoji: "🔥" },
          { value: "Gold", label: "Próximo badge", emoji: "🏅" },
        ].map((m) => (
          <div key={m.label} className="glass-card p-4 text-center">
            <span className="text-2xl">{m.emoji}</span>
            <p className="text-xl font-bold text-foreground mt-1">{m.value}</p>
            <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{m.label}</p>
          </div>
        ))}
      </div>
    </StudioRoom>
  );
};

export default Exercises;
