import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Mic, MicOff, Plus, MessageSquare } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { toast } from "sonner";
import { StudioRoom } from "@/components/studio/StudioRoom";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

export default function CollabRoom() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [rooms, setRooms] = useState<any[]>([]);
  const [activeRoom, setActiveRoom] = useState<any | null>(null);
  const [chatMsg, setChatMsg] = useState("");

  useEffect(() => {
    supabase
      .from("collab_rooms")
      .select("*")
      .eq("status", "open")
      .order("created_at", { ascending: false })
      .limit(10)
      .then(({ data }) => setRooms(data ?? []));
  }, []);

  const createRoom = async () => {
    if (!user) { navigate("/login"); return; }
    const { data, error } = await supabase.from("collab_rooms").insert([{
      creator_id: user.id,
      title: `Sala de ${user.email?.split("@")[0] || "Artista"}`,
      status: "open",
    }]).select().single();
    if (data) {
      setRooms((prev) => [data, ...prev]);
      setActiveRoom(data);
      toast.success("¡Sala creada!");
    }
  };

  return (
    <StudioRoom
      roomId="collab"
      heroContent={
        <motion.div className="flex flex-col items-center z-10"
          initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}>
          <div className="relative w-48 h-48 md:w-60 md:h-60">
            <div className="absolute inset-6 rounded-full border-2 border-border/40 bg-card/30 backdrop-blur-sm" />
            <motion.div className="absolute inset-0 flex items-center justify-center text-6xl"
              animate={{ scale: [1, 1.05, 1] }}
              transition={{ duration: 2, repeat: Infinity }}>
              🎙️
            </motion.div>
          </div>
          <Badge className="mt-2 stage-gradient text-primary-foreground">{rooms.length} salas abiertas</Badge>
        </motion.div>
      }
    >
      {/* Create room */}
      <StageButton variant="primary" icon={<Plus className="h-5 w-5" />} onClick={createRoom} className="w-full">
        CREAR SALA
      </StageButton>

      {/* Room list */}
      <div className="space-y-2">
        <span className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Salas abiertas</span>
        {rooms.map((room, i) => (
          <motion.div
            key={room.id}
            initial={{ opacity: 0, x: -10 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: i * 0.08 }}
            className={`glass-card p-4 flex items-center justify-between cursor-pointer hover:border-primary/30 transition-all ${activeRoom?.id === room.id ? "border-primary/40" : ""}`}
            onClick={() => setActiveRoom(room)}
          >
            <div>
              <p className="text-sm font-bold text-foreground">{room.title}</p>
              <p className="text-[10px] text-muted-foreground">
                {((room.participants as any[])?.length ?? 0)}/{room.max_participants} participantes
              </p>
            </div>
            <Badge variant="outline" className="text-[10px]">
              {room.status === "open" ? "Abierta" : "Cerrada"}
            </Badge>
          </motion.div>
        ))}
        {rooms.length === 0 && (
          <p className="text-center text-sm text-muted-foreground py-4">No hay salas. ¡Crea una!</p>
        )}
      </div>

      {/* Chat (basic) */}
      {activeRoom && (
        <div className="glass-card p-4 rounded-2xl">
          <span className="text-xs font-bold text-foreground flex items-center gap-2 mb-3">
            <MessageSquare className="h-4 w-4 text-primary" /> Chat — {activeRoom.title}
          </span>
          <div className="space-y-1 mb-3 max-h-24 overflow-y-auto">
            <p className="text-xs text-muted-foreground italic">Chat en tiempo real próximamente...</p>
          </div>
          <div className="flex gap-2">
            <Input placeholder="Escribe..." value={chatMsg} onChange={(e) => setChatMsg(e.target.value)} className="text-sm" />
            <StageButton variant="lever" onClick={() => { setChatMsg(""); toast.success("Enviado"); }}>
              Enviar
            </StageButton>
          </div>
        </div>
      )}
    </StudioRoom>
  );
}
