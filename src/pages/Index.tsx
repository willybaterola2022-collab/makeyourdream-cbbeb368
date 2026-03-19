import { Mic, Flame, Star, Play, ChevronRight, Zap } from "lucide-react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";

const recentLessons = [
  { title: "Técnica de Belting", category: "Vocal Power", progress: 75, img: "🎤" },
  { title: "Vibrato Control", category: "Finesse", progress: 45, img: "🎵" },
  { title: "Breath Support", category: "Fundamentos", progress: 90, img: "💨" },
  { title: "Falsetto Master", category: "Range", progress: 30, img: "✨" },
  { title: "Rhythm & Timing", category: "Musicality", progress: 60, img: "🎶" },
];

const ExpandingRing = ({ delay, size }: { delay: number; size: string }) => (
  <motion.div
    className="absolute rounded-full border border-primary/20"
    style={{ width: size, height: size }}
    animate={{ scale: [1, 1.8, 2.2], opacity: [0.4, 0.1, 0] }}
    transition={{ duration: 3, repeat: Infinity, delay, ease: "easeOut" }}
  />
);

const MiniEqualizer = () => (
  <div className="absolute inset-0 flex items-center justify-center gap-[3px] opacity-20 pointer-events-none">
    {Array.from({ length: 12 }).map((_, i) => {
      const center = 6;
      const dist = Math.abs(i - center) / center;
      const maxH = 80 - dist * 50;
      return (
        <motion.div
          key={i}
          className="w-[3px] md:w-1 rounded-full bg-primary"
          animate={{ height: [`${maxH * 0.2}px`, `${maxH}px`, `${maxH * 0.4}px`] }}
          transition={{ duration: 1.2 + Math.random(), repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: i * 0.08 }}
        />
      );
    })}
  </div>
);

