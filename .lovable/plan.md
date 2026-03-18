

# Verificacion + Master Prompt + Propuesta de Retencion

## Estado actual verificado

Todos los modulos cargan correctamente en 360px:
- **Home Stage Mode**: Microfono gigante, CTA dorado, badge live, stats -- todo OK
- **Song Sketch**: Grabacion rapida, bloques arrastrables, ensamblar con IA -- OK
- **Loop Station**: Capas de audio, mixer con volumen -- OK
- **Duelos 1v1**: Rating ELO, buscar rival, ranking -- OK
- **Voice Journal**: Timeline vocal, stats de evolucion -- OK
- **Sidebar**: Categorias colapsables (ESCENARIO/CREAR/ENTRENAR/ANALIZAR/SOCIAL/MI CARRERA) funcionan bien, NEW badges visibles

---

## Master Prompt para Cursor / Claude Code

```text
# MASTER PROMPT — MakeYourDream Backend Implementation

## PROJECT OVERVIEW
MakeYourDream is a premium vocal training platform built with React + Vite + TypeScript + Tailwind CSS + Framer Motion. The frontend has 30 modules covering vocal creation, training, analysis, social features, and career management. ALL frontend UI is complete. You need to build the ENTIRE backend using Supabase (Postgres + Edge Functions + Storage + Auth + Realtime).

## TECH STACK
- Frontend: React 18, Vite, TypeScript, Tailwind CSS, Framer Motion, shadcn/ui
- Backend: Supabase (Postgres, Edge Functions in Deno, Storage, Auth, Realtime)
- AI: Lovable AI Gateway (https://ai.gateway.lovable.dev/v1/chat/completions) — OpenAI-compatible API. Use LOVABLE_API_KEY env var. Default model: google/gemini-3-flash-preview
- Audio: Web Audio API (AnalyserNode, MediaRecorder, OscillatorNode)
- State: React Query (@tanstack/react-query)

## ARCHITECTURE REQUIREMENTS

### 1. AUTHENTICATION (Supabase Auth)
- Email/password + Google OAuth + Apple OAuth
- On signup: create profile row, assign 'user' role, create initial vocal_fingerprint record
- User roles table (separate from profiles — SECURITY CRITICAL):
  CREATE TYPE public.app_role AS ENUM ('admin', 'moderator', 'user', 'premium');
  CREATE TABLE public.user_roles (id uuid PRIMARY KEY DEFAULT gen_random_uuid(), user_id uuid REFERENCES auth.users(id) ON DELETE CASCADE NOT NULL, role app_role NOT NULL, UNIQUE(user_id, role));
- Security definer function has_role(uuid, app_role) for RLS policies
- Protected routes: all /app/* routes require auth, /landing and /onboarding are public

### 2. DATABASE SCHEMA (Postgres)

#### Core Tables:
- profiles (id uuid PK → auth.users, display_name, avatar_url, bio, vocal_range, genre_preferences text[], onboarding_completed boolean, created_at, updated_at)
- vocal_fingerprints (id, user_id FK, pitch_accuracy int, timing int, vibrato int, sustain int, control int, range int, global_score numeric, recorded_at timestamptz) — one per analysis session
- recordings (id, user_id FK, title, duration_seconds int, file_url text, module text, section text, key_detected text, bpm_detected int, emotion_tags text[], created_at)
- song_sketches (id, user_id FK, title, blocks jsonb[], assembled_url text, status text, created_at, updated_at)

#### Training:
- training_sessions (id, user_id FK, module text, exercise_type text, score int, duration_seconds int, metadata jsonb, completed_at)
- streaks (user_id FK UNIQUE, current_streak int, longest_streak int, last_active date, total_sessions int)
- daily_goals (id, user_id FK, date date, target_sessions int, completed_sessions int, target_minutes int, completed_minutes int)

#### Social:
- challenges (id, title, description, song_title, start_date, end_date, category text, created_by uuid)
- challenge_entries (id, challenge_id FK, user_id FK, recording_id FK, score int, votes int, rank int, submitted_at)
- duels (id, challenger_id FK, opponent_id FK, song_title, status text CHECK ('pending','active','voting','completed'), challenger_recording_id FK, opponent_recording_id FK, winner_id FK, created_at)
- elo_ratings (user_id FK UNIQUE, rating int DEFAULT 1200, wins int, losses int, tier text)
- vocal_stories (id, user_id FK, recording_id FK, caption text, hashtags text[], likes_count int, created_at, expires_at timestamptz)
- story_reactions (id, story_id FK, user_id FK, reaction_type text, voice_reply_url text)
- collab_rooms (id, name, host_id FK, participants uuid[], status text, max_participants int DEFAULT 4)
- follows (follower_id FK, following_id FK, created_at, PRIMARY KEY(follower_id, following_id))

#### Career:
- portfolio_items (id, user_id FK, title, description, recording_id FK, category text, is_public boolean, created_at)
- dream_canvas (id, user_id FK, goals jsonb, milestones jsonb, updated_at)
- plan_90_tasks (id, user_id FK, week int, title, description, completed boolean, due_date date)

#### Gamification:
- achievements (id, key text UNIQUE, title, description, icon text, category text, requirement jsonb)
- user_achievements (id, user_id FK, achievement_id FK, unlocked_at, UNIQUE(user_id, achievement_id))
- xp_log (id, user_id FK, amount int, source text, module text, created_at)
- user_levels (user_id FK UNIQUE, total_xp int, level int, title text)

#### AI Analysis:
- emotion_analyses (id, recording_id FK, user_id FK, melancholy int, power int, tenderness int, joy int, anger int, dominant_emotion text, ai_feedback text[], analyzed_at)
- voice_journal_entries (id, user_id FK, recording_id FK, range_low text, range_high text, pitch_accuracy int, power int, notes text, recorded_date date)

### 3. STORAGE BUCKETS
- recordings (audio files: webm/wav/mp3, max 50MB, user-scoped paths: {user_id}/{module}/{timestamp}.webm)
- avatars (profile pictures, max 2MB)
- exports (assembled songs, mixed audio)

### 4. EDGE FUNCTIONS (Deno)

#### Audio Processing:
- analyze-vocal: Receives recording_id, fetches audio from storage, calls Lovable AI to analyze pitch accuracy/timing/emotion, saves results to vocal_fingerprints + emotion_analyses
- assemble-sketch: Receives song_sketch_id, fetches all blocks' audio, uses AI to suggest order/crossfade, returns assembled URL
- detect-pitch: Real-time pitch detection support — receives audio chunk, returns detected note + frequency + cents deviation

#### AI Features:
- ai-coach: Streaming chat endpoint. System prompt includes user's vocal_fingerprint data, recent training_sessions, streaks. Responds with personalized vocal coaching advice in Spanish.
- generate-lyrics: Receives theme + structure + style. Uses Lovable AI with tool calling to return structured lyrics {verses: [{type, lines}]}
- emotion-map: Analyzes recording for emotional content, returns emotion percentages + AI feedback tips
- voice-match: Compares user's fingerprint against known artist profiles, returns top 3 matches with similarity %
- harmony-suggest: Receives melody recording, returns harmony suggestions (intervals, style recommendations)

#### Social:
- find-duel-opponent: Matches users by ELO rating (±200 range), returns opponent profile
- calculate-duel-winner: Receives duel_id, fetches both recordings, AI scores both, community votes weighted 30%, AI score 70%
- update-elo: After duel completion, adjusts both players' ELO ratings using standard formula

#### Gamification:
- check-achievements: Triggered after training_sessions insert. Checks all unearned achievements against user stats, awards any newly qualified ones
- update-streak: Called daily or on session completion. Updates streak count, awards XP
- leaderboard: Returns ranked users by category (global XP, weekly score, genre-specific, challenge wins)

### 5. REALTIME SUBSCRIPTIONS
- collab_rooms: presence for who's in the room
- duels: status changes (pending → active → voting → completed)
- vocal_stories: new stories in followed users feed
- challenges: new entries, vote updates

### 6. ROW-LEVEL SECURITY POLICIES
Every table needs RLS enabled. Key patterns:
- Users can SELECT/INSERT/UPDATE/DELETE their own rows (user_id = auth.uid())
- Public data (challenges, leaderboards, public portfolios) readable by all authenticated
- Duels readable by both participants
- Stories readable by followers + public
- Admin override via has_role(auth.uid(), 'admin')

### 7. AUDIO RECORDING IMPLEMENTATION
The frontend uses useMicrophone() hook with Web Audio API AnalyserNode for visualization.
You need to ADD MediaRecorder to actually save audio:
- Create useRecorder() hook that wraps MediaRecorder API
- Record as webm (opus codec) for browser compatibility
- On stop: upload Blob to Supabase Storage, create recordings row
- Return { startRecording, stopRecording, isRecording, audioBlob, uploadProgress }
- Integrate into: Song Sketch (quick capture), Karaoke (full session), Voice Journal (daily snippet), Loop Station (per-layer), Vocal Stories (15-30s clips)

### 8. PITCH DETECTION (Client-side)
Implement autocorrelation-based pitch detection in a Web Worker:
- Input: raw audio samples from AnalyserNode.getFloatTimeDomainData()
- Output: { frequency: number, note: string, octave: number, cents: number }
- Use in: Pitch Training (compare against target), Karaoke (real-time scoring), Vocal Fingerprint (range detection)
- Library suggestion: pitchy (npm) or custom autocorrelation

### 9. CRITICAL INTEGRATION POINTS
- Every module that has a "record" button needs the useRecorder hook connected to Supabase Storage
- Every module that shows "scores" needs to read from the database (vocal_fingerprints, training_sessions)
- Song Sketch blocks need to be actual audio blobs, not mock data
- Karaoke scoring needs real pitch detection comparing user's voice against the target melody
- Streaks/XP/achievements update after every completed session
- AI Coach chat history persists per user
- Voice Journal entries create daily snapshots for the evolution timeline

### 10. ENVIRONMENT VARIABLES NEEDED
- SUPABASE_URL, SUPABASE_ANON_KEY (auto-configured)
- LOVABLE_API_KEY (auto-configured, for AI Gateway)
- No other API keys needed

### 11. QUESTIONS TO RESOLVE
1. Song library: Where do karaoke backing tracks come from? Options: (a) user uploads MP3, (b) integrate with a music API, (c) YouTube audio extraction (legal issues), (d) MIDI-based synthesis
2. Voice-to-MIDI: Should we implement real-time voice-to-MIDI conversion for Harmony Lab?
3. Audio effects: Vocal FX Studio — should effects be client-side (Web Audio API nodes: BiquadFilter, Convolver, etc.) or server-side processing?
4. Collab Room: Real-time multi-user audio — WebRTC peer-to-peer or Supabase Realtime for signaling only?
5. Fan Radar matching: Algorithm for matching singers with producers — content-based (fingerprint similarity) or collaborative filtering?
6. Offline mode: Should recordings queue locally (IndexedDB) and sync when online?
7. Push notifications: For duel turns, challenge deadlines, streak reminders — use web push or only in-app?

### 12. IMPLEMENTATION ORDER
Phase 1: Auth + Profiles + Recordings storage + useRecorder hook
Phase 2: Vocal Fingerprint analysis + Pitch Detection + Karaoke scoring
Phase 3: Training sessions + Streaks + XP + Achievements
Phase 4: AI Coach + Lyrics Writer + Emotion Map (Edge Functions + Lovable AI)
Phase 5: Song Sketch full flow (record → blocks → assemble)
Phase 6: Social (Challenges + Duels + Stories + Collab)
Phase 7: Career (Portfolio + Dream Canvas + Plan 90 + Fan Radar)

### 13. CURRENT FILE STRUCTURE
src/
  hooks/useMicrophone.ts — Web Audio API mic capture + AnalyserNode (DONE)
  hooks/useAudioEngine.ts — Oscillator playback, notes, sweeps (DONE)
  pages/ — 30 module pages, all with complete UI, mock data, toast notifications
  components/layout/ — AppLayout (SidebarProvider), AppSidebar (6 categories), FloatingBar, PageTransition, StaggerContainer
  components/ui/ — Full shadcn/ui library

### 14. STYLE & UX GUIDELINES
- Dark theme only (bg: #0A0A0A, primary: gold HSL 46 65% 52%)
- All UI text in Spanish
- Toast notifications via sonner for all user actions
- Animations via framer-motion (spring physics, stagger)
- Mobile-first (360px primary breakpoint)
- PWA-ready (manifest.json exists)
```

