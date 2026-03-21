

# Super Informe End-to-End: MakeYourDream (KaraokAI)

## Testing Results Summary

### PASSED
| Module | Status | Details |
|--------|--------|---------|
| Home (Index) | OK | DreamBooth renders, 3 action pads, GRABAR AHORA CTA |
| Mobile Menu (☰) | OK | 19 modules in 4 categories, coming-soon hidden |
| BottomNav | OK | 5 tabs with CANTA pulse center button |
| Challenges | OK | Loads 6+ challenges from backend (daily_challenges table), XP badges, dates |
| Karaoke - Song List | OK | 10 preset songs with genre, difficulty, backing badges |
| Karaoke - Song Player | OK | Lyrics sync, pitch display, backing track toggle, progress bar |
| Skill Tree | OK* | Loads real XP from user_progress, 3 tabs, node states correct |

### BUGS FOUND
| Bug | Severity | Location |
|-----|----------|----------|
| SVG circle cx/cy undefined | Medium | `SkillBranch.tsx:36-38` — particle `<circle>` without initial cx/cy attributes causes Framer Motion rendering errors (dozens of console errors) |
| No triggers in DB | High | `db-triggers` section shows "no triggers" — the `handle_new_user_progress` and `handle_new_user` functions exist but triggers are NOT attached to `auth.users` |

### NOT TESTABLE (requires real mic/audio hardware)
- Actual singing + pitch scoring flow
- Recording save to storage bucket
- Backing track audio playback (Web Audio API)

---

## Architecture Snapshot for External AI Review

### Tech Stack
- **Frontend**: React 18 + Vite + TypeScript + Tailwind CSS + shadcn/ui + Framer Motion
- **Backend**: Supabase (Lovable Cloud) — 14 tables, 14 Edge Functions, 6 DB functions
- **Audio**: Web Audio API (OscillatorNode for backing tracks, AnalyserNode for pitch detection)
- **Auth**: Supabase Auth (email/password), AuthContext provider

### Database Schema (14 tables)
`profiles`, `user_progress`, `recordings`, `training_sessions`, `vocal_fingerprints`, `recording_comparisons`, `daily_challenges`, `challenge_completions`, `social_feed`, `collab_rooms`, `duels`, `song_sketches`, `analytics_events`, `share_cards`, `voice_journal_entries`, `user_roles`

### Edge Functions (14 deployed)
`vocal-analysis`, `vocal-fingerprint`, `ai-coach-feedback`, `save-training-session`, `daily-exercise`, `daily-challenge`, `gamification-engine`, `generate-share-card`, `compare-recordings`, `analytics-events`, `auto-clip`, `social-feed`, `duel-matchmaking`, `voice-translate`

### Navigation Architecture
- **Desktop**: Sidebar (AppSidebar) + top header
- **Mobile**: BottomNav (5 tabs) + Hamburger MobileMenu (19 modules in grid)
- **Pages**: 27 route pages total

---

## Critical Issues (for Claude Code / Gemini to fix)

### 1. DB Triggers Not Attached
The functions `handle_new_user()` and `handle_new_user_progress()` exist but NO triggers are attached to `auth.users`. New signups do NOT auto-create rows in `profiles` or `user_progress`.

**Fix SQL:**
```sql
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user();

CREATE TRIGGER on_auth_user_created_progress
  AFTER INSERT ON auth.users
  FOR EACH ROW EXECUTE FUNCTION public.handle_new_user_progress();
```

### 2. SVG Particle Bug in SkillBranch
`SkillBranch.tsx` line 36 renders `<circle r="2">` without `cx`/`cy` attributes. The `<animateMotion>` handles positioning but Framer Motion tries to read initial coords and throws errors.

**Fix:** Add `cx="2" cy="0"` to the circle element.

### 3. Modules with UI Only (no backend connection)
These modules render UI but don't save/load data:
- WarmUp, Breath Trainer, Pitch Training, Exercises → should save `training_sessions`
- Loop Station, Vocal FX → need Web Audio integration
- Lyrics Writer, Emotion Map, Portfolio, Voice Journal, Diagnostico → need CRUD operations

---

## Module Status Matrix

