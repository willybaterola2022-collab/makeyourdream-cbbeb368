import { useState, useEffect } from "react";
import { motion } from "framer-motion";
import { Lock, Check, ChevronRight, Mic } from "lucide-react";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";
import { PhaseProgress } from "@/components/PhaseProgress";
import { getPhaseByXp } from "@/lib/phases";
import { trackEvent } from "@/lib/trackEvent";
import { SKILL_TREE_DATA, SkillNodeData, getLevelForXP } from "@/components/skilltree/skillTreeData";
import { SkillDrawer } from "@/components/skilltree/SkillDrawer";

export default function SkillTree() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [userXP, setUserXP] = useState(0);
  const [streak, setStreak] = useState(0);
  const [sessionCounts, setSessionCounts] = useState<Record<string, number>>({});
  const [loading, setLoading] = useState(true);
  const [selectedNode, setSelectedNode] = useState<SkillNodeData | null>(null);

  useEffect(() => {
    if (!user) { setLoading(false); return; }
    trackEvent(user.id, "module_visited", { module: "skill-tree" });

    async function fetchProgress() {
      try {
        const { data: progress } = await supabase
          .from("user_progress")
          .select("xp, streak_days")
          .eq("user_id", user!.id)
          .maybeSingle();
        if (progress) {
          setUserXP(progress.xp || 0);
          setStreak(progress.streak_days || 0);
        }

        const { data: sessions } = await supabase
          .from("training_sessions")
          .select("module")
          .eq("user_id", user!.id);
        if (sessions) {
          const counts: Record<string, number> = {};
          sessions.forEach((s) => { counts[s.module] = (counts[s.module] || 0) + 1; });
          setSessionCounts(counts);
        }
      } catch {}
      setLoading(false);
    }
    fetchProgress();
  }, [user]);

  // Realtime XP
  useEffect(() => {
    if (!user) return;
    const channel = supabase
      .channel("xp-updates-legend")
      .on("postgres_changes", { event: "UPDATE", schema: "public", table: "user_progress", filter: `user_id=eq.${user.id}` }, (payload) => {
        setUserXP((payload.new as any).xp ?? 0);
        setStreak((payload.new as any).streak_days ?? 0);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, [user]);

  const phase = getPhaseByXp(userXP);

  // Compute node statuses
  const computedNodes = SKILL_TREE_DATA.map((node) => {
    const moduleKey = node.route.replace("/", "");
    const userSessions = sessionCounts[moduleKey] || 0;

    let computedStatus: "completed" | "unlocked" | "locked";
    if (node.status === "coming-soon") {
      computedStatus = "locked";
    } else if (userXP >= node.requiredXP && userSessions >= node.requiredSessions) {
      computedStatus = "completed";
    } else if (userXP >= node.requiredXP || node.requiredXP === 0) {
      computedStatus = "unlocked";
    } else {
      computedStatus = "locked";
    }

    return { ...node, computedStatus, currentSessions: userSessions };
  });

  // Get 3 active nodes + 2 locked
  const activeNodes = computedNodes.filter(n => n.computedStatus === "unlocked").slice(0, 3);
  const completedNodes = computedNodes.filter(n => n.computedStatus === "completed");
  const lockedNodes = computedNodes.filter(n => n.computedStatus === "locked").slice(0, 2);

  // Pad active if not enough
  if (activeNodes.length < 3) {
    const remaining = computedNodes.filter(n => n.computedStatus === "locked" && !lockedNodes.includes(n));
    while (activeNodes.length < 3 && remaining.length > 0) {
      activeNodes.push(remaining.shift()!);
    }
  }

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
    <div className="min-h-screen px-4 py-6 max-w-lg mx-auto space-y-8">
      {/* Phase title */}
      <motion.div initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} className="text-center space-y-4">
        <h1 className="font-display text-3xl text-primary">{phase.name}</h1>
        <PhaseProgress xp={userXP} />
      </motion.div>

      {/* Completed nodes (scroll up reveals history) */}
      {completedNodes.length > 0 && (
        <div className="space-y-2">
          {completedNodes.slice(-3).map((node, i) => (
            <motion.div
              key={node.id}
              initial={{ opacity: 0 }}
              animate={{ opacity: 0.5 }}
              className="glass-card p-3 flex items-center gap-3"
            >
              <div className="w-8 h-8 rounded-lg bg-primary/20 flex items-center justify-center">
                <Check className="h-4 w-4 text-primary" />
              </div>
              <span className="text-sm text-muted-foreground">{node.title}</span>
            </motion.div>
          ))}
          {/* Dotted path */}
          <div className="flex justify-center py-2">
            <div className="w-px h-8 border-l border-dashed border-muted-foreground/30" />
          </div>
        </div>
      )}

      {/* Active nodes (3) */}
      <div className="space-y-3">
        {activeNodes.map((node, i) => (
          <motion.button
            key={node.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.1 }}
            onClick={() => handleNodeClick(node)}
            className="w-full glass-card p-4 flex items-center gap-4 hover:border-primary/30 transition-all text-left"
          >
            <div className="w-12 h-12 rounded-xl bg-primary/10 border border-primary/20 flex items-center justify-center shrink-0">
              <Mic className="h-5 w-5 text-primary" />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-medium text-foreground truncate">{node.title}</p>
              <p className="text-xs text-muted-foreground mt-0.5">{node.description || "Disponible"}</p>
            </div>
            <ChevronRight className="h-4 w-4 text-muted-foreground shrink-0" />
          </motion.button>
        ))}
      </div>

      {/* Dotted path to locked */}
      <div className="flex justify-center py-2">
        <div className="w-px h-10 border-l border-dashed border-muted-foreground/20" />
      </div>

      {/* Locked nodes (2 mysterious) */}
      <div className="space-y-3">
        {lockedNodes.map((node, i) => (
          <motion.div
            key={node.id}
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.3 + i * 0.1 }}
            className="glass-card p-4 flex items-center gap-4 opacity-40"
          >
            <div className="w-12 h-12 rounded-xl bg-muted/30 border border-muted-foreground/10 flex items-center justify-center shrink-0">
              <Lock className="h-5 w-5 text-primary/50" />
            </div>
            <div className="flex-1">
              <p className="text-sm text-muted-foreground">Próximamente</p>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Drawer */}
      <SkillDrawer node={selectedNode} onClose={() => setSelectedNode(null)} streak={streak} />
    </div>
  );
}
