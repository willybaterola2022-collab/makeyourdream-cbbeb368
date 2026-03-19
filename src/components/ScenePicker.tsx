import { motion } from "framer-motion";

export type SceneType = "studio" | "club" | "theater" | "arena";

interface Props {
  selected: SceneType;
  onChange: (scene: SceneType) => void;
}

const scenes: { id: SceneType; emoji: string; label: string }[] = [
  { id: "studio", emoji: "🎙️", label: "Estudio" },
  { id: "club", emoji: "🎪", label: "Club" },
  { id: "theater", emoji: "🎭", label: "Teatro" },
  { id: "arena", emoji: "🏟️", label: "Arena" },
];

export function ScenePicker({ selected, onChange }: Props) {
  return (
    <div className="flex items-center justify-center gap-3 md:gap-4">
      {scenes.map((s) => (
        <motion.button
          key={s.id}
          onClick={() => onChange(s.id)}
          whileTap={{ scale: 0.9 }}
          className={`flex flex-col items-center gap-1.5 p-3 md:p-4 rounded-2xl transition-all ${
            selected === s.id
              ? "glass-card border-primary/40 shadow-[0_0_20px_-5px_hsl(var(--primary)/0.3)]"
              : "opacity-50 hover:opacity-80"
          }`}
        >
          <span className="text-2xl md:text-3xl">{s.emoji}</span>
          <span className={`text-[10px] md:text-xs font-bold uppercase tracking-wider ${
            selected === s.id ? "neon-text" : "text-muted-foreground"
          }`}>
            {s.label}
          </span>
        </motion.button>
      ))}
    </div>
  );
}

export function getSceneGradient(scene: SceneType): string {
  switch (scene) {
    case "studio":
      return "radial-gradient(ellipse at 50% 0%, hsl(275 85% 15% / 0.4) 0%, hsl(0 0% 4%) 70%)";
    case "club":
      return "radial-gradient(ellipse at 50% 30%, hsl(275 85% 30% / 0.3) 0%, hsl(185 90% 20% / 0.15) 40%, hsl(0 0% 4%) 80%)";
    case "theater":
      return "radial-gradient(ellipse at 50% 0%, hsl(35 80% 30% / 0.25) 0%, hsl(275 40% 10% / 0.2) 50%, hsl(0 0% 4%) 80%)";
    case "arena":
      return "radial-gradient(ellipse at 50% 20%, hsl(275 85% 40% / 0.35) 0%, hsl(185 90% 30% / 0.2) 40%, hsl(0 0% 4%) 70%)";
  }
}
