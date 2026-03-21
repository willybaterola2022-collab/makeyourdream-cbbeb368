CREATE TABLE public.weekly_leaderboard (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL,
  week_start date NOT NULL,
  xp_earned integer NOT NULL DEFAULT 0,
  league text NOT NULL DEFAULT 'bronce',
  rank integer,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, week_start)
);
ALTER TABLE public.weekly_leaderboard ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can view leaderboard" ON public.weekly_leaderboard FOR SELECT USING (true);
CREATE POLICY "Users can insert own entries" ON public.weekly_leaderboard FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own entries" ON public.weekly_leaderboard FOR UPDATE USING (auth.uid() = user_id);
CREATE INDEX idx_leaderboard_week_xp ON public.weekly_leaderboard(week_start, xp_earned DESC);