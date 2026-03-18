import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
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
} from "lucide-react";

const features = [
  {
    icon: Mic,
    title: "Karaoke Inteligente",
    desc: "Score en tiempo real con análisis de afinación, timing y expresión",
  },
  {
    icon: Fingerprint,
    title: "Vocal Fingerprint 6D",
    desc: "Tu huella vocal única en 6 dimensiones con radar hexagonal",
  },
  {
    icon: Sparkles,
    title: "AI Vocal Coach",
    desc: "Coaching personalizado con IA que analiza cada performance",
  },
  {
    icon: Trophy,
    title: "Challenges Globales",
    desc: "Compite con cantantes de todo el mundo en ranking semanal",
  },
  {
    icon: AudioWaveform,
    title: "Voice Matching",
    desc: "Descubre a qué artista famoso suena tu voz",
  },
  {
    icon: Users,
    title: "Duetos con IA",
    desc: "Canta junto a Freddie Mercury, Adele, Sinatra y más",
  },
];

const testimonials = [
  { name: "Valentina R.", text: "Mejoré mi afinación un 40% en 3 semanas", city: "CDMX" },
  { name: "Carlos M.", text: "El mejor coach vocal que he tenido, y es IA", city: "Madrid" },
  { name: "Ana P.", text: "Los challenges me motivan a practicar cada día", city: "Buenos Aires" },
];

