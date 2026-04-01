
-- Fix weekly_reports: only authenticated service or the user themselves can insert
DROP POLICY IF EXISTS "Service can insert reports" ON public.weekly_reports;
CREATE POLICY "Authenticated can insert own reports" ON public.weekly_reports FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Fix notifications: only authenticated service or the user themselves can insert
DROP POLICY IF EXISTS "Service can insert notifications" ON public.notifications;
CREATE POLICY "Authenticated can insert own notifications" ON public.notifications FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);

-- Fix seasonal_progress: update only own
DROP POLICY IF EXISTS "Service can update progress" ON public.seasonal_progress;
CREATE POLICY "Users update own progress" ON public.seasonal_progress FOR UPDATE TO authenticated USING (auth.uid() = user_id);