| Module | UI | Backend | Audio | Score |
|--------|----|---------|-------|-------|
| Karaoke Freestyle | Complete | vocal-analysis + save-training-session | Mic + pitch | Full |
| Karaoke Preset | Complete | save-training-session | Backing + pitch | Full |
| Fingerprint | Complete | vocal-fingerprint | Mic 15s | Full |
| Coach IA | Complete | ai-coach-feedback | None | Full |
| Challenges | Complete | daily_challenges table | None | Full |
| Skill Tree | Complete | user_progress (read) | None | 90% (SVG bug) |
| Exercises | Partial | daily-exercise | Pending | 50% |
| WarmUp | UI only | Not connected | Pending | 30% |
| Breath Trainer | UI only | Not connected | Pending | 30% |
| Pitch Training | UI only | Not connected | Pending | 30% |
| Comparator | UI only | compare-recordings exists | None | 40% |
| Song Sketch | UI only | song_sketches table | None | 50% |
| Loop Station | UI only | Not connected | Pending | 20% |
| Lyrics Writer | UI only | Not connected | None | 20% |
| Vocal FX | UI only | Not connected | Pending | 20% |
| Emotion Map | UI only | Not connected | None | 20% |
| Portfolio | UI only | Not connected | None | 20% |
| Voice Journal | UI only | Not connected | None | 20% |
| Diagnostico | UI only | Not connected | None | 20% |

---

## Recommendations for External AI (Claude Code / Gemini)

### Backend Priority Tasks
1. **Attach triggers** to `auth.users` (see SQL above)
2. **Connect WarmUp/BreathTrainer/PitchTraining** to save `training_sessions` + award XP via `gamification-engine`
3. **Add storage policies** verification — bucket `recordings` is public but RLS policies need testing
4. **Rate limiting** on edge functions (especially `vocal-analysis` and `ai-coach-feedback`)
5. **Streak logic**: Add a daily cron or trigger that resets `streak_days` when `last_active_date` is >48h ago

### Frontend Priority Tasks
1. **Fix SVG particle bug** in SkillBranch.tsx (add cx/cy)
2. **Lazy load routes** with `React.lazy()` — 27 pages in one bundle is heavy
3. **React Query migration** — replace raw `useEffect` fetches with `useQuery` for caching
4. **Error boundaries** around audio modules (mic permission failures)
5. **Skeleton screens** for Coach, Challenges, SkillTree loading states

---

## 10 Tips for "Soy Leyenda" Success

1. **Connect to real XP**: Node unlocking should react instantly when XP changes — use Supabase Realtime subscription on `user_progress` table
2. **Micro-rewards per node**: Each completed node should trigger a confetti animation + toast with XP earned, not just a silent state change
3. **Visual momentum**: Animate the SVG connection lines drawing when a new node unlocks — the line "grows" from parent to child over 1s
4. **Boss Node spectacle**: The 3 boss nodes (Maestro Técnico, Artista Completo, Leyenda) need unique visual treatment — golden ring pulse, 1.3x size, particle corona
5. **Progress persistence**: The mini-progress bar in the drawer ("3/10 sessions") must read from `training_sessions` WHERE module matches the node's route
6. **Branch completion %**: Show a percentage arc around each branch tab (TÉCNICA 40%, ARTÍSTICA 15%, PERFORMANCE 5%) to drive completionism
7. **Streak integration**: Display the current streak prominently — "🔥 7 días" is social proof that motivates continued engagement
8. **Share milestones**: When a user completes a branch's 5th node, auto-generate a share card via `generate-share-card` edge function
9. **Sound design**: Add a subtle "level up" sound (Web Audio sine sweep) when unlocking a node — audio apps need audio feedback
10. **Seasonal rotation**: Plan for "Season 2" content — the boss nodes should eventually lead to themed seasonal challenges that keep power users engaged beyond the initial 30 nodes

---

## Implementation Plan (next sprint)

### Files to modify:
| File | Change |
|------|--------|
| `src/components/skilltree/SkillBranch.tsx` | Fix SVG circle cx/cy bug |
| `src/components/layout/BottomNav.tsx` | Redesign as "Stage Controls" with 72px center button, gradient tabs, notification badge |
| SQL Migration | Attach triggers to auth.users |
| `src/pages/WarmUp.tsx` | Connect to save training_sessions on completion |
| `src/pages/BreathTrainer.tsx` | Connect to save training_sessions on completion |
| `src/pages/PitchTraining.tsx` | Connect to save training_sessions on completion |