const Landing = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-background overflow-hidden">
      {/* Hero Section */}
      <section className="relative min-h-screen flex items-center justify-center overflow-hidden">
        {/* Animated background */}
        <div className="absolute inset-0">
          <div className="absolute inset-0 bg-gradient-to-b from-background via-background/80 to-background z-10" />
          <motion.div
            animate={{
              backgroundPosition: ["0% 0%", "100% 100%"],
            }}
            transition={{ duration: 30, repeat: Infinity, repeatType: "reverse", ease: "linear" }}
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 20% 50%, hsl(var(--primary) / 0.4) 0%, transparent 50%), radial-gradient(circle at 80% 20%, hsl(var(--violet) / 0.3) 0%, transparent 50%), radial-gradient(circle at 50% 80%, hsl(var(--primary) / 0.2) 0%, transparent 50%)",
              backgroundSize: "200% 200%",
            }}
          />
          {/* Floating music notes */}
          {["🎵", "🎶", "🎤", "✨", "🎼", "⭐"].map((emoji, i) => (
            <motion.div
              key={i}
              className="absolute text-2xl md:text-3xl opacity-10"
              style={{
                left: `${15 + i * 14}%`,
                top: `${20 + (i % 3) * 25}%`,
              }}
              animate={{
                y: [-20, 20, -20],
                rotate: [-10, 10, -10],
                opacity: [0.05, 0.15, 0.05],
              }}
              transition={{
                duration: 5 + i,
                repeat: Infinity,
                delay: i * 0.7,
                ease: "easeInOut",
              }}
            >
              {emoji}
            </motion.div>
          ))}
        </div>

        <div className="relative z-20 text-center px-4 max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: [0.22, 1, 0.36, 1] }}
            className="mb-6"
          >
            <div className="h-16 w-16 md:h-20 md:w-20 rounded-2xl gold-gradient flex items-center justify-center mx-auto mb-6 glow-gold">
              <Music className="h-8 w-8 md:h-10 md:w-10 text-primary-foreground" />
            </div>
          </motion.div>

          <motion.h1
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.2, ease: [0.22, 1, 0.36, 1] }}
            className="font-serif text-5xl md:text-7xl lg:text-8xl font-bold text-foreground leading-[0.95] tracking-tight"
          >
            Make Your
            <br />
            <span className="gold-text">Dream</span>
          </motion.h1>

          <motion.p
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.4 }}
            className="text-lg md:text-xl text-muted-foreground mt-6 max-w-xl mx-auto leading-relaxed"
          >
            La plataforma premium de transformación musical con IA.
            Descubre tu voz, entrena como profesional, compite con el mundo.
          </motion.p>

          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.8, delay: 0.6 }}
            className="mt-10 flex flex-col sm:flex-row items-center justify-center gap-4"
          >
            <motion.button
              whileHover={{ scale: 1.05, boxShadow: "0 0 40px -5px hsl(46 65% 52% / 0.5)" }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/onboarding")}
              className="h-14 px-8 rounded-xl gold-gradient text-primary-foreground font-semibold text-lg flex items-center gap-3 hover:opacity-90 transition-opacity"
            >
              <Mic className="h-5 w-5" />
              Descubre tu voz gratis
              <ChevronRight className="h-5 w-5" />
            </motion.button>
            <motion.button
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => navigate("/")}
              className="h-14 px-8 rounded-xl glass-card text-foreground font-medium flex items-center gap-2 hover:border-primary/30 transition-colors"
            >
              <Play className="h-4 w-4" />
              Ver demo
            </motion.button>
          </motion.div>

          {/* Social proof */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ duration: 1, delay: 1 }}
            className="mt-12 flex items-center justify-center gap-2 text-sm text-muted-foreground"
          >
            <div className="flex -space-x-2">
              {["VR", "CM", "AP", "DL"].map((initials, i) => (
                <div
                  key={i}
                  className="h-8 w-8 rounded-full bg-muted border-2 border-background flex items-center justify-center text-[10px] font-bold text-muted-foreground"
                >
                  {initials}
                </div>
              ))}
            </div>
            <span>+12,400 artistas transformando su voz</span>
          </motion.div>
        </div>

        {/* Scroll indicator */}
        <motion.div
          animate={{ y: [0, 8, 0] }}
          transition={{ duration: 2, repeat: Infinity }}
          className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20"
        >
          <div className="w-6 h-10 rounded-full border-2 border-muted-foreground/30 flex justify-center pt-2">
            <motion.div
              animate={{ opacity: [0.3, 1, 0.3], y: [0, 8, 0] }}
              transition={{ duration: 2, repeat: Infinity }}
              className="w-1.5 h-1.5 rounded-full bg-primary"
            />
          </div>
        </motion.div>
      </section>

      {/* Features Section */}
      <section className="py-24 px-4">
        <div className="max-w-5xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="text-center mb-16"
          >
            <p className="text-[11px] text-primary uppercase tracking-[0.3em] mb-3">10 módulos premium</p>
            <h2 className="font-serif text-4xl md:text-5xl font-bold text-foreground">
              Todo lo que necesitas para
              <br />
              <span className="gold-text">brillar</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {features.map((f, i) => (
              <motion.div
                key={f.title}
                initial={{ opacity: 0, y: 30 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ duration: 0.5, delay: i * 0.1 }}
                whileHover={{ y: -6, transition: { duration: 0.25 } }}
                className="glass-card p-6 group cursor-pointer hover:border-primary/20 transition-colors"
              >
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

      {/* Testimonials */}
      <section className="py-24 px-4">
        <div className="max-w-4xl mx-auto">
          <motion.div
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true }}
            className="text-center mb-12"
          >
            <p className="text-[11px] text-primary uppercase tracking-[0.3em] mb-3">Testimonios</p>
            <h2 className="font-serif text-4xl font-bold text-foreground">
              Voces que ya <span className="gold-text">brillan</span>
            </h2>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            {testimonials.map((t, i) => (
              <motion.div
                key={t.name}
                initial={{ opacity: 0, y: 20 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true }}
                transition={{ delay: i * 0.15 }}
                className="glass-card p-6"
              >
                <div className="flex gap-1 mb-3">
                  {Array.from({ length: 5 }).map((_, j) => (
                    <Star key={j} className="h-4 w-4 fill-primary text-primary" />
                  ))}
                </div>
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

      {/* Final CTA */}
      <section className="py-24 px-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.95 }}
          whileInView={{ opacity: 1, scale: 1 }}
          viewport={{ once: true }}
          className="max-w-2xl mx-auto text-center glass-card p-10 border-primary/20 glow-gold"
        >
          <h2 className="font-serif text-3xl md:text-4xl font-bold text-foreground mb-4">
            Tu voz merece ser <span className="gold-text">escuchada</span>
          </h2>
          <p className="text-muted-foreground mb-8">
            Graba tu voz, recibe tu diagnóstico vocal gratuito y comienza tu transformación hoy.
          </p>
          <motion.button
            whileHover={{ scale: 1.05, boxShadow: "0 0 50px -5px hsl(46 65% 52% / 0.5)" }}
            whileTap={{ scale: 0.95 }}
            onClick={() => navigate("/onboarding")}
            className="h-14 px-10 rounded-xl gold-gradient text-primary-foreground font-semibold text-lg flex items-center gap-3 mx-auto"
          >
            <Mic className="h-5 w-5" />
            Comenzar gratis
          </motion.button>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="border-t border-border/40 py-8 px-4 text-center">
        <div className="flex items-center justify-center gap-2 mb-3">
          <div className="h-7 w-7 rounded-lg gold-gradient flex items-center justify-center">
            <Music className="h-4 w-4 text-primary-foreground" />
          </div>
          <span className="font-serif text-lg font-semibold text-foreground">MakeYourDream</span>
        </div>
        <p className="text-xs text-muted-foreground">
          © 2026 MakeYourDream. Transform your voice with AI.
        </p>
      </footer>
    </div>
  );
};

export default Landing;
