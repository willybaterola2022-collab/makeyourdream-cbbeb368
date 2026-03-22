

# Sprint B — Conexión Frontend ↔ Backend

## Estado actual (lo que ya funciona)

| Módulo | Conexión backend | Estado |
|--------|-----------------|--------|
| Home (Index.tsx) | gamification-engine, daily-challenge, vocal_fingerprints (direct query) | Funcional con fallbacks |
| VocalDnaTest | vocal-fingerprint (save), analyzeVocalDna client-side | Funcional |
| AuthModal | Google OAuth via lovable.auth, email/password | Funcional |
| Coach | ai-coach-feedback + fallback local | Funcional |
| Exercises | daily-exercise get_recommended | Parcial (hardcoded fallback) |
| SkillTree | gamification-engine get_progress | Funcional |
| Profile | Direct queries (recordings, user_progress, profiles, vocal_fingerprints) | Funcional |
| Challenges | Direct query daily_challenges + challenge_completions | Parcial |

## Lo que falta conectar (Sprint B)

### Prerequisitos
1. **Google OAuth**: Ya implementado con `lovable.auth.signInWithOAuth("google")`. Lovable Cloud lo gestiona automáticamente — no requiere acción adicional.
2. **SQL**: Las tablas ya existen en la base de datos (confirmado por el schema provisto). No se necesita ejecutar SQL adicional.

---

### Fase 1: Paleta visual — Limpiar colores legacy (Karaoke + TalentFeed)

**Karaoke.tsx**: Reemplazar los 3 gradientes de las cards de modo:
- `from-[hsl(275_85%_50%)] to-[hsl(285_80%_60%)]` → `from-primary/80 to-primary`
- `from-[hsl(185_90%_40%)] to-[hsl(195_85%_50%)]` → `from-secondary/80 to-secondary`
- `from-[hsl(275_70%_45%)] to-[hsl(185_80%_50%)]` → `from-primary/70 to-secondary/80`

Reemplazar `stage-gradient` en genre chips y BPM selectors con `bg-primary text-primary-foreground`.

**TalentFeed.tsx**: Se reescribe completo en Fase 3.

### Fase 2: Home auth — Migrar a react-query + mejorar tension system

**Index.tsx**: Reemplazar el `useEffect` fetch con `useQuery` de react-query:
```
const { data: progress } = useQuery({
  queryKey: ['home-progress', user?.id],
  queryFn: () => supabase.functions.invoke('gamification-engine', { body: { action: 'get_progress', user_id: user.id } }),
  enabled: !!user, staleTime: 5 * 60 * 1000
});
```
Mismo patrón para daily-challenge y vocal-fingerprint. Esto elimina re-fetches en cada navegación.

Mejorar `getTension` para usar `progress.last_active_date` comparado con hoy (como indica el Sprint B doc).

### Fase 3: Social Feed — Reescribir TalentFeed.tsx como Feed social

Reemplazar `TalentFeed.tsx` completo. Dejar de usar `talent-scout` y conectar a `social-feed`:

- `get_feed`: Lista posts con avatar, canción, score, audio, likes. Paginación con infinite scroll.
- `publish`: Publicar grabación al feed (post-Karaoke).
- `like`: Optimistic update en likes_count.
- Realtime: Suscribirse a `social_feed` table changes para actualizaciones en vivo.

Cada post renderiza: avatar + nombre + timeAgo → canción + score → caption → `<audio>` player → like button.

### Fase 4: Karaoke post-sesión — Conectar save-training-session

Después de grabar en cualquier modo (freestyle/custom/preset), invocar:
```
supabase.functions.invoke('save-training-session', { body: { user_id, module: 'karaoke', song_title, recording_id, scores: { pitch, timing, expression } } })
```

Mostrar pantalla de resultado con:
- Frase por grade (S/A/B+/B/C/D/F)
- Score overall + 3 barras (pitch/timing/expression)
- XP ganado + streak + badges nuevos
- CTAs: "Volver a intentar" / "Publicar en el Feed" / "Home"
- `trackEvent(user.id, 'recording_completed', { song, grade, score })`

### Fase 5: Duelos — Conectar duel-matchmaking

