import { motion } from "framer-motion";
import { Radar, Star, MessageCircle, Music, ExternalLink } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";

interface Match {
  name: string;
  initials: string;
  type: "listener" | "producer";
  compatibility: number;
  genre: string;
  looking: string;
}

const MATCHES: Match[] = [
  { name: "Carlos Méndez", initials: "CM", type: "producer", compatibility: 94, genre: "R&B / Soul", looking: "Voz femenina para single" },
  { name: "Ana Torres", initials: "AT", type: "listener", compatibility: 88, genre: "Pop Latino", looking: "Artista para playlist" },
  { name: "DJ Neon", initials: "DN", type: "producer", compatibility: 82, genre: "Electropop", looking: "Vocal para remix" },
  { name: "María López", initials: "ML", type: "listener", compatibility: 79, genre: "Indie", looking: "Descubrir nuevas voces" },
];

export default function FanRadar() {
  return (
    <div className="p-4 md:p-8 space-y-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3">
        <Radar className="h-8 w-8 text-primary" />
        <div>
          <h1 className="text-3xl md:text-4xl font-bold text-foreground">Fan Radar</h1>
          <p className="text-muted-foreground mt-1">Conecta con oyentes y productores que buscan tu tipo de voz</p>
        </div>
      </div>

      {/* My Vocal Profile Summary */}
      <Card className="p-5 bg-card border-primary/20">
        <p className="text-sm text-muted-foreground mb-2">Tu perfil vocal atrae a:</p>
        <div className="flex gap-2 flex-wrap">
          <Badge className="stage-gradient text-primary-foreground">R&B</Badge>
          <Badge variant="outline">Soul</Badge>
          <Badge variant="outline">Pop Latino</Badge>
          <Badge variant="outline">Ballad</Badge>
        </div>
        <p className="text-xs text-muted-foreground mt-3">
          Basado en tu Vocal Fingerprint: rango alto, timbre cálido, vibrato natural
        </p>
      </Card>

      {/* Matches */}
      <div>
        <h2 className="text-lg font-semibold text-foreground mb-3">🎯 Matches para ti</h2>
        <div className="space-y-3">
          {MATCHES.map((m, i) => (
            <motion.div key={i} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.1 }}>
              <Card className="p-4 bg-card border-border/40">
                <div className="flex items-start gap-3">
                  <Avatar className="h-10 w-10">
                    <AvatarFallback className="bg-primary/20 text-primary text-xs font-semibold">{m.initials}</AvatarFallback>
                  </Avatar>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <p className="text-sm font-semibold text-foreground">{m.name}</p>
                      <Badge variant="outline" className="text-[10px]">
                        {m.type === "producer" ? "🎚️ Productor" : "🎧 Oyente"}
                      </Badge>
                    </div>
                    <p className="text-xs text-muted-foreground mt-1">{m.genre} · {m.looking}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-lg font-bold text-primary">{m.compatibility}%</p>
                    <p className="text-[10px] text-muted-foreground">match</p>
                  </div>
                </div>
                <div className="flex gap-2 mt-3">
                  <Button size="sm" variant="outline" className="flex-1" onClick={() => toast.info("Mensaje enviado")}>
                    <MessageCircle className="h-3 w-3 mr-1" /> Contactar
                  </Button>
                  <Button size="sm" variant="outline" onClick={() => toast.info("Perfil abierto")}>
                    <ExternalLink className="h-3 w-3" />
                  </Button>
                </div>
              </Card>
            </motion.div>
          ))}
        </div>
      </div>
    </div>
  );
}
