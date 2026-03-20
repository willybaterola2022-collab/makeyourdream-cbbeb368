import { NavLink } from "react-router-dom";
import { useLocation } from "react-router-dom";
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
      {/* Glass backdrop */}
      <div className="bg-background/80 backdrop-blur-xl border-t border-border/40 px-2 pb-[env(safe-area-inset-bottom)]">
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
                  className="relative -mt-5 flex flex-col items-center"
                >
                  <div
                    className={cn(
                      "w-14 h-14 rounded-full flex items-center justify-center shadow-lg transition-all duration-200 active:scale-95",
                      "stage-gradient shadow-[0_0_20px_-4px_hsl(var(--primary)/0.5)]",
                    )}
                  >
                    <tab.icon className="h-6 w-6 text-primary-foreground" />
                  </div>
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
                className="flex flex-col items-center justify-center py-2 px-3 min-w-[56px]"
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
