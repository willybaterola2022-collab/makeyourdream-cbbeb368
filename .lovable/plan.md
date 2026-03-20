

# PLAN COMPLETO: MakeYourDream v5.0 "Stage Edition"
## Documento narrativo + hoja de ruta integral en español

---

## MI OPINION HONESTA COMO TU FRONTEND DEVELOPER

Willy, después de auditar cada archivo del proyecto, esto es lo que hay:

### LO QUE FUNCIONA DE VERDAD (puedes cantar y grabar)
| Modulo | Que hace realmente | Hooks conectados |
|--------|-------------------|-----------------|
| **Karaoke Freestyle** | Graba tu voz, detecta pitch en tiempo real, muestra waveform, guarda en la nube | useMicrophone + usePitchDetection + useSupabaseRecorder + useMetronome |
| **Karaoke Custom/Preset** | Igual que Freestyle pero con letra o canciones preseleccionadas | Los mismos 4 hooks |
| **Breath Trainer** | Ejercicios de respiracion con temporizador y sonido real | useAudioEngine (playSweep, playTone) |
| **Pitch Training** | Juego de oido: escuchas nota, eliges cual es, scoring real | useAudioEngine (playNote) |
| **WarmUp** | Rutina cronometrada con sonidos guia reales | useAudioEngine |
| **Song Sketch** | Graba bloques (intro/verso/coro) con mic real | useMicrophone + useSupabaseRecorder |

### LO QUE SE VE BONITO PERO NO HACE NADA
| Modulo | Problema |
|--------|---------|
| **Home (Index)** | Solo un mic decorativo que navega a Karaoke. Cero stats, cero datos reales |
| **Diagnostico** | Click en osciloscopio = muestra datos HARDCODEADOS. No analiza nada |
| **Fingerprint** | 100% estatico. Numeros inventados. No usa mic |
| **Coach** | Texto estatico. No hay IA, no hay conexion a datos reales |
| **Exercises** | Calendario mock. El boton Play no hace nada |
| **Challenges** | UI bonita con datos falsos. No hay sistema de retos |
| **Duelos** | Leaderboard inventado. No hay matchmaking |
| **CollabRoom** | Participantes falsos. Grabacion no funciona |
| **LoopStation** | Capas visuales pero no graban audio real por capa |
| **EmotionMap** | Datos hardcodeados. El mic se conecta pero no analiza |
| **VocalFX** | Tiene useMicrophone pero los efectos no procesan audio real |
| **HarmonyLab** | Tiene useMicrophone pero no genera armonias |
| **AutoMix** | Waveform decorativa. No procesa audio |
| **Matching, Duetos, FanRadar, GenreGym, StageSimulator, VocalStories, DreamCanvas, Comparator, VoiceJournal, Portfolio, Plan90, LyricsWriter** | Placeholders con datos mock |

### LO QUE NUNCA SE EJECUTO (propuestas anteriores pendientes)
1. **30 propuestas de diseño "El Estudio del Artista"** — Solo se implemento StudioRoom como wrapper + 7 hero components. Faltan 6 heroes nuevos (HeroBrain, HeroRadar6D, HeroSplitStage, HeroVinyl, HeroBook, HeroConsole)
2. **50 modulos de retencion/viralidad** — Ninguno se construyo (Daily Voice Check, Streak Rewards, Vocal Passport, etc.)
3. **Comentarios BACKEND-REQUEST** — CERO insertados en el codigo (busque y no hay ninguno)
4. **Master prompt para Claude Code** — No se genero
5. **Modulo Voice Translator** — No existe
6. **Bottom navigation mobile** — No existe
7. **Renombrado de modulos** — Siguen con nombres tecnicos
8. **Onboarding por sala** — No existe
9. **Sonidos de UI** — useAudioEngine existe pero solo lo usan WarmUp, Breath y Pitch
10. **Celebraciones** — No hay confetti, aplausos ni feedback sonoro al completar algo

---

## HOJA DE RUTA COMPLETA EN SPRINTS

### SPRINT 1: "LIMPIEZA" (Lovable solo, sin backend)
**Que se hace:**
- Ocultar del sidebar las 20 paginas que no funcionan (NO se borra codigo, solo se quitan del menu)
- Renombrar los modulos visibles con nombres en español marketeros
- Crear bottom navigation mobile con 5 tabs: Escenario | Estudio | CANTA (boton central grande) | Entrena | Perfil
- Reorganizar sidebar desktop en 5 grupos colapsables

**Resultado:** El usuario solo ve lo que funciona. Navegacion limpia.

### SPRINT 2: "HOME QUE FUNCIONA" (Lovable solo)
**Que se hace:**
- Rediseñar Home con 3 CTAs gigantes: "CANTA", "ENTRENA", "TU VOZ"
- Conectar datos reales de la tabla `recordings` para mostrar grabaciones recientes
- Conectar datos reales de la tabla `training_sessions` para mostrar racha de dias
- Leer `profiles.xp` y `profiles.vocal_level` para mostrar nivel del usuario
- Diseñar card "Reto del Dia" con countdown (mock, preparado para backend)
- Insertar `// BACKEND-REQUEST: daily-challenge edge function`