const Index = () => {
  const navigate = useNavigate();

  return (
    <StaggerContainer className="p-4 md:p-8 space-y-5 flex flex-col items-center">
      {/* ─── Live Badge ─── */}
      <StaggerItem className="flex justify-center pt-2">
        <motion.div
          className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full border border-primary/30 bg-primary/10"
          animate={{ opacity: [0.7, 1, 0.7] }}
          transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
        >
          <span className="relative flex h-2 w-2">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-primary opacity-75" />
            <span className="relative inline-flex rounded-full h-2 w-2 bg-primary" />
          </span>
          <span className="text-[13px] font-medium text-primary">847 artistas cantando ahora</span>
        </motion.div>
      </StaggerItem>

      {/* ─── Headline ─── */}
      <StaggerItem className="text-center space-y-2">
        <h1 className="font-serif text-4xl md:text-6xl font-bold uppercase tracking-wider neon-text leading-tight">
          Tu voz.<br />Tu momento.
        </h1>
        <p className="text-sm md:text-base text-muted-foreground max-w-xs mx-auto">
          Entrena, graba y descubre lo que tu voz puede hacer — con feedback real, no palmaditas.
        </p>
      </StaggerItem>

      {/* ─── Giant Mic Button ─── */}
      <StaggerItem className="flex items-center justify-center py-4 md:py-8">
        <div className="relative flex items-center justify-center">
          <ExpandingRing delay={0} size="200px" />
          <ExpandingRing delay={1} size="200px" />
          <ExpandingRing delay={2} size="200px" />
          <div className="hidden md:block">
            <ExpandingRing delay={0.5} size="280px" />
            <ExpandingRing delay={1.5} size="280px" />
          </div>
          <div className="absolute w-[260px] h-[260px] md:w-[340px] md:h-[340px]">
            <MiniEqualizer />
          </div>
          <motion.button
            onClick={() => navigate("/karaoke")}
            className="relative z-10 h-[160px] w-[160px] md:h-[220px] md:w-[220px] rounded-full stage-gradient flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 40px -10px hsl(275 85% 60% / 0.4), 0 0 40px -10px hsl(185 90% 55% / 0.2)",
                "0 0 80px -10px hsl(275 85% 60% / 0.6), 0 0 60px -10px hsl(185 90% 55% / 0.4)",
                "0 0 40px -10px hsl(275 85% 60% / 0.4), 0 0 40px -10px hsl(185 90% 55% / 0.2)",
              ],
            }}
            transition={{ boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" } }}
          >
            <Mic className="h-16 w-16 md:h-20 md:w-20 text-primary-foreground" />
          </motion.button>
        </div>
      </StaggerItem>

      {/* ─── CTA Button ─── */}
      <StaggerItem className="w-full flex flex-col items-center gap-3 -mt-1">
        <motion.button
          onClick={() => navigate("/karaoke")}
          className="w-full max-w-xs stage-gradient text-primary-foreground text-lg font-bold uppercase tracking-widest py-4 rounded-xl flex items-center justify-center gap-3 cursor-pointer"
          whileHover={{ scale: 1.03 }}
          whileTap={{ scale: 0.97 }}
          animate={{
            boxShadow: [
              "0 0 20px -5px hsl(275 85% 60% / 0.3)",
              "0 0 40px -5px hsl(275 85% 60% / 0.5)",
              "0 0 20px -5px hsl(275 85% 60% / 0.3)",
            ],
          }}
          transition={{ boxShadow: { duration: 2, repeat: Infinity, ease: "easeInOut" } }}
        >
          <Mic className="h-5 w-5" />
          Empezar a cantar gratis
        </motion.button>
        <p className="text-sm text-muted-foreground italic text-center">
          Canta. Escúchate. Mejora. Repite.
        </p>
      </StaggerItem>

      {/* ─── Mini Stats ─── */}
      <StaggerItem className="w-full max-w-md">
        <div className="flex items-center justify-center gap-5 text-sm">
          {[
            { icon: Flame, value: "12 días", label: "seguidos", accent: true },
            { icon: Star, value: "847", label: "puntos", accent: false },
            { icon: Play, value: "2/3", label: "sesiones", accent: false },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <s.icon className={`h-4 w-4 ${s.accent ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`font-semibold ${s.accent ? "neon-text" : "text-foreground"}`}>{s.value}</span>
              <span className="text-muted-foreground text-sm">{s.label}</span>
            </div>
          ))}
        </div>
      </StaggerItem>

      {/* ─── Tu Próximo Hit ─── */}
      <StaggerItem className="w-full max-w-lg">
        <div
          onClick={() => navigate("/karaoke")}
          className="glass-card-hover p-4 flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-11 w-11 rounded-lg stage-gradient flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[11px] text-primary uppercase tracking-widest font-bold">Tu próximo hit</p>
            <h3 className="font-serif text-base text-foreground font-semibold truncate">
              Karaoke — Bésame Mucho
            </h3>
            <p className="text-xs text-muted-foreground">Continúa donde lo dejaste</p>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </StaggerItem>

      {/* ─── Sube de Nivel ─── */}
      <StaggerItem className="w-full">
        <div className="flex items-center gap-2 mb-1">
          <span className="inline-flex items-center gap-1 text-xs font-medium text-secondary">
            <Zap className="h-3.5 w-3.5" /> Recomendado para ti
          </span>
        </div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg font-bold text-foreground uppercase tracking-wide">Sube de nivel</h2>
          <button className="text-xs text-primary font-semibold hover:underline">Ver todo</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {recentLessons.map((lesson) => (
            <div
              key={lesson.title}
              className="glass-card-hover min-w-[170px] md:min-w-[200px] p-3 snap-start cursor-pointer"
            >
              <div className="text-2xl mb-2">{lesson.img}</div>
              <p className="text-[9px] text-secondary uppercase tracking-widest">{lesson.category}</p>
              <h4 className="font-serif text-sm font-semibold text-foreground mt-0.5">{lesson.title}</h4>
              <div className="mt-2">
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full stage-gradient" style={{ width: `${lesson.progress}%` }} />
                </div>
                <p className="text-[9px] text-muted-foreground mt-1">{lesson.progress}%</p>
              </div>
            </div>
          ))}
        </div>
      </StaggerItem>
    </StaggerContainer>
  );
};

export default Index;
