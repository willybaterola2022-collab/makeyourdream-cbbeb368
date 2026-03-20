import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface DreamBoothProps {
  onClick?: () => void;
}

function makeParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: (Math.random() - 0.5) * 280,
    startY: (Math.random() - 0.5) * 360,
    dur: 3 + Math.random() * 4,
    delay: Math.random() * 3,
    size: 1 + Math.random() * 2.5,
  }));
}

function makeFreqBars(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = -90 + (180 / (count - 1)) * i;
    const rad = (angle * Math.PI) / 180;
    const cx = 150;
    const cy = 200;
    const innerR = 70;
    const maxLen = 18 + Math.random() * 22;
    return {
      id: i,
      x1: cx + Math.cos(rad) * innerR,
      y1: cy + Math.sin(rad) * innerR,
      x2: cx + Math.cos(rad) * (innerR + maxLen),
      y2: cy + Math.sin(rad) * (innerR + maxLen),
      dur: 1.2 + Math.random() * 1.8,
      delay: Math.random() * 1.5,
    };
  });
}

export default function DreamBooth({ onClick }: DreamBoothProps) {
  const [hovered, setHovered] = useState(false);
  const particles = useMemo(() => makeParticles(22), []);
  const bars = useMemo(() => makeFreqBars(28), []);

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      style={{ width: "min(85vw, 380px)", aspectRatio: "3/4" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      {/* Double halo */}
      <motion.div
        className="absolute inset-0 rounded-[50%] pointer-events-none"
        animate={{
          boxShadow: hovered
            ? "0 0 120px 35px hsl(275 85% 60%/0.4), 0 0 120px 35px hsl(185 90% 55%/0.3)"
            : "0 0 80px 20px hsl(275 85% 60%/0.2), 0 0 80px 20px hsl(185 90% 55%/0.12)",
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* Breathing ring */}
      <motion.div
        className="absolute inset-[-8%] rounded-[50%] pointer-events-none"
        style={{ border: "1px solid hsl(275 85% 60%/0.15)" }}
        animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        viewBox="0 0 300 400"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 40px hsl(275 85% 60%/0.25))" }}
      >
        <defs>
          <linearGradient id="portal-border" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(275 85% 60%)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="hsl(230 70% 50%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(185 90% 55%)" stopOpacity="0.9" />
          </linearGradient>
          <radialGradient id="inner-fog" cx="50%" cy="45%">
            <stop offset="0%" stopColor="hsl(275 60% 20%)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(240 30% 8%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(0 0% 4%)" stopOpacity="0.95" />
          </radialGradient>
          <linearGradient id="scan-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(185 90% 55%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(185 90% 55%)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(185 90% 75%)" stopOpacity="0.9" />
            <stop offset="70%" stopColor="hsl(185 90% 55%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(185 90% 55%)" stopOpacity="0" />
          </linearGradient>
          <linearGradient id="mic-grad" x1="0.5" y1="0" x2="0.5" y2="1">
            <stop offset="0%" stopColor="hsl(275 85% 70%)" stopOpacity="0.25" />
            <stop offset="100%" stopColor="hsl(185 90% 55%)" stopOpacity="0.1" />
          </linearGradient>
          <clipPath id="portal-clip">
            <ellipse cx="150" cy="200" rx="95" ry="145" />
          </clipPath>
        </defs>

        {/* Portal body */}
        <ellipse cx="150" cy="200" rx="95" ry="145" fill="url(#inner-fog)" />
        {/* Portal border */}
        <ellipse cx="150" cy="200" rx="95" ry="145" fill="none" stroke="url(#portal-border)" strokeWidth="2.5" opacity="0.85" />
        <ellipse cx="150" cy="200" rx="102" ry="152" fill="none" stroke="url(#portal-border)" strokeWidth="0.5" opacity="0.3" />

        {/* Stylized microphone silhouette inside portal */}
        <g clipPath="url(#portal-clip)" opacity="0.2">
          {/* Mic head (rounded rect) */}
          <rect x="132" y="140" width="36" height="55" rx="18" fill="url(#mic-grad)" />
          {/* Mic body/stand */}
          <rect x="146" y="195" width="8" height="50" rx="4" fill="url(#mic-grad)" />
          {/* Mic base arc */}
          <path d="M 126 245 Q 150 265 174 245" stroke="hsl(275 85% 65%)" strokeWidth="2" fill="none" opacity="0.3" />
          {/* Grille lines */}
          {[148, 155, 162, 169, 176].map((y) => (
            <line key={y} x1="138" y1={y} x2="162" y2={y} stroke="hsl(185 90% 60%)" strokeWidth="0.5" opacity="0.3" />
          ))}
        </g>

        {/* Frequency bars */}
        <g clipPath="url(#portal-clip)">
          {bars.map((b) => (
            <motion.line
              key={b.id}
              x1={b.x1} y1={b.y1} x2={b.x2} y2={b.y2}
              stroke="hsl(275 85% 65%)"
              strokeWidth="1.5"
              strokeLinecap="round"
              opacity="0.35"
              animate={{
                opacity: [0.15, 0.55, 0.15],
                x2: [b.x2, b.x2 + (Math.random() > 0.5 ? 8 : -8), b.x2],
                y2: [b.y2, b.y2 + (Math.random() > 0.5 ? 8 : -8), b.y2],
              }}
              transition={{ duration: b.dur, repeat: Infinity, delay: b.delay, ease: "easeInOut" }}
            />
          ))}
        </g>

        {/* Scan beam */}
        <g clipPath="url(#portal-clip)">
          <motion.rect x="55" width="190" height="2" rx="1" fill="url(#scan-grad)"
            animate={{ y: [80, 320, 80] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
          <motion.rect x="55" width="190" height="14" rx="7" fill="hsl(185 90% 55%)" opacity="0.07"
            animate={{ y: [73, 313, 73] }}
            transition={{ duration: 4.5, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>

        {/* Central point */}
        <motion.circle
          cx="150" cy="200" r="4"
          fill="hsl(185 90% 65%)"
          animate={{ r: hovered ? [5, 7, 5] : [3, 5, 3], opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* Particles */}
        {particles.map((p) => (
          <motion.circle
            key={p.id}
            r={p.size}
            fill="hsl(275 85% 70%)"
            opacity="0.4"
            animate={{
              cx: [150 + p.startX, 150 + p.startX * 0.15, 150 + p.startX],
              cy: [200 + p.startY, 200 + p.startY * 0.08, 200 + p.startY],
              opacity: [0, 0.7, 0],
            }}
            transition={{ duration: p.dur, repeat: Infinity, delay: p.delay, ease: "easeInOut" }}
          />
        ))}
      </svg>

      {/* Bottom reflection */}
      <div
        className="absolute bottom-[-10%] left-[15%] right-[15%] h-[20%] pointer-events-none"
        style={{ background: "radial-gradient(ellipse at center top, hsl(275 85% 60%/0.15), transparent 70%)" }}
      />
    </motion.div>
  );
}
