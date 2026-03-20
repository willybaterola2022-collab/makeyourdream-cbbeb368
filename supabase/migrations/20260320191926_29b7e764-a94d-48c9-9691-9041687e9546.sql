
-- Trigger: auto-create user_progress when new user signs up
CREATE TRIGGER on_auth_user_created_progress
  AFTER INSERT ON auth.users
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_new_user_progress();

-- Trigger: auto-update updated_at on user_progress
CREATE TRIGGER set_updated_at_user_progress
  BEFORE UPDATE ON public.user_progress
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: auto-update updated_at on duels
CREATE TRIGGER set_updated_at_duels
  BEFORE UPDATE ON public.duels
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();

-- Trigger: auto-update updated_at on collab_rooms
CREATE TRIGGER set_updated_at_collab_rooms
  BEFORE UPDATE ON public.collab_rooms
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();