---

## Propuesta: Retencion, Participacion y Premios

### Sistema de Retencion (7 mecanismos)

1. **Racha Diaria con Multiplicador**
   - Dia 1-7: x1 XP. Dia 8-14: x1.5. Dia 15-30: x2. Dia 30+: x3
   - Perder la racha = volver a x1 pero conservas un "escudo" gratis por semana (premium)
   - Notificacion push a las 20:00 si no has cantado: "Tu racha de 12 dias esta en peligro"

2. **Sistema de Niveles con Titulos Vocales**
   - 20 niveles: Principiante → Novato → Aprendiz → Interprete → Vocalista → Artista → Estrella → Leyenda → Icono → Inmortal
   - Cada nivel desbloquea algo: nuevo efecto en Vocal FX, nuevo genero en Genre Gym, badge en perfil
   - XP se gana en TODOS los modulos (grabar, entrenar, competir, crear)

3. **Desafio Semanal Tematico**
   - Cada lunes un nuevo challenge automatico: "Semana del Bolero", "Semana de Agudos", "Semana Freestyle"
   - Participar = XP bonus. Ganar = badge exclusivo + destacado en landing
   - Leaderboard semanal que se resetea (todos empiezan iguales)

4. **"Momento de Inspiracion" (Push Inteligente)**
   - Analizar patrones de uso: si el usuario suele cantar a las 22:00, enviar push a las 21:50
   - Mensajes emocionales: "Tus cuerdas vocales te extranan", "Hoy es buen dia para romperla"
   - Deep link directo al microfono del Home (Stage Mode)

