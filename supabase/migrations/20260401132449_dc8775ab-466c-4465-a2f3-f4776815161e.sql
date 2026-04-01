
-- Table: karaoke_tracks (catálogo de canciones)
CREATE TABLE public.karaoke_tracks (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  artist TEXT NOT NULL,
  genre TEXT DEFAULT 'pop',
  difficulty TEXT DEFAULT 'medium',
  bpm INTEGER,
  key TEXT,
  lyrics_url TEXT,
  backing_track_url TEXT,
  play_count INTEGER DEFAULT 0,
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.karaoke_tracks ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read tracks" ON public.karaoke_tracks FOR SELECT USING (true);
CREATE POLICY "Admins can manage tracks" ON public.karaoke_tracks FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Table: weekly_reports (resúmenes semanales)
CREATE TABLE public.weekly_reports (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  week_start DATE NOT NULL,
  data JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, week_start)
);
ALTER TABLE public.weekly_reports ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own reports" ON public.weekly_reports FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service can insert reports" ON public.weekly_reports FOR INSERT WITH CHECK (true);

-- Table: notifications (in-app)
CREATE TABLE public.notifications (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  type TEXT NOT NULL DEFAULT 'info',
  title TEXT NOT NULL,
  body TEXT,
  read BOOLEAN DEFAULT false,
  metadata JSONB DEFAULT '{}',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.notifications ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own notifications" ON public.notifications FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Users update own notifications" ON public.notifications FOR UPDATE TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Service can insert notifications" ON public.notifications FOR INSERT WITH CHECK (true);

-- Table: seasonal_events (temporadas competitivas)
CREATE TABLE public.seasonal_events (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  theme TEXT,
  start_date DATE NOT NULL,
  end_date DATE NOT NULL,
  rewards JSONB DEFAULT '[]',
  status TEXT DEFAULT 'upcoming',
  created_at TIMESTAMPTZ DEFAULT now()
);
ALTER TABLE public.seasonal_events ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Anyone can read seasons" ON public.seasonal_events FOR SELECT USING (true);
CREATE POLICY "Admins manage seasons" ON public.seasonal_events FOR ALL TO authenticated USING (public.has_role(auth.uid(), 'admin'));

-- Table: seasonal_progress (progreso por temporada)
CREATE TABLE public.seasonal_progress (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  season_id UUID NOT NULL REFERENCES public.seasonal_events(id) ON DELETE CASCADE,
  xp_earned INTEGER DEFAULT 0,
  rank INTEGER,
  created_at TIMESTAMPTZ DEFAULT now(),
  UNIQUE(user_id, season_id)
);
ALTER TABLE public.seasonal_progress ENABLE ROW LEVEL SECURITY;
CREATE POLICY "Users read own seasonal progress" ON public.seasonal_progress FOR SELECT TO authenticated USING (auth.uid() = user_id);
CREATE POLICY "Anyone can read leaderboard" ON public.seasonal_progress FOR SELECT USING (true);
CREATE POLICY "Users can join seasons" ON public.seasonal_progress FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
CREATE POLICY "Service can update progress" ON public.seasonal_progress FOR UPDATE WITH CHECK (true);
