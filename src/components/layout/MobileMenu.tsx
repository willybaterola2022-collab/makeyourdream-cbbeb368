import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useNavigate, useLocation } from "react-router-dom";
import { X, Menu } from "lucide-react";
import {
  Mic, LayoutDashboard, Fingerprint, Star, Layers, Sliders as SlidersIcon,
  PenLine, Sparkles, Wand2, Thermometer, Ear, Wind, BrainCircuit, Dumbbell,
  Swords, UsersRound, Theater, UserCircle, BookOpen, Calendar, Heart,
  Music, Radio, GitCompare, TrendingUp, Trophy, Monitor,
} from "lucide-react";

interface ModuleItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  color: string;
  glow: string;
}

interface ModuleGroup {
  label: string;
  emoji: string;
  items: ModuleItem[];
}

const MODULE_GROUPS: ModuleGroup[] = [
  {
    label: "Escenario", emoji: "🎭",
    items: [
      { title: "Mi Escenario", url: "/", icon: LayoutDashboard, color: "from-violet-500 to-purple-600", glow: "shadow-violet-500/20" },
      { title: "Soy Leyenda", url: "/skill-tree", icon: Star, color: "from-amber-400 to-orange-500", glow: "shadow-amber-400/20" },
      { title: "Canta", url: "/karaoke", icon: Mic, color: "from-pink-500 to-rose-500", glow: "shadow-pink-500/20" },
      { title: "Tu Voz", url: "/fingerprint", icon: Fingerprint, color: "from-cyan-400 to-teal-500", glow: "shadow-cyan-400/20" },
    ],
  },
  {
    label: "Estudio", emoji: "🎛️",
    items: [
      { title: "Loop Station", url: "/loop-station", icon: Layers, color: "from-indigo-500 to-blue-600", glow: "shadow-indigo-500/20" },
      { title: "Auto Mix", url: "/automix", icon: Wand2, color: "from-purple-500 to-violet-600", glow: "shadow-purple-500/20" },
      { title: "Escribe Letras", url: "/lyrics-writer", icon: PenLine, color: "from-emerald-400 to-green-500", glow: "shadow-emerald-400/20" },
      { title: "Laboratorio", url: "/harmony-lab", icon: Sparkles, color: "from-yellow-400 to-amber-500", glow: "shadow-yellow-400/20" },
      { title: "Vocal FX", url: "/vocal-fx", icon: SlidersIcon, color: "from-fuchsia-500 to-pink-600", glow: "shadow-fuchsia-500/20" },
      { title: "Song Sketch", url: "/song-sketch", icon: Music, color: "from-sky-400 to-blue-500", glow: "shadow-sky-400/20" },
    ],
  },
  {
    label: "Entrena", emoji: "💪",
    items: [
      { title: "Calentamiento", url: "/warmup", icon: Thermometer, color: "from-orange-500 to-red-500", glow: "shadow-orange-500/20" },
      { title: "Afina tu Oído", url: "/pitch-training", icon: Ear, color: "from-lime-400 to-green-500", glow: "shadow-lime-400/20" },
      { title: "Respiración", url: "/breath-trainer", icon: Wind, color: "from-teal-400 to-cyan-500", glow: "shadow-teal-400/20" },
      { title: "Coach IA", url: "/coach", icon: BrainCircuit, color: "from-violet-500 to-indigo-600", glow: "shadow-violet-500/20" },
      { title: "Ejercicios", url: "/exercises", icon: Dumbbell, color: "from-rose-500 to-pink-600", glow: "shadow-rose-500/20" },
      { title: "Reto Diario", url: "/challenges", icon: Trophy, color: "from-amber-500 to-yellow-500", glow: "shadow-amber-500/20" },
      { title: "Emoción", url: "/emotion-map", icon: Heart, color: "from-red-500 to-rose-600", glow: "shadow-red-500/20" },
      { title: "Comparador", url: "/comparator", icon: GitCompare, color: "from-blue-500 to-indigo-500", glow: "shadow-blue-500/20" },
    ],
  },
  {
    label: "Arena", emoji: "⚔️",
    items: [
      { title: "Duelos 1v1", url: "/duelos", icon: Swords, color: "from-red-600 to-orange-600", glow: "shadow-red-600/20" },
      { title: "Colabora", url: "/collab-room", icon: UsersRound, color: "from-blue-500 to-purple-500", glow: "shadow-blue-500/20" },
      { title: "Escenario", url: "/stage-simulator", icon: Theater, color: "from-amber-500 to-orange-500", glow: "shadow-amber-500/20" },
      { title: "Genre Gym", url: "/genre-gym", icon: Radio, color: "from-green-500 to-emerald-500", glow: "shadow-green-500/20" },
      { title: "Fan Radar", url: "/fan-radar", icon: TrendingUp, color: "from-pink-500 to-fuchsia-500", glow: "shadow-pink-500/20" },
    ],
  },
  {
    label: "Tu Carrera", emoji: "🚀",
    items: [
      { title: "Portfolio", url: "/portfolio", icon: UserCircle, color: "from-purple-500 to-violet-600", glow: "shadow-purple-500/20" },
      { title: "Diario Vocal", url: "/voice-journal", icon: BookOpen, color: "from-teal-500 to-emerald-500", glow: "shadow-teal-500/20" },
      { title: "Plan 90 Días", url: "/plan-90", icon: Calendar, color: "from-sky-500 to-blue-600", glow: "shadow-sky-500/20" },
      { title: "Diagnóstico", url: "/diagnostico", icon: Monitor, color: "from-indigo-500 to-violet-500", glow: "shadow-indigo-500/20" },
    ],
  },
];

