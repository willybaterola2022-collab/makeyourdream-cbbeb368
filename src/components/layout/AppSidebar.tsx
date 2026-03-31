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
  Home, Mic, Heart, Trophy, Music,
  Dumbbell, Flame, Wind,
  PenTool, Repeat, FileText,
  Swords, GitCompare,
  User, Fingerprint, GraduationCap, BookOpen,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { label: "Principales", items: [
    { title: "Home", url: "/", icon: Home },
    { title: "Karaoke", url: "/karaoke", icon: Mic },
    { title: "Feed", url: "/talent-feed", icon: Heart },
    { title: "Leyenda", url: "/skill-tree", icon: Trophy },
  ]},
  { label: "Entrenar", items: [
    { title: "Ejercicios", url: "/exercises", icon: Dumbbell },
    { title: "Warm Up", url: "/warmup", icon: Flame },
    { title: "Pitch Training", url: "/pitch-training", icon: Music },
    { title: "Breath Trainer", url: "/breath-trainer", icon: Wind },
  ]},
  { label: "Crear", items: [
    { title: "Song Sketch", url: "/song-sketch", icon: PenTool },
    { title: "Loop Station", url: "/loop-station", icon: Repeat },
    { title: "Lyrics Writer", url: "/lyrics-writer", icon: FileText },
  ]},
  { label: "Social", items: [
    { title: "Duelos", url: "/duelos", icon: Swords },
    { title: "Comparador", url: "/comparator", icon: GitCompare },
  ]},
  { label: "Mi Perfil", items: [
    { title: "Perfil", url: "/profile", icon: User },
    { title: "Fingerprint", url: "/fingerprint", icon: Fingerprint },
    { title: "Coach", url: "/coach", icon: GraduationCap },
    { title: "Voice Journal", url: "/voice-journal", icon: BookOpen },
  ]},
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  return (
    <Sidebar collapsible="icon" className="border-r border-border/40">
      <SidebarHeader className="p-3">
        <div className="flex items-center gap-3">
          <div className="h-9 w-9 rounded-lg bg-primary flex items-center justify-center shrink-0">
            <Music className="h-5 w-5 text-primary-foreground" />
          </div>
          {!collapsed && (
            <h1 className="font-display text-lg text-foreground leading-tight truncate">
              MakeYourDream
            </h1>
          )}
        </div>
      </SidebarHeader>

      <SidebarContent className="px-1.5">
        {SIDEBAR_ITEMS.map((group) => (
          <SidebarGroup key={group.label}>
            {!collapsed && (
              <SidebarGroupLabel className="text-[10px] uppercase tracking-widest text-primary/40 px-2">
                {group.label}
              </SidebarGroupLabel>
            )}
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
                              ? "bg-primary/5 text-primary font-medium shadow-[0_0_15px_-5px_hsl(var(--primary)/0.2)]"
                              : "text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/30"
                          }`}
                        >
                          <item.icon className={`h-4 w-4 shrink-0 ${collapsed ? "mx-auto" : ""}`} />
                          {!collapsed && (
                            <span className="truncate flex-1 text-xs font-normal uppercase tracking-wider">{item.title}</span>
                          )}
                        </NavLink>
                      </SidebarMenuButton>
                    </SidebarMenuItem>
                  );
                })}
              </SidebarMenu>
            </SidebarGroupContent>
          </SidebarGroup>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
