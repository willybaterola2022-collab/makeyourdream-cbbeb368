import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { LayoutDashboard, Layers, Mic, Dumbbell, Fingerprint } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Escenario", url: "/", icon: LayoutDashboard },
  { label: "Estudio", url: "/loop-station", icon: Layers },
  { label: "Canta", url: "/karaoke", icon: Mic, isCenter: true },
  { label: "Entrena", url: "/warmup", icon: Dumbbell },
  { label: "Tu Voz", url: "/fingerprint", icon: Fingerprint },
];

export function BottomNav() {
  const location = useLocation();

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="bg-background/85 backdrop-blur-2xl border-t border-border/30 px-2 pb-[env(safe-area-inset-bottom)]">
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
                  className="relative -mt-6 flex flex-col items-center"
                >
                  <motion.div
                    className="absolute w-20 h-20 rounded-full"
                    animate={{
                      boxShadow: [
                        "0 0 20px 8px hsl(275 85% 60% / 0.2)",
                        "0 0 35px 14px hsl(275 85% 60% / 0.45)",
                        "0 0 20px 8px hsl(275 85% 60% / 0.2)",
                      ],
                    }}
                    transition={{ duration: 2, repeat: Infinity, ease: "easeInOut" }}
                  />
                  <motion.div
                    whileTap={{ scale: 0.9 }}
                    className="relative w-16 h-16 rounded-full flex items-center justify-center stage-gradient shadow-lg"
                  >
                    <tab.icon className="h-7 w-7 text-primary-foreground" />
                  </motion.div>
                  <span className="text-[10px] font-bold uppercase tracking-wider mt-1 text-primary">
                    {tab.label}
                  </span>
                </NavLink>
              );
            }

            return (
              <NavLink
                key={tab.url}
                to={tab.url}
                className="flex flex-col items-center justify-center py-2 px-3 min-w-[56px] active:scale-95 transition-transform"
              >
                <tab.icon
                  className={cn(
                    "h-5 w-5 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                />
                <span
                  className={cn(
                    "text-[10px] font-bold uppercase tracking-wider mt-1 transition-colors duration-200",
                    isActive ? "text-primary" : "text-muted-foreground"
                  )}
                >
                  {tab.label}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