export function MobileMenu() {
  const [open, setOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  const handleNav = (url: string) => {
    navigate(url);
    setOpen(false);
  };

  return (
    <>
      {/* Hamburger trigger */}
      <button
        onClick={() => setOpen(true)}
        className="fixed top-3 right-3 z-50 md:hidden w-10 h-10 rounded-xl bg-background/80 backdrop-blur-xl border border-border/30 flex items-center justify-center shadow-lg active:scale-90 transition-transform"
      >
        <Menu className="h-5 w-5 text-foreground" />
      </button>

      <AnimatePresence>
        {open && (
          <>
            {/* Backdrop */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              onClick={() => setOpen(false)}
              className="fixed inset-0 bg-black/70 backdrop-blur-sm z-[60]"
            />

            {/* Full-screen menu */}
            <motion.div
              initial={{ x: "100%", opacity: 0.5 }}
              animate={{ x: 0, opacity: 1 }}
              exit={{ x: "100%", opacity: 0 }}
              transition={{ type: "spring", damping: 28, stiffness: 300 }}
              className="fixed inset-0 z-[61] overflow-y-auto"
              style={{
                background: `
                  radial-gradient(ellipse at 80% 20%, hsl(275 85% 12% / 0.6) 0%, transparent 50%),
                  radial-gradient(ellipse at 20% 80%, hsl(185 90% 12% / 0.4) 0%, transparent 50%),
                  hsl(0 0% 4%)
                `,
              }}
            >
              {/* Close button */}
              <div className="flex justify-between items-center px-5 pt-4 pb-2">
                <h2 className="text-lg font-bold text-foreground tracking-wide" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                  MakeYourDream
                </h2>
                <button
                  onClick={() => setOpen(false)}
                  className="w-10 h-10 rounded-xl bg-white/5 border border-white/10 flex items-center justify-center active:scale-90 transition-transform"
                >
                  <X className="h-5 w-5 text-white/70" />
                </button>
              </div>

              {/* Module groups */}
              <div className="px-4 pb-24 space-y-5 mt-2">
                {MODULE_GROUPS.map((group, gi) => (
                  <motion.div
                    key={group.label}
                    initial={{ opacity: 0, y: 16 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: gi * 0.06, duration: 0.3 }}
                  >
                    <h3 className="text-[11px] font-bold uppercase tracking-[0.2em] text-white/30 mb-2.5 px-1">
                      {group.emoji} {group.label}
                    </h3>
                    <div className="grid grid-cols-4 gap-2">
                      {group.items.map((item, i) => {
                        const isActive = item.url === "/"
                          ? location.pathname === "/"
                          : location.pathname.startsWith(item.url);

                        return (
                          <motion.button
                            key={item.url}
                            onClick={() => handleNav(item.url)}
                            initial={{ opacity: 0, scale: 0.85 }}
                            animate={{ opacity: 1, scale: 1 }}
                            transition={{ delay: gi * 0.06 + i * 0.03, duration: 0.25 }}
                            whileTap={{ scale: 0.9 }}
                            className={`relative flex flex-col items-center gap-1.5 p-3 rounded-2xl transition-all ${
                              isActive
                                ? "bg-white/10 border border-white/20 shadow-lg " + item.glow
                                : "bg-white/[0.03] border border-white/[0.06] hover:bg-white/[0.06]"
                            }`}
                          >
                            <div className={`w-10 h-10 rounded-xl bg-gradient-to-br ${item.color} flex items-center justify-center shadow-md`}>
                              <item.icon className="h-5 w-5 text-white" />
                            </div>
                            <span className={`text-[9px] font-bold uppercase tracking-wider leading-tight text-center ${
                              isActive ? "text-white" : "text-white/50"
                            }`}>
                              {item.title}
                            </span>
                            {isActive && (
                              <motion.div
                                layoutId="mobile-menu-indicator"
                                className="absolute -bottom-0.5 w-5 h-0.5 rounded-full bg-gradient-to-r from-pink-500 to-violet-500"
                              />
                            )}
                          </motion.button>
                        );
                      })}
                    </div>
                  </motion.div>
                ))}
              </div>
            </motion.div>
          </>
        )}
      </AnimatePresence>
    </>
  );
}
