

# MakeYourDream — 10 Módulos Premium

Plataforma de transformación de talento musical con diseño dark premium inspirado en MasterClass × Moises.ai. Front-end completo con datos demo, listo para presentar.

---

## Diseño Global

- **Tema oscuro inmersivo**: fondo #0A0A0A, cards en glassmorphism #1A1A1A con bordes semi-transparentes
- **Tipografía**: Cormorant Garamond para títulos (elegante, editorial), Inter para body
- **Colores**: Gold (#D4AF37) para logros/progreso, Violet (#8B5CF6) para estados activos, Cool White (#F3F4F6) para texto
- **Sidebar con navegación por módulos** (colapsable, iconos cuando mini)
- **Floating Performance Bar** persistente en la parte inferior (metronome, tuner placeholder)
- **Animaciones fluidas**: fade-in suaves, breathing effects en estados activos
- **Responsive**: mobile-first, optimizado para móvil y desktop

---

## Los 10 Módulos

### M01 — The Stage (Dashboard)
Pantalla principal personalizada. Muestra "Next Up" con la próxima sesión sugerida, resumen de streak actual, progreso semanal en ring chart dorado, y carousel horizontal de lecciones recientes estilo Netflix.

### M02 — Karaoke Core
Reproductor de karaoke inmersivo. Waveform animado, letras sincronizadas con highlight en tiempo real, score en vivo (afinación, timing), controles de play/pause. Card de canción con artista y duración. Datos mock de "Bésame Mucho".

### M03 — Vocal Fingerprint 6D
Radar hexagonal con 6 dimensiones (Afinación, Timing, Vibrato, Sustain, Control, Registro). Perfil del usuario con score global, evolución semanal con mini-gráfico de líneas. Tarjeta de identidad vocal.

### M04 — Diagnóstico Vocal Gratis
Pantalla de resultado de diagnóstico: clasificación vocal (ej. Mezzosoprano lírica), rango detectado, percentil, barras de progreso para 5 dimensiones, comparativa con artistas famosos con % de similitud. Botón "Compartir mi diagnóstico".

### M05 — AI Vocal Coach + Debrief
Análisis post-performance: 3 métricas principales con delta vs sesión anterior, lista de observaciones del AI Coach, ejercicio recomendado con timer y reps, botón para iniciar ejercicio.

### M06 — Daily Exercises + Streaks
Calendario semanal con días completados, alerta de vencimiento de racha, rutina del día con 3 ejercicios (estado: hecho/activo/pendiente), métricas laterales (sesiones semana, mejora %, racha más larga, próximo badge).

### M07 — Challenge Engine + Ranking
Challenge semanal activo con countdown, canción destacada, barra de criterios de evaluación (4 dimensiones con peso %), posición actual en ranking, tabla Top 5 con avatares, scores y ciudades. Botón "Enviar mi performance".

### M08 — Voice Matching "Suenas a..."
Resultado de match vocal con artista famoso principal (% de similitud), desglose por dimensión, lista de artistas secundarios con %, share card viral con diseño premium lista para redes sociales.

### M09 — Duetos con IA
Selector de artista para dueto, visualización split-screen con waveforms paralelos (tu voz + IA), controles de ajuste tonal, preview del dueto generado. Card de resultado con opción de compartir.

### M10 — Talent Portfolio
Perfil público del artista: avatar, badges verificados (Gold Voice, Streak Master, Rising Star), galería de mejores performances con scores, stats (seguidores, votos totales, ranking de liga), gráfico de evolución temporal.

---

## Navegación

- **Sidebar izquierda** con iconos para cada módulo + labels
- **Header** con logo MakeYourDream, SidebarTrigger, y avatar del usuario
- **Floating bar** inferior con controles de audio placeholder
- **Routing**: 10 rutas independientes (`/`, `/karaoke`, `/fingerprint`, `/diagnostico`, `/coach`, `/exercises`, `/challenges`, `/matching`, `/duetos`, `/portfolio`)

