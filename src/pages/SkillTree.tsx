import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Sparkles, Zap, Trophy } from "lucide-react";
import { SKILL_TREE_DATA, BRANCH_META, SkillBranch, SkillNodeData } from "@/components/skilltree/skillTreeData";
import { SkillBranchComponent } from "@/components/skilltree/SkillBranch";
import { SkillDrawer } from "@/components/skilltree/SkillDrawer";
import { toast } from "sonner";

const BRANCHES: SkillBranch[] = ["tecnica", "artistica", "performance"];

// Mock data
const MOCK_XP = 450;
const MOCK_COMPLETED = 5;
const MOCK_STREAK = 7;

export default function SkillTree() {
  const [activeBranch, setActiveBranch] = useState<SkillBranch>("tecnica");
  const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null);

  const handleNodeClick = (node: SkillNodeData) => {
    if (node.status === "unlocked" || node.status === "completed") {
      setSelectedNode(node);
    } else if (node.status === "locked") {
      toast(`Necesitas ${node.requiredXP} XP y ${node.requiredSessions} sesiones para desbloquear`, { icon: "🔒" });
    } else {
      toast("Este módulo está en desarrollo", { icon: "🕐" });
    }
  };

  const branchNodes = (branch: SkillBranch) => SKILL_TREE_DATA.filter((n) => n.branch === branch);

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F" }}>
      {/* ═══ HEADER ═══ */}
      <div className="px-4 pt-6 pb-4 space-y-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1
            className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FF3CAC] via-[#784BA0] to-[#2B86C5] bg-clip-text text-transparent"
            style={{ fontFamily: "'Space Grotesk', sans-serif" }}
          >
            SOY LEYENDA
          </h1>
          <p className="text-sm text-[#A0A0B0] mt-1">Tu camino de aficionado a leyenda</p>
        </motion.div>

        {/* XP Bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex justify-between text-xs mb-1.5">
            <span className="text-[#A0A0B0]">Progreso total</span>
            <span className="text-white font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {MOCK_XP} XP
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF3CAC] via-[#784BA0] to-[#2B86C5]"
              initial={{ width: 0 }}
              animate={{ width: `${Math.min(100, (MOCK_XP / 2500) * 100)}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
        </motion.div>

        {/* Stats pills */}
        <div className="flex gap-2">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Trophy className="h-3 w-3 text-[#FFA502]" />
            <span className="text-[10px] text-white/70 font-medium">{MOCK_COMPLETED}/30 nodos</span>
          </div>
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Zap className="h-3 w-3 text-[#FF3CAC]" />
            <span className="text-[10px] text-white/70 font-medium">Racha: {MOCK_STREAK} 🔥</span>
          </div>
        </div>
      </div>

      {/* ═══ ROOT NODE "TU VOZ" ═══ */}
      <div className="flex justify-center py-4">
        <motion.div
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center gap-1 relative"
          style={{
            background: "radial-gradient(circle at 50% 40%, rgba(255,60,172,0.15), #0A0A0F 70%)",
          }}
        >
          <div className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-[#FF3CAC] via-[#784BA0] to-[#2B86C5]" style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }} />
          <Mic className="h-7 w-7 text-[#FF3CAC]" />
          <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest">TU VOZ</span>
        </motion.div>
      </div>

      {/* ═══ BRANCH TABS (mobile) / COLUMNS (desktop) ═══ */}
      {/* Mobile tabs */}
      <div className="md:hidden px-4 mb-4">
        <div className="flex gap-1 p-1 rounded-2xl bg-white/5">
          {BRANCHES.map((b) => (
            <button
              key={b}
              onClick={() => setActiveBranch(b)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all ${
                activeBranch === b
                  ? "bg-gradient-to-r from-[#FF3CAC] via-[#784BA0] to-[#2B86C5] text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
            >
              {BRANCH_META[b].label}
            </button>
          ))}
        </div>
      </div>

      {/* Mobile: single branch */}
      <div className="md:hidden px-4 pb-32">
        <AnimatePresence mode="wait">
          <motion.div
            key={activeBranch}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -20 }}
            transition={{ duration: 0.2 }}
          >
            <SkillBranchComponent branch={activeBranch} nodes={branchNodes(activeBranch)} onNodeClick={handleNodeClick} />
          </motion.div>
        </AnimatePresence>
      </div>

      {/* Desktop: 3 columns */}
      <div className="hidden md:grid md:grid-cols-3 gap-8 px-8 pb-32">
        {BRANCHES.map((b) => (
          <div key={b} className="flex flex-col items-center">
            <h3
              className="text-sm font-bold uppercase tracking-widest mb-4"
              style={{ color: BRANCH_META[b].color, fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {BRANCH_META[b].label}
            </h3>
            {/* Connection line from root */}
            <svg width="4" height="24" className="mb-2">
              <defs>
                <linearGradient id={`root-${b}`} x1="0" y1="0" x2="0" y2="1">
                  <stop offset="0%" stopColor="#FF3CAC" />
                  <stop offset="100%" stopColor={BRANCH_META[b].color} />
                </linearGradient>
              </defs>
              <line x1="2" y1="0" x2="2" y2="24" stroke={`url(#root-${b})`} strokeWidth="2" />
            </svg>
            <SkillBranchComponent branch={b} nodes={branchNodes(b)} onNodeClick={handleNodeClick} />
          </div>
        ))}
      </div>

      {/* ═══ DRAWER ═══ */}
      <SkillDrawer node={selectedNode} onClose={() => setSelectedNode(null)} />
    </div>
  );
}
