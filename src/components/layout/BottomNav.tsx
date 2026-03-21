import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Layers, Mic, Dumbbell, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

const TABS = [
  { label: "Escenario", url: "/", icon: LayoutDashboard, gradient: "from-violet-500 to-purple-600" },
  { label: "Estudio", url: "/loop-station", icon: Layers, gradient: "from-indigo-500 to-blue-600" },
  { label: "Canta", url: "/karaoke", icon: Mic, isCenter: true },
  { label: "Entrena", url: "/warmup", icon: Dumbbell, gradient: "from-orange-500 to-amber-600", hasBadge: true },
  { label: "Tu Voz", url: "/fingerprint", icon: Fingerprint, gradient: "from-cyan-500 to-teal-600" },
];

export function BottomNav() {
  const location = useLocation();
  const { user } = useAuth();
  const [pendingChallenges, setPendingChallenges] = useState(0);

  useEffect(() => {
    if (!user) return;
    const today = new Date().toISOString().split("T")[0];

    const fetchPending = async () => {
      const { data: challenges } = await supabase
        .from("daily_challenges")
        .select("id")
        .eq("active_date", today);

      if (!challenges?.length) return;

      const { data: completions } = await supabase
        .from("challenge_completions")
        .select("challenge_id")
        .eq("user_id", user.id);

      const completedIds = new Set(completions?.map((c) => c.challenge_id) ?? []);
      setPendingChallenges(challenges.filter((ch) => !completedIds.has(ch.id)).length);
    };

    fetchPending();
  }, [user, location.pathname]);

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      {/* Top gradient border */}
      <div className="h-[1px] bg-gradient-to-r from-violet-500/40 via-primary/60 to-cyan-500/40" />

      <div className="bg-[hsl(240_10%_4%/0.92)] backdrop-blur-2xl px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-end justify-around h-16">
          {TABS.map((tab) => {
            const isActive = tab.url === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.url);

            if (tab.isCenter) {
              return (
                <NavLink
                  key={tab.url}
                  to={tab.url}
                  className="relative -mt-8 flex flex-col items-center"
                >
                  {/* Outer pulse ring */}
                  <motion.div
                    className="absolute w-[76px] h-[76px] rounded-full border border-cyan-500/30"
                    animate={{ scale: [1, 1.15, 1], opacity: [0.4, 0, 0.4] }}
                    transition={{ duration: 2.5, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Inner glow ring */}
                  <motion.div
                    className="absolute w-[72px] h-[72px] rounded-full"
                    animate={{
                      boxShadow: [
                        "0 0 15px 4px hsl(275 85% 55% / 0.25)",
                        "0 0 30px 10px hsl(275 85% 55% / 0.5)",
                        "0 0 15px 4px hsl(275 85% 55% / 0.25)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  {/* Button */}
                  <motion.div
                    whileTap={{ scale: 0.88 }}
                    className="relative w-[72px] h-[72px] rounded-full flex items-center justify-center stage-gradient shadow-lg"
                  >
                    <Mic className="h-8 w-8 text-primary-foreground" />
                  </motion.div>
                  <span className="text-[10px] font-black uppercase tracking-widest mt-1 bg-gradient-to-r from-violet-400 to-cyan-400 bg-clip-text text-transparent">
                    {tab.label}
                  </span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={tab.url}
                to={tab.url}
                className="relative flex flex-col items-center justify-center py-2 px-3 min-w-[56px]"
              >
                <motion.div whileTap={{ scale: 0.85 }}>
                  <tab.icon
                    className={cn(
                      "h-5 w-5 transition-all duration-300",
                      isActive ? "text-primary drop-shadow-[0_0_6px_hsl(var(--primary)/0.5)]" : "text-muted-foreground/50"
                    )}
                  />
                </motion.div>
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mt-1 transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground/50"
                  )}
                >
                  {tab.label}
                </span>
                {/* Active dot indicator */}
                {isActive && (
                  <motion.div
                    layoutId="activeTabDot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
                {/* Notification badge for Entrena */}
                {tab.hasBadge && pendingChallenges > 0 && (
                  <motion.div
                    className="absolute top-1.5 right-2 w-[18px] h-[18px] rounded-full bg-red-500 flex items-center justify-center shadow-[0_0_8px_2px_hsl(0_80%_50%/0.4)]"
                    animate={{ scale: [1, 1.15, 1] }}
                    transition={{ duration: 1.5, repeat: Infinity }}
                  >
                    <span className="text-[9px] font-black text-white">{pendingChallenges}</span>
                  </motion.div>
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
