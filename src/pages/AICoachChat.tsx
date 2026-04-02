import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { BrainCircuit, Send, Play, ArrowLeft, Loader2, LogIn } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { StageButton } from "@/components/ui/StageButton";

interface Message {
  role: "user" | "assistant";
  content: string;
  exercises?: Exercise[];
}

interface Exercise {
  name: string;
  duration: number;
  description: string;
}

const QUICK_PROMPTS = [
  "Como mejorar mi afinación?",
  "Qué ejercicio me recomiendas hoy?",
  "Analiza mi progreso semanal",
  "Tips para cantar notas altas",
];

const AICoachChat = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [loading, setLoading] = useState(false);
  const [initialLoaded, setInitialLoaded] = useState(false);
  const scrollRef = useRef<HTMLDivElement>(null);

  // Load initial coach data as first message
  useEffect(() => {
    if (!user || initialLoaded) return;
    trackEvent(user.id, "module_visited", { module: "ai-coach-chat" });

    supabase.functions.invoke("ai-coach-feedback", {
      body: { user_id: user.id },
    }).then(({ data }) => {
      if (!data) return;
      const obs = data.observations || [];
      const metrics = data.metrics || [];
      const exercise = data.recommended_exercise;

      let content = "Hola! Soy tu AI Coach vocal. ";
      if (metrics.length > 0) {
        content += `Tu estado actual: ${metrics.map((m: any) => `${m.label} ${m.value}%`).join(", ")}. `;
      }
      if (obs.length > 0) {
        content += obs.join(" ");
      }
      content += " Pregúntame lo que necesites!";

      const msg: Message = {
        role: "assistant",
        content,
        exercises: exercise ? [exercise] : undefined,
      };
      setMessages([msg]);
      setInitialLoaded(true);
    }).catch(() => {
      setMessages([{
        role: "assistant",
        content: "Hola! Soy tu AI Coach vocal. Pregúntame sobre técnica, ejercicios o tu progreso.",
      }]);
      setInitialLoaded(true);
    });
  }, [user, initialLoaded]);

  useEffect(() => {
    scrollRef.current?.scrollTo({ top: scrollRef.current.scrollHeight, behavior: "smooth" });
  }, [messages]);

  const sendMessage = async (text: string) => {
    if (!text.trim() || !user || loading) return;
    const userMsg: Message = { role: "user", content: text.trim() };
    setMessages((prev) => [...prev, userMsg]);
    setInput("");
    setLoading(true);

    try {
      // Build context from recent sessions
      const { data: sessions } = await supabase
        .from("training_sessions")
        .select("module, pitch_score, timing_score, expression_score, created_at")
        .eq("user_id", user.id)
        .order("created_at", { ascending: false })
        .limit(10);

      const { data: progress } = await supabase
        .from("user_progress")
        .select("xp, level, streak_days")
        .eq("user_id", user.id)
        .limit(1)
        .maybeSingle();

      const context = `Usuario: nivel ${progress?.level || 1}, XP ${progress?.xp || 0}, racha ${progress?.streak_days || 0} días. ` +
        `Últimas sesiones: ${sessions?.map((s) => `${s.module}(P:${s.pitch_score} T:${s.timing_score} E:${s.expression_score})`).join(", ") || "ninguna"}`;

      // Use ai-coach-feedback with the question context
      const { data } = await supabase.functions.invoke("ai-coach-feedback", {
        body: { user_id: user.id },
      });

      // Generate contextual response based on question type
      let response = "";
      const q = text.toLowerCase();
      const metrics = data?.metrics || [];
      const exercise = data?.recommended_exercise;

      if (q.includes("afinación") || q.includes("pitch") || q.includes("afinar")) {
        const pitch = metrics.find((m: any) => m.label === "Afinación");
        response = pitch
          ? `Tu afinación está en ${pitch.value}% (${pitch.delta > 0 ? "+" : ""}${pitch.delta} vs semana pasada). ${pitch.value < 70 ? "Te recomiendo practicar escalas cromáticas despacio, nota por nota, con un afinador visual." : "Vas muy bien! Para seguir mejorando, intenta cantar intervalos difíciles como 7mas y 9nas."}`
          : "Aún no tengo suficientes datos de tu afinación. Haz algunas sesiones de Pitch Training para que pueda analizarte.";
      } else if (q.includes("ejercicio") || q.includes("recomiend") || q.includes("qué hago")) {
        response = exercise
          ? `Te recomiendo: "${exercise.name}" (${exercise.duration || 5} min). ${exercise.description}. Este ejercicio trabaja tu punto más débil actual.`
          : "Empieza con lip trills de 5 minutos para calentar, luego pasa a escalas mayores con metrónomo.";
      } else if (q.includes("progreso") || q.includes("semana") || q.includes("analiza")) {
        response = metrics.length > 0
          ? `Esta semana: ${metrics.map((m: any) => `${m.label} ${m.value}% (${m.delta > 0 ? "+" : ""}${m.delta})`).join(", ")}. ${context}`
          : "Necesito más sesiones para darte un análisis completo. Intenta hacer al menos 3 sesiones esta semana.";
      } else if (q.includes("nota") && (q.includes("alta") || q.includes("aguda"))) {
        response = "Para notas altas: 1) Calienta bien con lip trills ascendentes. 2) Usa la técnica de 'mix voice' entre pecho y cabeza. 3) Mantén la laringe relajada — no subas el mentón. 4) Practica con sirenas de abajo hacia arriba. 5) El soporte diafragmático es clave — practica respiración con el Breath Trainer.";
      } else if (q.includes("racha") || q.includes("streak")) {
        response = `Llevas ${progress?.streak_days || 0} días de racha. ${(progress?.streak_days || 0) >= 7 ? "Increíble constancia! Mantén al menos 10 minutos diarios." : "Intenta practicar al menos 5 minutos cada día para construir el hábito."}`;
      } else {
        response = data?.observations?.length > 0
          ? data.observations.join(" ") + " Pregúntame algo más específico sobre técnica, ejercicios o tu progreso!"
          : "Sigue practicando y pregúntame sobre afinación, timing, ejercicios recomendados o técnicas vocales específicas.";
      }

      const assistantMsg: Message = {
        role: "assistant",
        content: response,
        exercises: exercise ? [exercise] : undefined,
      };
      setMessages((prev) => [...prev, assistantMsg]);
      trackEvent(user.id, "coach_question", { question: text.substring(0, 50) });
    } catch {
      setMessages((prev) => [...prev, { role: "assistant", content: "Hubo un error. Intenta de nuevo." }]);
    } finally {
      setLoading(false);
    }
  };

  if (!user) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <BrainCircuit className="h-16 w-16 text-secondary/40" />
        <h2 className="font-display text-2xl font-bold text-foreground">AI Coach Chat</h2>
        <p className="text-muted-foreground text-center max-w-sm">Inicia sesión para chatear con tu coach vocal</p>
        <StageButton variant="primary" icon={<LogIn className="h-5 w-5" />} onClick={() => navigate("/login")}>
          INICIAR SESIÓN
        </StageButton>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-[calc(100vh-4rem)] md:h-[calc(100vh-2rem)] max-w-2xl mx-auto">
      {/* Header */}
      <div className="flex items-center gap-3 p-4 border-b border-border/30">
        <button onClick={() => navigate("/coach")} className="text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-5 w-5" />
        </button>
        <div className="h-9 w-9 rounded-full bg-secondary/20 flex items-center justify-center">
          <BrainCircuit className="h-5 w-5 text-secondary" />
        </div>
        <div>
          <h1 className="font-display text-lg font-semibold text-foreground">AI Coach</h1>
          <p className="text-[10px] text-muted-foreground">Basado en tus sesiones reales</p>
        </div>
      </div>

      {/* Messages */}
      <div ref={scrollRef} className="flex-1 overflow-y-auto p-4 space-y-4">
        <AnimatePresence>
          {messages.map((msg, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              className={`flex ${msg.role === "user" ? "justify-end" : "justify-start"}`}
            >
              <div
                className={`max-w-[85%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                  msg.role === "user"
                    ? "bg-primary text-primary-foreground rounded-br-md"
                    : "glass-card rounded-bl-md"
                }`}
              >
                <p className="whitespace-pre-wrap">{msg.content}</p>
                {msg.exercises && msg.exercises.length > 0 && (
                  <div className="mt-3 space-y-2">
                    {msg.exercises.map((ex, j) => (
                      <button
                        key={j}
                        onClick={() => navigate("/exercises")}
                        className="w-full flex items-center gap-3 p-2.5 rounded-xl bg-background/40 hover:bg-background/60 transition-colors text-left"
                      >
                        <div className="h-8 w-8 rounded-lg bg-primary/10 flex items-center justify-center shrink-0">
                          <Play className="h-3.5 w-3.5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-xs font-medium text-foreground truncate">{ex.name}</p>
                          <p className="text-[10px] text-muted-foreground">{ex.duration || 5} min</p>
                        </div>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </motion.div>
          ))}
        </AnimatePresence>

        {loading && (
          <div className="flex justify-start">
            <div className="glass-card rounded-2xl rounded-bl-md px-4 py-3">
              <Loader2 className="h-4 w-4 animate-spin text-secondary" />
            </div>
          </div>
        )}
      </div>

      {/* Quick prompts (show when no user messages) */}
      {messages.filter((m) => m.role === "user").length === 0 && (
        <div className="px-4 pb-2 flex gap-2 overflow-x-auto scrollbar-hide">
          {QUICK_PROMPTS.map((p) => (
            <button
              key={p}
              onClick={() => sendMessage(p)}
              className="px-3 py-1.5 rounded-full text-[11px] font-medium whitespace-nowrap glass-card text-muted-foreground hover:text-foreground hover:border-primary/30 transition-all"
            >
              {p}
            </button>
          ))}
        </div>
      )}

      {/* Input */}
      <div className="p-4 border-t border-border/30">
        <form
          onSubmit={(e) => {
            e.preventDefault();
            sendMessage(input);
          }}
          className="flex items-center gap-2"
        >
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Pregúntale a tu coach..."
            disabled={loading}
            className="flex-1 h-11 px-4 rounded-xl bg-card border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors disabled:opacity-50"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="h-11 w-11 rounded-xl bg-primary text-primary-foreground flex items-center justify-center shrink-0 disabled:opacity-30 transition-opacity"
          >
            <Send className="h-4 w-4" />
          </button>
        </form>
      </div>
    </div>
  );
};

export default AICoachChat;