5. **Metas Semanales Personalizadas**
   - La IA genera 3 metas basadas en tu progreso: "Sube tu afinacion 3 puntos", "Graba 5 snippets en Song Sketch", "Gana 1 duelo"
   - Completar las 3 = cofre de recompensa (XP + badge)

6. **Social Proof & FOMO**
   - "847 artistas cantando ahora" (badge real con Supabase Realtime presence)
   - Feed de actividad: "Luna Vox acaba de ganar un duelo", "Echo Rivera subio de nivel"
   - Notificacion: "Tu rival en Duelos acaba de mejorar su score. ¿Vas a dejar que te gane?"

7. **Recap Mensual ("Tu Mes en MakeYourDream")**
   - Como Spotify Wrapped pero mensual: minutos cantados, notas alcanzadas, racha maxima, emocion dominante, genero mas practicado
   - Compartible como imagen/story en redes sociales
   - Genera retencion por curiosidad de ver el proximo recap

### Sistema de Premios (5 capas)

1. **Badges Coleccionables** (50+)
   - Por racha (7, 30, 90, 365 dias)
   - Por modulo ("Maestro del Karaoke", "Arquitecto de Canciones", "Rey del Duelo")
   - Por genero ("Alma de Jazz", "Voz de Rock", "Espiritu R&B")
   - Raros/epicos por logros dificiles ("Nota Perfecta 10 veces seguidas", "100 duelos ganados")

