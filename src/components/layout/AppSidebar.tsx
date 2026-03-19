import { NavLink } from "@/components/NavLink";
import { useLocation } from "react-router-dom";
import {
  Sidebar,
  SidebarContent,
  SidebarHeader,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import {
  Mic, LayoutDashboard, Music, Fingerprint, Stethoscope, BrainCircuit,
  Dumbbell, Trophy, AudioWaveform, Users, UserCircle, Palette, Calendar,
  Wind, Ear, Thermometer, GitCompareArrows, Wand2, PenLine, Layers,
  Sparkles, Sliders, Swords, Radio, UsersRound, Radar, Heart, BookOpen, Theater,
} from "lucide-react";

interface ModuleItem {
  title: string;
  url: string;
  icon: React.ComponentType<{ className?: string }>;
  emoji: string;
}

const ALL_MODULES: ModuleItem[] = [
  { title: "The Stage", url: "/", icon: LayoutDashboard, emoji: "🎤" },
  { title: "Karaoke", url: "/karaoke", icon: Mic, emoji: "🎙️" },
  { title: "Song Sketch", url: "/song-sketch", icon: PenLine, emoji: "📓" },
  { title: "Loop Station", url: "/loop-station", icon: Layers, emoji: "🎛️" },
  { title: "Harmony Lab", url: "/harmony-lab", icon: Sparkles, emoji: "🎶" },
  { title: "Lyrics Writer", url: "/lyrics-writer", icon: PenLine, emoji: "✍️" },
  { title: "Vocal FX", url: "/vocal-fx", icon: Sliders, emoji: "🎸" },
  { title: "Auto-Mix", url: "/automix", icon: Wand2, emoji: "🪄" },
  { title: "AI Coach", url: "/coach", icon: BrainCircuit, emoji: "🧠" },
  { title: "Ejercicios", url: "/exercises", icon: Dumbbell, emoji: "🔥" },
  { title: "Warm-Up", url: "/warmup", icon: Thermometer, emoji: "🌡️" },
  { title: "Breath", url: "/breath-trainer", icon: Wind, emoji: "🫁" },
  { title: "Pitch", url: "/pitch-training", icon: Ear, emoji: "🎹" },
  { title: "Genre Gym", url: "/genre-gym", icon: Dumbbell, emoji: "💪" },
  { title: "Stage Sim", url: "/stage-simulator", icon: Theater, emoji: "🎭" },
  { title: "Fingerprint", url: "/fingerprint", icon: Fingerprint, emoji: "🔬" },
  { title: "Diagnóstico", url: "/diagnostico", icon: Stethoscope, emoji: "📊" },
  { title: "Emotion", url: "/emotion-map", icon: Heart, emoji: "🪞" },
  { title: "Before/After", url: "/comparator", icon: GitCompareArrows, emoji: "⚖️" },
  { title: "Voice Journal", url: "/voice-journal", icon: BookOpen, emoji: "📖" },
  { title: "Challenges", url: "/challenges", icon: Trophy, emoji: "🏆" },
  { title: "Duelos", url: "/duelos", icon: Swords, emoji: "⚔️" },
  { title: "Voice Match", url: "/matching", icon: AudioWaveform, emoji: "🎵" },
  { title: "Duetos IA", url: "/duetos", icon: Users, emoji: "🎤" },
  { title: "Collab", url: "/collab-room", icon: UsersRound, emoji: "🛋️" },
  { title: "Stories", url: "/vocal-stories", icon: Radio, emoji: "📻" },
  { title: "Dream Canvas", url: "/dream-canvas", icon: Palette, emoji: "🎨" },
  { title: "Plan 90", url: "/plan-90", icon: Calendar, emoji: "📅" },
  { title: "Portfolio", url: "/portfolio", icon: UserCircle, emoji: "👤" },
  { title: "Fan Radar", url: "/fan-radar", icon: Radar, emoji: "📡" },
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
        <SidebarMenu>
          {ALL_MODULES.map((item) => {
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
                    <span className={`text-lg ${collapsed ? "mx-auto" : ""}`}>{item.emoji}</span>
                    {!collapsed && (
                      <span className="truncate flex-1 text-xs font-bold uppercase tracking-wider">{item.title}</span>
                    )}
                  </NavLink>
                </SidebarMenuButton>
              </SidebarMenuItem>
            );
          })}
        </SidebarMenu>
      </SidebarContent>
    </Sidebar>
  );
}
