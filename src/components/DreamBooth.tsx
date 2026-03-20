import { useState, useMemo } from "react";
import { motion } from "framer-motion";

interface DreamBoothProps {
  onClick?: () => void;
}

/* ── helpers ── */
function makeParticles(count: number) {
  return Array.from({ length: count }, (_, i) => ({
    id: i,
    startX: (Math.random() - 0.5) * 280,
    startY: (Math.random() - 0.5) * 360,
    dur: 4 + Math.random() * 5,
    delay: Math.random() * 4,
    size: 1 + Math.random() * 2.5,
  }));
}

function makeFreqBars(count: number) {
  return Array.from({ length: count }, (_, i) => {
    const angle = -90 + (180 / (count - 1)) * i; // semicircle -90→90
    const rad = (angle * Math.PI) / 180;
    const cx = 150; // center of 300-wide SVG
    const cy = 200;
    const innerR = 70;
    const maxLen = 18 + Math.random() * 22;
    return {
      id: i,
      x1: cx + Math.cos(rad) * innerR,
      y1: cy + Math.sin(rad) * innerR,
      x2: cx + Math.cos(rad) * (innerR + maxLen),
      y2: cy + Math.sin(rad) * (innerR + maxLen),
      dur: 1.5 + Math.random() * 2,
      delay: Math.random() * 2,
    };
  });
}

export default function DreamBooth({ onClick }: DreamBoothProps) {
  const [hovered, setHovered] = useState(false);
  const particles = useMemo(() => makeParticles(18), []);
  const bars = useMemo(() => makeFreqBars(24), []);

  return (
    <motion.div
      className="relative cursor-pointer select-none"
      style={{ width: "min(85vw, 380px)", aspectRatio: "3/4" }}
      onHoverStart={() => setHovered(true)}
      onHoverEnd={() => setHovered(false)}
      onClick={onClick}
      whileTap={{ scale: 0.97 }}
    >
      {/* ── Double halo (outer glow) ── */}
      <motion.div
        className="absolute inset-0 rounded-[50%] pointer-events-none"
        animate={{
          boxShadow: hovered
            ? "0 0 120px 30px hsl(275 85% 60%/0.35), 0 0 120px 30px hsl(185 90% 55%/0.25)"
            : "0 0 80px 20px hsl(275 85% 60%/0.2), 0 0 80px 20px hsl(185 90% 55%/0.12)",
        }}
        transition={{ duration: 1.2, ease: "easeInOut" }}
      />

      {/* ── Breathing halo ring ── */}
      <motion.div
        className="absolute inset-[-8%] rounded-[50%] pointer-events-none"
        style={{
          border: "1px solid hsl(275 85% 60%/0.15)",
        }}
        animate={{ scale: [1, 1.04, 1], opacity: [0.4, 0.7, 0.4] }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <svg
        viewBox="0 0 300 400"
        className="w-full h-full"
        style={{ filter: "drop-shadow(0 0 40px hsl(275 85% 60%/0.25))" }}
      >
        <defs>
          {/* Portal border gradient */}
          <linearGradient id="portal-border" x1="0" y1="0" x2="1" y2="1">
            <stop offset="0%" stopColor="hsl(275 85% 60%)" stopOpacity="0.9" />
            <stop offset="50%" stopColor="hsl(230 70% 50%)" stopOpacity="0.5" />
            <stop offset="100%" stopColor="hsl(185 90% 55%)" stopOpacity="0.9" />
          </linearGradient>

          {/* Inner fog */}
          <radialGradient id="inner-fog" cx="50%" cy="45%">
            <stop offset="0%" stopColor="hsl(275 60% 20%)" stopOpacity="0.3" />
            <stop offset="50%" stopColor="hsl(240 30% 8%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(0 0% 4%)" stopOpacity="0.95" />
          </radialGradient>

          {/* Scan beam gradient */}
          <linearGradient id="scan-grad" x1="0" y1="0" x2="1" y2="0">
            <stop offset="0%" stopColor="hsl(185 90% 55%)" stopOpacity="0" />
            <stop offset="30%" stopColor="hsl(185 90% 55%)" stopOpacity="0.6" />
            <stop offset="50%" stopColor="hsl(185 90% 75%)" stopOpacity="0.9" />
            <stop offset="70%" stopColor="hsl(185 90% 55%)" stopOpacity="0.6" />
            <stop offset="100%" stopColor="hsl(185 90% 55%)" stopOpacity="0" />
          </linearGradient>

          {/* Clip for portal interior */}
          <clipPath id="portal-clip">
            <ellipse cx="150" cy="200" rx="95" ry="145" />
          </clipPath>
        </defs>

        {/* ── Portal body (dark interior) ── */}
        <ellipse cx="150" cy="200" rx="95" ry="145" fill="url(#inner-fog)" />

        {/* ── Portal border ── */}
        <ellipse
          cx="150" cy="200" rx="95" ry="145"
          fill="none"
          stroke="url(#portal-border)"
          strokeWidth="2.5"
          opacity="0.85"
        />

        {/* ── Second thinner ring ── */}
        <ellipse
          cx="150" cy="200" rx="102" ry="152"
          fill="none"
          stroke="url(#portal-border)"
          strokeWidth="0.5"
          opacity="0.3"
        />

        {/* ── Frequency bars (radial, inside portal) ── */}
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
                opacity: [0.15, 0.5, 0.15],
                x2: [b.x2, b.x2 + (Math.random() > 0.5 ? 6 : -6), b.x2],
                y2: [b.y2, b.y2 + (Math.random() > 0.5 ? 6 : -6), b.y2],
              }}
              transition={{
                duration: b.dur,
                repeat: Infinity,
                delay: b.delay,
                ease: "easeInOut",
              }}
            />
          ))}
        </g>

        {/* ── Scan beam ── */}
        <g clipPath="url(#portal-clip)">
          <motion.rect
            x="55" width="190" height="2" rx="1"
            fill="url(#scan-grad)"
            animate={{ y: [80, 320, 80] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
          {/* Soft glow behind scan line */}
          <motion.rect
            x="55" width="190" height="12" rx="6"
            fill="hsl(185 90% 55%)"
            opacity="0.06"
            animate={{ y: [74, 314, 74] }}
            transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
          />
        </g>

        {/* ── Central waiting point ── */}
        <motion.circle
          cx="150" cy="200" r="4"
          fill="hsl(185 90% 65%)"
          animate={{
            r: hovered ? [5, 7, 5] : [3, 5, 3],
            opacity: [0.5, 1, 0.5],
          }}
          transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
        />

        {/* ── Particles converging toward center ── */}
        {particles.map((p) => (
          <motion.circle
            key={p.id}
            r={p.size}
            fill="hsl(275 85% 70%)"
            opacity="0.4"
            animate={{
              cx: [150 + p.startX, 150 + p.startX * 0.2, 150 + p.startX],
              cy: [200 + p.startY, 200 + p.startY * 0.1, 200 + p.startY],
              opacity: [0, 0.6, 0],
            }}
            transition={{
              duration: p.dur,
              repeat: Infinity,
              delay: p.delay,
              ease: "easeInOut",
            }}
          />
        ))}
      </svg>

      {/* ── Bottom reflection ── */}
      <div
        className="absolute bottom-[-10%] left-[15%] right-[15%] h-[20%] pointer-events-none"
        style={{
          background: "radial-gradient(ellipse at center top, hsl(275 85% 60%/0.12), transparent 70%)",
        }}
      />
    </motion.div>
  );
}