**Resultado:** Home muestra datos reales del usuario logueado.

### SPRINT 3: "KARAOKE PERFECTO" (Lovable solo)
**Que se hace:**
- Hacer el microfono mucho mas grande en la pantalla de grabacion
- Crear pantalla de RESULTADOS al terminar de grabar: score S/A/B/C/D/E, radar de dimensiones, boton "Compartir" y "Cantar otra vez"
- Los 3 modos siempre visibles como tabs arriba (no escondidos tras "Volver")
- Canciones con caratula de color, badge de genero, estrellas de dificultad
- Insertar `// BACKEND-REQUEST: vocal-analysis — analisis real de pitch/timing/expression`

**Resultado:** Karaoke es una experiencia completa de grabar + ver resultados.

### SPRINT 4: "ENTRENAMIENTO UNIFICADO" (Lovable solo)
**Que se hace:**
- Crear una sola pagina "Entrena" que unifica WarmUp + BreathTrainer + PitchTraining
- "Ejercicio del dia" arriba: grande, con boton PLAY para escuchar demo + boton REC para intentarlo con mic real
- Conectar `useMicrophone` + `usePitchDetection` para feedback en tiempo real mientras haces el ejercicio
- Cada ejercicio tiene: demo audio (useAudioEngine), grabar intento (useMicrophone), ver precision de pitch
- Barra de progreso: cuantos ejercicios completaste hoy
- Insertar `// BACKEND-REQUEST: daily-exercise — generar ejercicio del dia personalizado`

**Resultado:** El entrenamiento funciona con mic real y feedback visual.

### SPRINT 5: "TU VOZ" (Lovable + Claude Code)
**Que se hace:**
- Fusionar Fingerprint + Diagnostico en una sola pagina "Tu Voz"
- Hero: radar 6D existente pero ENORME y animado
- Boton "Hacer Analisis" → abre mic → graba 30 seg → envia al backend
- Muestra resultados del ultimo analisis (de tabla `recordings.metadata`)
- Grafico de evolucion con datos reales de `training_sessions`
- Rango vocal: nota mas grave a nota mas aguda detectada
- Artista similar (mock hasta que Claude Code conecte)
- Insertar:
  - `// BACKEND-REQUEST: vocal-analysis { recording_id, audio_url } → { classification, range, dimensions[], similar_artists[] }`
  - `// BACKEND-REQUEST: vocal-fingerprint { recording_id, audio_url } → { dimensions[], global_score, weekly_evolution[] }`

**Que necesita Claude Code:** Edge functions `vocal-analysis` y `vocal-fingerprint`. Tabla `vocal_fingerprints`.

### SPRINT 6: "ARENA SOCIAL" (Lovable + Claude Code)
**Que se hace:**
- Feed vertical tipo TikTok con grabaciones de la comunidad
- Card: waveform mini + nombre + cancion + score + play
- Filtros: Populares, Recientes, Retos
- Boton flotante "Subir mi performance"
- Mock data realista hasta que el backend conecte
- Insertar:
  - `// BACKEND-REQUEST: social-feed { user_id, filter } → { posts[] }`
  - `// BACKEND-REQUEST: Realtime subscription para nuevos posts`

**Que necesita Claude Code:** Tabla `social_feed`. Edge function `social-feed`. Realtime channel.

---

## SPRINTS FUTUROS (despues de que las 5 pantallas sean perfectas)

### SPRINT 7: "GAMIFICACION" (Lovable + Claude Code)
- Sistema de XP visible en toda la app (barra de progreso en header)
- Streaks con visual de fuego que crece
- Niveles: Principiante → Aprendiz → Artista → Estrella → Leyenda
- Badges desbloqueables en galeria 3D
- Ligas semanales: Bronce → Plata → Oro → Diamante
- **Claude Code:** Tabla `user_progress` (xp, streak, level). Edge function `gamification-engine`.

### SPRINT 8: "LOOP STATION REAL" (Lovable solo)
- Conectar `useMicrophone` + `useRecorder` a cada capa individual
- Grabar capa 1 → reproducir capa 1 mientras grabas capa 2 → etc.
- Mezcla en tiempo real con Web Audio API (GainNode por capa)
- Exportar mezcla final como archivo de audio

### SPRINT 9: "VOCAL FX REAL" (Lovable solo)
- Implementar efectos de audio reales con Web Audio API:
  - Reverb (ConvolverNode)
  - Delay (DelayNode)
  - Pitch shift (PitchShifterNode via worklet)
  - Distortion (WaveShaperNode)
- El usuario canta → escucha su voz con efecto en tiempo real

