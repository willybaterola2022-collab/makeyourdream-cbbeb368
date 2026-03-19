import { useState } from "react";
import { motion } from "framer-motion";
import { Dumbbell, Lock, Star, Play, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";

interface Genre {
  id: string;
  name: string;
  emoji: string;
  exercises: string[];
  progress: number;
  badge: string;
  unlocked: boolean;
}

const GENRES: Genre[] = [
  { id: "pop", name: "Pop", emoji: "🎤", exercises: ["Belting", "Dinamismo", "Riffs ligeros"], progress: 68, badge: "Estrella Pop", unlocked: true },
  { id: "rnb", name: "R&B / Soul", emoji: "🎷", exercises: ["Melismas", "Runs", "Falsete con cuerpo"], progress: 42, badge: "Maestro del Soul", unlocked: true },
  { id: "rock", name: "Rock", emoji: "🎸", exercises: ["Growl", "Grit vocal", "Potencia"], progress: 25, badge: "Voz de Trueno", unlocked: true },
  { id: "jazz", name: "Jazz", emoji: "🎹", exercises: ["Scatting", "Vibrato lento", "Improvisación"], progress: 15, badge: "Voz de Jazz", unlocked: true },
  { id: "latin", name: "Bolero / Latino", emoji: "🌹", exercises: ["Vibrato clásico", "Portamento", "Expresividad"], progress: 0, badge: "Romántico Eterno", unlocked: false },
  { id: "indie", name: "Indie / Folk", emoji: "🍃", exercises: ["Falsete etéreo", "Breathy tone", "Dinámica suave"], progress: 0, badge: "Alma Indie", unlocked: false },
];

export default function GenreGym() {
  const [selected, setSelected] = useState<string | null>(null);
  const genre = GENRES.find((g) => g.id === selected);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Dumbbell className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Genre Gym</h1>
          <p className="text-muted-foreground mt-1">Entrena tu voz para cualquier género musical</p>
        </div>
      </div>

      {/* Genre Grid */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
        {GENRES.map((g, i) => (
          <motion.div
            key={g.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card
              className={`p-4 bg-card border-border/40 cursor-pointer transition-all hover:border-primary/40 ${
                !g.unlocked ? "opacity-50" : ""
              } ${selected === g.id ? "border-primary/60 ring-1 ring-primary/30" : ""}`}
              onClick={() => g.unlocked && setSelected(g.id)}
            >
              <div className="text-center">
                <span className="text-3xl">{g.emoji}</span>
                <p className="text-sm font-semibold text-foreground mt-2">{g.name}</p>
                {g.unlocked ? (
                  <Progress value={g.progress} className="h-1.5 mt-2" />
                ) : (
                  <Lock className="h-4 w-4 mx-auto mt-2 text-muted-foreground" />
                )}
                <p className="text-[10px] text-muted-foreground mt-1">{g.unlocked ? `${g.progress}%` : "Bloqueado"}</p>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Selected Genre Detail */}
      {genre && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card border-primary/20">
            <div className="flex items-center gap-3 mb-4">
              <span className="text-3xl">{genre.emoji}</span>
              <div>
                <h2 className="text-lg font-bold text-foreground">{genre.name}</h2>
                <p className="text-xs text-muted-foreground">🏅 Badge: {genre.badge}</p>
              </div>
            </div>

            <h3 className="text-sm font-semibold text-foreground mb-2">Ejercicios</h3>
            <div className="space-y-2">
              {genre.exercises.map((ex, i) => (
                <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-background">
                  <Play className="h-4 w-4 text-primary shrink-0" />
                  <span className="text-sm text-foreground flex-1">{ex}</span>
                  <Badge variant="outline" className="text-[10px]">3 min</Badge>
                </div>
              ))}
            </div>

            <Button className="stage-gradient text-primary-foreground w-full mt-4">
              <Dumbbell className="h-4 w-4 mr-2" />
              EMPEZAR ENTRENAMIENTO
            </Button>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
