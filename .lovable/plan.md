

# Plan: Soy Leyenda ULTIMATE — Rewards, Competition, Talent Discovery & Magic

## Vision Gap Analysis

The current Skill Tree is a **static progression map**. It shows nodes, XP, and sessions — but it's missing the **soul** of what makes games addictive: variable rewards, social competition, talent discovery, and moments of awe. Here's what's missing and what we'll build:

---

## What We'll Build (6 Major Systems)

### 1. NODE REWARDS SYSTEM — Every node completion triggers a reward ceremony

**New file: `src/components/skilltree/NodeRewardCeremony.tsx`**
- Full-screen overlay when a node transitions from unlocked to completed
- Animated loot box that "opens" revealing: XP earned, badge unlocked, title earned
- Confetti explosion (30 particles, signature gradient colors)
- Sound effect via Web Audio API (ascending sine sweep 200Hz→800Hz over 0.5s)
- "SHARE YOUR ACHIEVEMENT" CTA with Web Share API
- Each node awards a unique collectible badge (stored in `user_progress.badges` JSONB)

**Node-specific rewards (in `skillTreeData.ts`):**
- Add `rewardXP`, `rewardBadge`, `rewardTitle` fields to each node
- Examples: "Afinacion Basica" → Badge: "Oido de Oro", Title: "Afinador Nivel 1"
- Boss nodes award premium titles: "Maestro Tecnico", "Artista Completo", "LEYENDA"
- Titles display next to username everywhere in the app

### 2. TALENT RADAR — AI-powered talent detection & scoring

**New file: `src/components/skilltree/TalentRadar.tsx`**
- Radar chart (SVG) showing 6 vocal dimensions: Pitch, Range, Power, Control, Expression, Creativity
- Animated drawing of the radar shape when data loads
- "Vocal DNA" score (0-100) calculated from all training sessions
- Comparison ghost overlay: "Top 10% of users in Pitch" — percentile rankings
- "Talent Scout Alert" — when user exceeds 85 in any dimension, golden notification: "Tu afinacion esta en el TOP 5% — podrias ser profesional"
- Data source: aggregate from `training_sessions` scores + `vocal_fingerprints`

### 3. COMPETITIVE LEAGUE SYSTEM — Weekly leaderboards with tiers

**New section in SkillTree header: League Badge**
- 5 leagues: Bronce, Plata, Oro, Diamante, Leyenda (each with icon + color)
- League determined by weekly XP earned (not total)
- Top 3 in each league get promoted, bottom 3 get relegated
- Visual league badge next to XP bar in SkillTree header
- "Esta semana: #4 en Liga Oro — +2 posiciones" with arrow animation

**New DB table via migration: `weekly_leaderboard`**
- Columns: user_id, week_start, xp_earned, league, rank, created_at

### 4. STREAK MULTIPLIER & COMBO SYSTEM

**Enhanced in SkillTree header + BottomNav:**
- Streak multiplier: 1-3 days = 1x, 4-6 = 1.5x, 7-13 = 2x, 14+ = 3x
- Visual multiplier badge that GLOWS more intensely with higher streaks
- "COMBO" counter during sessions: consecutive good scores = combo multiplier
- Streak freeze: 1 free freeze per week (stored in user_progress.badges JSONB as special item)
- When streak breaks: dramatic "broken chain" animation + "Recupera tu racha" CTA

### 5. SEASONAL BOSS EVENTS — Time-limited epic challenges

**Enhanced Boss Nodes in drawer:**
- Boss nodes become time-limited events (e.g., "Maestro Tecnico — Temporada 1")
- Countdown timer: "Quedan 12 dias para completar"
- Boss requirements: complete ALL nodes in the branch + pass a multi-part evaluation
- Boss rewards: exclusive animated profile frame, permanent title, 500 XP bonus
- Leaderboard within each boss: "Mejores puntuaciones del Boss Tecnico"

### 6. DISCOVERY MOMENTS — "Magic" surprises throughout the tree

