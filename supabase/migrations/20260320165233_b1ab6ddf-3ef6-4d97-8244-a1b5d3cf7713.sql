
-- ══════════════════════════════════════════════
-- TABLA 1: user_progress
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.user_progress (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  xp integer NOT NULL DEFAULT 0,
  level integer NOT NULL DEFAULT 1,
  streak_days integer NOT NULL DEFAULT 0,
  longest_streak integer NOT NULL DEFAULT 0,
  last_active_date date,
  badges jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

ALTER TABLE public.user_progress ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own progress" ON public.user_progress FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own progress" ON public.user_progress FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own progress" ON public.user_progress FOR UPDATE USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════
-- TABLA 2: vocal_fingerprints
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.vocal_fingerprints (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recording_id uuid REFERENCES public.recordings(id) ON DELETE SET NULL,
  dimensions jsonb DEFAULT '{}'::jsonb,
  global_score integer DEFAULT 0,
  vocal_range_low real,
  vocal_range_high real,
  classification text,
  similar_artists jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.vocal_fingerprints ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own fingerprints" ON public.vocal_fingerprints FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own fingerprints" ON public.vocal_fingerprints FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════
-- TABLA 3: daily_challenges
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.daily_challenges (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  title text NOT NULL,
  description text,
  challenge_type text NOT NULL DEFAULT 'sing',
  target_criteria jsonb DEFAULT '{}'::jsonb,
  reward_xp integer NOT NULL DEFAULT 50,
  active_date date NOT NULL DEFAULT CURRENT_DATE,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.daily_challenges ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view challenges" ON public.daily_challenges FOR SELECT USING (true);
CREATE POLICY "Only admins can insert challenges" ON public.daily_challenges FOR INSERT WITH CHECK (public.has_role(auth.uid(), 'admin'));

-- ══════════════════════════════════════════════
-- TABLA 4: challenge_completions
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.challenge_completions (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  challenge_id uuid NOT NULL REFERENCES public.daily_challenges(id) ON DELETE CASCADE,
  recording_id uuid REFERENCES public.recordings(id) ON DELETE SET NULL,
  score integer DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now(),
  UNIQUE(user_id, challenge_id)
);

ALTER TABLE public.challenge_completions ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own completions" ON public.challenge_completions FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own completions" ON public.challenge_completions FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════
-- TABLA 5: social_feed
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.social_feed (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recording_id uuid REFERENCES public.recordings(id) ON DELETE SET NULL,
  caption text,
  song_title text,
  score integer DEFAULT 0,
  likes_count integer NOT NULL DEFAULT 0,
  comments_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.social_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view feed" ON public.social_feed FOR SELECT USING (true);
CREATE POLICY "Users can insert own posts" ON public.social_feed FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own posts" ON public.social_feed FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "Users can delete own posts" ON public.social_feed FOR DELETE USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════
-- TABLA 6: duels
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.duels (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  challenger_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  opponent_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  song_title text,
  status text NOT NULL DEFAULT 'pending',
  challenger_score integer DEFAULT 0,
  opponent_score integer DEFAULT 0,
  winner_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.duels ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own duels" ON public.duels FOR SELECT USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);
CREATE POLICY "Users can create duels" ON public.duels FOR INSERT WITH CHECK (auth.uid() = challenger_id);
CREATE POLICY "Participants can update duels" ON public.duels FOR UPDATE USING (auth.uid() = challenger_id OR auth.uid() = opponent_id);

-- ══════════════════════════════════════════════
-- TABLA 7: collab_rooms
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.collab_rooms (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  creator_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title text NOT NULL DEFAULT 'Sala de Colaboración',
  max_participants integer NOT NULL DEFAULT 4,
  status text NOT NULL DEFAULT 'open',
  participants jsonb DEFAULT '[]'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now(),
  updated_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.collab_rooms ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Anyone can view open rooms" ON public.collab_rooms FOR SELECT USING (true);
CREATE POLICY "Users can create rooms" ON public.collab_rooms FOR INSERT WITH CHECK (auth.uid() = creator_id);
CREATE POLICY "Creator can update room" ON public.collab_rooms FOR UPDATE USING (auth.uid() = creator_id);
CREATE POLICY "Creator can delete room" ON public.collab_rooms FOR DELETE USING (auth.uid() = creator_id);

-- ══════════════════════════════════════════════
-- TABLA 8: analytics_events
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.analytics_events (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid REFERENCES auth.users(id) ON DELETE SET NULL,
  event_type text NOT NULL,
  metadata jsonb DEFAULT '{}'::jsonb,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.analytics_events ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own events" ON public.analytics_events FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own events" ON public.analytics_events FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════
-- TABLA 9: share_cards
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.share_cards (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  fingerprint_id uuid REFERENCES public.vocal_fingerprints(id) ON DELETE SET NULL,
  card_type text NOT NULL DEFAULT 'fingerprint',
  card_data jsonb DEFAULT '{}'::jsonb,
  image_url text,
  share_count integer NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.share_cards ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own cards" ON public.share_cards FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own cards" ON public.share_cards FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Users can update own cards" ON public.share_cards FOR UPDATE USING (auth.uid() = user_id);

-- ══════════════════════════════════════════════
-- TABLA 10: recording_comparisons
-- ══════════════════════════════════════════════
CREATE TABLE IF NOT EXISTS public.recording_comparisons (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id uuid NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  recording_a_id uuid NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  recording_b_id uuid NOT NULL REFERENCES public.recordings(id) ON DELETE CASCADE,
  delta_pitch real DEFAULT 0,
  delta_timing real DEFAULT 0,
  delta_expression real DEFAULT 0,
  delta_overall real DEFAULT 0,
  summary text,
  created_at timestamptz NOT NULL DEFAULT now()
);

ALTER TABLE public.recording_comparisons ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view own comparisons" ON public.recording_comparisons FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "Users can insert own comparisons" ON public.recording_comparisons FOR INSERT WITH CHECK (auth.uid() = user_id);

-- ══════════════════════════════════════════════
-- TRIGGERS
-- ══════════════════════════════════════════════
CREATE TRIGGER update_user_progress_updated_at
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_duels_updated_at
  BEFORE UPDATE ON public.duels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_collab_rooms_updated_at
  BEFORE UPDATE ON public.collab_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Auto-create user_progress on signup
CREATE OR REPLACE FUNCTION public.handle_new_user_progress()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  INSERT INTO public.user_progress (user_id)
  VALUES (NEW.id)
  ON CONFLICT (user_id) DO NOTHING;
  RETURN NEW;
END;
$$;

-- Increment likes on social_feed
CREATE OR REPLACE FUNCTION public.increment_likes(p_post_id uuid)
RETURNS void
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path TO 'public'
AS $$
BEGIN
  UPDATE public.social_feed
  SET likes_count = likes_count + 1
  WHERE id = p_post_id;
END;
$$;

-- Calculate WAS (Weekly Activated Singers)
CREATE OR REPLACE FUNCTION public.calculate_was(weeks_back integer DEFAULT 0)
RETURNS integer
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path TO 'public'
AS $$
  SELECT COUNT(DISTINCT user_id)::integer
  FROM public.recordings
  WHERE created_at >= (CURRENT_DATE - (weeks_back * 7 + 7)) 
    AND created_at < (CURRENT_DATE - (weeks_back * 7));
$$;
