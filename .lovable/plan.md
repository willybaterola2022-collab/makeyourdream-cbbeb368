
# Sprint 6 — Completed ✅

## Changes Made

### 1. DB Triggers (Fixed)
- `on_auth_user_created` → already existed on `auth.users`
- `on_auth_user_created_progress` → created, attached to `auth.users`
- `update_user_progress_updated_at` → created on `user_progress`

### 2. SVG Particle Bug (Fixed)
- Added `cx="2" cy="0"` to `<circle>` in `SkillBranch.tsx:36`

### 3. BottomNav → Stage Controls (Redesigned)
- Center button: 72px with double pulse ring (violet inner + cyan outer)
- 4 tabs: glow on active, dot indicator with `layoutId` spring animation
- Badge: red pulsing counter on "Entrena" showing pending daily challenges
- Top gradient border: violet → primary → cyan

### 4. Training Modules Connected to Backend
- Created `useTrainingSession` hook (saves to `training_sessions` + awards XP via `gamification-engine`)
- **WarmUp**: saves session on full completion (100 score)
- **BreathTrainer**: saves session after 5 reps (90 score)
- **PitchTraining**: saves session on level-up (score-based)
- All show XP toast on save

## Next Sprint Candidates
- Lazy load routes with React.lazy
- React Query migration for caching
- Boss Node visuals in Skill Tree
- Connect remaining modules (LyricsWriter, VoiceJournal, etc.)
