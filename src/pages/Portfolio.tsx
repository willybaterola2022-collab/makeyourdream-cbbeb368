import { Award, Users, Heart, Trophy, TrendingUp } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";

const badges = [
  { name: "Gold Voice", emoji: "🏆", earned: true },
  { name: "Streak Master", emoji: "🔥", earned: true },
  { name: "Rising Star", emoji: "⭐", earned: true },
  { name: "Perfect Pitch", emoji: "🎯", earned: false },
  { name: "Duet Legend", emoji: "👥", earned: false },
];

const performances = [
  { song: "Bésame Mucho", score: 96.4, date: "Hace 2 días" },
  { song: "Bohemian Rhapsody", score: 92.1, date: "Hace 5 días" },
  { song: "Shallow", score: 94.7, date: "Hace 1 semana" },
  { song: "Someone Like You", score: 91.3, date: "Hace 2 semanas" },
];

const evolutionData = [65, 68, 72, 70, 75, 78, 80, 83, 85, 88, 86, 91];

const Portfolio = () => {
  const maxEvo = Math.max(...evolutionData);
  const minEvo = Math.min(...evolutionData);

  const pathPoints = evolutionData
    .map((v, i) => {
      const x = (i / (evolutionData.length - 1)) * 280 + 10;
      const y = 80 - ((v - minEvo) / (maxEvo - minEvo)) * 60;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <div className="p-4 md:p-8 space-y-6 animate-fade-in">
      {/* Profile header */}
      <div className="glass-card p-6 text-center">
        <Avatar className="h-20 w-20 mx-auto mb-3">
          <AvatarFallback className="bg-primary/20 text-primary text-2xl font-serif font-bold">
            MK
          </AvatarFallback>
        </Avatar>
        <h1 className="font-serif text-2xl font-bold text-foreground">MakeYourDream Artist</h1>
        <p className="text-sm text-muted-foreground mt-1">Mezzosoprano Lírica · Bogotá</p>

        <div className="flex justify-center gap-6 mt-4">
          {[
            { label: "Seguidores", value: "1.2K", icon: Users },
            { label: "Votos", value: "847", icon: Heart },
            { label: "Liga", value: "Gold", icon: Trophy },
          ].map((s) => (
            <div key={s.label} className="text-center">
              <p className="text-lg font-serif font-bold gold-text">{s.value}</p>
              <p className="text-[10px] text-muted-foreground uppercase tracking-wider">{s.label}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Badges */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Badges</h3>
        <div className="flex gap-3 overflow-x-auto pb-2">
          {badges.map((b) => (
            <div
              key={b.name}
              className={`glass-card p-3 min-w-[80px] text-center shrink-0 ${
                b.earned ? "border-primary/20" : "opacity-40"
              }`}
            >
              <div className="text-2xl mb-1">{b.emoji}</div>
              <p className="text-[10px] text-muted-foreground">{b.name}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Best performances */}
      <div>
        <h3 className="font-serif text-lg font-semibold text-foreground mb-3">Mejores performances</h3>
        <div className="space-y-2">
          {performances.map((p, i) => (
            <div key={p.song} className="glass-card-hover p-4 flex items-center gap-3">
              <div className={`h-8 w-8 rounded-full flex items-center justify-center shrink-0 ${
                i === 0 ? "gold-gradient" : "bg-muted"
              }`}>
                <span className={`text-xs font-bold ${
                  i === 0 ? "text-primary-foreground" : "text-muted-foreground"
                }`}>
                  {i + 1}
                </span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-medium text-foreground truncate">{p.song}</p>
                <p className="text-[10px] text-muted-foreground">{p.date}</p>
              </div>
              <span className={`text-lg font-serif font-bold ${i === 0 ? "gold-text" : "text-foreground"}`}>
                {p.score}
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Evolution graph */}
      <div className="glass-card p-5">
        <div className="flex items-center gap-2 mb-3">
          <TrendingUp className="h-4 w-4 text-primary" />
          <h3 className="font-serif text-lg font-semibold text-foreground">Evolución</h3>
        </div>
        <svg viewBox="0 0 300 100" className="w-full">
          <defs>
            <linearGradient id="evoGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="0%" stopColor="hsl(var(--primary))" stopOpacity="0.3" />
              <stop offset="100%" stopColor="hsl(var(--primary))" stopOpacity="0" />
            </linearGradient>
          </defs>
          <polygon
            points={`10,90 ${pathPoints} 290,90`}
            fill="url(#evoGrad)"
          />
          <polyline
            points={pathPoints}
            fill="none"
            stroke="hsl(var(--primary))"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          {evolutionData.map((v, i) => {
            const x = (i / (evolutionData.length - 1)) * 280 + 10;
            const y = 80 - ((v - minEvo) / (maxEvo - minEvo)) * 60;
            return i === evolutionData.length - 1 ? (
              <circle key={i} cx={x} cy={y} r="4" fill="hsl(var(--primary))" />
            ) : null;
          })}
          <text x="10" y="96" className="fill-muted-foreground text-[7px]">Ene</text>
          <text x="280" y="96" className="fill-muted-foreground text-[7px]">Dic</text>
        </svg>
      </div>
    </div>
  );
};

export default Portfolio;
