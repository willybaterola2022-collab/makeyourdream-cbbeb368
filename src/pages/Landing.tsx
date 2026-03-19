import { motion, useScroll, useTransform } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { useState, useEffect, useRef } from "react";
import {
  Mic,
  Play,
  ChevronRight,
  Sparkles,
  Fingerprint,
  Trophy,
  AudioWaveform,
  Star,
  Users,
  Music,
  Flame,
  Zap,
  BarChart3,
  Headphones,
} from "lucide-react";

/* ─── Animated Equalizer ─── */
const EqualizerBar = ({ index, total }: { index: number; total: number }) => {
  const center = total / 2;
  const dist = Math.abs(index - center) / center;
  const maxH = 100 - dist * 60;
  return (
    <motion.div
      className="rounded-full bg-primary"
      style={{ width: "clamp(3px, 0.8vw, 6px)", opacity: 0.3 + (1 - dist) * 0.7 }}
      animate={{ height: [`${maxH * 0.3}%`, `${maxH}%`, `${maxH * 0.5}%`, `${maxH * 0.8}%`, `${maxH * 0.2}%`] }}
      transition={{ duration: 1.5 + Math.random() * 1.5, repeat: Infinity, repeatType: "mirror", ease: "easeInOut", delay: index * 0.05 }}
    />
  );
};

const AnimatedEqualizer = () => (
  <div className="flex items-end justify-center gap-[2px] md:gap-1 h-40 md:h-64 w-full max-w-xl mx-auto opacity-40">
    {Array.from({ length: 28 }).map((_, i) => (
      <EqualizerBar key={i} index={i} total={28} />
    ))}
  </div>
);

/* ─── Sound Wave Rings ─── */
const SoundWaveRings = () => (
  <div className="absolute inset-0 flex items-center justify-center pointer-events-none">
    {[1, 2, 3, 4].map((ring) => (
      <motion.div
        key={ring}
        className="absolute rounded-full border border-primary/10"
        style={{ width: `${ring * 120 + 100}px`, height: `${ring * 120 + 100}px` }}
        animate={{ scale: [1, 1.15, 1], opacity: [0.15, 0.05, 0.15] }}
        transition={{ duration: 4 + ring * 0.5, repeat: Infinity, delay: ring * 0.8, ease: "easeInOut" }}
      />
    ))}
  </div>
);

/* ─── Counter Hook ─── */
const useCounter = (target: number, duration = 2000) => {
  const [count, setCount] = useState(0);
  useEffect(() => {
    let start = 0;
    const step = target / (duration / 16);
    const interval = setInterval(() => {
      start += step;
      if (start >= target) { setCount(target); clearInterval(interval); }
      else setCount(Math.floor(start));
    }, 16);
    return () => clearInterval(interval);
  }, [target, duration]);
  return count;
};

/* ─── Features ─── */
const features = [
  { icon: Mic, title: "Karaoke Inteligente", desc: "Score en tiempo real con análisis de afinación, timing y expresión" },
  { icon: Fingerprint, title: "Vocal Fingerprint 6D", desc: "Tu huella vocal única en 6 dimensiones con radar hexagonal" },
  { icon: Sparkles, title: "AI Vocal Coach", desc: "Coaching personalizado con IA que analiza cada performance" },
  { icon: Trophy, title: "Challenges Globales", desc: "Compite con cantantes de todo el mundo en ranking semanal" },
  { icon: AudioWaveform, title: "Voice Matching", desc: "Descubre a qué artista famoso suena tu voz" },
  { icon: Users, title: "Duetos con IA", desc: "Canta junto a Freddie Mercury, Adele, Sinatra y más" },
];

const howItWorks = [
  { icon: Mic, step: "01", title: "Graba tu voz", desc: "30 segundos es todo lo que necesitamos" },
  { icon: BarChart3, step: "02", title: "Análisis con IA", desc: "Tu huella vocal en 6 dimensiones al instante" },
  { icon: Zap, step: "03", title: "Entrena y brilla", desc: "Plan personalizado para transformar tu voz" },
];

const testimonials = [
  { name: "Valentina R.", text: "Mejoré mi afinación un 40% en 3 semanas", city: "CDMX" },
  { name: "Carlos M.", text: "El mejor coach vocal que he tenido, y es IA", city: "Madrid" },
  { name: "Ana P.", text: "Los challenges me motivan a practicar cada día", city: "Buenos Aires" },
];

