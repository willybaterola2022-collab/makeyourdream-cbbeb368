import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Lock, Check, ChevronRight, Trophy, Share2 } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PhaseProgress } from "@/components/PhaseProgress";
import { getPhaseByXp } from "@/lib/phases";
import { trackEvent } from "@/lib/trackEvent";
import { SKILL_TREE_DATA, SkillNodeData, BRANCH_META, getLevelForXP, type SkillBranch } from "@/components/skilltree/skillTreeData";
import { SkillDrawer } from "@/components/skilltree/SkillDrawer";
import { NodeRewardCeremony } from "@/components/skilltree/NodeRewardCeremony";
import { DiscoveryMoment, type Discovery } from "@/components/skilltree/DiscoveryMoment";
import { WeeklyWrap } from "@/components/skilltree/WeeklyWrap";
import { StreakMultiplier } from "@/components/skilltree/StreakMultiplier";
import { LeagueBadge } from "@/components/skilltree/LeagueBadge";
import { toast } from "sonner";

// 5 branches for the new system
const BRANCHES: { key: string; label: string; icon: string; metric: string }[] = [
  { key: "pitch", label: "Afinación", icon: "🎯", metric: "avg pitch_score" },
  { key: "timing", label: "Ritmo", icon: "⏱️", metric: "avg timing_score" },
  { key: "expression", label: "Expresión", icon: "🎭", metric: "avg expression_score" },
  { key: "social", label: "Social", icon: "👥", metric: "posts published" },
  { key: "consistency", label: "Constancia", icon: "🔥", metric: "streak days" },
];

const BRANCH_THRESHOLDS: Record<string, number[]> = {
  pitch: [60, 70, 80, 90],
  timing: [60, 70, 80, 90],
  expression: [60, 70, 80, 90],
  social: [1, 5, 10, 25],
  consistency: [3, 7, 14, 30],
};

function computeBranchProgress(branchKey: string, sessions: any[], streak: number, socialPosts: number): { unlocked: number; total: number; currentValue: number } {
  const thresholds = BRANCH_THRESHOLDS[branchKey];
  const total = thresholds.length;
  let currentValue = 0;

  if (branchKey === "pitch" || branchKey === "timing" || branchKey === "expression") {
    const scoreKey = `${branchKey}_score`;
    const scores = sessions.map((s) => s[scoreKey] || 0).filter((s) => s > 0);
    currentValue = scores.length > 0 ? Math.round(scores.reduce((a, b) => a + b, 0) / scores.length) : 0;
  } else if (branchKey === "social") {
    currentValue = socialPosts;
  } else if (branchKey === "consistency") {
    currentValue = streak;
  }

  let unlocked = 0;
  for (const threshold of thresholds) {
    if (currentValue >= threshold) unlocked++;
    else break;
  }

  return { unlocked, total, currentValue };
}

