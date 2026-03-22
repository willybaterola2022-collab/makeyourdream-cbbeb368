import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Heart, Mic, Play, Pause, MessageCircle } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { trackEvent } from "@/lib/trackEvent";
import { toast } from "sonner";

interface FeedPost {
  id: string;
  user_id: string;
  recording_id: string | null;
  caption: string | null;
  song_title: string | null;
  score: number | null;
  likes_count: number;
  created_at: string;
  profiles?: { display_name: string | null; avatar_url: string | null } | null;
}

function timeAgo(dateStr: string): string {
  const diff = Math.floor((Date.now() - new Date(dateStr).getTime()) / 1000);
  if (diff < 60) return "ahora";
  if (diff < 3600) return `${Math.floor(diff / 60)}m`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h`;
  return `${Math.floor(diff / 86400)}d`;
}

function PostCard({
  post,
  onLike,
}: {
  post: FeedPost;
  onLike: (id: string) => void;
}) {
  const [playing, setPlaying] = useState(false);
  const [audio, setAudio] = useState<HTMLAudioElement | null>(null);
  const name = post.profiles?.display_name || "Artista";
  const initials = name.slice(0, 2).toUpperCase();

  const togglePlay = useCallback(async () => {
    if (!post.recording_id) return;
    if (audio) {
      if (playing) {
        audio.pause();
        setPlaying(false);
      } else {
        audio.play();
        setPlaying(true);
      }
      return;
    }
    // Fetch recording URL
    const { data: rec } = await supabase
      .from("recordings")
      .select("file_url")
      .eq("id", post.recording_id)
      .maybeSingle();
    if (rec?.file_url) {
      const a = new Audio(rec.file_url);
      a.onended = () => setPlaying(false);
      a.play();
      setAudio(a);
      setPlaying(true);
    }
  }, [post.recording_id, audio, playing]);

  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card p-4 space-y-3"
    >
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary/20 flex items-center justify-center shrink-0">
          {post.profiles?.avatar_url ? (
            <img src={post.profiles.avatar_url} alt="" className="w-full h-full rounded-full object-cover" />
          ) : (
            <span className="text-sm font-bold text-primary">{initials}</span>
          )}
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-bold text-foreground truncate">{name}</p>
          <p className="text-[10px] text-muted-foreground">{timeAgo(post.created_at)}</p>
        </div>
        {post.score != null && (
          <span className="text-lg font-mono font-bold text-primary">{post.score}</span>
        )}
      </div>

      {/* Song title */}
      {post.song_title && (
        <p className="text-xs text-muted-foreground">🎵 {post.song_title}</p>
      )}

      {/* Caption */}
      {post.caption && (
        <p className="text-sm text-foreground">{post.caption}</p>
      )}

      {/* Audio player + actions */}
      <div className="flex items-center gap-3">
        {post.recording_id && (
          <button
            onClick={togglePlay}
            className="h-10 w-10 rounded-full bg-primary/10 flex items-center justify-center hover:bg-primary/20 transition-colors"
          >
            {playing ? (
              <Pause className="h-4 w-4 text-primary" />
            ) : (
              <Play className="h-4 w-4 text-primary" />
            )}
          </button>
        )}
        <div className="flex-1" />
        <button
          onClick={() => onLike(post.id)}
          className="flex items-center gap-1.5 text-muted-foreground hover:text-primary transition-colors"
        >
          <Heart className="h-4 w-4" />
          <span className="text-xs font-bold">{post.likes_count}</span>
        </button>
      </div>
    </motion.div>
  );
}

export default function TalentFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [posts, setPosts] = useState<FeedPost[]>([]);
  const [loading, setLoading] = useState(true);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);

  const loadFeed = useCallback(async (pageNum = 1) => {
    setLoading(true);
    try {
      const { data } = await supabase.functions.invoke("social-feed", {
        body: { action: "feed", page: pageNum, limit: 20 },
      });
      const newPosts = data?.posts || [];
      setPosts((prev) => (pageNum === 1 ? newPosts : [...prev, ...newPosts]));
      setPage(pageNum);
      setHasMore(newPosts.length >= 20);
    } catch {
      // Fallback: direct query
      const from = (pageNum - 1) * 20;
      const { data: directPosts } = await supabase
        .from("social_feed")
        .select("*, profiles!social_feed_user_id_fkey(display_name, avatar_url)")
        .order("created_at", { ascending: false })
        .range(from, from + 19);
      const newPosts = directPosts || [];
      setPosts((prev) => (pageNum === 1 ? newPosts : [...prev, ...newPosts]));
      setPage(pageNum);
      setHasMore(newPosts.length >= 20);
    }
    setLoading(false);
  }, []);

  useEffect(() => {
    loadFeed();
    if (user) trackEvent(user.id, "module_visited", { module: "feed" });
  }, [loadFeed, user]);

  // Realtime subscription
  useEffect(() => {
    const channel = supabase
      .channel("social-feed-realtime")
      .on("postgres_changes", { event: "INSERT", schema: "public", table: "social_feed" }, (payload) => {
        setPosts((prev) => [payload.new as FeedPost, ...prev]);
      })
      .subscribe();
    return () => { supabase.removeChannel(channel); };
  }, []);

  const handleLike = useCallback(async (postId: string) => {
    // Optimistic update
    setPosts((prev) =>
      prev.map((p) => (p.id === postId ? { ...p, likes_count: p.likes_count + 1 } : p))
    );
    await supabase.functions.invoke("social-feed", {
      body: { action: "like", post_id: postId },
    });
  }, []);

  const handleScroll = useCallback(
    (e: React.UIEvent<HTMLDivElement>) => {
      const el = e.currentTarget;
      if (el.scrollHeight - el.scrollTop - el.clientHeight < 200 && !loading && hasMore) {
        loadFeed(page + 1);
      }
    },
    [loading, hasMore, page, loadFeed]
  );

  return (
    <div className="min-h-screen pb-24" onScroll={handleScroll}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <h1 className="font-display text-2xl text-foreground">Feed</h1>
          <p className="text-sm text-muted-foreground">
            Escuchá las voces de la comunidad
          </p>
        </motion.div>
      </div>

      {/* Posts */}
      <div className="px-4 space-y-3">
        {loading && posts.length === 0 ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 rounded-2xl bg-muted/20 animate-pulse" />
            ))}
          </div>
        ) : posts.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Mic className="h-12 w-12 text-muted-foreground/20 mb-4" />
            <p className="text-sm text-muted-foreground mb-2">El feed está vacío</p>
            <p className="text-xs text-muted-foreground/60 mb-4">
              Graba algo en Karaoke y sé el primero en publicar
            </p>
            <button
              onClick={() => navigate("/karaoke")}
              className="px-4 py-2 rounded-xl bg-primary text-primary-foreground text-xs font-bold"
            >
              Ir a cantar
            </button>
          </motion.div>
        ) : (
          posts.map((post) => (
            <PostCard key={post.id} post={post} onLike={handleLike} />
          ))
        )}

        {loading && posts.length > 0 && (
          <div className="flex justify-center py-4">
            <div className="w-6 h-6 rounded-full border-2 border-primary/30 border-t-primary animate-spin" />
          </div>
        )}
      </div>
    </div>
  );
}
