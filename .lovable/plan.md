

# Propuesta: 20 Nuevos Módulos Frontend — MakeYourDream

## Inventario actual: 20 páginas funcionales + 15 Edge Functions

Las 20 páginas existentes cubren: Home, Karaoke (3 modos), Entrenamiento (4), Creación (3), Social (3), Perfil (4), Auth (3).

Los 20 módulos propuestos se dividen en 4 categorías estratégicas, priorizados por impacto en retención y engagement.

---

## Categoría A — Retención diaria (vuelven cada día)

### 1. Daily Warmup Flow (`/daily-flow`)
Rutina guiada de 5 minutos: respiración → escalas → frase del día. Usa `daily-exercise` (ya existe). Pantalla con timer circular, instrucciones paso a paso, animación de progreso. Al completar: auto-save con `save-training-session`.

### 2. Streak Dashboard (`/streak`)
Calendario visual tipo GitHub heatmap con días activos. Racha actual destacada con llama animada (reutiliza `StreakFlame`). Hitos desbloqueables (7, 30, 100 días). Datos de `gamification-engine`.

### 3. Vocal Horoscope (`/vocal-horoscope`)
Mensaje diario basado en último fingerprint + hora del día + género frecuente. "Hoy tu voz está cálida. Ideal para baladas." Card compartible. Usa `vocal-fingerprint` get_latest + lógica client-side.

### 4. Practice Room (`/practice-room`)
Sala de práctica con metrónomo visual, afinador en tiempo real, y grabación rápida. Combina `useMetronome` + `usePitchDetection` (ya existen como hooks). Timer configurable. Sin presión de score.

### 5. Achievement Gallery (`/achievements`)
Galería visual de todos los badges ganados. Grid con badges bloqueados en silueta y desbloqueados con glow. Datos de `gamification-engine` get_progress → badges array. Cada badge clickeable con descripción y fecha.

---

## Categoría B — Profundidad vocal (exploran su voz)

### 6. Range Explorer (`/range-explorer`)
Herramienta interactiva para mapear rango vocal nota por nota. Piano visual vertical, el usuario canta y se ilumina cada nota alcanzada. Usa `usePitchDetection`. Al terminar: guarda rango con `vocal-fingerprint` save.

### 7. Vocal Evolution (`/evolution`)
Timeline visual de cómo ha cambiado la voz del usuario. Gráfico de línea con global_score a lo largo del tiempo. Comparación de radar charts (primer fingerprint vs último). Usa `vocal-fingerprint` get_latest → evolution array.

### 8. Tone Lab (`/tone-lab`)
Ejercicios de color vocal: cantar la misma frase con diferentes emociones (alegre, triste, susurro, power). Graba cada versión, las muestra como ondas superpuestas. Usa `useRecorder` + `vocal-analysis`.

### 9. Harmony Trainer (`/harmony-trainer`)
Reproduce una nota o acorde, el usuario canta la armonía. Feedback visual de qué tan cerca está del intervalo correcto. Usa `usePitchDetection` + audio context para generar tonos de referencia.

### 10. Vibrato Coach (`/vibrato-coach`)
Ejercicio enfocado en vibrato. Visualización de onda en tiempo real mostrando oscilación de pitch. Objetivo: mantener vibrato estable a X Hz. Usa `usePitchDetection` con sampling rate alto.

---

## Categoría C — Social y competencia (se quedan por la comunidad)

### 11. Vocal Battle (`/vocal-battle`)
Versión expandida de Duelos. Rondas múltiples con votación de la comunidad. Bracket visual tipo torneo. Usa `duel-matchmaking` existente + UI de bracket.

### 12. Collab Duets (`/duets`)
El usuario graba su parte sobre la grabación de otro usuario. Resultado: audio combinado. Feed de duetos abiertos esperando segunda voz. Usa `social-feed` para publicar + Storage para audio.

### 13. Voice Reactions (`/reactions`)
Responder a posts del Feed con audio en vez de texto. Botón "Reaccionar con tu voz" en cada post. Grabación de 10 segundos máximo. Complementa `social-feed`.