### SPRINT 10: "COACH IA" (Lovable + Claude Code)
- Despues de cada sesion de karaoke/entrenamiento, enviar grabacion al backend
- Recibir feedback de IA: que hiciste bien, que mejorar, ejercicio recomendado
- Mostrar metricas reales de progreso (no hardcodeadas)
- **Claude Code:** Edge function `ai-coach-feedback` usando Lovable AI Gateway

### SPRINT 11: "DUELOS 1v1" (Lovable + Claude Code)
- Sistema ELO real con matchmaking
- Ambos cantan la misma cancion → IA puntua → gana el mejor
- Replays compartibles como share cards
- **Claude Code:** Tabla `duels`. Edge function `duel-matchmaking`. Realtime.

### SPRINT 12: "COLLAB ROOM REAL" (Lovable + Claude Code)
- Sala con audio real usando WebRTC o Supabase Realtime
- Cada participante graba su pista
- Mezcla final de todas las pistas
- **Claude Code:** Tabla `collab_rooms`. Edge function `collab-room-create`. Realtime channels.

### SPRINT 13: "VOICE TRANSLATOR" (Lovable + Claude Code)
- El modulo nuevo que propusiste: cantas en tu idioma, la IA traduce la letra y regenera el audio en otro idioma manteniendo tu voz
- Selector de idioma destino (EN, FR, PT, IT, JP, KR, DE)
- Hero: globo terraqueo con ondas de audio
- **Claude Code:** Edge function `voice-translate` { recording_id, source_lang, target_lang } → { translated_audio_url, original_lyrics, translated_lyrics }

### SPRINT 14: "MODULOS DE RETENCION" (Lovable + Claude Code)
De las 50 propuestas originales, los mas impactantes:
- **Daily Voice Check** — 30 seg de voz cada mañana, tracking automatico
- **Nota del Dia** — Una nota que debes clavar, streak de dias
- **Mood Singing** — "Como te sientes?" → sugiere cancion segun emocion
- **Streak Rewards** — Cada 7 dias, desbloqueas algo
- **Vocal Passport** — Sellos por cada genero dominado
- **Share Card** — Tarjeta visual compartible con tu score

### SPRINT 15: "SOCIAL AVANZADO"
- Voice Chain viral: graba 10 seg, pasa al siguiente
- Battle Royale: 8 cantantes, eliminacion por rondas
- Community Choir: coro masivo
- Vocal Gift: graba cancion personalizada como regalo
- Hashtag Challenges tipo TikTok

### SPRINT 16: "MONETIZACION"
- Pro Recordings (exportar en alta calidad con masterizacion IA)
- Vocal Skins (efectos premium)
- Artist Profile Verified (portfolio publico)
- Marketplace de Beats

---

## QUE NECESITA CLAUDE CODE (resumen para el master prompt)

### Tablas nuevas:
1. `vocal_fingerprints` — analisis persistente de voz
2. `daily_challenges` — reto del dia
3. `social_feed` — performances compartidas
4. `user_progress` — XP, streaks, levels, badges
5. `duels` — duelos 1v1 con ELO
6. `collab_rooms` — salas colaborativas
7. `voice_translations` — traducciones de voz

### Edge Functions:
1. `vocal-analysis` — analisis real de audio (pitch, timing, expression)
2. `vocal-fingerprint` — perfil vocal profundo
3. `daily-exercise` — genera ejercicio personalizado del dia
4. `ai-coach-feedback` — feedback post-sesion
5. `social-feed` — CRUD del feed social
6. `duel-matchmaking` — matchmaking con ELO
7. `collab-room-create` — crear sala colaborativa
8. `voice-translate` — traduccion vocal
9. `gamification-engine` — XP, streaks, badges, levels

---

## QUE PUEDO HACER YO SOLO SIN ESPERAR A CLAUDE CODE

| Sprint | Depende de backend? |
|--------|-------------------|
| Sprint 1: Limpieza y navegacion | NO |
| Sprint 2: Home con datos reales | NO (usa tablas existentes) |
| Sprint 3: Karaoke perfecto | NO |
| Sprint 4: Entrenamiento unificado | NO |
| Sprint 5: Tu Voz | PARCIAL (UI sin backend, luego Claude conecta) |
| Sprint 6: Arena Social | PARCIAL (mock primero, luego Claude conecta) |
| Sprint 8: Loop Station real | NO (Web Audio API puro) |
| Sprint 9: Vocal FX real | NO (Web Audio API puro) |

**Propuesta: Empiezo con Sprint 1 ahora mismo.** Es la base de todo y no depende de nadie.

---

## DIRECTIVAS PARA CLAUDE CODE

Cuando aprubes, genero un archivo descargable `claude-code-master-prompt.md` con:
- Esquema completo de cada tabla con columnas, tipos y RLS
- Especificacion de cada edge function con Input/Output exactos
- Orden de prioridad de construccion
- Como conectar con los `// BACKEND-REQUEST` que yo deje en el codigo

