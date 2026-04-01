

# Sprint 2: Connect 20 Pages to Edge Functions + 10-Sprint Roadmap

## EF Test Results (all 9 passing)

All 9 new Edge Functions are deployed and responding correctly on Lovable Cloud. No fixes needed.

## Current State

**Pages already connected** (have `supabase.functions.invoke` calls):
- DailyFlow, CoverStudio, RecapReel, VocalHoroscope, VocalBattle, Evolution — already call EFs or query DB directly
- StreakDashboard, Achievements — use `useUserProgress` hook (calls `gamification-engine`)
- PracticeRoom — client-side only (hooks), no EF needed

**Pages that are placeholders** ("Proximamente" with disabled button):
- VocalMatches, LeaderboardSeasons, CollabDuets — need full UI + EF connection

**Pages with partial logic but no EF connection:**
- VoiceReactions — records audio but doesn't save/publish to `social-feed`
- VocalStory — records but doesn't save to `social-feed`
- RangeExplorer, ToneLab, HarmonyTrainer, VibratoCoach — have client-side audio logic but don't save sessions
- VoiceEffects, MelodyMaker — client-side only, no persistence

## What to build

### Group 1: Replace 3 placeholder pages with real UI + EF connections

**VocalMatches.tsx** — Connect to `vocal-match` EF
- Call `find_matches` action on mount
- Show match cards with compatibility %, display_name, avatar, vocal range
- Empty state: "Completa tu test de ADN vocal primero"
- Auth gate: require login

**LeaderboardSeasons.tsx** — Connect to `seasonal-engine` EF
- Call `get_current` on mount to show active season
- Call `get_leaderboard` with season_id
- Call `join` when user clicks "Unirse"
- Show leaderboard table with rank, display_name, xp_earned
- Empty state when no active season

**CollabDuets.tsx** — Connect to `audio-merge` EF
- Call `list_duets` on mount to show user's duets
- Show existing recordings user can select to create a duet
- Call `merge` with two recording IDs
- Show duet list with audio player

### Group 2: Add save-training-session to 6 training pages

These pages already have functional UI but don't persist results:
- **RangeExplorer** — save range data via `vocal-fingerprint` (save action)
- **ToneLab** — save via `save-training-session` with module "tone-lab"
- **HarmonyTrainer** — save via `save-training-session` with module "harmony-trainer"
- **VibratoCoach** — save via `save-training-session` with module "vibrato-coach"
- **VoiceEffects** — save via `save-training-session` with module "voice-effects"
- **MelodyMaker** — save via `save-training-session` with module "melody-maker"

Pattern: after exercise completion, call `save-training-session` with scores and show XP toast.

### Group 3: Connect social features to social-feed EF

- **VocalStory** — on "Publicar", call `social-feed` with action `publish`
- **VoiceReactions** — save recording, then call `social-feed` with action `publish` (type: reaction)

### Group 4: Connect remaining pages

- **SongSketch** — already saves to `song_sketches` table directly, no change needed
- **VoiceJournal** — already has client-side logic, add `save-training-session` call

## Files to modify (20 files)

| File | Change |
|------|--------|
| `src/pages/VocalMatches.tsx` | Full rewrite: match cards UI + vocal-match EF |
| `src/pages/LeaderboardSeasons.tsx` | Full rewrite: season UI + seasonal-engine EF |
| `src/pages/CollabDuets.tsx` | Full rewrite: duets UI + audio-merge EF |
| `src/pages/RangeExplorer.tsx` | Add save to vocal-fingerprint on completion |
| `src/pages/ToneLab.tsx` | Add save-training-session on completion |
| `src/pages/HarmonyTrainer.tsx` | Add save-training-session on completion |
| `src/pages/VibratoCoach.tsx` | Add save-training-session on completion |
| `src/pages/VoiceEffects.tsx` | Add save-training-session on completion |
| `src/pages/MelodyMaker.tsx` | Add save-training-session on completion |
| `src/pages/VocalStory.tsx` | Connect publish to social-feed EF |
| `src/pages/VoiceReactions.tsx` | Connect publish to social-feed EF |

## 10-Sprint Roadmap (updated with reality)

```text
SPRINT 2 (NOW) — CONNECT ALL 20 PAGES
  Connect the 3 placeholder pages (Matches, Seasons, Duets)
  Add save-training-session to 6 training pages
  Connect VocalStory + VoiceReactions to social-feed
  Seed first seasonal_event for leaderboard testing

SPRINT 3 — KARAOKE CATALOG + SONG BROWSER
  Replace hardcoded SONGS arrays in CoverStudio, Karaoke
  Fetch from karaoke-tracks EF with search, genre filter
  Add SongBrowser component with favorites
  Seed 40 more tracks (50 total)

SPRINT 4 — SMART PRACTICE PLAN UI
  New page /practice-plan using smart-practice-plan EF
  Weekly calendar view with daily exercises
  "Completar" button per exercise → save-training-session
  Auto-refresh plan when user completes week

SPRINT 5 — NOTIFICATION CENTER
  Bell icon in BottomNav/Sidebar with unread count
  Notification dropdown/page using notification-center EF
  Badge alerts, streak warnings, duel invites
  Mark as read on view

SPRINT 6 — ONBOARDING FLOW POLISH
  Landing → DNA Test → Signup → Home with data
  Auto-create profile + user_progress on signup
  First-time tutorial overlay (3 steps)
  Empty states with CTA in every page

SPRINT 7 — SOCIAL FEED V2
  Audio player in feed posts
  Like animation + comment stubs
  Voice reactions inline
  Profile links in feed cards

SPRINT 8 — AI COACH V2
  Chat interface on /coach page
  Call ai-coach-v2 EF with conversation history
  Personalized exercise recommendations
  Context from last 10 sessions + fingerprint

SPRINT 9 — MONETIZATION PREP
  Paywall UI component (Free/Pro/Legend tiers)
  Feature gates on premium modules
  Stripe integration (requires API keys from Andy)
  Subscription status check in AuthContext

SPRINT 10 — PERFORMANCE + PWA
  Lighthouse audit → fix to 90+
  Service worker + offline shell
  Loading skeletons on all data-fetching pages
  Error boundaries + global error handler
  Bundle split verification

SPRINT 11 — ANALYTICS DASHBOARD
  Admin-only /admin route
  WAS, DAU, retention charts
  User detail view
  Top songs, churn risk users
```

