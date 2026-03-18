import { useState } from "react";
import { motion } from "framer-motion";
import { Mic, Users, Volume2, Timer, Star, Trophy } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "sonner";

interface Venue {
  id: string;
  name: string;
  emoji: string;
  capacity: number;
  difficulty: string;
  unlocked: boolean;
}

const VENUES: Venue[] = [
  { id: "room", name: "Sala Íntima", emoji: "🏠", capacity: 50, difficulty: "Fácil", unlocked: true },
  { id: "bar", name: "Bar en Vivo", emoji: "🍸", capacity: 200, difficulty: "Normal", unlocked: true },
  { id: "theater", name: "Teatro", emoji: "🎭", capacity: 1000, difficulty: "Difícil", unlocked: true },
  { id: "stadium", name: "Estadio", emoji: "🏟️", capacity: 50000, difficulty: "Extremo", unlocked: false },
];

export default function StageSimulator() {
  const [selected, setSelected] = useState<string | null>(null);
  const [performing, setPerforming] = useState(false);
  const [score, setScore] = useState(0);
  const [crowdMood, setCrowdMood] = useState(50);

  const venue = VENUES.find((v) => v.id === selected);

  const startPerformance = () => {
    setPerforming(true);
    setScore(0);
    setCrowdMood(50);

    // Simulate crowd reactions
    const interval = setInterval(() => {
      setCrowdMood((m) => Math.min(100, m + Math.floor(Math.random() * 10 - 3)));
      setScore((s) => s + Math.floor(Math.random() * 15));
    }, 1500);

    setTimeout(() => {
      clearInterval(interval);
      setPerforming(false);
      toast.success("🎉 ¡Presentación terminada!");
    }, 12000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Stage Simulator</h1>
        <p className="text-muted-foreground mt-1">Prepárate para cantar en público. Simulación inmersiva.</p>
      </div>

      {/* Venue Selection */}
      <div className="grid grid-cols-2 gap-3">
        {VENUES.map((v) => (
          <Card
            key={v.id}
            className={`p-4 bg-card border-border/40 cursor-pointer transition-all text-center ${
              !v.unlocked ? "opacity-40" : "hover:border-primary/40"
            } ${selected === v.id ? "border-primary/60 ring-1 ring-primary/30" : ""}`}
            onClick={() => v.unlocked && setSelected(v.id)}
          >
            <span className="text-3xl">{v.emoji}</span>
            <p className="text-sm font-semibold text-foreground mt-2">{v.name}</p>
            <p className="text-xs text-muted-foreground">{v.capacity.toLocaleString()} personas</p>
            <Badge variant="outline" className="text-[10px] mt-1">{v.difficulty}</Badge>
          </Card>
        ))}
      </div>

      {/* Performance */}
      {venue && !performing && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <Card className="p-5 bg-card border-primary/20 text-center">
            <p className="text-3xl mb-2">{venue.emoji}</p>
            <h2 className="text-xl font-bold text-foreground">{venue.name}</h2>
            <p className="text-sm text-muted-foreground mb-4">
              {venue.capacity.toLocaleString()} personas esperando. ¿Estás listo?
            </p>
            <Button className="gold-gradient text-primary-foreground text-lg px-8 py-6" size="lg" onClick={startPerformance}>
              <Mic className="h-5 w-5 mr-2" />
              SUBIR AL ESCENARIO
            </Button>
          </Card>
        </motion.div>
      )}

      {/* Live Performance */}
      {performing && (
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} className="space-y-4">
          <Card className="p-5 bg-card border-primary/20">
            <div className="flex items-center justify-between mb-3">
              <Badge className="gold-gradient text-primary-foreground animate-pulse">EN VIVO</Badge>
              <div className="flex items-center gap-2">
                <Star className="h-4 w-4 text-primary" />
                <span className="text-lg font-bold text-primary">{score}</span>
              </div>
            </div>

            {/* Crowd mood */}
            <div className="mb-3">
              <div className="flex justify-between text-xs text-muted-foreground mb-1">
                <span>Público</span>
                <span>{crowdMood > 70 ? "🔥 ¡Eufóricos!" : crowdMood > 40 ? "👏 Atentos" : "😐 Tibios"}</span>
              </div>
              <Progress value={crowdMood} className="h-3" />
            </div>

            {/* Simulated audience noise */}
            <div className="text-center py-4">
              <motion.p
                animate={{ opacity: [0.5, 1, 0.5] }}
                transition={{ repeat: Infinity, duration: 2 }}
                className="text-2xl"
              >
                {crowdMood > 70 ? "👏👏👏🔥" : crowdMood > 40 ? "👏👏" : "..."}
              </motion.p>
            </div>
          </Card>
        </motion.div>
      )}
    </div>
  );
}
