import { useState, useEffect, useRef } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Mic, Zap, Trophy } from "lucide-react";
import { SKILL_TREE_DATA, BRANCH_META, SkillBranch, SkillNodeData, SkillStatus, getLevelForXP } from "@/components/skilltree/skillTreeData";
import { SkillBranchComponent } from "@/components/skilltree/SkillBranch";
import { SkillDrawer } from "@/components/skilltree/SkillDrawer";
import { NodeRewardCeremony } from "@/components/skilltree/NodeRewardCeremony";
import { TalentRadar } from "@/components/skilltree/TalentRadar";
import { LeagueBadge } from "@/components/skilltree/LeagueBadge";
import { StreakMultiplier } from "@/components/skilltree/StreakMultiplier";
import { DiscoveryMoment, Discovery } from "@/components/skilltree/DiscoveryMoment";
import { WeeklyWrap } from "@/components/skilltree/WeeklyWrap";
import { toast } from "sonner";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

const BRANCHES: SkillBranch[] = ["tecnica", "artistica", "performance"];

// Mock talent radar data
const MOCK_TALENT = [
  { label: "Pitch", value: 72, percentile: 15 },
  { label: "Rango", value: 58, percentile: 30 },
  { label: "Potencia", value: 65, percentile: 22 },
  { label: "Control", value: 70, percentile: 18 },
  { label: "Expresión", value: 88, percentile: 4 },
  { label: "Creatividad", value: 55, percentile: 35 },
];

