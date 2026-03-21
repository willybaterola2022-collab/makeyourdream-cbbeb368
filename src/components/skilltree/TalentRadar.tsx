import { motion } from "framer-motion";
import { useMemo } from "react";

interface TalentRadarProps {
  dimensions: { label: string; value: number; percentile?: number }[];
  vocalDNA: number;
}

const SIZE = 200;
const CENTER = SIZE / 2;
const RADIUS = 70;
const AXES = 6;

function polarToXY(angle: number, r: number) {
  const rad = (angle - 90) * (Math.PI / 180);
  return { x: CENTER + r * Math.cos(rad), y: CENTER + r * Math.sin(rad) };
}

export function TalentRadar({ dimensions, vocalDNA }: TalentRadarProps) {
  const angleStep = 360 / AXES;

  const gridRings = [0.25, 0.5, 0.75, 1];

  const points = useMemo(() => {
    return dimensions.map((d, i) => {
      const angle = i * angleStep;
      const r = (d.value / 100) * RADIUS;
      return polarToXY(angle, r);
    });
  }, [dimensions, angleStep]);

  const polygonPoints = points.map((p) => `${p.x},${p.y}`).join(" ");

  const topDimension = dimensions.reduce((best, d) => (d.value > best.value ? d : best), dimensions[0]);

  return (
    <div className="flex flex-col items-center gap-3">
      <div className="relative" style={{ width: SIZE, height: SIZE }}>
        <svg width={SIZE} height={SIZE} className="absolute inset-0">
          {/* Grid rings */}
          {gridRings.map((scale) => {
            const ringPts = Array.from({ length: AXES }, (_, i) => {
              const p = polarToXY(i * angleStep, RADIUS * scale);
              return `${p.x},${p.y}`;
            }).join(" ");
            return <polygon key={scale} points={ringPts} fill="none" stroke="rgba(255,255,255,0.06)" strokeWidth="1" />;
          })}

          {/* Axis lines */}
          {Array.from({ length: AXES }, (_, i) => {
            const end = polarToXY(i * angleStep, RADIUS);
            return <line key={i} x1={CENTER} y1={CENTER} x2={end.x} y2={end.y} stroke="rgba(255,255,255,0.08)" strokeWidth="1" />;
          })}

          {/* Data polygon */}
          <motion.polygon
            points={polygonPoints}
            fill="url(#radarGrad)"
            stroke="url(#radarStroke)"
            strokeWidth="2"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.8, ease: "easeOut" }}
            style={{ transformOrigin: `${CENTER}px ${CENTER}px` }}
          />

          {/* Gradient defs */}
          <defs>
            <linearGradient id="radarGrad" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF3CAC" stopOpacity="0.15" />
              <stop offset="50%" stopColor="#784BA0" stopOpacity="0.1" />
              <stop offset="100%" stopColor="#2B86C5" stopOpacity="0.15" />
            </linearGradient>
            <linearGradient id="radarStroke" x1="0%" y1="0%" x2="100%" y2="100%">
              <stop offset="0%" stopColor="#FF3CAC" />
              <stop offset="50%" stopColor="#784BA0" />
              <stop offset="100%" stopColor="#2B86C5" />
            </linearGradient>
          </defs>

          {/* Data points */}
          {points.map((p, i) => (
            <motion.circle
              key={i}
              cx={p.x}
              cy={p.y}
              r="4"
              fill="#FF3CAC"
              stroke="#fff"
              strokeWidth="1.5"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.3 + i * 0.08 }}
            />
          ))}
        </svg>

        {/* Labels */}
        {dimensions.map((d, i) => {
          const angle = i * angleStep;
          const pos = polarToXY(angle, RADIUS + 24);
          return (
            <div
              key={i}
              className="absolute text-center"
              style={{
                left: pos.x,
                top: pos.y,
                transform: "translate(-50%, -50%)",
              }}
            >
              <p className="text-[9px] font-bold text-white/70 leading-none">{d.label}</p>
              <p className="text-[8px] text-[#FF3CAC] font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                {d.value}
              </p>
            </div>
          );
        })}
      </div>

      {/* Vocal DNA score */}
      <div className="flex items-center gap-3 px-4 py-2.5 rounded-xl bg-white/5 border border-white/10">
        <span className="text-lg">🧬</span>
        <div>
          <p className="text-[10px] text-[#A0A0B0] uppercase tracking-widest">Vocal DNA</p>
          <p className="text-lg font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {vocalDNA}<span className="text-xs text-[#A0A0B0]">/100</span>
          </p>
        </div>
      </div>

      {/* Talent scout alert */}
      {topDimension.value >= 85 && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="px-4 py-3 rounded-xl border border-[#FFA502]/30 bg-[#FFA502]/5 text-center"
        >
          <p className="text-[10px] font-bold text-[#FFA502] uppercase tracking-widest mb-0.5">
            🔥 Talent Scout Alert
          </p>
          <p className="text-xs text-[#A0A0B0]">
            Tu <span className="text-white font-bold">{topDimension.label}</span> está en el{" "}
            <span className="text-[#FFA502] font-bold">TOP {topDimension.percentile ?? 5}%</span> — ¡podrías ser profesional!
          </p>
        </motion.div>
      )}
    </div>
  );
}
