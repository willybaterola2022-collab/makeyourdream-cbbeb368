import { motion } from "framer-motion";
import { useState, useEffect } from "react";

interface Props {
  isAnalyzing: boolean;
  onClick: () => void;
}

export function HeroOscilloscope({ isAnalyzing, onClick }: Props) {
  const [wave, setWave] = useState<number[]>(Array(40).fill(50));

  useEffect(() => {
    if (!isAnalyzing) return;
    const iv = setInterval(() => {
      setWave(Array.from({ length: 40 }, (_, i) =>
        50 + Math.sin(Date.now() / 200 + i * 0.4) * 30 + Math.random() * 10
      ));
    }, 80);
    return () => clearInterval(iv);
  }, [isAnalyzing]);

  const pathD = wave.map((y, i) => {
    const x = (i / (wave.length - 1)) * 300;
    return `${i === 0 ? "M" : "L"} ${x} ${100 - y}`;
  }).join(" ");

  return (
    <motion.button
      onClick={onClick}
      whileTap={{ scale: 0.96 }}
      className="relative flex flex-col items-center cursor-pointer z-10"
      initial={{ scale: 0.9, opacity: 0 }}
      animate={{ scale: 1, opacity: 1 }}
    >
      {/* Green glow */}
      <motion.div
        className="absolute rounded-full"
        style={{ width: 300, height: 200 }}
        animate={{
          boxShadow: isAnalyzing
            ? ["0 0 60px 25px hsl(140 80% 50% / 0.3)", "0 0 90px 40px hsl(140 80% 50% / 0.2)", "0 0 60px 25px hsl(140 80% 50% / 0.3)"]
            : ["0 0 30px 10px hsl(140 80% 50% / 0.1)", "0 0 50px 20px hsl(140 80% 50% / 0.12)", "0 0 30px 10px hsl(140 80% 50% / 0.1)"],
        }}
        transition={{ duration: 2, repeat: Infinity }}
      />

      {/* Screen */}
      <div className="relative z-10 w-[280px] md:w-[360px] h-[160px] md:h-[200px] rounded-2xl border-2 overflow-hidden"
        style={{ background: "hsl(140 30% 4%)", borderColor: "hsl(140 40% 20%)" }}
      >
        {/* Grid lines */}
        <div className="absolute inset-0 opacity-10">
          {[...Array(6)].map((_, i) => (
            <div key={`h${i}`} className="absolute w-full border-t" style={{ top: `${(i + 1) * 14.2}%`, borderColor: "hsl(140 80% 50%)" }} />
          ))}
          {[...Array(8)].map((_, i) => (
            <div key={`v${i}`} className="absolute h-full border-l" style={{ left: `${(i + 1) * 11.1}%`, borderColor: "hsl(140 80% 50%)" }} />
          ))}
        </div>

        {/* Waveform */}
        <svg viewBox="0 0 300 100" className="absolute inset-0 w-full h-full p-3">
          <motion.path
            d={pathD}
            fill="none"
            stroke="hsl(140 80% 50%)"
            strokeWidth="2"
            strokeLinecap="round"
            style={{ filter: "drop-shadow(0 0 6px hsl(140 80% 50% / 0.6))" }}
          />
        </svg>

        {/* Scan line */}
        {isAnalyzing && (
          <motion.div
            className="absolute top-0 bottom-0 w-[2px]"
            style={{ background: "hsl(140 80% 50% / 0.3)" }}
            animate={{ left: ["0%", "100%"] }}
            transition={{ duration: 2, repeat: Infinity, ease: "linear" }}
          />
        )}
      </div>

      {/* Label */}
      <motion.p
        className="mt-6 text-lg md:text-2xl font-bold uppercase tracking-[0.2em]"
        style={{ color: "hsl(140 80% 50%)" }}
        animate={{ opacity: [0.5, 1, 0.5] }}
        transition={{ duration: 1.5, repeat: Infinity }}
      >
        {isAnalyzing ? "📊 ANALIZANDO" : "🔬 ANALIZA TU VOZ 🔬"}
      </motion.p>
    </motion.button>
  );
}
