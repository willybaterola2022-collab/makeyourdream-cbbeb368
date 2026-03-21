import { useState, useEffect } from "react";
import { supabase } from "@/integrations/supabase/client";

interface TalentDimension {
  label: string;
  value: number;
  percentile: number;
}

interface TalentAlert {
  id: string;
  alert_type: string;
  dimension: string;
  score: number;
  percentile: number;
  ai_report: string | null;
  seen: boolean;
  created_at: string;
}

export function useTalentData(userId: string | undefined) {
  const [dimensions, setDimensions] = useState<TalentDimension[]>([]);
  const [vocalDNA, setVocalDNA] = useState(0);
  const [alerts, setAlerts] = useState<TalentAlert[]>([]);
  const [aiReport, setAiReport] = useState<string | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) { setLoading(false); return; }

    async function analyze() {
      try {
        const { data } = await supabase.functions.invoke("talent-scout", {
          body: { action: "analyze", user_id: userId },
        });

        if (data) {
          setDimensions(data.dimensions || []);
          setVocalDNA(data.vocalDNA || 0);
          setAlerts(data.alerts || []);
          setAiReport(data.aiReport || null);
        }
      } catch (e) {
        console.error("Talent analysis error:", e);
        // Fallback to mock data
        setDimensions([
          { label: "Pitch", value: 50, percentile: 50 },
          { label: "Rango", value: 45, percentile: 55 },
          { label: "Potencia", value: 50, percentile: 50 },
          { label: "Control", value: 48, percentile: 52 },
          { label: "Expresión", value: 42, percentile: 58 },
          { label: "Creatividad", value: 40, percentile: 60 },
        ]);
        setVocalDNA(46);
      }
      setLoading(false);
    }

    analyze();
  }, [userId]);

  // Listen for new talent alerts in realtime
  useEffect(() => {
    if (!userId) return;
    const channel = supabase
      .channel("talent-alerts")
      .on("postgres_changes", {
        event: "INSERT",
        schema: "public",
        table: "talent_alerts",
        filter: `user_id=eq.${userId}`,
      }, (payload) => {
        setAlerts((prev) => [payload.new as TalentAlert, ...prev]);
      })
      .subscribe();

    return () => { supabase.removeChannel(channel); };
  }, [userId]);

  return { dimensions, vocalDNA, alerts, aiReport, loading };
}
