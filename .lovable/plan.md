

# Plan: Crear y Desplegar las 7 Edge Functions Prioritarias

## Situacion

- El frontend YA tiene los `supabase.functions.invoke()` correctos con fallbacks locales en 5 archivos (FreestyleMode, Fingerprint, Coach, Exercises, Index)
- Las tablas en la base de datos YA existen (user_progress, vocal_fingerprints, training_sessions, daily_challenges, etc.)
- El directorio `supabase/functions/` esta VACIO — no hay ninguna edge function desplegada
- Claude Code las escribio en una Mac local pero no pudo subirlas. Lovable las crea y las despliega automaticamente

## Que voy a hacer

Crear las 7 edge functions prioritarias directamente en este proyecto. Lovable las despliega automaticamente — no necesitas GitHub, terminal ni Supabase dashboard.

### Las 7 funciones

| # | Funcion | Que hace | Frontend que la consume |
|---|---------|----------|------------------------|
| 1 | `vocal-analysis` | Calcula pitch/timing/expression score server-side, guarda training_session | FreestyleMode.tsx |
| 2 | `save-training-session` | Guarda sesion + actualiza XP/streak/badges en user_progress | FreestyleMode.tsx (fallback) |
| 3 | `vocal-fingerprint` | Guarda/lee fingerprint con clasificacion vocal + artistas similares | Fingerprint.tsx |
| 4 | `ai-coach-feedback` | Lee ultimas 20 sesiones, calcula metricas + observaciones | Coach.tsx |
| 5 | `daily-exercise` | Recomienda ejercicio personalizado segun nivel del usuario | Exercises.tsx |
| 6 | `daily-challenge` | Retorna reto del dia + estado de completitud | Index.tsx |
| 7 | `gamification-engine` | Retorna XP, nivel, streak, badges del usuario | Index.tsx |

### Logica de cada funcion

Todas siguen el mismo patron:
- CORS headers + OPTIONS preflight
- Crean cliente Supabase con `SUPABASE_URL` + `SUPABASE_SERVICE_ROLE_KEY` (ya configurados como secrets)
- Parsean body JSON
- Queries a las tablas existentes
- Respuesta JSON

**vocal-analysis**: Recibe pitch_samples + onset_times_ms, calcula score continuo (1 - |cents|/50), timing sync, guarda en training_sessions, actualiza user_progress con XP ganado.

**save-training-session**: Inserta en training_sessions, calcula grade (S/A/B+/B/C/D/F), actualiza XP y streak en user_progress, evalua badges.

**vocal-fingerprint**: action "save" inserta en vocal_fingerprints con clasificacion por rango (soprano/mezzo/tenor/baritono/bajo) y artistas similares mapeados por rango. action "get_latest" retorna el ultimo.

**ai-coach-feedback**: Lee ultimas 20 training_sessions, compara semana actual vs anterior, genera observaciones basadas en deltas, recomienda ejercicio para la metrica mas baja.

**daily-exercise**: Lee user_progress.level + ultimo fingerprint, selecciona ejercicio adaptado al nivel (escalas basicas para principiantes, melismas para avanzados).

**daily-challenge**: Busca reto con active_date = hoy. Si no existe, genera uno basado en la metrica mas debil del usuario (insert con service role). Verifica si ya esta completado.

**gamification-engine**: Lee user_progress, calcula nivel (XP/100), retorna badges, streak, XP total.

### Archivos a crear

| Archivo | Descripcion |
|---------|-------------|
| `supabase/functions/vocal-analysis/index.ts` | Scoring + save |
| `supabase/functions/save-training-session/index.ts` | Save + XP + streak |
| `supabase/functions/vocal-fingerprint/index.ts` | Save/read fingerprint |
| `supabase/functions/ai-coach-feedback/index.ts` | Metricas + observaciones |
| `supabase/functions/daily-exercise/index.ts` | Ejercicio personalizado |
| `supabase/functions/daily-challenge/index.ts` | Reto del dia |
| `supabase/functions/gamification-engine/index.ts` | Progreso XP/nivel |

### Frontend — Sin cambios

El frontend ya tiene las llamadas correctas con fallbacks. Una vez desplegadas las funciones, todo conecta automaticamente.

### Despliegue

Despues de crear los archivos, uso `supabase--deploy_edge_functions` para desplegar las 7 funciones. El despliegue es automatico e inmediato.

### Orden de ejecucion

1. Crear los 7 archivos index.ts
2. Desplegar las 7 funciones
3. Verificar con logs que responden correctamente

