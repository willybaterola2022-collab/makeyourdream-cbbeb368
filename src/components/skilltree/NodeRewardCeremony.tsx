import { motion, AnimatePresence } from "framer-motion";
import { useEffect, useState, useRef, useCallback } from "react";
import { Share2, ArrowRight } from "lucide-react";
import { SkillNodeData } from "./skillTreeData";

interface NodeRewardCeremonyProps {
  node: SkillNodeData | null;
  onClose: () => void;
}

const CONFETTI_COLORS = ["#FF3CAC", "#784BA0", "#2B86C5", "#00E5A0", "#FFA502", "#FFD700"];

function Confetti() {
  const particles = Array.from({ length: 30 }, (_, i) => ({
    id: i,
    x: Math.random() * 100,
    color: CONFETTI_COLORS[Math.floor(Math.random() * CONFETTI_COLORS.length)],
    delay: Math.random() * 0.3,
    rotation: Math.random() * 720 - 360,
    size: Math.random() * 8 + 4,
  }));

  return (
    <div className="absolute inset-0 pointer-events-none overflow-hidden z-10">
      {particles.map((p) => (
        <motion.div
          key={p.id}
          className="absolute rounded-sm"
          style={{
            left: `${p.x}%`,
            top: "50%",
            width: p.size,
            height: p.size,
            backgroundColor: p.color,
          }}
          initial={{ y: 0, x: 0, rotate: 0, opacity: 1, scale: 1 }}
          animate={{
            y: [0, -(200 + Math.random() * 300), 400 + Math.random() * 200],
            x: [0, (Math.random() - 0.5) * 300],
            rotate: p.rotation,
            opacity: [0, 1, 1, 0],
            scale: [0, 1.2, 1, 0.5],
          }}
          transition={{ duration: 2 + Math.random(), delay: p.delay, ease: "easeOut" }}
        />
      ))}
    </div>
  );
}

function useSuccessSound() {
  const ctxRef = useRef<AudioContext | null>(null);
  return useCallback(() => {
    try {
      if (!ctxRef.current) ctxRef.current = new AudioContext();
      const ctx = ctxRef.current;
      const osc = ctx.createOscillator();
      const gain = ctx.createGain();
      osc.connect(gain);
      gain.connect(ctx.destination);
      osc.type = "sine";
      osc.frequency.setValueAtTime(200, ctx.currentTime);
      osc.frequency.exponentialRampToValueAtTime(800, ctx.currentTime + 0.5);
      gain.gain.setValueAtTime(0.15, ctx.currentTime);
      gain.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.6);
      osc.start(ctx.currentTime);
      osc.stop(ctx.currentTime + 0.6);
    } catch { /* audio not available */ }
  }, []);
}

export function NodeRewardCeremony({ node, onClose }: NodeRewardCeremonyProps) {
  const [countUp, setCountUp] = useState(0);
  const playSound = useSuccessSound();

  useEffect(() => {
    if (!node) { setCountUp(0); return; }
    playSound();
    let frame = 0;
    const target = node.rewardXP;
    const totalFrames = 60;
    const step = () => {
      frame++;
      setCountUp(Math.round((frame / totalFrames) * target));
      if (frame < totalFrames) requestAnimationFrame(step);
    };
    const timer = setTimeout(() => requestAnimationFrame(step), 600);
    return () => clearTimeout(timer);
  }, [node, playSound]);

  const handleShare = async () => {
    if (!node) return;
    const text = `🏆 Desbloqueé "${node.name}" en MakeYourDream! ${node.rewardBadge} — ${node.rewardTitle}`;
    if (navigator.share) {
      try { await navigator.share({ title: "MakeYourDream", text }); } catch { /* cancelled */ }
    } else {
      await navigator.clipboard.writeText(text);
    }
  };

  return (
    <AnimatePresence>
      {node && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-[100] flex items-center justify-center"
          style={{ background: "rgba(0,0,0,0.85)", backdropFilter: "blur(12px)" }}
        >
          <Confetti />

          <motion.div
            initial={{ scale: 0, rotate: -10 }}
            animate={{ scale: 1, rotate: 0 }}
            exit={{ scale: 0.8, opacity: 0 }}
            transition={{ type: "spring", damping: 15, stiffness: 200, delay: 0.3 }}
            className="relative z-20 flex flex-col items-center text-center px-8 py-10 max-w-sm"
          >
            {/* Badge icon */}
            <motion.div
              initial={{ scale: 0 }}
              animate={{ scale: [0, 1.3, 1] }}
              transition={{ delay: 0.5, duration: 0.6, ease: "easeOut" }}
              className="w-24 h-24 rounded-3xl flex items-center justify-center mb-6"
              style={{ background: "linear-gradient(135deg, #FF3CAC, #784BA0, #2B86C5)" }}
            >
              <span className="text-5xl">{node.rewardBadge.split(" ")[0]}</span>
            </motion.div>

            {/* Badge name */}
            <motion.p
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.8 }}
              className="text-lg font-bold text-white mb-1"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {node.rewardBadge}
            </motion.p>

            {/* Title */}
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 1 }}
              className="text-sm text-[#A0A0B0] mb-6"
            >
              Título desbloqueado: <span className="text-[#FF3CAC] font-bold">{node.rewardTitle}</span>
            </motion.p>

            {/* XP counter */}
            <motion.div
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.6 }}
              className="flex items-center gap-2 px-5 py-3 rounded-2xl bg-white/5 border border-white/10 mb-8"
            >
              <span className="text-[#FFA502] text-xl">⚡</span>
              <span className="text-2xl font-bold text-white" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
                +{countUp} XP
              </span>
            </motion.div>

            {/* CTAs */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 1.2 }}
              className="w-full space-y-3"
            >
              <button
                onClick={handleShare}
                className="w-full py-3.5 px-6 rounded-2xl bg-gradient-to-r from-[#FF3CAC] via-[#784BA0] to-[#2B86C5] text-white font-bold text-sm flex items-center justify-center gap-2 active:scale-[0.97] transition-transform"
              >
                <Share2 className="h-4 w-4" />
                Compartir Logro
              </button>
              <button
                onClick={onClose}
                className="w-full py-3 px-6 rounded-2xl border border-white/10 text-white/70 text-sm flex items-center justify-center gap-2 hover:bg-white/5 transition-colors"
              >
                Continuar
                <ArrowRight className="h-4 w-4" />
              </button>
            </motion.div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
