import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, MessageCircle, Share2, ChevronUp, ChevronDown, Plus, Mic } from "lucide-react";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Badge } from "@/components/ui/badge";
import { StageButton } from "@/components/ui/StageButton";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { useNavigate } from "react-router-dom";

interface FeedPost {
  id: string;
  user_id: string;
  song_title: string | null;
  caption: string | null;
  likes_count: number;
  comments_count: number;
  score: number | null;
  created_at: string;
}

export default function VocalStories() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [currentIdx, setCurrentIdx] = useState(0);
  const [likedPosts, setLikedPosts] = useState<Set<string>>(new Set());

  useEffect(() => {
    supabase
      .from("social_feed")
      .select("*")
      .order("created_at", { ascending: false })
      .limit(20)
      .then(({ data }) => setPosts(data ?? []));
  }, []);

  const toggleLike = async (postId: string) => {
    if (likedPosts.has(postId)) return;
    setLikedPosts((prev) => new Set([...prev, postId]));
    setPosts((prev) => prev.map((p) => p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p));
    await supabase.rpc("increment_likes", { p_post_id: postId });
  };

  const post = posts[currentIdx];
  const next = () => setCurrentIdx((i) => Math.min(i + 1, posts.length - 1));
  const prev = () => setCurrentIdx((i) => Math.max(i - 1, 0));

  if (posts.length === 0) {
    return (
      <div className="p-8 text-center space-y-4">
        <h1 className="font-serif text-2xl font-bold text-foreground">Vocal Stories</h1>
        <p className="text-muted-foreground">No hay stories aún. ¡Sé el primero!</p>
        <StageButton variant="primary" icon={<Mic className="h-5 w-5" />} onClick={() => navigate("/karaoke")}>
          Grabar una story
        </StageButton>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 max-w-md mx-auto">
      <div className="mb-6">
        <h1 className="font-serif text-2xl font-bold text-foreground">Vocal Stories</h1>
        <p className="text-muted-foreground text-sm mt-1">Clips de voz de la comunidad</p>
      </div>

      <AnimatePresence mode="wait">
        {post && (
          <motion.div
            key={post.id}
            initial={{ opacity: 0, y: 30 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -30 }}
            className="glass-card overflow-hidden"
          >
            <div className="h-48 bg-gradient-to-b from-primary/10 to-card flex flex-col items-center justify-center relative">
              <div className="absolute top-3 left-3 right-3 flex gap-1">
                {posts.slice(0, 8).map((_, i) => (
                  <div key={i} className={`h-1 flex-1 rounded-full ${i === currentIdx ? "bg-primary" : "bg-muted"}`} />
                ))}
              </div>
              <div className="flex items-end gap-[2px] h-16 w-40">
                {Array.from({ length: 24 }).map((_, i) => (
                  <motion.div key={i} className="flex-1 rounded-sm bg-primary"
                    animate={{ height: `${15 + Math.random() * 85}%`, opacity: 0.6 }}
                    transition={{ duration: 0.3, repeat: Infinity, repeatType: "reverse", delay: i * 0.05 }} />
                ))}
              </div>
              {post.song_title && <Badge className="mt-3 bg-primary/20 text-primary border-primary/30">{post.song_title}</Badge>}
            </div>

            <div className="p-4">
              {post.caption && <p className="text-sm text-foreground mb-3">{post.caption}</p>}
              {post.score && <p className="text-xs text-muted-foreground mb-2">Score: {post.score}</p>}

              <div className="flex items-center gap-4">
                <motion.button whileTap={{ scale: 0.9 }} onClick={() => toggleLike(post.id)}
                  className={`flex items-center gap-1 text-sm ${likedPosts.has(post.id) ? "text-destructive" : "text-muted-foreground"}`}>
                  <Heart className={`h-5 w-5 ${likedPosts.has(post.id) ? "fill-current" : ""}`} />
                  {post.likes_count}
                </motion.button>
                <span className="flex items-center gap-1 text-sm text-muted-foreground">
                  <MessageCircle className="h-5 w-5" /> {post.comments_count}
                </span>
              </div>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      <div className="flex justify-between mt-4">
        <StageButton variant="glass" onClick={prev} disabled={currentIdx === 0}>
          <ChevronUp className="h-4 w-4" /> Anterior
        </StageButton>
        <StageButton variant="primary" icon={<Plus className="h-4 w-4" />} onClick={() => navigate("/karaoke")}>
          Grabar
        </StageButton>
        <StageButton variant="glass" onClick={next} disabled={currentIdx === posts.length - 1}>
          Siguiente <ChevronDown className="h-4 w-4" />
        </StageButton>
      </div>
    </div>
  );
}
