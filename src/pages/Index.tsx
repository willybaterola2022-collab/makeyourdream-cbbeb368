import { Mic, Flame, Star, Play, ChevronRight } from "lucide-react";
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

/* ─── Expanding Ring ─── */
const ExpandingRing = ({ delay, size }: { delay: number; size: string }) => (
  <motion.div
    className="absolute rounded-full border border-primary/20"
    style={{ width: size, height: size }}
    animate={{
      scale: [1, 1.8, 2.2],
      opacity: [0.4, 0.1, 0],
    }}
    transition={{
      duration: 3,
      repeat: Infinity,
      delay,
      ease: "easeOut",
    }}
  />
);

/* ─── Mini Equalizer behind mic ─── */
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
          animate={{
            height: [`${maxH * 0.2}px`, `${maxH}px`, `${maxH * 0.4}px`],
          }}
          transition={{
            duration: 1.2 + Math.random(),
            repeat: Infinity,
            repeatType: "mirror",
            ease: "easeInOut",
            delay: i * 0.08,
          }}
        />
      );
    })}
  </div>
);

const Index = () => {
  const navigate = useNavigate();

  return (
    <StaggerContainer className="p-4 md:p-8 space-y-6 flex flex-col items-center">
      {/* ─── Stage Hero ─── */}
      <StaggerItem className="flex flex-col items-center text-center pt-4 md:pt-8">
        <p className="text-[11px] text-muted-foreground uppercase tracking-[0.3em] mb-2">
          Tu escenario
        </p>
        <h1 className="font-serif text-3xl md:text-5xl font-bold text-foreground">
          Buenas noches, <span className="gold-text">Artista</span>
        </h1>
      </StaggerItem>

      {/* ─── Giant Mic Button ─── */}
      <StaggerItem className="flex items-center justify-center py-6 md:py-10">
        <div className="relative flex items-center justify-center">
          {/* Expanding rings */}
          <ExpandingRing delay={0} size="200px" />
          <ExpandingRing delay={1} size="200px" />
          <ExpandingRing delay={2} size="200px" />

          {/* Desktop: larger rings */}
          <div className="hidden md:block">
            <ExpandingRing delay={0.5} size="280px" />
            <ExpandingRing delay={1.5} size="280px" />
          </div>

          {/* Equalizer behind */}
          <div className="absolute w-[260px] h-[260px] md:w-[340px] md:h-[340px]">
            <MiniEqualizer />
          </div>

          {/* Mic button */}
          <motion.button
            onClick={() => navigate("/karaoke")}
            className="relative z-10 h-[160px] w-[160px] md:h-[220px] md:w-[220px] rounded-full gold-gradient flex items-center justify-center cursor-pointer"
            whileHover={{ scale: 1.06 }}
            whileTap={{ scale: 0.95 }}
            animate={{
              boxShadow: [
                "0 0 40px -10px hsl(46 65% 52% / 0.4)",
                "0 0 80px -10px hsl(46 65% 52% / 0.7)",
                "0 0 40px -10px hsl(46 65% 52% / 0.4)",
              ],
            }}
            transition={{
              boxShadow: { duration: 3, repeat: Infinity, ease: "easeInOut" },
            }}
          >
            <Mic className="h-16 w-16 md:h-20 md:w-20 text-primary-foreground" />
          </motion.button>
        </div>
      </StaggerItem>

      {/* CTA text */}
      <StaggerItem className="text-center -mt-2">
        <p className="text-muted-foreground text-sm">
          Toca el micrófono. <span className="text-primary font-medium">Canta. Brilla.</span>
        </p>
      </StaggerItem>

      {/* ─── Mini Stats ─── */}
      <StaggerItem className="w-full max-w-md">
        <div className="flex items-center justify-center gap-6 text-sm">
          {[
            { icon: Flame, value: "12 días", label: "Racha", accent: true },
            { icon: Star, value: "847", label: "Score", accent: false },
            { icon: Play, value: "2/3", label: "Sesiones", accent: false },
          ].map((s) => (
            <div key={s.label} className="flex items-center gap-1.5">
              <s.icon className={`h-4 w-4 ${s.accent ? "text-primary" : "text-muted-foreground"}`} />
              <span className={`font-semibold ${s.accent ? "gold-text" : "text-foreground"}`}>{s.value}</span>
              <span className="text-muted-foreground text-xs hidden sm:inline">{s.label}</span>
            </div>
          ))}
        </div>
      </StaggerItem>

      {/* ─── Next Up ─── */}
      <StaggerItem className="w-full max-w-lg">
        <div
          onClick={() => navigate("/karaoke")}
          className="glass-card-hover p-4 flex items-center gap-3 cursor-pointer group"
        >
          <div className="h-11 w-11 rounded-lg gold-gradient flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
            <Play className="h-5 w-5 text-primary-foreground ml-0.5" />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-[10px] text-primary uppercase tracking-widest font-medium">Next Up</p>
            <h3 className="font-serif text-base text-foreground font-semibold truncate">
              Karaoke — Bésame Mucho
            </h3>
          </div>
          <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
        </div>
      </StaggerItem>

      {/* ─── Continue Learning ─── */}
      <StaggerItem className="w-full">
        <div className="flex items-center justify-between mb-3">
          <h2 className="font-serif text-lg font-semibold text-foreground">Continúa aprendiendo</h2>
          <button className="text-xs text-primary hover:underline">Ver todo</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {recentLessons.map((lesson) => (
            <div
              key={lesson.title}
              className="glass-card-hover min-w-[170px] md:min-w-[200px] p-3 snap-start cursor-pointer"
            >
              <div className="text-2xl mb-2">{lesson.img}</div>
              <p className="text-[9px] text-primary uppercase tracking-widest">{lesson.category}</p>
              <h4 className="font-serif text-sm font-semibold text-foreground mt-0.5">{lesson.title}</h4>
              <div className="mt-2">
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full gold-gradient" style={{ width: `${lesson.progress}%` }} />
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