export default function SkillTree() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userXP, setUserXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessions, setSessions] = useState<any[]>([]);
  const [socialPosts, setSocialPosts] = useState(0);
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null);
  const [ceremonyNode, setCeremonyNode] = useState<SkillNodeData | null>(null);
  const [discovery, setDiscovery] = useState<Discovery | null>(null);
  const [weeklyReport, setWeeklyReport] = useState<any>(null);
  const [showWeekly, setShowWeekly] = useState(false);
  const [selectedBranch, setSelectedBranch] = useState<string | null>(null);
  const [weeklyXP, setWeeklyXP] = useState(0);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    trackEvent(user.id, "module_visited", { module: "skill-tree" });

    async function fetchAll() {
      try {
        const [progressRes, sessionsRes, socialRes, weeklyRes, leaderboardRes] = await Promise.all([
          supabase.from("user_progress").select("xp, streak_days").eq("user_id", user!.id).maybeSingle(),
          supabase.from("training_sessions").select("pitch_score, timing_score, expression_score, module").eq("user_id", user!.id),
          supabase.from("social_feed").select("id", { count: "exact", head: true }).eq("user_id", user!.id),
          supabase.functions.invoke("weekly-report", { body: { action: "get_latest", user_id: user!.id } }),
          supabase.from("weekly_leaderboard").select("xp_earned").eq("user_id", user!.id).order("week_start", { ascending: false }).limit(1).maybeSingle(),
        ]);

        if (progressRes.data) {
          setUserXP(progressRes.data.xp || 0);
          setStreak(progressRes.data.streak_days || 0);
        }
        if (sessionsRes.data) setSessions(sessionsRes.data);
        setSocialPosts(socialRes.count || 0);
        if (weeklyRes.data?.report) setWeeklyReport(weeklyRes.data.report);
        if (leaderboardRes.data) setWeeklyXP(leaderboardRes.data.xp_earned || 0);
      } catch {}
      setLoading(false);
    }
    fetchAll();
  }, [user]);

  // Realtime XP
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("xp-skilltree")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "user_progress", filter: `user_id=eq.${user.id}` }, (payload) => {
        setUserXP((payload.new as any).xp ?? 0);
        setStreak((payload.new as any).streak_days ?? 0);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const phase = getPhaseByXp(userXP);
  const level = getLevelForXP(userXP);

  // Compute all 5 branches
  const branchData = BRANCHES.map((branch) => {
    const progress = computeBranchProgress(branch.key, sessions, streak, socialPosts);
    return { ...branch, ...progress };
  });

  // Check "Soy Leyenda" — all branches have >= 3 nodes unlocked
  const isSoyLeyenda = branchData.every((b) => b.unlocked >= 3);

  // Original tree nodes for the drawer
  const computedNodes = SKILL_TREE_DATA.map((node) => {
    const moduleKey = node.route.replace("/", "");
    const userSessions = sessions.filter((s) => s.module === moduleKey).length;
    let computedStatus: "completed" | "unlocked" | "locked";
    if (node.status === "coming-soon") computedStatus = "locked";
    else if (userXP >= node.requiredXP && userSessions >= node.requiredSessions) computedStatus = "completed";
    else if (userXP >= node.requiredXP || node.requiredXP === 0) computedStatus = "unlocked";
    else computedStatus = "locked";
    return { ...node, computedStatus, currentSessions: userSessions };
  });

  // Get nodes for a branch
  const getNodesForBranch = (branchKey: string) => {
    const branchMap: Record<string, SkillBranch> = {
      pitch: "tecnica", timing: "tecnica", expression: "artistica",
      social: "performance", consistency: "performance",
    };
    return computedNodes.filter((n) => n.branch === (branchMap[branchKey] || "tecnica")).slice(0, 4);
  };

  const handleNodeClick = (node: typeof computedNodes[0]) => {
    if (node.computedStatus === "unlocked" || node.computedStatus === "completed") {
      setSelectedNode(node as any);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="w-8 h-8 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
      </div>
    );
  }

  return (
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto space-y-6">
      {/* Header */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-3">
        <h1 className="font-serif text-3xl text-primary">{phase.name}</h1>
        <PhaseProgress xp={userXP} />
        <div className="flex items-center justify-center gap-3">
          <StreakMultiplier streak={streak} />
          <LeagueBadge weeklyXP={weeklyXP} />
        </div>
      </motion.div>

      {/* Soy Leyenda Badge */}
      {isSoyLeyenda && (
        <motion.div
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
          className="relative overflow-hidden rounded-2xl p-5 text-center"
          style={{ background: "linear-gradient(135deg, hsl(var(--primary)/0.2), hsl(var(--primary)/0.05))" }}
        >
          <motion.div
            className="absolute inset-0 pointer-events-none"
            style={{ background: "linear-gradient(90deg, transparent, hsl(var(--primary)/0.1), transparent)" }}
            animate={{ x: ["-100%", "200%"] }}
            transition={{ duration: 3, repeat: Infinity, repeatDelay: 2 }}
          />
          <motion.div
            animate={{ scale: [1, 1.1, 1], rotate: [0, 5, -5, 0] }}
            transition={{ duration: 4, repeat: Infinity }}
          >
            <Trophy className="h-12 w-12 text-primary mx-auto mb-2" />
          </motion.div>
          <h2 className="font-serif text-2xl font-bold text-primary">SOY LEYENDA</h2>
          <p className="text-xs text-muted-foreground mt-1">Dominio vocal completo desbloqueado</p>
          <motion.button
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.97 }}
            onClick={async () => {
              const text = "🏆 Alcancé el nivel SOY LEYENDA en MakeYourDream — dominio vocal completo desbloqueado!";
              if (navigator.share) { try { await navigator.share({ title: "MakeYourDream", text }); } catch {} }
              else { await navigator.clipboard.writeText(text); toast.success("Copiado"); }
            }}
            className="mt-3 inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-primary/10 border border-primary/20 text-primary text-sm font-medium transition-transform duration-200"
          >
            <Share2 className="h-4 w-4" /> Compartir logro
          </motion.button>
        </motion.div>
      )}

      {/* 5 Branches */}
      <div className="space-y-3">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Ramas de progreso</p>
        {branchData.map((branch, i) => {
          const pct = branch.total > 0 ? (branch.unlocked / branch.total) * 100 : 0;
          const isExpanded = selectedBranch === branch.key;
          return (
            <motion.div key={branch.key} initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.05 }}>
              <motion.button
                whileHover={{ scale: 1.01 }}
                whileTap={{ scale: 0.98 }}
                onClick={() => setSelectedBranch(isExpanded ? null : branch.key)}
                className="w-full glass-card p-4 text-left transition-all duration-200"
              >
                <div className="flex items-center gap-3">
                  <span className="text-2xl">{branch.icon}</span>
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center justify-between mb-1.5">
                      <span className="text-sm font-medium text-foreground">{branch.label}</span>
                      <span className="text-xs font-mono text-muted-foreground">
                        {branch.unlocked}/{branch.total}
                      </span>
                    </div>
                    <div className="h-2 rounded-full bg-muted overflow-hidden">
                      <motion.div
                        className="h-full rounded-full bg-primary"
                        initial={{ width: 0 }}
                        animate={{ width: `${pct}%` }}
                        transition={{ duration: 0.8, delay: 0.1 + i * 0.05 }}
                      />
                    </div>
                  </div>
                  <ChevronRight className={`h-4 w-4 text-muted-foreground transition-transform duration-200 ${isExpanded ? "rotate-90" : ""}`} />
                </div>
              </motion.button>

              <AnimatePresence>
                {isExpanded && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    transition={{ duration: 0.2 }}
                    className="overflow-hidden"
                  >
                    <div className="pl-4 py-2 space-y-2">
                      {BRANCH_THRESHOLDS[branch.key].map((threshold, nodeIdx) => {
                        const isUnlocked = branch.currentValue >= threshold;
                        const isMastered = branch.currentValue >= threshold * 1.1;
                        return (
                          <motion.div
                            key={nodeIdx}
                            initial={{ opacity: 0, x: -10 }}
                            animate={{ opacity: 1, x: 0 }}
                            transition={{ delay: nodeIdx * 0.05 }}
                            className={`flex items-center gap-3 p-3 rounded-xl ${isMastered ? "glass-card border-primary/30" : isUnlocked ? "glass-card" : "opacity-40"}`}
                          >
                            <div className={`w-8 h-8 rounded-lg flex items-center justify-center ${
                              isMastered ? "bg-primary/20" : isUnlocked ? "bg-primary/10" : "bg-muted/30"
                            }`}>
                              {isMastered ? (
                                <Check className="h-4 w-4 text-primary" />
                              ) : isUnlocked ? (
                                <span className="text-xs text-primary font-bold">{nodeIdx + 1}</span>
                              ) : (
                                <Lock className="h-3 w-3 text-muted-foreground" />
                              )}
                            </div>
                            <div className="flex-1">
                              <p className="text-sm text-foreground">
                                {branch.key === "social" ? `${threshold} publicaciones` :
                                 branch.key === "consistency" ? `${threshold} días de racha` :
                                 `Promedio ${threshold}+`}
                              </p>
                              <p className="text-[10px] text-muted-foreground">
                                Actual: {branch.currentValue}{branch.key !== "social" && branch.key !== "consistency" ? "%" : ""}
                              </p>
                            </div>
                          </motion.div>
                        );
                      })}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          );
        })}
      </div>

      {/* Weekly Wrap button */}
      <motion.button
        whileHover={{ scale: 1.02 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => {
          if (!weeklyReport?.data) {
            // Generate report
            if (user) {
              supabase.functions.invoke("weekly-report", { body: { action: "generate", user_id: user.id } })
                .then(({ data }) => { if (data?.report) { setWeeklyReport(data.report); setShowWeekly(true); } });
            }
          } else {
            setShowWeekly(!showWeekly);
          }
        }}
        className="w-full glass-card p-4 flex items-center gap-3 text-left border-primary/10 hover:border-primary/20 transition-all duration-200"
      >
        <span className="text-xl">📊</span>
        <div className="flex-1">
          <p className="text-sm font-medium text-foreground">Tu Semana Vocal</p>
          <p className="text-[10px] text-muted-foreground">Resumen semanal de tu progreso</p>
        </div>
        <ChevronRight className="h-4 w-4 text-muted-foreground" />
      </motion.button>

      <AnimatePresence>
        {showWeekly && weeklyReport?.data && (
          <WeeklyWrap
            minutesSung={weeklyReport.data.totalMinutes || 0}
            pitchImprovement={weeklyReport.data.avgScore || 0}
            sessionsCompleted={weeklyReport.data.totalSessions || 0}
            topModule={weeklyReport.data.modulesUsed?.[0] || "—"}
            onClose={() => setShowWeekly(false)}
          />
        )}
      </AnimatePresence>

      {/* Original tree nodes for navigation */}
      <div className="space-y-2">
        <p className="text-xs font-bold uppercase tracking-wider text-muted-foreground">Módulos activos</p>
        {computedNodes.filter((n) => n.computedStatus === "unlocked").slice(0, 4).map((node, i) => (
          <motion.button
            key={node.id}
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
            whileHover={{ scale: 1.01 }}
            whileTap={{ scale: 0.98 }}
            onClick={() => handleNodeClick(node)}
            className="w-full glass-card p-4 flex items-center gap-4 text-left transition-all duration-200 hover:border-primary/20"
          >
            <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <node.icon className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{node.name}</p>
              <p className="text-[10px] text-muted-foreground">{node.description}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* Drawer + Ceremony */}
      <SkillDrawer node={selectedNode} onClose={() => setSelectedNode(null)} streak={streak} />
      <NodeRewardCeremony node={ceremonyNode} onClose={() => setCeremonyNode(null)} />
      <DiscoveryMoment discovery={discovery} onClose={() => setDiscovery(null)} />
    </div>
  );
}
