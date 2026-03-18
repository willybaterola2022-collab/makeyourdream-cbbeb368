import {
  Mic,
  LayoutDashboard,
  Music,
  Fingerprint,
  Stethoscope,
  BrainCircuit,
  Dumbbell,
  Trophy,
  AudioWaveform,
  Users,
  UserCircle,
  Palette,
  Calendar,
  Wind,
  Ear,
  Thermometer,
  GitCompareArrows,
  Wand2,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";

const modules = [
  { title: "The Stage", url: "/", icon: LayoutDashboard },
  { title: "Karaoke", url: "/karaoke", icon: Mic },
  { title: "Vocal Fingerprint", url: "/fingerprint", icon: Fingerprint },
  { title: "Diagnóstico", url: "/diagnostico", icon: Stethoscope },
  { title: "AI Coach", url: "/coach", icon: BrainCircuit },
  { title: "Ejercicios", url: "/exercises", icon: Dumbbell },
  { title: "Dream Canvas", url: "/dream-canvas", icon: Palette },
  { title: "Plan 90 Días", url: "/plan-90", icon: Calendar },
  { title: "Breath Trainer", url: "/breath-trainer", icon: Wind },
  { title: "Pitch Training", url: "/pitch-training", icon: Ear },
  { title: "Warm-Up", url: "/warmup", icon: Thermometer },
  { title: "Before/After", url: "/comparator", icon: GitCompareArrows },
  { title: "Auto-Mix IA", url: "/automix", icon: Wand2 },
  { title: "Challenges", url: "/challenges", icon: Trophy },
  { title: "Voice Match", url: "/matching", icon: AudioWaveform },
  { title: "Duetos IA", url: "/duetos", icon: Users },
  { title: "Portfolio", url: "/portfolio", icon: UserCircle },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className="p-4">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg gold-gradient flex items-center justify-center shrink-0">
            <Music className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <div className="overflow-hidden">
              <h1 className="font-serif text-lg font-semibold text-foreground leading-tight truncate">
                MakeYourDream
              </h1>
              <p className="text-[10px] text-muted-foreground uppercase tracking-widest">
                Transform your voice
              </p>
            </div>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-2">
        <SidebarGroup>
          <SidebarGroupContent>
            <SidebarMenu>
              {modules.map((item) => {
                const isActive =
                  item.url === "/"
                    ? location.pathname === "/"
                    : location.pathname.startsWith(item.url);
                return (
                  <SidebarMenuItem key={item.title}>
                    <SidebarMenuButton asChild>
                      <NavLink
                        to={item.url}
                        end={item.url === "/"}
                        className={`group flex items-center gap-3 rounded-lg px-3 py-2.5 text-sm transition-all duration-200 ${
                          isActive
                            ? "bg-primary/10 text-primary font-medium"
                            : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                        }`}
                      >
                        <item.icon
                          className={`h-4 w-4 shrink-0 transition-colors ${
                            isActive ? "text-primary" : "text-muted-foreground group-hover:text-foreground"
                          }`}
                        />
                        {!collapsed && <span className="truncate">{item.title}</span>}
                      </NavLink>
                    </SidebarMenuButton>
                  </SidebarMenuItem>
                );
              })}
            </SidebarMenu>
          </SidebarGroupContent>
        </SidebarGroup>
      </SidebarContent>
    </Sidebar>
  );
}
