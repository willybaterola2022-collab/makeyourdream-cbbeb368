
-- Fix: restrict talent_alerts INSERT to authenticated users only (edge functions use service role which bypasses RLS)
DROP POLICY IF EXISTS "System can insert alerts" ON public.talent_alerts;
CREATE POLICY "Authenticated can insert alerts" ON public.talent_alerts FOR INSERT TO authenticated WITH CHECK (auth.uid() = user_id);
