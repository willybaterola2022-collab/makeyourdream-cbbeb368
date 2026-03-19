import { useState } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import VintageMicrophone from "@/components/karaoke/VintageMicrophone";
import { ScenePicker, getSceneGradient, type SceneType } from "@/components/ScenePicker";
import { StudioGrid } from "@/components/StudioGrid";
import { SongBrowser } from "@/components/SongBrowser";

const Index = () => {
  const navigate = useNavigate();
  const [scene, setScene] = useState<SceneType>("studio");

  return (
    <div
      className="min-h-screen flex flex-col transition-all duration-700"
      style={{ background: getSceneGradient(scene) }}
    >
      {/* ═══ SCROLL 1 — MICRÓFONO HÉROE ═══ */}
      <section className="min-h-[85vh] md:min-h-screen flex flex-col items-center justify-center relative overflow-hidden px-4">
        {/* Spotlight from top */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[600px] h-[400px] md:w-[900px] md:h-[600px] rounded-full opacity-20 pointer-events-none"
          style={{ background: "radial-gradient(ellipse at center, hsl(275 85% 60% / 0.3), transparent 70%)" }}
        />

        {/* Floating particles */}
        {[...Array(8)].map((_, i) => (
          <motion.div
            key={i}
            className="absolute w-1 h-1 rounded-full bg-primary/30"
            style={{
              left: `${15 + Math.random() * 70}%`,
              top: `${10 + Math.random() * 60}%`,
            }}
            animate={{
              y: [-20, 20, -20],
              opacity: [0.2, 0.6, 0.2],
            }}
            transition={{
              duration: 3 + Math.random() * 3,
              repeat: Infinity,
              delay: i * 0.5,
              ease: "easeInOut",
            }}
          />
        ))}

        <VintageMicrophone
          isActive={false}
          volume={0}
          onClick={() => navigate("/karaoke")}
          state="idle"
          size="hero"
        />
      </section>

      {/* ═══ SCROLL 2 — TU ESTUDIO ═══ */}
      <section className="py-10 md:py-16 px-4 space-y-8 md:space-y-10">
        {/* Scene Picker */}
        <ScenePicker selected={scene} onChange={setScene} />

        {/* Studio Grid */}
        <StudioGrid />
      </section>

      {/* ═══ SCROLL 3 — CANCIONES ═══ */}
      <section className="py-8 md:py-12 px-4 space-y-4">
        <h2 className="font-serif text-xl md:text-2xl font-bold text-foreground uppercase tracking-wider text-center neon-text">
          🎶 Elige y Canta
        </h2>
        <SongBrowser />
      </section>
    </div>
  );
};

export default Index;
