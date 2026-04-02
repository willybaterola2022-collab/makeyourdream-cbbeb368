import { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Bell, CheckCheck, Flame, Trophy, Music, Swords, Sparkles, ArrowLeft } from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useAuth } from "@/contexts/AuthContext";
import { supabase } from "@/integrations/supabase/client";
import { trackEvent } from "@/lib/trackEvent";
import { Skeleton } from "@/components/ui/skeleton";
import { StageButton } from "@/components/ui/StageButton";

interface Notification {
  id: string;
  type: string;
  title: string;
  body: string | null;
  read: boolean;
  created_at: string;
  metadata: any;
}

const TYPE_ICON: Record<string, typeof Bell> = {
  streak: Flame,
  achievement: Trophy,
  challenge: Music,
  duel: Swords,
  info: Bell,
  talent: Sparkles,
};

const TYPE_COLOR: Record<string, string> = {
  streak: "text-orange-400",
  achievement: "text-primary",
  challenge: "text-emerald-400",
  duel: "text-red-400",
  info: "text-muted-foreground",
  talent: "text-violet-400",
};

function timeAgo(dateStr: string) {
  const diff = Date.now() - new Date(dateStr).getTime();
  const mins = Math.floor(diff / 60000);
  if (mins < 60) return `${mins}m`;
  const hrs = Math.floor(mins / 60);
  if (hrs < 24) return `${hrs}h`;
  return `${Math.floor(hrs / 24)}d`;
}

const NotificationCenter = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!user) return;
    trackEvent(user.id, "module_visited", { module: "notifications" });

    supabase.functions.invoke("notification-center", {
      body: { action: "list", user_id: user.id, limit: 50 },
    }).then(({ data }) => {
      setNotifications(data?.notifications || []);
      setLoading(false);
    }).catch(() => setLoading(false));
  }, [user]);

  const markRead = async (id: string) => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => (n.id === id ? { ...n, read: true } : n)));
    await supabase.functions.invoke("notification-center", {
      body: { action: "mark_read", user_id: user.id, notification_id: id },
    }).catch(() => {});
  };

  const markAllRead = async () => {
    if (!user) return;
    setNotifications((prev) => prev.map((n) => ({ ...n, read: true })));
    await supabase.functions.invoke("notification-center", {
      body: { action: "mark_all_read", user_id: user.id },
    }).catch(() => {});
  };

  const unreadCount = notifications.filter((n) => !n.read).length;

  if (!user) {
    return (
      <div className="p-4 flex flex-col items-center justify-center min-h-[60vh] gap-4">
        <Bell className="h-16 w-16 text-muted-foreground/30" />
        <p className="text-muted-foreground text-sm">Inicia sesión para ver tus notificaciones</p>
      </div>
    );
  }

  return (
    <div className="p-4 md:p-8 space-y-4 animate-fade-in max-w-2xl mx-auto">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-3">
          <button onClick={() => navigate(-1)} className="text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-5 w-5" />
          </button>
          <h1 className="font-display text-2xl font-semibold text-foreground">Notificaciones</h1>
          {unreadCount > 0 && (
            <span className="bg-primary text-primary-foreground text-[10px] font-bold px-2 py-0.5 rounded-full">
              {unreadCount}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button onClick={markAllRead} className="flex items-center gap-1.5 text-xs text-primary hover:underline">
            <CheckCheck className="h-3.5 w-3.5" />
            Marcar todo leído
          </button>
        )}
      </div>

      {loading && (
        <div className="space-y-3">
          {Array.from({ length: 5 }).map((_, i) => (
            <Skeleton key={i} className="h-16 rounded-xl" />
          ))}
        </div>
      )}

      {!loading && notifications.length === 0 && (
        <div className="text-center py-16">
          <Bell className="h-12 w-12 text-muted-foreground/20 mx-auto mb-3" />
          <p className="text-sm text-muted-foreground">Sin notificaciones aún</p>
          <p className="text-xs text-muted-foreground/60 mt-1">Entrena y participa para recibir alertas</p>
        </div>
      )}

      <AnimatePresence>
        {notifications.map((n, i) => {
          const Icon = TYPE_ICON[n.type] || Bell;
          const color = TYPE_COLOR[n.type] || "text-muted-foreground";
          return (
            <motion.button
              key={n.id}
              initial={{ opacity: 0, y: 8 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => markRead(n.id)}
              className={`w-full text-left glass-card p-4 flex items-start gap-3 transition-all ${
                !n.read ? "border-primary/20 bg-primary/[0.03]" : "opacity-60"
              }`}
            >
              <div className={`h-8 w-8 rounded-lg bg-background/60 flex items-center justify-center shrink-0 ${color}`}>
                <Icon className="h-4 w-4" />
              </div>
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-foreground truncate">{n.title}</p>
                  {!n.read && <div className="h-1.5 w-1.5 rounded-full bg-primary shrink-0" />}
                </div>
                {n.body && <p className="text-xs text-muted-foreground mt-0.5 line-clamp-2">{n.body}</p>}
              </div>
              <span className="text-[10px] text-muted-foreground/50 shrink-0">{timeAgo(n.created_at)}</span>
            </motion.button>
          );
        })}
      </AnimatePresence>
    </div>
  );
};

export default NotificationCenter;
