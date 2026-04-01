import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar, SidebarContent, SidebarHeader, SidebarMenu, SidebarMenuButton,
  SidebarMenuItem, SidebarGroup, SidebarGroupLabel, SidebarGroupContent, useSidebar,
} from "@/components/ui/sidebar";
import {
  Home, Mic, Heart, Trophy, Music, Dumbbell, Flame, Wind, PenTool, Repeat, FileText,
  Swords, GitCompare, User, Fingerprint, GraduationCap, BookOpen, Sun, TrendingUp,
  Award, Piano, Sliders, Disc3, Film, Sparkles, Palette, Waves, Music2, Camera,
  Users, MessageCircle, Crown, Heart as HeartIcon,
} from "lucide-react";

const SIDEBAR_ITEMS = [
  { label: "Principales", items: [
    { title: "Home", url: "/", icon: Home },
    { title: "Karaoke", url: "/karaoke", icon: Mic },
    { title: "Feed", url: "/talent-feed", icon: Heart },
    { title: "Leyenda", url: "/skill-tree", icon: Trophy },
  ]},
  { label: "Diario", items: [
    { title: "Rutina Diaria", url: "/daily-flow", icon: Sun },
    { title: "Racha", url: "/streak", icon: Flame },
    { title: "Horóscopo Vocal", url: "/vocal-horoscope", icon: Sparkles },
    { title: "Logros", url: "/achievements", icon: Award },
    { title: "Recap", url: "/recap", icon: Film },
  ]},
  { label: "Entrenar", items: [
    { title: "Ejercicios", url: "/exercises", icon: Dumbbell },
    { title: "Warm Up", url: "/warmup", icon: Flame },
    { title: "Pitch Training", url: "/pitch-training", icon: Music },
    { title: "Breath Trainer", url: "/breath-trainer", icon: Wind },
    { title: "Sala de Práctica", url: "/practice-room", icon: Mic },
    { title: "Rango Vocal", url: "/range-explorer", icon: TrendingUp },
    { title: "Harmony", url: "/harmony-trainer", icon: Music },
    { title: "Vibrato", url: "/vibrato-coach", icon: Waves },
  ]},
  { label: "Crear", items: [
    { title: "Cover Studio", url: "/cover-studio", icon: Disc3 },
    { title: "Song Sketch", url: "/song-sketch", icon: PenTool },
    { title: "Loop Station", url: "/loop-station", icon: Repeat },
    { title: "Lyrics Writer", url: "/lyrics-writer", icon: FileText },
    { title: "Voice Effects", url: "/voice-effects", icon: Sliders },
    { title: "Melody Maker", url: "/melody-maker", icon: Music2 },
    { title: "Tone Lab", url: "/tone-lab", icon: Palette },
    { title: "Vocal Story", url: "/vocal-story", icon: Camera },
  ]},
  { label: "Social", items: [
    { title: "Duelos", url: "/duelos", icon: Swords },
    { title: "Vocal Battle", url: "/vocal-battle", icon: Swords },
    { title: "Comparador", url: "/comparator", icon: GitCompare },
    { title: "Duets", url: "/duets", icon: Users },
    { title: "Reacciones", url: "/reactions", icon: MessageCircle },
    { title: "Temporadas", url: "/seasons", icon: Crown },
    { title: "Matches", url: "/matches", icon: HeartIcon },
  ]},
  { label: "Mi Perfil", items: [
    { title: "Perfil", url: "/profile", icon: User },
    { title: "Fingerprint", url: "/fingerprint", icon: Fingerprint },
    { title: "Evolución", url: "/evolution", icon: TrendingUp },
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
            <h1 className="font-display text-lg text-foreground leading-tight truncate">MakeYourDream</h1>
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
                        <NavLink to={item.url} end={item.url === "/"}
                          className={`group flex items-center gap-2.5 rounded-xl px-2.5 py-2 text-sm transition-all duration-200 ${
                            isActive
                              ? "bg-primary/5 text-primary font-medium shadow-[0_0_15px_-5px_hsl(var(--primary)/0.2)]"
                              : "text-muted-foreground/40 hover:text-foreground/70 hover:bg-muted/30"
                          }`}>
                          <item.icon className={`h-4 w-4 shrink-0 ${collapsed ? "mx-auto" : ""}`} />
                          {!collapsed && <span className="truncate flex-1 text-xs font-normal uppercase tracking-wider">{item.title}</span>}
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
