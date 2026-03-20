

# Plan: MakeYourDream — Sprint Masivo de Frontend + Recomendaciones Backend

Este plan cubre TODO lo que puedo hacer desde el frontend (mi responsabilidad) y las recomendaciones para Claude Code (backend).

---

## BLOQUE 1 — Activar Triggers + Seed Data (Backend en Supabase)

Puedo ejecutar migraciones SQL directamente:

**1.1 Activar triggers pendientes:**
- `handle_new_user_progress` ON `auth.users` AFTER INSERT
- `update_updated_at` ON `user_progress`, `duels`, `collab_rooms` BEFORE UPDATE

**1.2 Seed 30 daily challenges** en la tabla `daily_challenges` (usando INSERT con service role, sin necesidad de admin role)

---

## BLOQUE 2 — Home Dream Booth Mejorado

**Problema**: El portal ovalado abstracto perdio identidad. No se entiende que es.

**Solucion**: Agregar silueta de microfono sugerida dentro del portal SVG (no literal, sino una forma estilizada que insinue mic). Mas particulas, scan beam mas dramatico, halo mas intenso.

**Mood Capsules funcionales**: Conectar cada mood a una ruta real:
- Soltar → `/karaoke` (freestyle directo)
- Crear → `/song-sketch`
- Entrenar → `/warmup`
- Mostrar → `/portfolio`

**Streak real**: Leer de `user_progress` en vez de hardcodear 3.
**Reto real**: Leer de `daily_challenges` WHERE `active_date = today`.

---

## BLOQUE 3 — Piano Premium + Multi-Instrumento

**Archivo**: `src/components/studio/HeroPiano.tsx` — REESCRIBIR completo

**Cambios**:
- Teclas 3x mas grandes, con profundidad real (inner-shadow, gradientes, hundimiento al click)
- Glow por tecla cuando se pulsa (flash de color)
- Feedback visual: tecla correcta brilla verde, incorrecta roja con shake

**Selector de instrumento** en `PitchTraining.tsx`:
- Piano (triangle wave — ya existe)
- Guitarra (sawtooth wave con filtro)
- Saxo (square wave con envelope especial)
- Bajo (sine wave octava baja)
- Flauta (sine wave pura)
- Cada instrumento cambia el `OscillatorType` + frecuencia base + ADSR envelope en `useAudioEngine`

**Ampliar `useAudioEngine.ts`**: nueva funcion `playInstrument(freq, instrument)` que aplica timbre distinto por instrumento usando oscillator type + gain envelope + BiquadFilter.

---

## BLOQUE 4 — Botones Premium en TODA la App

Aplicar `StageButton` consistentemente en las 34 paginas. Reemplazar todo `<button>` y `<motion.button>` generico con la variante correcta:
- CTAs principales → `monolith`
- Acciones rapidas → `launchpad`
- Filtros/seleccion → `capsule`
- Diagnostico → `scan`
- Toggles/FX → `lever`
- Navegacion → `glass`

**Paginas a actualizar**: Karaoke, PitchTraining, BreathTrainer, WarmUp, Exercises, Fingerprint, VocalFX, LoopStation, Coach, Challenges, Duelos, Portfolio, SongSketch, HarmonyLab, LyricsWriter, y todas las demas.

---

## BLOQUE 5 — Karaoke Score Real (no random)

**Problema**: `FreestyleMode` calcula pitch score basado en `cents < 25` pero es rudimentario.

**Mejora**:
- Pitch score: usar autocorrelation ya existente, pero ponderar por continuidad (notas sostenidas valen mas)
- Timing score: medir ratio de canto vs silencio (ya existe pero mejorar ponderacion)
- Expression: dynamic range + vibrato detection (varianza de cents)
- Guardar sesion en `training_sessions` tabla al terminar
- Actualizar `user_progress.xp` sumando score/10

---

## BLOQUE 6 — Fingerprint Conectado al Backend

**Archivo**: `src/pages/Fingerprint.tsx`

- Al terminar analisis de 15s, guardar en `vocal_fingerprints` tabla:
  - dimensions, global_score, vocal_range_low/high, classification
- Guardar share card en `share_cards` tabla
- Leer historial de fingerprints anteriores para mostrar evolucion

---

## BLOQUE 7 — Modulos Placeholder → Funcionales Basicos

Para los 18 placeholders, el minimo viable es:

