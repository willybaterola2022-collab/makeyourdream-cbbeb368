
-- Demo Reels: users curate their best recordings as a talent showcase
CREATE TABLE public.demo_reels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  recordings jsonb NOT NULL DEFAULT '[]',
  talent_score integer DEFAULT 0,
  featured boolean DEFAULT false,
  bio text,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.demo_reels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view demo reels" ON public.demo_reels FOR SELECT USING (true);
CREATE POLICY "Users can insert own demo reel" ON public.demo_reels FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own demo reel" ON public.demo_reels FOR UPDATE USING (auth.uid() = user_id);

-- Talent Alerts: triggered when a user shows exceptional vocal metrics
CREATE TABLE public.talent_alerts (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  alert_type text NOT NULL DEFAULT 'dimension_high',
  dimension text,
  score integer,
  percentile integer,
  ai_report text,
  seen boolean DEFAULT false,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.talent_alerts ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own alerts" ON public.talent_alerts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "System can insert alerts" ON public.talent_alerts FOR INSERT WITH CHECK (true);
CREATE POLICY "Users can update own alerts" ON public.talent_alerts FOR UPDATE USING (auth.uid() = user_id);

-- Enable realtime for talent alerts
ALTER PUBLICATION supabase_realtime ADD TABLE public.talent_alerts;

-- Make vocal_fingerprints publicly readable for talent feed
CREATE POLICY "Anyone can view fingerprints for talent feed" ON public.vocal_fingerprints FOR SELECT USING (true);
DROP POLICY IF EXISTS "Users can view own fingerprints" ON public.vocal_fingerprints;
