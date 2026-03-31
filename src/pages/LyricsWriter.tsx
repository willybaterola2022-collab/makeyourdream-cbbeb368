import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { PenLine, Wand2, Mic, Timer, RotateCcw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

const STRUCTURES = ["Verso - Coro - Verso - Puente - Coro", "Verso - Pre-Coro - Coro - Verso - Coro - Outro", "Intro - Verso - Coro - Verso - Coro - Bridge - Coro"];

const SAMPLE_LYRICS = `[Verso 1]
Camino bajo la lluvia sin paraguas
Cada gota me recuerda lo que fuimos
Las calles vacías hablan de tu ausencia
Y el silencio grita todo lo que siento

[Coro]
Pero ya no duele como antes
Ya no quema como el primer día
Aprendí a bailar entre las lágrimas
Y encontré la luz en mi melancolía`;

export default function LyricsWriter() {
  const { user } = useAuth();

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "lyrics-writer" }); }, []);

  const [theme, setTheme] = useState("");
  const [structure, setStructure] = useState(STRUCTURES[0]);
  const [lyrics, setLyrics] = useState("");
  const [freestyleMode, setFreestyleMode] = useState(false);
  const [freestyleWord, setFreestyleWord] = useState("");
  const [timer, setTimer] = useState(10);

  const generateLyrics = () => {
    setLyrics(SAMPLE_LYRICS);
    toast.success("¡Letra generada por IA!");
  };

  const startFreestyle = () => {
    const words = ["amor", "fuego", "noche", "sueño", "tormenta", "libertad", "corazón", "silencio"];
    setFreestyleWord(words[Math.floor(Math.random() * words.length)]);
    setFreestyleMode(true);
    setTimer(10);
    const interval = setInterval(() => {
      setTimer((t) => {
        if (t <= 1) {
          clearInterval(interval);
          setFreestyleMode(false);
          toast.info("¡Tiempo! Fragmento grabado");
          return 10;
        }
        return t - 1;
      });
    }, 1000);
  };

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div>
        <h1 className="text-3xl md:text-4xl font-bold text-foreground">Lyrics Writer</h1>
        <p className="text-muted-foreground mt-1">Escribe letras con asistencia IA o improvisa en modo freestyle</p>
      </div>

      {/* Theme & Structure */}
      <Card className="p-5 bg-card border-border/40 space-y-4">
        <div>
          <label className="text-sm font-medium text-foreground mb-1 block">Tema de tu canción</label>
          <Input
            placeholder='Ej: "desamor en la lluvia", "fiesta de verano"'
            value={theme}
            onChange={(e) => setTheme(e.target.value)}
          />
        </div>
        <div>
          <label className="text-sm font-medium text-foreground mb-2 block">Estructura</label>
          <div className="flex flex-col gap-2">
            {STRUCTURES.map((s) => (
              <Button
                key={s}
                variant={structure === s ? "default" : "outline"}
                size="sm"
                className={`text-xs justify-start ${structure === s ? "stage-gradient text-primary-foreground" : ""}`}
                onClick={() => setStructure(s)}
              >
                {s}
              </Button>
            ))}
          </div>
        </div>
        <Button className="stage-gradient text-primary-foreground w-full" onClick={generateLyrics}>
          <Wand2 className="h-4 w-4 mr-2" />
          GENERAR LETRA CON IA
        </Button>
      </Card>

      {/* Editor */}
      {lyrics && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
          <Card className="p-5 bg-card border-border/40">
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-foreground flex items-center gap-2">
                <PenLine className="h-5 w-5 text-primary" />
                Tu letra
              </h2>
              <Button variant="ghost" size="sm" onClick={() => setLyrics("")}>
                <RotateCcw className="h-4 w-4 mr-1" />
                Limpiar
              </Button>
            </div>
            <Textarea
              value={lyrics}
              onChange={(e) => setLyrics(e.target.value)}
              rows={12}
              className="font-mono text-sm bg-background"
            />
          </Card>
        </motion.div>
      )}

      {/* Freestyle */}
      <Card className="p-5 bg-card border-primary/20">
        <h2 className="text-lg font-semibold text-foreground mb-2">🎤 Modo Freestyle</h2>
        <p className="text-sm text-muted-foreground mb-4">
          Te damos una palabra, tienes 10 segundos para improvisar. Se graba todo.
        </p>
        {freestyleMode ? (
          <div className="text-center space-y-4">
            <motion.p
              key={freestyleWord}
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-4xl font-bold text-primary uppercase"
            >
              {freestyleWord}
            </motion.p>
            <div className="flex items-center justify-center gap-2">
              <Timer className="h-5 w-5 text-destructive" />
              <span className="text-2xl font-bold text-destructive">{timer}s</span>
            </div>
          </div>
        ) : (
          <Button variant="outline" className="w-full" onClick={startFreestyle}>
            <Mic className="h-4 w-4 mr-2" />
            EMPEZAR FREESTYLE
          </Button>
        )}
      </Card>
    </div>
  );
}
