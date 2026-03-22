import { motion } from "framer-motion";
import { VocalRadar } from "./VocalRadar";
import { Share2, Download } from "lucide-react";

interface LegendaryCardProps {
  username: string;
  classification: string;
  radarValues: number[];
  perfectTakes: number;
  vocalRange: string;
  celebrityMatch: { name: string; percent: number };
  vocalId: string;
  className?: string;
}

export function LegendaryCard({
  username,
  classification,
  radarValues,
  perfectTakes,
  vocalRange,
  celebrityMatch,
  vocalId,
  className,
}: LegendaryCardProps) {
  return (
    <div className={className}>
      <div
        className="relative rounded-3xl overflow-hidden"
        style={{
          background: "radial-gradient(ellipse at 50% 40%, hsl(40 40% 8% / 0.5), hsl(240 20% 4%))",
        }}
      >
        {/* Shimmer border */}
        <div className="absolute inset-0 rounded-3xl p-[1px]">
          <div className="shimmer-border absolute inset-0 rounded-3xl opacity-60" />
        </div>

        {/* Card content */}
        <div className="relative bg-card/80 backdrop-blur-2xl rounded-3xl m-[1px] p-6 space-y-6">
          {/* Header: Identity */}
          <div className="flex flex-col items-center text-center space-y-3">
            {/* Voice Avatar */}
            <motion.div
              className="w-32 h-32 rounded-full flex items-center justify-center"
              style={{
                background: "radial-gradient(circle, hsl(40 55% 58% / 0.3), hsl(40 55% 58% / 0.05))",
                boxShadow: "0 0 60px -10px hsl(40 55% 58% / 0.3)",
              }}
              animate={{ scale: [1, 1.02, 1] }}
              transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
            >
              <svg viewBox="0 0 64 64" className="w-16 h-16">
                <circle cx="32" cy="32" r="20" fill="none" stroke="hsl(40 55% 58%)" strokeWidth="1.5" opacity={0.6} />
                <circle cx="32" cy="32" r="12" fill="hsl(40 55% 58% / 0.3)" />
                <circle cx="32" cy="32" r="6" fill="hsl(40 55% 58%)" />
              </svg>
            </motion.div>

            {/* Badge */}
            <svg viewBox="0 0 20 20" className="w-5 h-5">
              <path
                d="M10 1L12.5 7L19 7.5L14 12L15.5 19L10 15.5L4.5 19L6 12L1 7.5L7.5 7Z"
                fill="hsl(40 55% 58%)"
                className="animate-pulse-amber"
              />
            </svg>

            <h3 className="font-display text-2xl text-primary">{username}</h3>
            <p className="text-sm text-accent">{classification}</p>
          </div>

          {/* Vocal Radar */}
          <div className="flex justify-center">
            <VocalRadar values={radarValues} size="full" />
          </div>

          {/* Identity data — NOT dashboard stats */}
          <div className="space-y-3">
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-primary" />
              <span className="font-mono text-sm text-primary">{perfectTakes} tomas perfectas</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-accent" />
              <span className="font-mono text-sm text-accent">{vocalRange}</span>
            </div>
            <div className="flex items-center gap-3">
              <div className="w-2 h-2 rounded-full bg-muted-foreground" />
              <span className="text-sm text-muted-foreground">
                Tu voz se acerca a <span className="text-primary">{celebrityMatch.name}</span>{" "}
                <span className="font-mono">({celebrityMatch.percent}%)</span>
              </span>
            </div>
          </div>

          {/* Footer: Vocal ID + Share */}
          <div className="pt-4 border-t border-border/30 flex items-center justify-between">
            <div>
              <p className="text-[10px] uppercase tracking-[0.2em] text-muted-foreground">Vocal ID</p>
              <p className="font-mono text-xs text-accent/80">{vocalId}</p>
            </div>
            <div className="flex gap-3">
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Share2 className="w-4 h-4" />
              </button>
              <button className="text-muted-foreground hover:text-primary transition-colors">
                <Download className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
