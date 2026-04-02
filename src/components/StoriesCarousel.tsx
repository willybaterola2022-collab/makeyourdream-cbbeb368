import { useState, useEffect, useRef } from "react";
import { motion } from "framer-motion";
import { Plus, Play, Pause } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";

interface StoryItem {
  id: string;
  user_id: string;
  caption: string | null;
  song_title: string | null;
  created_at: string;
  display_name?: string;
}

const MOOD_COLORS: Record<string, string> = {
  Atardecer: "from-primary/30 to-primary/10",
  Nocturno: "from-accent/30 to-accent/10",
  Oceano: "from-primary/20 to-accent/20",
  Fuego: "from-destructive/30 to-primary/10",
  Sueño: "from-primary/25 to-muted/20",
  Poder: "from-accent/25 to-destructive/15",
};

function getMoodGradient(title: string | null): string {
  if (!title) return "from-primary/20 to-muted/10";
  for (const [mood, gradient] of Object.entries(MOOD_COLORS)) {
    if (title.includes(mood)) return gradient;
  }
  return "from-primary/20 to-muted/10";
}

export function StoriesCarousel() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [stories, setStories] = useState<StoryItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [playingId, setPlayingId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchStories() {
      try {
        const { data } = await supabase.functions.invoke("social-feed", {
          body: { action: "get_feed", filter: "recent" },
        });
        const posts = (data?.posts || data?.feed || []).filter(
          (p: any) => p.song_title?.startsWith("Story:")
        ).slice(0, 12);

        // Enrich with display names
        if (posts.length > 0) {
          const userIds = [...new Set(posts.map((p: any) => p.user_id))];
          const { data: profiles } = await supabase
            .from("profiles")
            .select("user_id, display_name")
            .in("user_id", userIds);
          const nameMap = new Map((profiles || []).map(p => [p.user_id, p.display_name]));
          posts.forEach((p: any) => {
            p.display_name = nameMap.get(p.user_id) || "Artista";
          });
        }

        setStories(posts);
      } catch {}
      setLoading(false);
    }
    fetchStories();
  }, []);

  if (loading) {
    return (
      <div className="flex gap-3 overflow-hidden px-1">
        {[0, 1, 2, 3].map(i => (
          <div key={i} className="w-[72px] h-[96px] rounded-2xl bg-muted/30 animate-pulse shrink-0" />
        ))}
      </div>
    );
  }

  return (
    <div ref={scrollRef} className="flex gap-3 overflow-x-auto no-scrollbar px-1 -mx-1">
      {/* Create story button */}
      <motion.button
        whileHover={{ scale: 1.03 }}
        whileTap={{ scale: 0.97 }}
        onClick={() => navigate("/vocal-story")}
        className="w-[72px] h-[96px] rounded-2xl border-2 border-dashed border-primary/30 flex flex-col items-center justify-center gap-1 shrink-0 transition-transform duration-200 hover:border-primary/50"
      >
        <div className="w-8 h-8 rounded-full bg-primary/10 flex items-center justify-center">
          <Plus className="h-4 w-4 text-primary" />
        </div>
        <span className="text-[9px] text-muted-foreground">Tu story</span>
      </motion.button>

      {/* Story items */}
      {stories.map((story, i) => {
        const gradient = getMoodGradient(story.song_title);
        const isOwn = story.user_id === user?.id;
        const mood = story.song_title?.replace("Story: ", "") || "";

        return (
          <motion.button
            key={story.id}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: i * 0.03 }}
            whileHover={{ scale: 1.03 }}
            whileTap={{ scale: 0.97 }}
            className={`w-[72px] h-[96px] rounded-2xl bg-gradient-to-b ${gradient} border shrink-0 flex flex-col items-center justify-end p-2 relative overflow-hidden transition-transform duration-200 ${
              isOwn ? "border-primary/40 ring-1 ring-primary/20" : "border-border/20"
            }`}
          >
            <span className="text-lg absolute top-2">{mood === "Atardecer" ? "🌅" : mood === "Nocturno" ? "🌙" : mood === "Oceano" ? "🌊" : mood === "Fuego" ? "🔥" : mood === "Sueño" ? "✨" : "⚡"}</span>
            <p className="text-[8px] text-foreground font-medium truncate w-full text-center">
              {isOwn ? "Tú" : (story.display_name || "").split(" ")[0]}
            </p>
          </motion.button>
        );
      })}

      {stories.length === 0 && (
        <div className="flex items-center justify-center h-[96px] px-4">
          <p className="text-xs text-muted-foreground">Sé el primero en compartir</p>
        </div>
      )}
    </div>
  );
}