export default function SkillTree() {
  const { user } = useAuth();
  const [activeBranch, setActiveBranch] = useState<SkillBranch>("tecnica");
  const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null);
  const [rewardNode, setRewardNode] = useState<SkillNodeData | null>(null);
  const [userXP, setUserXP] = useState(0);
  const [displayXP, setDisplayXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [showRadar, setShowRadar] = useState(false);
  const [showWrap, setShowWrap] = useState(false);
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const rootTapCount = useRef(0);
  const rootTapTimer = useRef<ReturnType<typeof setTimeout>>();

  // Fetch real user progress
  useEffect(() => {
    async function fetchProgress() {
      if (!user) { setLoading(false); return; }
      try {
        const { data: progress } = await supabase
          .from("user_progress")
          .select("xp, streak_days")
          .eq("user_id", user.id)
          .maybeSingle();

        if (progress) {
          setUserXP(progress.xp || 0);
          setStreak(progress.streak_days || 0);
        }

        const { data: sessions } = await supabase
          .from("training_sessions")
          .select("module")
          .eq("user_id", user.id);

        if (sessions) {
          const counts: Record<string, number> = {};
          sessions.forEach((s) => { counts[s.module] = (counts[s.module] || 0) + 1; });
          setSessionCounts(counts);
        }
      } catch (e) { console.error("Error fetching progress:", e); }
      setLoading(false);
    }
    fetchProgress();
  }, [user]);

  // Realtime XP subscription
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("xp-updates")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "user_progress", filter: `user_id=eq.${user.id}` }, (payload) => {
        const newXP = (payload.new as { xp?: number }).xp ?? 0;
        setUserXP(newXP);
        const newStreak = (payload.new as { streak_days?: number }).streak_days ?? 0;
        setStreak(newStreak);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  // XP count-up animation
  useEffect(() => {
    let frame = 0;
    const start = displayXP;
    const diff = userXP - start;
    if (diff === 0) return;
    const totalFrames = 60;
    const step = () => {
      frame++;
      setDisplayXP(Math.round(start + (frame / totalFrames) * diff));
      if (frame < totalFrames) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }, [userXP]);

  const level = getLevelForXP(userXP);

  // Compute dynamic node statuses
  const computedNodes = SKILL_TREE_DATA.map((node) => {
    if (node.status === "coming-soon") return node;
    let status: SkillStatus;
    const moduleKey = node.route.replace("/", "");
    const userSessions = sessionCounts[moduleKey] || 0;

    if (userXP >= node.requiredXP && userSessions >= node.requiredSessions) {
      status = "completed";
    } else if (userXP >= node.requiredXP) {
      status = "unlocked";
    } else {
      status = "locked";
    }
    if (node.requiredXP === 0 && status === "locked") status = "unlocked";

    return { ...node, status, mockSessions: { current: userSessions, total: node.requiredSessions } };
  });

  const completedCount = computedNodes.filter((n) => n.status === "completed").length;

  const handleNodeClick = (node: SkillNodeData) => {
    const computed = computedNodes.find((n) => n.id === node.id) || node;
    if (computed.status === "unlocked" || computed.status === "completed") {
      setSelectedNode(computed);
    } else if (computed.status === "locked") {
      toast(`Necesitas ${computed.requiredXP} XP y ${computed.requiredSessions} sesiones para desbloquear`, { icon: "🔒" });
    } else {
      toast("Este módulo está en desarrollo", { icon: "🕐" });
    }
  };

  // Easter egg: tap root node 5 times
  const handleRootTap = () => {
    rootTapCount.current++;
    clearTimeout(rootTapTimer.current);
    if (rootTapCount.current >= 5) {
      rootTapCount.current = 0;
      setDiscovery({ id: "easter", badge: "🥚", title: "Huevo de Pascua", description: "¡Descubriste un secreto! Eres un explorador nato." });
      setTimeout(() => setDiscovery(null), 4000);
    } else {
      rootTapTimer.current = setTimeout(() => { rootTapCount.current = 0; }, 1500);
    }
  };

  const branchNodes = (branch: SkillBranch) => computedNodes.filter((n) => n.branch === branch);

  // Branch completion arcs for mobile tabs
  const branchPct = (branch: SkillBranch) => {
    const nodes = computedNodes.filter((n) => n.branch === branch);
    const done = nodes.filter((n) => n.status === "completed").length;
    return Math.round((done / nodes.length) * 100);
  };

  return (
    <div className="min-h-screen" style={{ background: "#0A0A0F" }}>
      {/* ═══ HEADER ═══ */}
      <div className="px-4 pt-6 pb-4 space-y-3">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }} className="flex items-start justify-between">
          <div>
            <h1
              className="text-3xl md:text-4xl font-bold bg-gradient-to-r from-[#FF3CAC] via-[#784BA0] to-[#2B86C5] bg-clip-text text-transparent"
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              SOY LEYENDA
            </h1>
            <p className="text-sm mt-1" style={{ color: "#A0A0B0" }}>
              Tu camino de aficionado a leyenda
            </p>
          </div>
          <LeagueBadge weeklyXP={userXP > 0 ? Math.min(userXP, 450) : 120} rank={4} positionChange={2} />
        </motion.div>

        {/* Level + XP Bar */}
        <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }}>
          <div className="flex justify-between items-center text-xs mb-1.5">
            <div className="flex items-center gap-2">
              <span
                className="px-2 py-0.5 rounded-md text-[10px] font-bold uppercase"
                style={{ color: level.color, background: `${level.color}15`, fontFamily: "'Space Grotesk', sans-serif" }}
              >
                Lv.{level.index} {level.name}
              </span>
            </div>
            <span className="text-white font-mono" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {displayXP} XP
            </span>
          </div>
          <div className="h-2.5 rounded-full bg-white/10 overflow-hidden">
            <motion.div
              className="h-full rounded-full bg-gradient-to-r from-[#FF3CAC] via-[#784BA0] to-[#2B86C5]"
              initial={{ width: 0 }}
              animate={{ width: `${level.progress * 100}%` }}
              transition={{ duration: 1, ease: "easeOut" }}
            />
          </div>
          <p className="text-[9px] text-white/30 mt-1 text-right" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
            {level.nextXP > userXP ? `${level.nextXP - userXP} XP para ${BRANCHES.length > 0 ? level.name : ""}` : "¡Nivel máximo!"}
          </p>
        </motion.div>

        {/* Stats row */}
        <div className="flex gap-2 flex-wrap">
          <div className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-white/5 border border-white/10">
            <Trophy className="h-3 w-3 text-[#FFA502]" />
            <span className="text-[10px] text-white/70 font-medium" style={{ fontFamily: "'JetBrains Mono', monospace" }}>
              {completedCount}/30 nodos
            </span>
          </div>
          <StreakMultiplier streak={streak || 7} />
          <button
            onClick={() => setShowRadar(!showRadar)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#FF3CAC]/10 border border-[#FF3CAC]/20 text-[10px] text-[#FF3CAC] font-bold"
          >
            🧬 Vocal DNA
          </button>
          <button
            onClick={() => setShowWrap(!showWrap)}
            className="flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-[#2B86C5]/10 border border-[#2B86C5]/20 text-[10px] text-[#2B86C5] font-bold"
          >
            📊 Weekly
          </button>
        </div>
      </div>

      {/* Talent Radar expandable */}
      <AnimatePresence>
        {showRadar && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-4 pb-4"
          >
            <div className="p-4 rounded-2xl border border-white/10" style={{ background: "#1E1E2E" }}>
              <TalentRadar dimensions={MOCK_TALENT} vocalDNA={68} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Weekly Wrap expandable */}
      <AnimatePresence>
        {showWrap && (
          <motion.div
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: "auto", opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            className="overflow-hidden px-4 pb-4"
          >
            <WeeklyWrap
              minutesSung={47}
              pitchImprovement={12}
              sessionsCompleted={9}
              topModule="Karaoke"
              onClose={() => setShowWrap(false)}
            />
          </motion.div>
        )}
      </AnimatePresence>

      {/* ═══ ROOT NODE "TU VOZ" ═══ */}
      <div className="flex justify-center py-4">
        <motion.button
          onClick={handleRootTap}
          initial={{ scale: 0.8, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ delay: 0.2 }}
          className="w-20 h-20 md:w-24 md:h-24 rounded-2xl flex flex-col items-center justify-center gap-1 relative"
          style={{ background: "radial-gradient(circle at 50% 40%, rgba(255,60,172,0.15), #0A0A0F 70%)" }}
        >
          <div
            className="absolute inset-0 rounded-2xl p-[2px] bg-gradient-to-br from-[#FF3CAC] via-[#784BA0] to-[#2B86C5]"
            style={{ WebkitMask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)", WebkitMaskComposite: "xor", maskComposite: "exclude" }}
          />
          <Mic className="h-7 w-7 text-[#FF3CAC]" />
          <span className="text-[9px] font-bold text-white/80 uppercase tracking-widest" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
            TU VOZ
          </span>
        </motion.button>
      </div>

      {/* ═══ BRANCH TABS (mobile) ═══ */}
      <div className="md:hidden px-4 mb-4">
        <div className="flex gap-1 p-1 rounded-2xl bg-white/5">
          {BRANCHES.map((b) => (
            <button
              key={b}
              onClick={() => setActiveBranch(b)}
              className={`flex-1 py-2 px-3 rounded-xl text-xs font-bold uppercase tracking-wider transition-all relative ${
                activeBranch === b
                  ? "bg-gradient-to-r from-[#FF3CAC] via-[#784BA0] to-[#2B86C5] text-white"
                  : "text-white/40 hover:text-white/60"
              }`}
              style={{ fontFamily: "'Space Grotesk', sans-serif" }}
            >
              {BRANCH_META[b].label}
              {/* Progress arc under tab */}
              <span
                className="absolute -bottom-1 left-1/2 -translate-x-1/2 h-[3px] rounded-full transition-all duration-500"
                style={{ width: `${branchPct(b)}%`, background: BRANCH_META[b].color, minWidth: branchPct(b) > 0 ? 8 : 0 }}
              />
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
      <SkillDrawer node={selectedNode} onClose={() => setSelectedNode(null)} streak={streak} />

      {/* ═══ REWARD CEREMONY ═══ */}
      <NodeRewardCeremony node={rewardNode} onClose={() => setRewardNode(null)} />

      {/* ═══ DISCOVERY MOMENTS ═══ */}
      <DiscoveryMoment discovery={discovery} onClose={() => setDiscovery(null)} />
    </div>
  );
}