### 14. Leaderboard Seasons (`/seasons`)
Temporadas competitivas con tema (ej: "Mes del Bolero"). Leaderboard por XP ganado en el período. Rewards exclusivos. Necesita nueva Edge Function `seasonal-engine` (marcar como Sprint C).

### 15. Vocal Matches (`/matches`)
"Tinder de voces": encuentra usuarios con voces complementarias. Cards deslizables con preview de audio. "Match" = propuesta de dueto. Necesita Edge Function `vocal-match` (Sprint C).

---

## Categoría D — Creación avanzada (se sienten artistas)

### 16. Cover Studio (`/cover-studio`)
Flujo completo: elegir canción → practicar por secciones → grabar versión final → publicar. Más estructurado que Karaoke. Integra `save-training-session` + `social-feed` para publicar.

### 17. Voice Effects (`/voice-effects`)
Aplicar efectos en tiempo real a la voz: reverb, delay, pitch shift, autotune. Usa Web Audio API. Preview antes de grabar. Resultado guardable y compartible.

### 18. Melody Maker (`/melody-maker`)
Herramienta para componer melodías cantando. El usuario canta, se transcribe a notas MIDI en un piano roll visual. Editable después. Usa `usePitchDetection` para conversión pitch → nota.

### 19. Vocal Story (`/vocal-story`)
"Stories" de audio de 30 segundos con fondo visual generado. El usuario graba, elige un "mood" visual, se publica como story efímera (24h). Usa `useRecorder` + canvas para visual.

### 20. Recap Reel (`/recap`)
Resumen mensual/semanal automático: mejores momentos, progreso, badges ganados, comparación antes/después. Card visual compartible. Usa `generate-share-card` + datos de `gamification-engine`.

---

## Priorización por sprint

```text
SPRINT A (inmediato — usan Edge Functions existentes):
  1. Daily Warmup Flow     — daily-exercise + save-training-session
  2. Streak Dashboard      — gamification-engine
  3. Achievement Gallery   — gamification-engine
  4. Range Explorer        — usePitchDetection + vocal-fingerprint
  5. Vocal Evolution       — vocal-fingerprint
  6. Practice Room         — useMetronome + usePitchDetection
  7. Cover Studio          — save-training-session + social-feed
  8. Recap Reel            — generate-share-card + gamification-engine

SPRINT B (requiere lógica client-side nueva):
  9. Vocal Horoscope       — vocal-fingerprint + client-side
 10. Tone Lab              — useRecorder + vocal-analysis
 11. Harmony Trainer       — usePitchDetection + Web Audio
 12. Vibrato Coach         — usePitchDetection
 13. Voice Effects         — Web Audio API
 14. Melody Maker          — usePitchDetection + canvas
 15. Vocal Story           — useRecorder + canvas
 16. Vocal Battle          — duel-matchmaking (expandido)
 17. Voice Reactions       — social-feed + useRecorder

SPRINT C (requiere nuevas Edge Functions):
 18. Collab Duets          — nueva EF para merge audio
 19. Leaderboard Seasons   — nueva EF seasonal-engine
 20. Vocal Matches         — nueva EF vocal-match
```

## Archivos por módulo (patrón estándar)

Cada módulo nuevo sigue esta estructura:
- `src/pages/NombreModulo.tsx` — página principal
- Ruta en `App.tsx` dentro de `<AppLayout />`
- Link en `AppSidebar.tsx` en su grupo correspondiente
- `trackEvent` en mount
- `useAuth` para user_id
- `save-training-session` si hay ejercicio completable
- Estados: loading spinner, empty state con CTA, error con toast

## Impacto estimado

| Métrica | Sin módulos | Con 20 módulos |
|---------|:-----------:|:--------------:|
| Razones para volver diario | 1 (karaoke) | 5+ (daily flow, horoscope, streak, challenges, stories) |
| Minutos por sesión | 3-5 | 10-15 |
| Páginas accesibles desde sidebar | 17 | 37 |
| Hooks reutilizados | 3 de 10 | 10 de 10 |
| Edge Functions conectadas | 8 de 15 | 13 de 15 |

