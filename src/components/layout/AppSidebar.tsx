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
  PenLine,
  Layers,
  Sparkles,
  Sliders,
  Swords,
  Radio,
  UsersRound,
  Radar,
  Heart,
  BookOpen,
  Theater,
  ChevronDown,
} from "lucide-react";
import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import { useState } from "react";
import {
  Sidebar,
  SidebarContent,
  SidebarGroup,
  SidebarGroupContent,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  SidebarHeader,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";

interface ModuleItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  isNew?: boolean;
}

interface SidebarCategory {
  label: string;
  emoji: string;
  items: ModuleItem[];
}

const CATEGORIES: SidebarCategory[] = [
  {
    label: "ESCENARIO",
    emoji: "🎤",
    items: [
      { title: "The Stage", url: "/", icon: LayoutDashboard },
      { title: "Karaoke", url: "/karaoke", icon: Mic },
    ],
  },
  {
    label: "CREAR",
    emoji: "✨",
    items: [
      { title: "Song Sketch", url: "/song-sketch", icon: PenLine, isNew: true },
      { title: "Loop Station", url: "/loop-station", icon: Layers, isNew: true },
      { title: "Harmony Lab", url: "/harmony-lab", icon: Sparkles, isNew: true },
      { title: "Lyrics Writer", url: "/lyrics-writer", icon: PenLine, isNew: true },
      { title: "Vocal FX Studio", url: "/vocal-fx", icon: Sliders, isNew: true },
      { title: "Auto-Mix IA", url: "/automix", icon: Wand2 },
    ],
  },
  {
    label: "ENTRENAR",
    emoji: "💪",
    items: [
      { title: "AI Coach", url: "/coach", icon: BrainCircuit },
      { title: "Ejercicios", url: "/exercises", icon: Dumbbell },
      { title: "Warm-Up", url: "/warmup", icon: Thermometer },
      { title: "Breath Trainer", url: "/breath-trainer", icon: Wind },
      { title: "Pitch Training", url: "/pitch-training", icon: Ear },
      { title: "Genre Gym", url: "/genre-gym", icon: Dumbbell, isNew: true },
      { title: "Stage Simulator", url: "/stage-simulator", icon: Theater, isNew: true },
    ],
  },
  {
    label: "ANALIZAR",
    emoji: "🔬",
    items: [
      { title: "Vocal Fingerprint", url: "/fingerprint", icon: Fingerprint },
      { title: "Diagnóstico", url: "/diagnostico", icon: Stethoscope },
      { title: "Emotion Map", url: "/emotion-map", icon: Heart, isNew: true },
      { title: "Before/After", url: "/comparator", icon: GitCompareArrows },
      { title: "Voice Journal", url: "/voice-journal", icon: BookOpen, isNew: true },
    ],
  },
  {
    label: "SOCIAL",
    emoji: "🌐",
    items: [
      { title: "Challenges", url: "/challenges", icon: Trophy },
      { title: "Duelos 1v1", url: "/duelos", icon: Swords, isNew: true },
      { title: "Voice Match", url: "/matching", icon: AudioWaveform },
      { title: "Duetos IA", url: "/duetos", icon: Users },
      { title: "Collab Room", url: "/collab-room", icon: UsersRound, isNew: true },
      { title: "Vocal Stories", url: "/vocal-stories", icon: Radio, isNew: true },
    ],
  },
  {
    label: "MI CARRERA",
    emoji: "🚀",
    items: [
      { title: "Dream Canvas", url: "/dream-canvas", icon: Palette },
      { title: "Plan 90 Días", url: "/plan-90", icon: Calendar },
      { title: "Portfolio", url: "/portfolio", icon: UserCircle },
      { title: "Fan Radar", url: "/fan-radar", icon: Radar, isNew: true },
    ],
  },
];

export function AppSidebar() {
  const { state } = useSidebar();
  const collapsed = state === "collapsed";
  const location = useLocation();

  // Determine which categories should be open by default
  const activeCategoryIdx = CATEGORIES.findIndex((cat) =>
    cat.items.some((item) =>
      item.url === "/" ? location.pathname === "/" : location.pathname.startsWith(item.url)
    )
  );

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
        {CATEGORIES.map((category, catIdx) => (
          <Collapsible
            key={category.label}
            defaultOpen={catIdx === activeCategoryIdx || catIdx === 0}
          >
            <SidebarGroup>
              {!collapsed && (
                <CollapsibleTrigger className="w-full">
                  <SidebarGroupLabel className="flex items-center justify-between cursor-pointer hover:text-foreground transition-colors">
                    <span className="flex items-center gap-2 text-[11px] tracking-widest">
                      <span>{category.emoji}</span>
                      {category.label}
                    </span>
                    <ChevronDown className="h-3 w-3 transition-transform duration-200 [&[data-state=open]]:rotate-180" />
                  </SidebarGroupLabel>
                </CollapsibleTrigger>
              )}
              <CollapsibleContent>
                <SidebarGroupContent>
                  <SidebarMenu>
                    {category.items.map((item) => {
                      const isActive =
                        item.url === "/"
                          ? location.pathname === "/"
                          : location.pathname.startsWith(item.url);
                      return (
                        <SidebarMenuItem key={item.url}>
                          <SidebarMenuButton asChild>
                            <NavLink
                              to={item.url}
                              end={item.url === "/"}
                              className={`group flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-all duration-200 ${
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
                              {!collapsed && (
                                <span className="truncate flex-1">{item.title}</span>
                              )}
                              {!collapsed && item.isNew && (
                                <span className="text-[9px] font-bold uppercase tracking-wider text-primary bg-primary/10 px-1.5 py-0.5 rounded-full">
                                  new
                                </span>
                              )}
                            </NavLink>
                          </SidebarMenuButton>
                        </SidebarMenuItem>
                      );
                    })}
                  </SidebarMenu>
                </SidebarGroupContent>
              </CollapsibleContent>
            </SidebarGroup>
          </Collapsible>
        ))}
      </SidebarContent>
    </Sidebar>
  );
}