2. **Moneda Virtual: "Notas"**
   - Se ganan con XP, challenges, rachas
   - Se gastan en: desbloquear canciones premium de karaoke, comprar efectos exclusivos en Vocal FX, enviar "regalos" a otros artistas en Stories

3. **Rankings con Ligas**
   - Bronce → Plata → Oro → Platino → Diamante → Leyenda
   - Cada liga tiene su propio leaderboard
   - Subir de liga = animacion cinematica + badge
   - Bajar de liga si no compites en 2 semanas (urgencia)

4. **Premios Fisicos (Fase futura)**
   - Top 10 mensual en challenges = merchandising MakeYourDream
   - Top 1 anual = sesion de grabacion en estudio real
   - Partnerships con escuelas de musica para becas

5. **Certificaciones Verificables**
   - "Certificado Vocal MakeYourDream — Nivel Artista"
   - PDF descargable con QR de verificacion
   - Compartible en LinkedIn / redes
   - Basado en completar X modulos + score minimo en Fingerprint

### Nuevos Modulos de Engagement (3 propuestos)

1. **Daily Warm-Up Streak** — 5 minutos de warm-up guiado cada dia. Completarlo = racha + XP. No completarlo = rompe racha. Simple, adictivo, habito diario.

2. **Voice Roulette** — Boton random: te asigna un challenge aleatorio de 60 segundos. "Canta el coro de Bohemian Rhapsody en falsete". Divertido, bajo compromiso, alta retencion.

3. **Spotlight Stage** — Cada semana, la IA selecciona las 10 mejores grabaciones de la comunidad y las pone en un "escenario virtual" en la landing. Ser seleccionado = prestigio social maximo.

