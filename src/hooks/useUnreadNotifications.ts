import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";
import { useAuth } from "@/contexts/AuthContext";

export function useUnreadNotifications() {
  const { user } = useAuth();
  const [count, setCount] = useState(0);

  useEffect(() => {
    if (!user) { setCount(0); return; }

    const fetch = () => {
      supabase.functions.invoke("notification-center", {
        body: { action: "count_unread", user_id: user.id },
      }).then(({ data }) => {
        setCount(data?.unread || 0);
      }).catch(() => {});
    };

    fetch();
    const interval = setInterval(fetch, 60_000); // poll every 60s
    return () => clearInterval(interval);
  }, [user]);

  return count;
}
