

# Fase 2 Completa + Hero Cinematográfico — Plan de Implementación

## 1. Hero Rediseñado (Landing.tsx)

**Concepto: "Tu voz es única. Demuéstralo."** — Un hero inmersivo con un ecualizador animado central que reacciona como si estuviera escuchando una voz en vivo. En desktop, ocupa fullscreen con el ecualizador a gran escala detrás del texto. En móvil, el ecualizador se compacta arriba del título.

**Elementos clave:**
- **Ecualizador SVG animado** (20-30 barras con alturas aleatorias, animación continua con framer-motion) como fondo central, en dorado con opacidad degradada — crea sensación de "la app está viva, escuchando"
- **Headline en dos líneas**: "Tu voz merece el" / "escenario mundial" — serif grande, gold-text en "escenario mundial"
- **Micro-stat animado** debajo: contador que sube de 0 a 12,400 artistas (useEffect + interval)
- **CTA pulsante** con glow dorado que respira: "Descubre tu voz — 30 segundos"
- **Partículas de notas musicales** flotando con parallax suave al scroll
- **Badge flotante** tipo "🔥 847 cantando ahora" con breathing animation

## 2. Siete Nuevos Módulos (Páginas)

### 2a. Dream Canvas Vocal (`/dream-canvas`)
- Card principal con campos mock: "Mi sueño musical", fecha objetivo, evidencia de éxito
- Radar mini del Fingerprint actual como punto de partida
- Mapa de brechas visual: barras que muestran "dónde estoy" vs "dónde quiero estar"
- Línea de tiempo con 3 milestones editables

### 2b. Plan de 90 Días (`/plan-90`)
- Timeline vertical con 12 semanas agrupadas en 3 fases (Fundación / Desarrollo / Dominio)
- Cada semana: título, objetivo, ejercicios sugeridos, estado (completado/activo/pendiente)
- Badge "Generado por IA" con ícono de Sparkles
- Progress bar general del plan (ej. semana 4 de 12 = 33%)
- Card lateral con stats: días restantes, sesiones completadas, mejora acumulada

### 2c. Breath & Diaphragm Trainer (`/breath-trainer`)
- **Círculo de respiración animado** que se expande (inhalar 4s) y contrae (exhalar 6s) con framer-motion
- Timer configurable con fases: Inhalar → Sostener → Exhalar → Pausa
- Contador de repeticiones completadas
- 3 ejercicios preset: "Diafragma básico", "4-7-8 Relajación", "Soporte para belting"
- Visualización de onda sinusoidal que sigue el ritmo de la respiración

### 2d. Pitch & Ear Training (`/pitch-training`)
- Piano virtual SVG de 2 octavas con notas clickeables
- Modo "Identifica la nota": muestra nota objetivo, simula audio, usuario selecciona
- Modo "Intervalos": identifica distancia entre 2 notas (2da, 3ra, 5ta, 8va)
- Score acumulado y streak de respuestas correctas
- Progresión: nivel 1 (notas simples) → nivel 5 (acordes complejos)

### 2e. Vocal Warm-Up Studio (`/warmup`)
- Selector de duración: 3 min / 5 min / 10 min
- Lista de ejercicios de calentamiento con timer individual (lip trills, sirenas, escalas)
- Cada ejercicio con estado: pendiente → activo (con countdown circular) → completado
- Waveform placeholder mostrando la nota objetivo
- Botón "Completar calentamiento" al final

### 2f. Before/After Comparator (`/comparator`)
- **Split player horizontal**: grabación antigua (izquierda) vs reciente (derecha)
- Waveforms paralelos con colores diferenciados (gris vs dorado)
- Tabla de métricas comparativas: Afinación, Timing, Control, Vibrato con deltas
- Selector de fechas para elegir qué grabaciones comparar
- Badge visual: "Mejora: +23% en afinación"

### 2g. Auto-Mix & Master (`/automix`)
- Waveform de la grabación original con controles
- Panel de efectos: EQ (sliders), Reverb (knob), Compresión (knob) — valores mock
- Botón "Auto-Mix con IA" que simula procesamiento (progress bar animada)
- Preview del resultado con waveform "procesado" (visualmente diferente)
- Opciones de export: "TikTok (15s)", "Reels (30s)", "Full track"
- Watermark visual "Mixed with MakeYourDream"

## 3. Cambios en Archivos Existentes

- **App.tsx**: agregar 7 nuevas rutas dentro del AppLayout
- **AppSidebar.tsx**: agregar 7 nuevos items al menú con iconos (Wind, Target, Palette, Ear, Thermometer, GitCompare, Wand2)
- **Landing.tsx**: reemplazar hero section completo con el nuevo diseño cinematográfico

## 4. Estructura de Archivos

```text
src/pages/
├── DreamCanvas.tsx      (nuevo)
├── Plan90.tsx           (nuevo)
├── BreathTrainer.tsx    (nuevo)
├── PitchTraining.tsx    (nuevo)
├── WarmUp.tsx           (nuevo)
├── Comparator.tsx       (nuevo)
├── AutoMix.tsx          (nuevo)
└── Landing.tsx          (editado — hero nuevo)

src/App.tsx              (editado — 7 rutas nuevas)
src/components/layout/
└── AppSidebar.tsx       (editado — 7 items nuevos)
```

Total: 7 archivos nuevos, 3 archivos editados.

