import { NavLink, useLocation } from "react-router-dom";
import { motion } from "framer-motion";
import { Home, Mic, Rss, Mountain, User } from "lucide-react";
import { cn } from "@/lib/utils";

const TABS = [
  { label: "Home", url: "/", icon: Home },
  { label: "Karaoke", url: "/karaoke", icon: Mic },
  { label: "Feed", url: "/talent-feed", icon: Rss },
  { label: "Leyenda", url: "/skill-tree", icon: Mountain },
  { label: "Perfil", url: "/fingerprint", icon: User },
];

export function BottomNav() {
  const location = useLocation();

  // Hide on non-auth landing (Home handles its own full-screen layout)
  const hideOnRoutes = ["/login", "/landing", "/onboarding", "/reset-password", "/vocal-dna-test"];
  if (hideOnRoutes.includes(location.pathname)) return null;

  return (
    <nav className="fixed bottom-0 left-0 right-0 z-50 md:hidden">
      <div className="h-[1px] bg-gradient-to-r from-primary/20 via-primary/40 to-primary/20" />

      <div className="bg-background/92 backdrop-blur-2xl px-2 pb-[env(safe-area-inset-bottom)]">
        <div className="flex items-center justify-around h-16">
          {TABS.map((tab) => {
            const isActive = tab.url === "/"
              ? location.pathname === "/"
              : location.pathname.startsWith(tab.url);

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
                    "text-[10px] font-medium mt-1 transition-all duration-300",
                    isActive ? "text-primary" : "text-muted-foreground/50"
                  )}
                >
                  {tab.label}
                </span>
                {isActive && (
                  <motion.div
                    layoutId="activeTabDot"
                    className="absolute -bottom-0.5 w-1 h-1 rounded-full bg-primary"
                    transition={{ type: "spring", stiffness: 500, damping: 30 }}
                  />
                )}
              </NavLink>
            );
          })}
        </div>
      </div>
    </nav>
  );
}