**New file: `src/components/skilltree/DiscoveryMoment.tsx`**
- Hidden achievements that trigger unexpectedly:
  - "Cantaste 3 dias seguidos a las 7am" → "Pajaro Madrugador" badge
  - "Tu rango vocal crecio 3 semitonos" → "Voz en Expansion" + celebration
  - "Completaste tu primera rama" → Unlock exclusive "Freestyle Arena" mode
- "Easter eggs" in the tree: tapping the root node "TU VOZ" 5 times triggers a secret animation showing your vocal journey timeline
- Weekly "Vocal Wrapped" summary (like Spotify Wrapped): "Esta semana cantaste 47 minutos, mejoraste tu pitch 12%, tu cancion mas repetida fue..."

---

## Files to Create

| File | Purpose |
|------|---------|
| `src/components/skilltree/NodeRewardCeremony.tsx` | Full-screen reward overlay with confetti, badge reveal, share CTA |
| `src/components/skilltree/TalentRadar.tsx` | SVG radar chart with 6 vocal dimensions + percentile rankings |
| `src/components/skilltree/LeagueBadge.tsx` | Weekly league tier badge (Bronce→Leyenda) with rank |
| `src/components/skilltree/StreakMultiplier.tsx` | Visual multiplier display (1x→3x) with glow intensity |
| `src/components/skilltree/DiscoveryMoment.tsx` | Hidden achievement popup with surprise animations |
| `src/components/skilltree/WeeklyWrap.tsx` | "Vocal Wrapped" weekly summary card |

## Files to Modify

| File | Changes |
|------|---------|
| `src/components/skilltree/skillTreeData.ts` | Add `rewardXP`, `rewardBadge`, `rewardTitle` to SkillNodeData interface + populate all 30 nodes |
| `src/components/skilltree/SkillNode.tsx` | Boss golden corona (3 rings), completed nodes show badge icon, unlocked gradient border fix |
| `src/components/skilltree/SkillBranch.tsx` | Taller lines (48px), 3 staggered particles on completed paths, branch completion % |
| `src/components/skilltree/SkillDrawer.tsx` | Add reward preview section, boss countdown timer, share milestone CTA, streak flame |
| `src/pages/SkillTree.tsx` | Add TalentRadar section, LeagueBadge in header, StreakMultiplier, XP count-up animation, level system (20 tiers), Realtime subscription, discovery moment triggers |

## Database Migration

```sql
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
```

## Technical Details

**Level System (20 tiers):**
```text
0 XP = Novato | 50 = Aprendiz | 150 = Cantante | 300 = Interprete | 500 = Vocalista
750 = Artista | 1000 = Performer | 1300 = Profesional | 1600 = Virtuoso | 2000 = Maestro
2500 = Experto | 3000 = Elite | 3500 = Champion | 4000 = Diamante | 4500 = Platino
5000 = Legendario | 6000 = Mitico | 7500 = Inmortal | 9000 = Divino | 10000 = LEYENDA
```

**Talent Radar SVG:** 6-axis radar using `<polygon>` with animated `points` transitions. Each axis maps to an aggregate score from training_sessions (pitch_score, timing_score, expression_score) + vocal_fingerprints (range, power, global_score).

**Streak Multiplier Visual:** Ring around streak count with color intensity:
- 1x: white/30 border
- 1.5x: amber glow
- 2x: orange pulse
- 3x: golden fire animation (3 concentric rings)

**Reward Ceremony Flow:**
1. Node completes → 0.5s delay → screen dims
2. Badge icon scales from 0 to 1.2 to 1.0 (spring bounce)
3. Confetti burst (30 divs with random trajectories)
4. XP counter counts up from 0 to reward amount
5. Title text fades in below
6. "Compartir" + "Continuar" CTAs appear

**Realtime XP:** Subscribe to `user_progress` changes so the tree updates live when XP is earned in other modules without page refresh.

## Execution Order

1. DB migration (weekly_leaderboard table)
2. Update skillTreeData.ts with reward fields for all 30 nodes
3. Build NodeRewardCeremony, TalentRadar, LeagueBadge, StreakMultiplier, DiscoveryMoment
4. Enhance SkillNode (boss corona, completed badges), SkillBranch (particles, completion %), SkillDrawer (rewards preview, boss timer, share)
5. Rebuild SkillTree.tsx with all new systems integrated

