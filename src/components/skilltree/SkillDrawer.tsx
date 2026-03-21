import { motion, AnimatePresence } from "framer-motion";
import { X, ArrowRight, BarChart3, Share2, Flame } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { SkillNodeData } from "./skillTreeData";

interface SkillDrawerProps {
  node: SkillNodeData | null;
  onClose: () => void;
  streak?: number;
}

export function SkillDrawer({ node, onClose, streak = 0 }: SkillDrawerProps) {
  const navigate = useNavigate();

  return (
    <AnimatePresence>
      {node && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50"
          />

          <motion.div
            initial={{ y: "100%" }}
            animate={{ y: 0 }}
            exit={{ y: "100%" }}
            transition={{ type: "spring", damping: 30, stiffness: 300 }}
            className="fixed bottom-0 left-0 right-0 z-50 md:left-auto md:right-0 md:top-0 md:bottom-0 md:w-[400px]"
          >
            <div className="bg-[#1E1E2E] border-t md:border-l border-white/10 rounded-t-3xl md:rounded-none p-6 max-h-[85vh] md:max-h-full md:h-full overflow-y-auto">
              <div className="w-10 h-1 rounded-full bg-white/20 mx-auto mb-5 md:hidden" />

              <button onClick={onClose} className="absolute top-4 right-4 p-2 rounded-full hover:bg-white/10 transition-colors">
                <X className="h-5 w-5 text-white/60" />
              </button>

              {/* Boss golden banner */}
              {node.isBoss && (
                <div className="mb-4 -mx-6 -mt-6 px-6 py-4 rounded-t-3xl md:rounded-none" style={{ background: "linear-gradient(135deg, rgba(255,165,2,0.15), rgba(255,215,0,0.05))" }}>
                  <p className="text-[10px] font-bold text-[#FFA502] uppercase tracking-widest">
                    🏆 {node.id === "p10" ? "BOSS FINAL" : "BOSS BATTLE"}
                  </p>
                  <p className="text-xs text-[#A0A0B0] mt-1">
                    {node.id === "p10"
                      ? "El desafío definitivo. Completa todas las ramas para tu título de Leyenda."
                      : "Evaluación de temporada — demuestra dominio en esta disciplina."
                    }
                  </p>
                  {/* Countdown mock */}
                  <div className="flex items-center gap-2 mt-2 px-2 py-1.5 rounded-lg bg-black/20 w-fit">
                    <span className="text-[10px] text-[#FFA502] font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      ⏳ Temporada 1 — 27 días restantes
                    </span>
                  </div>
                </div>
              )}

              {/* Icon */}
              <div
                className="w-16 h-16 rounded-2xl flex items-center justify-center mb-4"
                style={{
                  background: node.isBoss
                    ? "linear-gradient(135deg, #FFA502, #FFD700)"
                    : "linear-gradient(135deg, #FF3CAC, #784BA0, #2B86C5)",
                }}
              >
                <node.icon className="h-8 w-8 text-white" />
              </div>

              <h2 className="text-2xl font-bold text-white mb-1" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
                {node.name}
              </h2>
              <p className="text-sm text-[#A0A0B0] mb-4">{node.description}</p>

              {/* Progress */}
              {node.mockSessions && (
                <div className="mb-4">
                  <div className="flex justify-between text-xs mb-2">
                    <span className="text-[#A0A0B0]">Progreso</span>
                    <span className="text-white font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                      {node.mockSessions.current}/{node.mockSessions.total} sesiones
                    </span>
                  </div>
                  <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
                    <motion.div
                      className="h-full rounded-full bg-gradient-to-r from-[#FF3CAC] via-[#784BA0] to-[#2B86C5]"
                      initial={{ width: 0 }}
                      animate={{ width: `${(node.mockSessions.current / node.mockSessions.total) * 100}%` }}
                      transition={{ duration: 0.8, ease: "easeOut" }}
                    />
                  </div>
                </div>
              )}

              {/* Reward preview */}
              <div className="mb-4 p-3 rounded-xl bg-white/[0.03] border border-white/[0.06] space-y-2">
                <p className="text-[10px] font-bold text-[#FF3CAC] uppercase tracking-widest">Recompensas</p>
                <div className="flex items-center gap-2">
                  <span className="text-[#FFA502]">⚡</span>
                  <span className="text-xs text-white font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                    +{node.rewardXP} XP
                  </span>
                </div>
                <div className="flex items-center gap-2">
                  <span>{node.rewardBadge.split(" ")[0]}</span>
                  <span className="text-xs text-[#A0A0B0]">{node.rewardBadge}</span>
                </div>
                <div className="flex items-center gap-2">
                  <span className="text-[#784BA0]">🏷️</span>
                  <span className="text-xs text-[#A0A0B0]">
                    Título: <span className="text-white font-bold">{node.rewardTitle}</span>
                  </span>
                </div>
              </div>

              {/* XP requirement */}
              <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-white/5 border border-white/10">
                <span className="text-[#FFA502] text-lg">⚡</span>
                <span className="text-sm text-[#A0A0B0]">Requiere</span>
                <span className="text-white font-bold font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                  {node.requiredXP} XP
                </span>
              </div>

              {/* Streak multiplier */}
              {streak > 0 && (
                <div className="flex items-center gap-2 mb-4 px-3 py-2 rounded-xl bg-[#FFA502]/5 border border-[#FFA502]/20">
                  <Flame className="h-4 w-4 text-[#FFA502]" />
                  <span className="text-xs text-[#A0A0B0]">Racha activa:</span>
                  <span className="text-xs font-bold text-[#FFA502]">{streak} días 🔥</span>
                </div>
              )}

              {/* CTAs */}
              <div className="space-y-3">
                <button
                  onClick={() => { onClose(); navigate(node.route); }}
                  className="w-full py-4 px-6 rounded-2xl bg-gradient-to-r from-[#FF3CAC] via-[#784BA0] to-[#2B86C5] text-white font-bold text-sm flex items-center justify-center gap-2 hover:opacity-90 transition-opacity active:scale-[0.98]"
                >
                  Ir al Módulo
                  <ArrowRight className="h-4 w-4" />
                </button>

                {node.status === "completed" && (
                  <button
                    onClick={async () => {
                      const text = `🏆 Completé "${node.name}" en MakeYourDream! ${node.rewardBadge}`;
                      if (navigator.share) {
                        try { await navigator.share({ title: "MakeYourDream", text }); } catch { /* */ }
                      } else {
                        await navigator.clipboard.writeText(text);
                      }
                    }}
                    className="w-full py-3 px-6 rounded-2xl bg-gradient-to-r from-[#FF3CAC]/10 to-[#2B86C5]/10 border border-[#FF3CAC]/20 text-white/80 text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                  >
                    <Share2 className="h-4 w-4" />
                    Compartir Logro
                  </button>
                )}

                <button
                  onClick={onClose}
                  className="w-full py-3 px-6 rounded-2xl border border-white/10 bg-transparent text-white/70 text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
                >
                  <BarChart3 className="h-4 w-4" />
                  Ver Progreso
                </button>
              </div>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
