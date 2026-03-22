import { supabase } from "@/integrations/supabase/client";

export function trackEvent(userId: string | undefined, eventType: string, metadata?: Record<string, any>) {
  // Fire and forget — never block UI
  supabase.functions.invoke("analytics-events", {
    body: {
      action: "track",
      user_id: userId || null,
      event_type: eventType,
      metadata: metadata || {},
    },
  }).catch(() => {});
}
