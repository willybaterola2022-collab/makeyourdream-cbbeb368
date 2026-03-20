import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarGroup,
  SidebarGroupLabel,
  SidebarGroupContent,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Mic, LayoutDashboard, Music, Fingerprint, Stethoscope, BrainCircuit,
  Dumbbell, Trophy, Wind, Ear, Thermometer, Sliders, Swords, UsersRound,
  Layers, PenLine, Wand2, Sparkles, Theater, BookOpen, Calendar, UserCircle,
} from "lucide-react";

interface ModuleItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
}

interface ModuleGroup {
  label: string;
  items: ModuleItem[];
}

const SIDEBAR_GROUPS: ModuleGroup[] = [
  {
    label: "🎤 Escenario",
    items: [
      { title: "Tu Escenario", url: "/", icon: LayoutDashboard },
      { title: "Canta", url: "/karaoke", icon: Mic },
      { title: "Tu Voz", url: "/fingerprint", icon: Fingerprint },
    ],
  },
  {
    label: "🎛️ Estudio",
    items: [
      { title: "Loop Station", url: "/loop-station", icon: Layers },
      { title: "Auto Mix", url: "/automix", icon: Wand2 },
      { title: "Escribe Letras", url: "/lyrics-writer", icon: PenLine },
      { title: "Laboratorio", url: "/harmony-lab", icon: Sparkles },
      { title: "Efectos", url: "/vocal-fx", icon: Sliders },
    ],
  },
  {
    label: "💪 Entrena",
    items: [
      { title: "Calentamiento", url: "/warmup", icon: Thermometer },
      { title: "Afina tu Oído", url: "/pitch-training", icon: Ear },
      { title: "Respiración", url: "/breath-trainer", icon: Wind },
      { title: "Tu Coach IA", url: "/coach", icon: BrainCircuit },
      { title: "Reto Diario", url: "/exercises", icon: Dumbbell },
    ],
  },
  {
    label: "⚔️ Arena",
    items: [
      { title: "Duelos 1v1", url: "/duelos", icon: Swords },
      { title: "Colabora", url: "/collab-room", icon: UsersRound },
      { title: "El Escenario", url: "/stage-simulator", icon: Theater },
    ],
  },
  {
    label: "📈 Tu Carrera",
    items: [
      { title: "Portfolio", url: "/portfolio", icon: UserCircle },
      { title: "Diario Vocal", url: "/voice-journal", icon: BookOpen },
      { title: "Plan 90 Días", url: "/plan-90", icon: Calendar },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg stage-gradient flex items-center justify-center shrink-0">
            <Music className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <h1 className="font-serif text-lg font-semibold text-foreground leading-tight truncate">
              MakeYourDream
            </h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1.5">
        {SIDEBAR_GROUPS.map((group) => {
          const groupHasActive = group.items.some((item) =>
            item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url)
          );

          return (
            <SidebarGroup key={group.label} defaultOpen={groupHasActive}>
              {!collapsed && <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-muted-foreground/60 px-2">{group.label}</SidebarGroupLabel>}
              <SidebarGroupContent>
                <SidebarMenu>
                  {group.items.map((item) => {
                    const isActive = item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url);
                    return (
                      <SidebarMenuItem key={item.url}>
                        <SidebarMenuButton asChild>
                          <NavLink
                            to={item.url}
                            end={item.url === "/"}
                            className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-all duration-200 ${
                              isActive
                                ? "bg-primary/10 text-primary font-medium shadow-[0_0_15px_-5px_hsl(var(--primary)/0.3)]"
                                : "text-muted-foreground hover:text-foreground hover:bg-muted/50"
                            }`}
                          >
                            <item.icon className={`h-4 w-4 shrink-0 ${collapsed ? "mx-auto" : ""}`} />
                            {!collapsed && (
                              <span className="truncate flex-1 text-xs font-bold uppercase tracking-wider">{item.title}</span>
                            )}
                          </NavLink>
                        </SidebarMenuButton>
                      </SidebarMenuItem>
                    );
                  })}
                </SidebarMenu>
              </SidebarGroupContent>
            </SidebarGroup>
          );
        })}
      </SidebarContent>
    </Sidebar>
  );
}