/* ─── Landing Page ─── */
const Landing = () => {
  const navigate = useNavigate();
  const artistCount = useCounter(12400);
  const heroRef = useRef<HTMLDivElement>(null);
  const { scrollYProgress } = useScroll({ target: heroRef, offset: ["start start", "end start"] });
  const eqY = useTransform(scrollYProgress, [0, 1], [0, 80]);
  const textY = useTransform(scrollYProgress, [0, 1], [0, -30]);

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* ═══════ HERO ═══════ */}
      <section ref={heroRef} className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Gradient BG */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/70 to-background z-10" />
          <motion.div
            animate={{ backgroundPosition: ["0% 0%", "100% 100%"] }}
            transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.5) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--primary) / 0.2) 0%, transparent 50%)",
              backgroundSize: "200% 200%",
            }}
          />
        </div>

        {/* Sound wave rings */}
        <SoundWaveRings />

        {/* Floating notes with parallax */}
        {["🎵", "🎶", "🎤", "✨", "🎼", "⭐", "🎹", "🎧"].map((emoji, i) => (
          <motion.div
            key={i}
            className="absolute text-xl md:text-3xl"
            style={{ left: `${8 + i * 12}%`, top: `${15 + (i % 4) * 20}%`, opacity: 0.06 }}
            animate={{ y: [-15, 15, -15], rotate: [-5, 5, -5] }}
            transition={{ duration: 4 + i * 0.8, repeat: Infinity, delay: i * 0.5, ease: "easeInOut" }}
          >
            {emoji}
          </motion.div>
        ))}

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          {/* Live badge */}
          <motion.div
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 }}
            className="mb-8"
          >
            <motion.div
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 3, repeat: Infinity }}
              className="inline-flex items-center gap-2 px-4 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-sm"
            >
              <Flame className="h-4 w-4 text-primary" />
              <span className="text-primary font-medium">847 cantando ahora</span>
            </motion.div>
          </motion.div>

          {/* Equalizer behind text */}
          <motion.div style={{ y: eqY }} className="absolute inset-0 flex items-center justify-center z-0 pointer-events-none">
            <AnimatedEqualizer />
          </motion.div>

          {/* Main headline */}
          <motion.div style={{ y: textY }} className="relative z-10">
            <motion.h1
              initial={{ opacity: 0, y: 40 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 1, delay: 0.4, ease: [0.22, 1, 0.36, 1] }}
              className="font-serif text-4xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.92] tracking-tight"
            >
              Tu voz merece el
              <br />
              <span className="neon-text">escenario mundial</span>
            </motion.h1>

            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.8, delay: 0.7 }}
              className="text-sm md:text-xl text-muted-foreground mt-6 max-w-lg mx-auto leading-relaxed"
            >
              Graba tu voz, descubre tu potencial y transforma tu talento con inteligencia artificial — en 30 segundos.
            </motion.p>
          </motion.div>

          {/* CTA */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 1 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4 relative z-10"
          >
            <motion.button
              animate={{ boxShadow: ["0 0 20px -5px hsl(275 85% 60% / 0.3)", "0 0 40px -5px hsl(275 85% 60% / 0.6)", "0 0 20px -5px hsl(275 85% 60% / 0.3)"] }}
              transition={{ duration: 3, repeat: Infinity }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/onboarding")}
              className="h-14 px-8 w-full sm:w-auto rounded-xl stage-gradient text-primary-foreground font-semibold text-lg flex items-center justify-center gap-3 hover:opacity-90 transition-opacity"
            >
              <Mic className="h-5 w-5" />
              Descubre tu voz — 30s
              <ChevronRight className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="h-14 px-8 w-full sm:w-auto rounded-xl glass-card text-foreground font-medium flex items-center justify-center gap-2 hover:border-primary/30 transition-colors"
            >
              <Play className="h-4 w-4" />
              Ver demo
            </motion.button>
          </motion.div>

          {/* Animated counter */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 1.5 }}
            className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground relative z-10"
          >
            <div className="flex -space-x-2">
              {["VR", "CM", "AP", "DL"].map((initials, i) => (
                <div key={i} className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground">
                  {initials}
                </div>
              ))}
            </div>
            <span>+{artistCount.toLocaleString()} artistas transformando su voz</span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div animate={{ y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20">
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <motion.div animate={{ opacity: [0.3, 1, 0.3], y: [0, 8, 0] }} transition={{ duration: 2, repeat: Infinity }} className="w-1.5 h-1.5 rounded-full bg-primary" />
          </div>
        </motion.div>
      </section>

      {/* ═══════ HOW IT WORKS ═══════ */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-14">
            <p className="text-[11px] text-primary uppercase tracking-[0.3em] mb-3">Así de fácil</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground">
              3 pasos para <span className="gold-text">brillar</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {howItWorks.map((item, i) => (
              <motion.div
                key={item.step}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="text-center"
              >
                <div className="h-16 w-16 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-4">
                  <item.icon className="h-7 w-7 text-primary-foreground" />
                </div>
                <p className="text-[11px] text-primary uppercase tracking-[0.3em] mb-1">{item.step}</p>
                <h3 className="font-serif text-xl font-semibold text-foreground mb-2">{item.title}</h3>
                <p className="text-sm text-muted-foreground">{item.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FEATURES ═══════ */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, margin: "-100px" }} className="text-center mb-16">
            <p className="text-[11px] text-primary uppercase tracking-[0.3em] mb-3">10 módulos premium</p>
            <h2 className="font-serif text-3xl md:text-5xl font-bold text-foreground">
              Todo lo que necesitas para <br /><span className="gold-text">brillar</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div key={f.title} initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ duration: 0.5, delay: i * 0.1 }} whileHover={{ y: -6, transition: { duration: 0.25 } }} className="glass-card p-6 group cursor-pointer hover:border-primary/20 transition-colors">
                <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center mb-4 group-hover:bg-primary/20 transition-colors">
                  <f.icon className="h-6 w-6 text-primary" />
                </div>
                <h3 className="font-serif text-lg font-semibold text-foreground mb-2">{f.title}</h3>
                <p className="text-sm text-muted-foreground leading-relaxed">{f.desc}</p>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ TESTIMONIALS ═══════ */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div initial={{ opacity: 0, y: 30 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} className="text-center mb-12">
            <p className="text-[11px] text-primary uppercase tracking-[0.3em] mb-3">Testimonios</p>
            <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground">Voces que ya <span className="gold-text">brillan</span></h2>
          </motion.div>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div key={t.name} initial={{ opacity: 0, y: 20 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true }} transition={{ delay: i * 0.15 }} className="glass-card p-6">
                <div className="flex gap-1 mb-3">{Array.from({ length: 5 }).map((_, j) => (<Star key={j} className="h-4 w-4 fill-primary text-primary" />))}</div>
                <p className="text-sm text-foreground mb-4 italic">"{t.text}"</p>
                <div>
                  <p className="text-sm font-medium text-foreground">{t.name}</p>
                  <p className="text-[11px] text-muted-foreground">{t.city}</p>
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </section>

      {/* ═══════ FINAL CTA ═══════ */}
      <section className="py-24 px-4">
        <motion.div initial={{ opacity: 0, scale: 0.95 }} whileInView={{ opacity: 1, scale: 1 }} viewport={{ once: true }} className="max-w-2xl mx-auto text-center glass-card p-8 md:p-10 border-primary/20 glow-gold">
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">Tu voz merece ser <span className="gold-text">escuchada</span></h2>
          <p className="text-muted-foreground mb-8 text-sm md:text-base">Graba tu voz, recibe tu diagnóstico vocal gratuito y comienza tu transformación hoy.</p>
          <motion.button whileHover={{ scale: 1.05, boxShadow: "0 0 50px -5px hsl(46 65% 52% / 0.5)" }} whileTap={{ scale: 0.95 }} onClick={() => navigate("/onboarding")} className="h-14 px-10 w-full sm:w-auto rounded-xl gold-gradient text-primary-foreground font-semibold text-lg flex items-center justify-center gap-3 mx-auto">
            <Mic className="h-5 w-5" />
            Comenzar gratis
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="flex items-center justify-center gap-2 mb-4">
            <div className="h-7 w-7 rounded-lg gold-gradient flex items-center justify-center"><Music className="h-4 w-4 text-primary-foreground" /></div>
            <span className="font-serif text-lg font-semibold text-foreground">MakeYourDream</span>
          </div>
          <div className="flex flex-wrap items-center justify-center gap-4 mb-4 text-xs text-muted-foreground">
            <button onClick={() => navigate("/karaoke")} className="hover:text-primary transition-colors">Karaoke</button>
            <button onClick={() => navigate("/fingerprint")} className="hover:text-primary transition-colors">Fingerprint</button>
            <button onClick={() => navigate("/coach")} className="hover:text-primary transition-colors">Coach IA</button>
            <button onClick={() => navigate("/challenges")} className="hover:text-primary transition-colors">Challenges</button>
            <button onClick={() => navigate("/matching")} className="hover:text-primary transition-colors">Matching</button>
          </div>
          <p className="text-xs text-muted-foreground text-center">© 2026 MakeYourDream. Transform your voice with AI.</p>
        </div>
      </footer>
    </div>
  );
};

export default Landing;