| Modulo | Accion Frontend |
|--------|----------------|
| LoopStation | Conectar `useRecorder` para grabar capas reales con playback |
| VocalFX | Conectar Web Audio nodes reales: ConvolverNode (reverb), DelayNode, BiquadFilter |
| Diagnostico | Fusionar con Fingerprint o redirigir |
| Challenges | Leer de `daily_challenges` tabla, mostrar retos reales |
| Portfolio | Leer de `recordings` + `user_progress` + `vocal_fingerprints` |
| DreamCanvas | Leer de `user_progress` para metas reales |
| Plan90 | Generar plan basado en datos de `training_sessions` |
| Duelos | UI para crear duelo en `duels` tabla + esperar oponente |
| Duetos | Redirigir a CollabRoom o crear modo dueto |
| VocalStories | Leer de `social_feed` tabla |
| CollabRoom | Crear sala en `collab_rooms` tabla |
| Matching | Leer de `vocal_fingerprints` para buscar voces similares |
| FanRadar | Leer de `social_feed` para descubrir cantantes |
| EmotionMap | Usar mic real + pitch/volume para inferir emocion |
| GenreGym | Ejercicios interactivos con mic (como Exercises) |
| StageSimulator | Simular audiencia reactiva al volume del mic |
| AutoMix | Procesar audio con Web Audio API (EQ, compression) |
| HarmonyLab | Generar harmonias con Web Audio oscillators |

---

## BLOQUE 8 — CSS y Estetica Global

**Archivo**: `src/index.css` — agregar:
```css
.fog-layer { /* radial-gradients multicapa */ }
.portal-glow { /* boxShadow multicapa */ }
.pad-depth { /* inner-shadow para pads */ }
.key-press { /* animacion de tecla de piano premium */ }
```

---

## RECOMENDACIONES PARA CLAUDE CODE (Backend)

Estas son las tareas que necesitas pasarle a Claude Code:

### Edge Functions Prioritarias (de las 14 del otro repo):

1. **`vocal-analysis`** — Analiza audio con Lovable AI Gateway, devuelve dimensions/classification/similar_artists. Es la mas critica porque Fingerprint y Karaoke dependen de ella.

2. **`generate-exercise`** — Genera ejercicios personalizados via IA segun nivel del usuario.

3. **`ai-coach-observation`** — Genera observaciones del coach basadas en historial de `training_sessions`.

4. **`generate-challenge`** — Genera retos diarios automaticamente y los inserta en `daily_challenges`.

5. **`match-voices`** — Compara `vocal_fingerprints` entre usuarios para matching.

6. **`generate-share-image`** — Genera imagen de share card mas elaborada.

### Funcionalidad Backend que Falta:

- **Realtime**: Habilitar `ALTER PUBLICATION supabase_realtime ADD TABLE` para `social_feed`, `collab_rooms`, `duels` — necesario para chat, duelos en vivo, feed social.
- **Storage policies**: El bucket `recordings` es publico — considerar si los audios deberian ser privados con signed URLs.
- **Cron job**: Para generar `daily_challenges` automaticamente cada dia (pg_cron o edge function con cron trigger).
- **XP calculation**: Edge function que calcule XP correctamente y actualice `user_progress` atomicamente (para evitar race conditions).

### Formato de Comunicacion con Claude Code:

Cada modulo tiene comentarios `// BACKEND-REQUEST:` en el codigo. Claude Code deberia:
1. Buscar todos los `BACKEND-REQUEST` en el repo
2. Implementar cada uno como edge function
3. Deployar en este proyecto Supabase (`lgkgdpmcjdbnlqtbhxgk`)

---

## ORDEN DE EJECUCION

Dado el volumen, ejecutare en este orden dentro de un solo mensaje:

1. **SQL Migration**: Activar triggers + seed 30 daily challenges
2. **DreamBooth mejorado**: Silueta mic + mood capsules funcionales + streak/reto real
3. **Piano Premium**: Teclas grandes + multi-instrumento + feedback visual
4. **Karaoke real**: Score mejorado + guardar en training_sessions + XP
5. **Fingerprint real**: Guardar en vocal_fingerprints + share_cards
6. **Botones premium**: Aplicar StageButton en las paginas principales
7. **Placeholders basicos**: LoopStation, VocalFX, Challenges, Portfolio con datos reales

## Archivos que se crean/modifican

| Archivo | Accion |
|---------|--------|
| Migration SQL | CREAR — triggers + seed data |
| `src/components/DreamBooth.tsx` | MODIFICAR — silueta mic + mas drama |
| `src/pages/Index.tsx` | MODIFICAR — mood capsules funcionales + datos reales |
| `src/components/studio/HeroPiano.tsx` | REESCRIBIR — piano premium |
| `src/pages/PitchTraining.tsx` | MODIFICAR — selector instrumentos |
| `src/hooks/useAudioEngine.ts` | MODIFICAR — multi-instrumento |
| `src/components/karaoke/FreestyleMode.tsx` | MODIFICAR — guardar sesion en DB |
| `src/pages/Fingerprint.tsx` | MODIFICAR — guardar en vocal_fingerprints |
| `src/pages/Challenges.tsx` | REESCRIBIR — leer de daily_challenges |
| `src/pages/Portfolio.tsx` | REESCRIBIR — leer datos reales |
| `src/pages/LoopStation.tsx` | MODIFICAR — grabacion real de capas |
| `src/pages/VocalFX.tsx` | MODIFICAR — efectos Web Audio reales |
| `src/components/ui/StageButton.tsx` | MANTENER (ya tiene las 6 variantes) |
| `src/index.css` | AGREGAR utilidades |
| + Actualizar botones en ~15 paginas mas |

