import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { BookOpen, Play, Calendar, TrendingUp, Mic } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { useAuth } from "@/contexts/AuthContext";
import { trackEvent } from "@/lib/trackEvent";

interface JournalEntry {
  date: string;
  dayLabel: string;
  range: string;
  pitch: number;
  power: number;
  snippet: boolean;
}

const ENTRIES: JournalEntry[] = [
  { date: "2026-03-18", dayLabel: "Hoy", range: "A2 - E5", pitch: 88, power: 72, snippet: true },
  { date: "2026-03-17", dayLabel: "Ayer", range: "A2 - D5", pitch: 85, power: 70, snippet: true },
  { date: "2026-03-15", dayLabel: "Hace 3 días", range: "A2 - D5", pitch: 82, power: 68, snippet: true },
  { date: "2026-03-10", dayLabel: "Hace 8 días", range: "B2 - C#5", pitch: 78, power: 65, snippet: true },
  { date: "2026-02-18", dayLabel: "Hace 1 mes", range: "B2 - C5", pitch: 72, power: 60, snippet: true },
  { date: "2025-12-18", dayLabel: "Hace 3 meses", range: "C3 - B4", pitch: 65, power: 52, snippet: true },
];

const STATS = [
  { label: "Rango ganado", value: "+4 semitonos", trend: "up" },
  { label: "Afinación", value: "+23%", trend: "up" },
  { label: "Potencia", value: "+20%", trend: "up" },
  { label: "Días activos", value: "67 días", trend: "up" },
];

export default function VoiceJournal() {
  const { user } = useAuth();

  useEffect(() => { trackEvent(user?.id, "page_view", { page: "voice-journal" }); }, []);

  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <BookOpen className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Voice Journal</h1>
          <p className="text-muted-foreground mt-1">El time-lapse de tu transformación vocal</p>
        </div>
      </div>

      {/* Record Today */}
      <Card className="p-5 bg-card border-primary/20 text-center">
        <p className="text-sm text-muted-foreground mb-3">Graba el snippet de hoy</p>
        <Button className="stage-gradient text-primary-foreground">
          <Mic className="h-4 w-4 mr-2" />
          GRABAR HOY
        </Button>
      </Card>

      {/* Evolution Stats */}
      <div className="grid grid-cols-2 gap-3">
        {STATS.map((s, i) => (
          <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
            <Card className="p-3 bg-card border-border/40 text-center">
              <p className="text-xs text-muted-foreground">{s.label}</p>
              <p className="text-lg font-bold text-primary mt-1">{s.value}</p>
              <TrendingUp className="h-3 w-3 text-emerald-500 mx-auto mt-1" />
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Timeline */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3 flex items-center gap-2">
          <Calendar className="h-5 w-5 text-primary" />
          Timeline vocal
        </h2>

        <div className="relative">
          {/* Vertical line */}
          <div className="absolute left-4 top-0 bottom-0 w-px bg-border/60" />

          <div className="space-y-4">
            {ENTRIES.map((entry, i) => (
              <motion.div
                key={entry.date}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
                className="relative pl-10"
              >
                {/* Dot */}
                <div className={`absolute left-2.5 top-3 h-3 w-3 rounded-full ${i === 0 ? "bg-primary" : "bg-muted-foreground/40"}`} />

                <Card className={`p-4 bg-card border-border/40 ${i === 0 ? "border-primary/30" : ""}`}>
                  <div className="flex items-center justify-between mb-2">
                    <div>
                      <span className="text-sm font-semibold text-foreground">{entry.dayLabel}</span>
                      <span className="text-xs text-muted-foreground ml-2">{entry.date}</span>
                    </div>
                    <Button variant="ghost" size="icon" className="h-7 w-7">
                      <Play className="h-3 w-3" />
                    </Button>
                  </div>
                  <div className="flex items-center gap-4 text-xs">
                    <Badge variant="outline" className="text-[10px]">{entry.range}</Badge>
                    <span className="text-muted-foreground">🎯 {entry.pitch}%</span>
                    <span className="text-muted-foreground">💪 {entry.power}%</span>
                  </div>
                  {/* Mini waveform */}
                  <div className="flex items-end gap-[1px] h-5 mt-2">
                    {Array.from({ length: 40 }).map((_, j) => (
                      <div
                        key={j}
                        className="flex-1 rounded-sm bg-primary"
                        style={{ height: `${15 + Math.random() * 85}%`, opacity: i === 0 ? 0.6 : 0.25 }}
                      />
                    ))}
                  </div>
                </Card>
              </motion.div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
