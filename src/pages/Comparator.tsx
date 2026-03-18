import { motion } from "framer-motion";
import { GitCompareArrows, Play, TrendingUp, Calendar } from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { StaggerContainer, StaggerItem } from "@/components/layout/StaggerContainer";

const metrics = [
  { name: "Afinación", before: 58, after: 81, unit: "%" },
  { name: "Timing", before: 65, after: 79, unit: "%" },
  { name: "Control", before: 42, after: 68, unit: "%" },
  { name: "Vibrato", before: 30, after: 55, unit: "%" },
];

const recordings = [
  { date: "2026-01-15", song: "Bohemian Rhapsody", score: 62 },
  { date: "2026-02-10", song: "Bohemian Rhapsody", score: 74 },
  { date: "2026-03-05", song: "Bohemian Rhapsody", score: 81 },
];

const WaveformMock = ({ color, seed }: { color: string; seed: number }) => (
  <div className="flex items-center gap-px h-16">
    {Array.from({ length: 50 }).map((_, i) => {
      const h = 15 + Math.sin(i * 0.5 + seed) * 25 + Math.cos(i * 0.8 + seed * 2) * 15;
      return (
        <motion.div
          key={i}
          initial={{ height: 0 }}
          animate={{ height: `${Math.max(8, h)}%` }}
          transition={{ duration: 0.5, delay: i * 0.02 }}
          className={`w-1 rounded-full ${color}`}
        />
      );
    })}
  </div>
);

const Comparator = () => (
  <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
    <StaggerContainer>
      <StaggerItem>
        <div className="flex items-center gap-3 mb-2">
          <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center">
            <GitCompareArrows className="h-5 w-5 text-primary" />
          </div>
          <div>
            <h1 className="font-serif text-2xl md:text-3xl font-bold text-foreground">Before / After</h1>
            <p className="text-sm text-muted-foreground">Compara tu evolución vocal</p>
          </div>
        </div>
      </StaggerItem>

      {/* Recording selector */}
      <StaggerItem>
        <div className="flex flex-wrap gap-2">
          {recordings.map((r, i) => (
            <button key={r.date} className={`px-3 py-1.5 rounded-lg text-xs font-medium transition-all ${i === 0 ? "bg-muted-foreground/20 text-foreground" : i === recordings.length - 1 ? "bg-primary text-primary-foreground" : "bg-muted/50 text-muted-foreground"}`}>
              <Calendar className="h-3 w-3 inline mr-1" />
              {r.date} — Score {r.score}
            </button>
          ))}
        </div>
      </StaggerItem>

      {/* Split waveforms */}
      <StaggerItem>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Card className="bg-muted/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Badge variant="outline" className="text-[10px] bg-muted-foreground/10">ANTES</Badge>
                15 Enero 2026
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WaveformMock color="bg-muted-foreground/40" seed={1} />
              <div className="flex justify-between mt-3">
                <Button variant="ghost" size="sm" className="gap-1 text-xs"><Play className="h-3 w-3" />Reproducir</Button>
                <span className="text-sm font-bold text-muted-foreground">Score: 62</span>
              </div>
            </CardContent>
          </Card>

          <Card className="border-primary/20">
            <CardHeader className="pb-2">
              <CardTitle className="text-sm flex items-center gap-2">
                <Badge className="text-[10px] bg-primary/20 text-primary border-0">DESPUÉS</Badge>
                5 Marzo 2026
              </CardTitle>
            </CardHeader>
            <CardContent>
              <WaveformMock color="bg-primary" seed={3} />
              <div className="flex justify-between mt-3">
                <Button variant="ghost" size="sm" className="gap-1 text-xs"><Play className="h-3 w-3" />Reproducir</Button>
                <span className="text-sm font-bold text-primary">Score: 81</span>
              </div>
            </CardContent>
          </Card>
        </div>
      </StaggerItem>

      {/* Improvement badge */}
      <StaggerItem>
        <motion.div initial={{ scale: 0.9 }} animate={{ scale: 1 }} className="flex justify-center">
          <div className="inline-flex items-center gap-2 px-5 py-2.5 rounded-full bg-primary/10 border border-primary/20">
            <TrendingUp className="h-5 w-5 text-primary" />
            <span className="font-serif text-lg font-bold text-primary">Mejora: +23% en afinación</span>
          </div>
        </motion.div>
      </StaggerItem>

      {/* Metrics table */}
      <StaggerItem>
        <Card>
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Métricas comparativas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {metrics.map((m) => {
                const delta = m.after - m.before;
                return (
                  <div key={m.name} className="space-y-1.5">
                    <div className="flex justify-between text-sm">
                      <span className="text-foreground font-medium">{m.name}</span>
                      <span className="text-emerald-400 font-bold">+{delta}{m.unit}</span>
                    </div>
                    <div className="relative h-3 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.before}%` }}
                        transition={{ duration: 0.8 }}
                        className="absolute h-full rounded-full bg-muted-foreground/30"
                      />
                      <motion.div
                        initial={{ width: 0 }}
                        animate={{ width: `${m.after}%` }}
                        transition={{ duration: 1, delay: 0.3 }}
                        className="absolute h-full rounded-full bg-primary"
                      />
                    </div>
                    <div className="flex justify-between text-[10px] text-muted-foreground">
                      <span>Antes: {m.before}{m.unit}</span>
                      <span>Después: {m.after}{m.unit}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      </StaggerItem>
    </StaggerContainer>
  </div>
);

export default Comparator;
