import { Flame, TrendingUp, Play, ChevronRight, Star } from "lucide-react";
import { motion } from "framer-motion";
import { StaggerContainer, StaggerItem, HoverCard } from "@/components/layout/StaggerContainer";

const recentLessons = [
  { title: "Técnica de Belting", category: "Vocal Power", progress: 75, img: "🎤" },
  { title: "Vibrato Control", category: "Finesse", progress: 45, img: "🎵" },
  { title: "Breath Support", category: "Fundamentos", progress: 90, img: "💨" },
  { title: "Falsetto Master", category: "Range", progress: 30, img: "✨" },
  { title: "Rhythm & Timing", category: "Musicality", progress: 60, img: "🎶" },
];

const Index = () => {
  return (
    <div className="p-4 md:p-8 space-y-8 animate-fade-in">
      {/* Hero greeting */}
      <div>
        <h1 className="font-serif text-3xl md:text-4xl font-semibold text-foreground">
          Buenas noches, <span className="gold-text">Artista</span>
        </h1>
        <p className="text-muted-foreground mt-1">Tu escenario te espera. Sigamos creando magia.</p>
      </div>

      {/* Stats row */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {[
          { label: "Racha actual", value: "12 días", icon: Flame, accent: true },
          { label: "Score global", value: "847", icon: Star, accent: false },
          { label: "Mejora semanal", value: "+14%", icon: TrendingUp, accent: false },
          { label: "Sesiones hoy", value: "2 / 3", icon: Play, accent: false },
        ].map((stat) => (
          <div key={stat.label} className={`glass-card p-4 ${stat.accent ? "glow-gold border-primary/20" : ""}`}>
            <div className="flex items-center gap-2 mb-2">
              <stat.icon className={`h-4 w-4 ${stat.accent ? "text-primary" : "text-muted-foreground"}`} />
              <span className="text-[11px] text-muted-foreground uppercase tracking-wider">{stat.label}</span>
            </div>
            <p className={`text-2xl font-serif font-bold ${stat.accent ? "gold-text" : "text-foreground"}`}>
              {stat.value}
            </p>
          </div>
        ))}
      </div>

      {/* Next Up */}
      <div className="glass-card-hover p-5 flex items-center gap-4 cursor-pointer group">
        <div className="h-14 w-14 rounded-xl gold-gradient flex items-center justify-center shrink-0 group-hover:scale-105 transition-transform">
          <Play className="h-6 w-6 text-primary-foreground ml-0.5" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-[11px] text-primary uppercase tracking-widest font-medium">Next Up</p>
          <h3 className="font-serif text-lg text-foreground font-semibold truncate">
            Sesión de Karaoke — Bésame Mucho
          </h3>
          <p className="text-xs text-muted-foreground">Practica tu afinación con scoring en vivo</p>
        </div>
        <ChevronRight className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors shrink-0" />
      </div>

      {/* Weekly Progress Ring */}
      <div className="glass-card p-6">
        <h2 className="font-serif text-xl font-semibold text-foreground mb-4">Progreso semanal</h2>
        <div className="flex items-center gap-8">
          <div className="relative h-32 w-32 shrink-0">
            <svg viewBox="0 0 120 120" className="h-full w-full -rotate-90">
              <circle cx="60" cy="60" r="50" fill="none" stroke="hsl(var(--muted))" strokeWidth="8" />
              <circle
                cx="60" cy="60" r="50" fill="none"
                stroke="hsl(var(--primary))"
                strokeWidth="8"
                strokeLinecap="round"
                strokeDasharray={`${2 * Math.PI * 50 * 0.72} ${2 * Math.PI * 50 * 0.28}`}
              />
            </svg>
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <span className="text-2xl font-serif font-bold gold-text">72%</span>
              <span className="text-[10px] text-muted-foreground">completado</span>
            </div>
          </div>
          <div className="space-y-3 flex-1">
            {["Karaoke", "Ejercicios", "Challenges"].map((item, i) => (
              <div key={item}>
                <div className="flex justify-between text-xs mb-1">
                  <span className="text-muted-foreground">{item}</span>
                  <span className="text-foreground font-medium">{[85, 60, 70][i]}%</span>
                </div>
                <div className="h-1.5 rounded-full bg-muted overflow-hidden">
                  <div
                    className="h-full rounded-full gold-gradient transition-all duration-700"
                    style={{ width: `${[85, 60, 70][i]}%` }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Recent Lessons Carousel */}
      <div>
        <div className="flex items-center justify-between mb-4">
          <h2 className="font-serif text-xl font-semibold text-foreground">Continúa aprendiendo</h2>
          <button className="text-xs text-primary hover:underline">Ver todo</button>
        </div>
        <div className="flex gap-3 overflow-x-auto pb-2 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {recentLessons.map((lesson) => (
            <div
              key={lesson.title}
              className="glass-card-hover min-w-[200px] md:min-w-[220px] p-4 snap-start cursor-pointer"
            >
              <div className="text-3xl mb-3">{lesson.img}</div>
              <p className="text-[10px] text-primary uppercase tracking-widest">{lesson.category}</p>
              <h4 className="font-serif text-sm font-semibold text-foreground mt-1">{lesson.title}</h4>
              <div className="mt-3">
                <div className="h-1 rounded-full bg-muted overflow-hidden">
                  <div className="h-full rounded-full gold-gradient" style={{ width: `${lesson.progress}%` }} />
                </div>
                <p className="text-[10px] text-muted-foreground mt-1">{lesson.progress}% completado</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Index;
