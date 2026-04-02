import { useState, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useNavigate } from "react-router-dom";
import { Play, Search, Heart } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { Skeleton } from "@/components/ui/skeleton";

interface Track {
  id: string;
  title: string;
  artist: string;
  genre: string | null;
  difficulty: string | null;
  bpm: number | null;
  key: string | null;
}

const GENRES = ["Todos", "Pop", "Rock", "Balada", "R&B", "Reggaeton", "Latin Pop", "Jazz", "Bolero", "Ranchera", "Rap"];

const GENRE_COLORS: Record<string, string> = {
  Pop: "from-pink-500/20 to-purple-500/10",
  Rock: "from-red-500/20 to-orange-500/10",
  Balada: "from-blue-400/20 to-indigo-500/10",
  "R&B": "from-violet-500/20 to-fuchsia-500/10",
  Rap: "from-amber-500/20 to-yellow-500/10",
  Reggaeton: "from-green-400/20 to-emerald-500/10",
  "Latin Pop": "from-pink-400/20 to-rose-500/10",
  Jazz: "from-cyan-500/20 to-teal-500/10",
  Bolero: "from-red-400/20 to-rose-500/10",
  Ranchera: "from-orange-500/20 to-red-500/10",
};

const difficultyLabel: Record<string, { text: string; color: string }> = {
  easy: { text: "Fácil", color: "text-emerald-400" },
  medium: { text: "Media", color: "text-amber-400" },
  hard: { text: "Difícil", color: "text-red-400" },
};

const DifficultyBadge = ({ level }: { level: string | null }) => {
  const d = difficultyLabel[level || "medium"] || difficultyLabel.medium;
  return <span className={`text-[10px] font-medium ${d.color}`}>{d.text}</span>;
};

export function SongBrowser() {
  const navigate = useNavigate();
  const { user } = useAuth();
  const [tracks, setTracks] = useState<Track[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeGenre, setActiveGenre] = useState("Todos");
  const [search, setSearch] = useState("");
  const [favorites, setFavorites] = useState<Set<string>>(new Set());

  const fetchTracks = useCallback(async () => {
    setLoading(true);
    const body: Record<string, any> = { action: "list", limit: 50 };
    if (activeGenre !== "Todos") body.genre = activeGenre;
    if (search.trim()) body.query = search.trim();

    const action = search.trim() ? "search" : "list";
    body.action = action;

    const { data } = await supabase.functions.invoke("karaoke-tracks", { body });
    setTracks(data?.tracks || []);
    setLoading(false);
  }, [activeGenre, search]);

  useEffect(() => {
    const timer = setTimeout(fetchTracks, search ? 300 : 0);
    return () => clearTimeout(timer);
  }, [fetchTracks, search]);

  // Load favorites
  useEffect(() => {
    if (!user) return;
    supabase.functions.invoke("user-favorites", {
      body: { action: "list", user_id: user.id, item_type: "track" },
    }).then(({ data }) => {
      if (data?.favorites) setFavorites(new Set(data.favorites.map((f: any) => f.item_id)));
    }).catch(() => {});
  }, [user]);

  const toggleFavorite = async (trackId: string) => {
    if (!user) return;
    const isFav = favorites.has(trackId);
    const newFavs = new Set(favorites);
    if (isFav) newFavs.delete(trackId); else newFavs.add(trackId);
    setFavorites(newFavs);

    await supabase.functions.invoke("user-favorites", {
      body: { action: isFav ? "remove" : "add", user_id: user.id, item_type: "track", item_id: trackId },
    }).catch(() => {});
  };

  return (
    <div className="space-y-4 w-full">
      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
        <input
          type="text"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Buscar canción o artista..."
          className="w-full h-10 pl-10 pr-4 rounded-xl bg-card border border-border/40 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:border-primary/40 transition-colors"
        />
      </div>

      {/* Genre chips */}
      <div className="flex gap-2 overflow-x-auto pb-1 scrollbar-hide -mx-4 px-4">
        {GENRES.map((g) => (
          <button
            key={g}
            onClick={() => setActiveGenre(g)}
            className={`px-3 py-1.5 rounded-full text-xs font-bold uppercase tracking-wider whitespace-nowrap transition-all ${
              activeGenre === g
                ? "stage-gradient text-primary-foreground"
                : "glass-card text-muted-foreground hover:text-foreground"
            }`}
          >
            {g}
          </button>
        ))}
      </div>

      {/* Loading skeletons */}
      {loading && (
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4">
          {Array.from({ length: 6 }).map((_, i) => (
            <Skeleton key={i} className="min-w-[140px] h-[120px] rounded-xl" />
          ))}
        </div>
      )}

      {/* Empty state */}
      {!loading && tracks.length === 0 && (
        <div className="text-center py-12">
          <p className="text-4xl mb-3">🎵</p>
          <p className="text-sm text-muted-foreground">No se encontraron canciones</p>
          <button onClick={() => { setSearch(""); setActiveGenre("Todos"); }} className="text-xs text-primary mt-2 hover:underline">
            Ver todo el catálogo
          </button>
        </div>
      )}

      {/* Songs horizontal scroll */}
      {!loading && tracks.length > 0 && (
        <div className="flex gap-3 overflow-x-auto pb-3 -mx-4 px-4 snap-x snap-mandatory scrollbar-hide">
          {tracks.map((track, i) => (
            <motion.div
              key={track.id}
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.03, duration: 0.3 }}
              className={`snap-start min-w-[140px] md:min-w-[160px] glass-card p-3 text-left hover:border-primary/30 transition-all bg-gradient-to-b ${GENRE_COLORS[track.genre || "Pop"] || "from-primary/10 to-primary/5"} relative group`}
            >
              <button
                onClick={() => navigate("/karaoke")}
                className="w-full text-left"
              >
                <div className="h-8 w-8 rounded-lg bg-background/40 flex items-center justify-center mb-2">
                  <Play className="h-3.5 w-3.5 text-primary" />
                </div>
                <p className="text-xs font-bold text-foreground truncate">{track.title}</p>
                <p className="text-[10px] text-muted-foreground truncate">{track.artist}</p>
                <div className="mt-1.5">
                  <DifficultyBadge level={track.difficulty} />
                </div>
              </button>
              {user && (
                <button
                  onClick={(e) => { e.stopPropagation(); toggleFavorite(track.id); }}
                  className="absolute top-2 right-2 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  <Heart className={`h-3.5 w-3.5 transition-colors ${favorites.has(track.id) ? "fill-primary text-primary" : "text-muted-foreground"}`} />
                </button>
              )}
            </motion.div>
          ))}
        </div>
      )}

      {/* Track count */}
      {!loading && tracks.length > 0 && (
        <p className="text-[10px] text-muted-foreground text-center">{tracks.length} canciones · Catálogo en expansión</p>
      )}
    </div>
  );
}
