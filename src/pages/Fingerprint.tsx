import { TrendingUp } from "lucide-react";

const dimensions = [
  { name: "Afinación", value: 92 },
  { name: "Timing", value: 85 },
  { name: "Vibrato", value: 78 },
  { name: "Sustain", value: 88 },
  { name: "Control", value: 82 },
  { name: "Registro", value: 75 },
];

const weeklyData = [72, 75, 74, 78, 80, 83, 85];

const Fingerprint = () => {
  const numDims = dimensions.length;
  const cx = 120, cy = 120, maxR = 90;

  const getPoint = (index: number, value: number) => {
    const angle = (2 * Math.PI * index) / numDims - Math.PI / 2;
    const r = (value / 100) * maxR;
    return { x: cx + r * Math.cos(angle), y: cy + r * Math.sin(angle) };
  };

  const polygonPoints = dimensions
    .map((d, i) => {
      const p = getPoint(i, d.value);
      return `${p.x},${p.y}`;
    })
    .join(" ");

  const gridPolygon = (pct: number) =>
    Array.from({ length: numDims })
      .map((_, i) => {
        const p = getPoint(i, pct);
        return `${p.x},${p.y}`;
      })
      .join(" ");

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      <div>
        <h1 className="font-serif text-3xl font-semibold text-foreground">Vocal Fingerprint 6D</h1>
        <p className="text-muted-foreground text-sm mt-1">Tu identidad vocal única</p>
      </div>

      {/* Score card */}
      <div className="glass-card p-5 flex items-center justify-between">
        <div>
          <p className="text-[11px] text-muted-foreground uppercase tracking-widest">Score Global</p>
          <p className="text-4xl font-serif font-bold neon-text">83.3</p>
        </div>
        <div className="flex items-center gap-1 text-primary text-sm">
          <TrendingUp className="h-4 w-4" />
          <span className="font-medium">+5.2 esta semana</span>
        </div>
      </div>

      {/* Radar chart */}
      <div className="glass-card p-5 flex justify-center">
        <svg viewBox="0 0 240 240" className="w-full max-w-[300px]">
          {[25, 50, 75, 100].map((pct) => (
            <polygon
              key={pct}
              points={gridPolygon(pct)}
              fill="none"
              stroke="hsl(var(--border))"
              strokeWidth="0.5"
            />
          ))}
          {dimensions.map((_, i) => {
            const p = getPoint(i, 100);
            return (
              <line key={i} x1={cx} y1={cy} x2={p.x} y2={p.y} stroke="hsl(var(--border))" strokeWidth="0.5" />
            );
          })}
          <polygon
            points={polygonPoints}
            fill="hsl(var(--primary) / 0.15)"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
          />
          {dimensions.map((d, i) => {
            const p = getPoint(i, d.value);
            return <circle key={i} cx={p.x} cy={p.y} r="4" fill="hsl(var(--primary))" />;
          })}
          {dimensions.map((d, i) => {
            const p = getPoint(i, 115);
            return (
              <text
                key={i}
                x={p.x}
                y={p.y}
                textAnchor="middle"
                dominantBaseline="middle"
                className="fill-muted-foreground text-[8px]"
              >
                {d.name}
              </text>
            );
          })}
        </svg>
      </div>

      {/* Dimension breakdown */}
      <div className="space-y-3">
        {dimensions.map((d) => (
          <div key={d.name} className="glass-card p-3 flex items-center gap-3">
            <span className="text-sm text-muted-foreground w-20 shrink-0">{d.name}</span>
            <div className="flex-1 h-2 rounded-full bg-muted overflow-hidden">
              <div className="h-full rounded-full stage-gradient" style={{ width: `${d.value}%` }} />
            </div>
            <span className="text-sm font-medium text-foreground w-8 text-right">{d.value}</span>
          </div>
        ))}
      </div>

      {/* Weekly evolution */}
      <div className="glass-card p-5">
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Evolución semanal</h3>
        <div className="flex items-end gap-2 h-24">
          {weeklyData.map((v, i) => (
            <div key={i} className="flex-1 flex flex-col items-center gap-1">
              <div
                className="w-full rounded-t gold-gradient transition-all duration-500"
                style={{ height: `${((v - 60) / 40) * 100}%` }}
              />
              <span className="text-[9px] text-muted-foreground">
                {["L", "M", "X", "J", "V", "S", "D"][i]}
              </span>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Fingerprint;