Reescribir `Duelos.tsx` para usar edge function en vez de queries directas:
- `find_match`: Buscar oponente o crear duel pending
- `submit_score`: Enviar score + recording_id tras cantar
- `get_my_duels`: Listar historial
- Pantalla VS con revelación de scores
- `trackEvent(user.id, 'duel_completed', { won })`

### Fase 6: Comparator — Conectar compare-recordings

Reescribir para usar edge function:
- `suggest_pair`: Backend sugiere mejor par before/after
- `compare`: Calcula deltas reales (pitch, timing, expression, overall)
- Mostrar summary + 4 deltas con flechas ↑↓ coloreadas + días entre grabaciones
- `trackEvent(user.id, 'comparison_made')`

### Fase 7: Exercises — Completar conexión daily-exercise

Ya tiene parcial. Completar:
- `get_all`: Listar los 9 ejercicios disponibles
- `complete`: Enviar score al terminar → recibir XP
- `trackEvent(user.id, 'exercise_completed', { exercise_id, score })`

### Fase 8: Challenges — Conectar daily-challenge edge function

Reescribir `Challenges.tsx` para usar edge function:
- `get_today`: Obtener reto del día con estado completed/pending + horas restantes
- `complete`: Completar reto con recording_id y score → recibir XP
- `trackEvent(user.id, 'challenge_completed', { challenge_id })`

### Fase 9: Share Cards — Conectar generate-share-card

En VocalDnaTest resultado y post-sesión Karaoke, conectar el botón "Compartir":
- Invocar `generate-share-card` con card_type + datos
- Renderizar card en Canvas 1080x1350
- Web Share API con fallback descarga PNG
- `trackEvent(user.id, 'share_created', { card_type })`

### Fase 10: Fingerprint — Conectar vocal-fingerprint get_latest

Reemplazar queries directas en `Fingerprint.tsx` con:
```
supabase.functions.invoke('vocal-fingerprint', { body: { action: 'get_latest', user_id } })
```
Renderizar evolution array (últimos global_scores) si disponible.

### Fase 11: Coach — Añadir daily-exercise get_recommended

Coach ya conecta `ai-coach-feedback`. Añadir segunda llamada:
```
supabase.functions.invoke('daily-exercise', { body: { action: 'get_recommended', user_id } })
```
Renderizar card de ejercicio recomendado basado en área más débil del usuario.

### Fase 12: trackEvent en todos los puntos faltantes

Añadir `trackEvent` en los puntos donde no existe:
- `recording_completed` → Karaoke post-sesión
- `feedback_received` → Coach al cargar
- `challenge_completed` → Challenges
- `duel_completed` → Duelos
- `exercise_completed` → Exercises
- `share_created` → ShareCard
- `comparison_made` → Comparator
- `module_visited` → Cada módulo al montar

### Fase 13: Eliminar Portfolio.tsx (absorber en Profile)

Portfolio.tsx es redundante con Profile.tsx (que ya tiene audio player, radar, progreso). Eliminar el archivo y la ruta de App.tsx.

---

## Archivos modificados/creados

| Archivo | Acción |
|---------|--------|
| src/pages/Karaoke.tsx | Fix paleta legacy |
| src/pages/Index.tsx | Migrar a react-query |
| src/pages/TalentFeed.tsx | Reescribir como Social Feed |
| src/pages/Duelos.tsx | Conectar duel-matchmaking |
| src/pages/Comparator.tsx | Conectar compare-recordings |
| src/pages/Exercises.tsx | Completar daily-exercise |
| src/pages/Challenges.tsx | Conectar daily-challenge EF |
| src/pages/Fingerprint.tsx | Conectar vocal-fingerprint get_latest |
| src/pages/Coach.tsx | Añadir daily-exercise get_recommended |
| src/pages/Profile.tsx | Absorber Portfolio |
| src/components/ShareCard.tsx | Conectar generate-share-card |
| src/pages/Portfolio.tsx | ELIMINAR |
| src/App.tsx | Quitar ruta /portfolio |

## Nota sobre `lib/phases.ts`, `lib/trackEvent.ts`, `lib/vocalDnaAnalysis.ts`

Estos 3 archivos ya existen y están correctamente implementados. No requieren cambios.

