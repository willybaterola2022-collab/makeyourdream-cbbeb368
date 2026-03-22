import { useMemo } from "react";

interface VocalRadarProps {
  /** Values 0–100 for each axis: [Afinación, Ritmo, Vibrato, Sustain, Control, Rango] */
  values?: number[];
  size?: "mini" | "full";
  className?: string;
}

const LABELS = ["Afinación", "Ritmo", "Vibrato", "Sustain", "Control", "Rango"];
const ANGLES = LABELS.map((_, i) => (Math.PI * 2 * i) / 6 - Math.PI / 2);

function polarToXY(angle: number, radius: number, cx: number, cy: number) {
  return { x: cx + radius * Math.cos(angle), y: cy + radius * Math.sin(angle) };
}

export function VocalRadar({ values = [0, 0, 0, 0, 0, 0], size = "full", className }: VocalRadarProps) {
  const dim = size === "mini" ? 80 : 200;
  const cx = dim / 2;
  const cy = dim / 2;
  const maxR = dim * 0.4;

  const dataPath = useMemo(() => {
    const points = ANGLES.map((a, i) => {
      const r = (Math.min(values[i] ?? 0, 100) / 100) * maxR;
      return polarToXY(a, r, cx, cy);
    });
    return points.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
  }, [values, maxR, cx, cy]);

  const gridLevels = [0.25, 0.5, 0.75, 1];

  return (
    <svg width={dim} height={dim} viewBox={`0 0 ${dim} ${dim}`} className={className}>
      {/* Grid hexagons */}
      {gridLevels.map((level) => {
        const pts = ANGLES.map((a) => polarToXY(a, maxR * level, cx, cy));
        const d = pts.map((p, i) => `${i === 0 ? "M" : "L"}${p.x},${p.y}`).join(" ") + "Z";
        return <path key={level} d={d} fill="none" stroke="hsl(240 6% 56% / 0.15)" strokeWidth={0.5} />;
      })}

      {/* Axis lines */}
      {ANGLES.map((a, i) => {
        const end = polarToXY(a, maxR, cx, cy);
        return <line key={i} x1={cx} y1={cy} x2={end.x} y2={end.y} stroke="hsl(240 6% 56% / 0.15)" strokeWidth={0.5} />;
      })}

      {/* Data area */}
      <path d={dataPath} fill="hsl(40 55% 58% / 0.25)" stroke="hsl(40 55% 58%)" strokeWidth={1.5} />

      {/* Data points */}
      {ANGLES.map((a, i) => {
        const r = (Math.min(values[i] ?? 0, 100) / 100) * maxR;
        const p = polarToXY(a, r, cx, cy);
        return <circle key={i} cx={p.x} cy={p.y} r={size === "mini" ? 1.5 : 3} fill="hsl(40 55% 58%)" />;
      })}

      {/* Labels (only on full size) */}
      {size === "full" &&
        ANGLES.map((a, i) => {
          const p = polarToXY(a, maxR + 18, cx, cy);
          return (
            <text
              key={i}
              x={p.x}
              y={p.y}
              textAnchor="middle"
              dominantBaseline="central"
              fill="hsl(240 6% 56%)"
              fontSize={10}
              fontFamily="Inter, sans-serif"
            >
              {LABELS[i]}
            </text>
          );
        })}
    </svg>
  );
}
