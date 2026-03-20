
-- REALTIME (use DROP + ADD to avoid "already exists" errors)
DO $$ BEGIN
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.social_feed; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.collab_rooms; EXCEPTION WHEN duplicate_object THEN NULL; END;
  BEGIN ALTER PUBLICATION supabase_realtime ADD TABLE public.duels; EXCEPTION WHEN duplicate_object THEN NULL; END;
END $$;

-- INDEXES
CREATE INDEX IF NOT EXISTS idx_training_sessions_user_created ON public.training_sessions(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_recordings_user_created ON public.recordings(user_id, created_at DESC);
CREATE INDEX IF NOT EXISTS idx_daily_challenges_date ON public.daily_challenges(active_date);
