import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Search, Sparkles, TrendingUp, Star, ChevronRight, Mic } from "lucide-react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";
import { useNavigate } from "react-router-dom";
import { TalentRadar } from "@/components/skilltree/TalentRadar";

interface TalentProfile {
  user_id: string;
  talent_score: number;
  display_name: string;
  avatar_url: string | null;
  vocal_level: string | null;
  classification: string | null;
  dimensions: any;
  bio: string | null;
  featured: boolean;
}

const DIMENSION_FILTERS = ["Todos", "Pitch", "Rango", "Potencia", "Control", "Expresión", "Creatividad"];

export default function TalentFeed() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [talents, setTalents] = useState<TalentProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("Todos");
  const [selectedTalent, setSelectedTalent] = useState<TalentProfile | null>(null);

  useEffect(() => {
    async function fetchTalents() {
      try {
        const { data } = await supabase.functions.invoke("talent-scout", {
          body: { action: "get_talent_feed" },
        });
        if (data?.talents) setTalents(data.talents);
      } catch (e) {
        console.error("Error fetching talent feed:", e);
      }
      setLoading(false);
    }
    fetchTalents();
  }, []);

  const filtered = filter === "Todos"
    ? talents
    : talents.filter((t) => {
        const dims = t.dimensions;
        if (!dims) return false;
        const key = filter.toLowerCase();
        return (dims[key] || 0) >= 75;
      }).sort((a, b) => {
        const key = filter.toLowerCase();
        return ((b.dimensions?.[key] || 0) - (a.dimensions?.[key] || 0));
      });

  const radarDims = (t: TalentProfile) => {
    const d = t.dimensions || {};
    return [
      { label: "Pitch", value: d.pitch || 50, percentile: 20 },
      { label: "Rango", value: d.rango || 45, percentile: 30 },
      { label: "Potencia", value: d.potencia || 50, percentile: 25 },
      { label: "Control", value: d.control || 50, percentile: 25 },
      { label: "Expresión", value: d.expresion || 40, percentile: 35 },
      { label: "Creatividad", value: d.creatividad || 35, percentile: 40 },
    ];
  };

  return (
    <div className="min-h-screen pb-24" style={{ background: "#0A0A0F" }}>
      {/* Header */}
      <div className="px-4 pt-6 pb-4">
        <motion.div initial={{ opacity: 0, y: -10 }} animate={{ opacity: 1, y: 0 }}>
          <div className="flex items-center gap-2 mb-1">
            <Sparkles className="h-5 w-5 text-[#FFA502]" />
            <h1 className="text-2xl font-bold text-white" style={{ fontFamily: "'Space Grotesk', sans-serif" }}>
              Talent Feed
            </h1>
          </div>
          <p className="text-sm text-[#A0A0B0]">
            Descubre las voces más prometedoras de la comunidad
          </p>
        </motion.div>

        {/* Filter pills */}
        <div className="flex gap-2 mt-4 overflow-x-auto scrollbar-hide pb-1">
          {DIMENSION_FILTERS.map((f) => (
            <button
              key={f}
              onClick={() => setFilter(f)}
              className={`shrink-0 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-wider transition-all ${
                filter === f
                  ? "bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white"
                  : "bg-white/5 border border-white/10 text-white/50 hover:text-white/70"
              }`}
            >
              {f}
            </button>
          ))}
        </div>
      </div>

      {/* Talent Cards */}
      <div className="px-4 space-y-3">
        {loading ? (
          <div className="space-y-3">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-24 rounded-2xl bg-white/5 animate-pulse" />
            ))}
          </div>
        ) : filtered.length === 0 ? (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            className="flex flex-col items-center justify-center py-16 text-center"
          >
            <Mic className="h-12 w-12 text-white/10 mb-4" />
            <p className="text-sm text-white/40 mb-2">Aún no hay talentos en el feed</p>
            <p className="text-xs text-white/20 mb-4">
              Completa tu análisis vocal para aparecer aquí
            </p>
            <button
              onClick={() => navigate("/fingerprint")}
              className="px-4 py-2 rounded-xl bg-gradient-to-r from-[#FF3CAC] to-[#784BA0] text-white text-xs font-bold"
            >
              Analizar mi voz
            </button>
          </motion.div>
        ) : (
          filtered.map((talent, i) => (
            <motion.div
              key={talent.user_id}
              initial={{ opacity: 0, y: 16 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.05 }}
            >
              <button
                onClick={() => setSelectedTalent(selectedTalent?.user_id === talent.user_id ? null : talent)}
                className="w-full text-left p-4 rounded-2xl border border-white/[0.06] bg-white/[0.02] hover:bg-white/[0.04] transition-all"
              >
                <div className="flex items-center gap-3">
                  {/* Avatar */}
                  <div
                    className="w-12 h-12 rounded-xl flex items-center justify-center shrink-0"
                    style={{
                      background: talent.featured
                        ? "linear-gradient(135deg, #FFA502, #FFD700)"
                        : "linear-gradient(135deg, #FF3CAC, #784BA0)",
                    }}
                  >
                    {talent.avatar_url ? (
                      <img src={talent.avatar_url} alt="" className="w-full h-full rounded-xl object-cover" />
                    ) : (
                      <span className="text-lg font-bold text-white">
                        {talent.display_name?.charAt(0)?.toUpperCase() || "?"}
                      </span>
                    )}
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-bold text-white truncate">{talent.display_name}</span>
                      {talent.featured && <Star className="h-3 w-3 text-[#FFA502] shrink-0" fill="#FFA502" />}
                    </div>
                    <div className="flex items-center gap-2 mt-0.5">
                      {talent.classification && (
                        <span className="text-[9px] px-1.5 py-0.5 rounded bg-[#784BA0]/20 text-[#784BA0] font-bold uppercase">
                          {talent.classification}
                        </span>
                      )}
                      <span className="text-[10px] text-[#A0A0B0]">{talent.vocal_level}</span>
                    </div>
                  </div>

                  {/* Score */}
                  <div className="flex flex-col items-center shrink-0">
                    <span
                      className="text-lg font-bold"
                      style={{
                        color: talent.talent_score >= 80 ? "#FFA502" : talent.talent_score >= 60 ? "#FF3CAC" : "#A0A0B0",
                        fontFamily: "'JetBrains Mono', monospace",
                      }}
                    >
                      {talent.talent_score}
                    </span>
                    <span className="text-[8px] text-[#A0A0B0] uppercase tracking-wider">DNA</span>
                  </div>

                  <ChevronRight className={`h-4 w-4 text-white/20 shrink-0 transition-transform ${selectedTalent?.user_id === talent.user_id ? "rotate-90" : ""}`} />
                </div>
              </button>

              {/* Expanded radar */}
              <AnimatePresence>
                {selectedTalent?.user_id === talent.user_id && (
                  <motion.div
                    initial={{ height: 0, opacity: 0 }}
                    animate={{ height: "auto", opacity: 1 }}
                    exit={{ height: 0, opacity: 0 }}
                    className="overflow-hidden"
                  >
                    <div className="p-4 rounded-b-2xl border border-t-0 border-white/[0.06] bg-[#1E1E2E]">
                      <TalentRadar dimensions={radarDims(talent)} vocalDNA={talent.talent_score} />
                      {talent.bio && (
                        <p className="text-xs text-[#A0A0B0] mt-3 text-center italic">"{talent.bio}"</p>
                      )}
                    </div>
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          ))
        )}
      </div>

      {/* Discover CTA for logged-in users */}
      {user && (
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.5 }}
          className="fixed bottom-20 left-4 right-4 z-40"
        >
          <button
            onClick={() => navigate("/fingerprint")}
            className="w-full py-3.5 rounded-2xl bg-gradient-to-r from-[#FF3CAC] via-[#784BA0] to-[#2B86C5] text-white font-bold text-sm flex items-center justify-center gap-2 shadow-lg shadow-[#FF3CAC]/20"
          >
            <TrendingUp className="h-4 w-4" />
            Analizar mi voz y aparecer aquí
          </button>
        </motion.div>
      )}
    </div>
  );
}
