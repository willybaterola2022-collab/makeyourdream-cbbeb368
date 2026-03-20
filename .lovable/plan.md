

# Plan: Complementar MakeYourDream con el Informe Estratégico

## Que trae el informe que NO tenemos implementado

El documento es un análisis estratégico de alto nivel. Al cruzarlo con nuestro código actual, identifico estas brechas concretas:

### BRECHAS CRITICAS (el informe las exige, nosotros no las tenemos)

| Concepto del Informe | Estado en la App | Sprint donde encaja |
|---------------------|-----------------|-------------------|
| **"Activation Wedge" = Diagnóstico Vocal Viral** — El usuario canta 20 seg y recibe un Vocal Fingerprint compartible con "Mi voz es 75% similar a [Artista]" | Fingerprint es placeholder estático | Sprint 2 (ya planificado) |
| **Auto Clips con marca de agua** — Cada grabación genera un video vertical 9:16 para TikTok/IG | NO EXISTE | Nuevo: Sprint 14 (Share Cards) |
| **Value-Trigger Monetization** — Análisis profundo gratis limitado, luego paywall | NO EXISTE | Sprint 16 (Monetización) |
| **Marketplace de Coaching 1:1** — Coaches humanos ofrecen clases dentro de la app | NO EXISTE | Sprint 16+ (nuevo módulo) |
| **Distribución a Spotify/Apple Music** — Integración con APIs tipo DistroKid | NO EXISTE | Sprint 16+ (nuevo módulo) |
| **North Star Metric: WAS** (Weekly Activated Singers) — Analytics de usuarios que graban + reciben feedback por semana | NO HAY analytics | Claude Code: tabla + dashboard |
| **Rachas estilo Duolingo** — Streaks con reducción de abandono del 47% al 28% | Solo propuesto en Sprint 7 | Sprint 7 (ya planificado) |
| **Before & After Comparator** — Escuchar tu grabación de hace 1 mes vs hoy | Comparator existe como placeholder | Sprint 5 o 14 |
| **Voice Translator con IPA** — Cantar en otro idioma manteniendo tu timbre | Solo propuesto en Sprint 13 | Sprint 13 (ya planificado) |
| **Matching por ELO competitivo** — Duelos justos por nivel | Solo propuesto en Sprint 11 | Sprint 11 (ya planificado) |
| **pYIN para detección de pitch** — Algoritmo probabilístico superior al actual | Usamos Web Audio API básico | Mejora técnica para Claude Code |
| **MFCC + x-vectors para Fingerprint** — Análisis profesional de identidad vocal | NO EXISTE | Claude Code: edge function |
| **Licencias SGAE/AGEDI** — Cánones por uso de obras con copyright | NO HAY gestión legal | Decisión de negocio, no de código |

### LO QUE YA TENEMOS ALINEADO CON EL INFORME

| Concepto del Informe | Nuestro Sprint |
|---------------------|---------------|
| Karaoke como gancho inicial (ref. Smule 52M usuarios) | Sprint 3 |
| Gamificación XP/Streaks/Ligas | Sprint 7 |
| Feed social de performances | Sprint 6 |
| Duelos competitivos | Sprint 11 |
| Voice Translator | Sprint 13 |
| Vocal Fingerprint como ancla de identidad | Sprint 2-5 |
| Entrenamiento metacognitivo con feedback | Sprint 4 |

---

## COMO COMPLEMENTAR: 6 acciones concretas

### 1. PRIORIZAR EL "WEDGE" (Dia 1-30 del informe)
El informe dice que el wedge NO es el karaoke, es el **Diagnóstico Vocal Viral**. Nuestro Sprint 2 ya incluye Fingerprint funcional, pero falta:
- **Share Card** generada automáticamente: imagen con tu radar 6D + "Mi voz es 75% similar a Adele" + QR a la app
- Esto va en Sprint 2 como feature adicional del Fingerprint
- **Archivos**: Nuevo componente `src/components/ShareCard.tsx` que genera un canvas/imagen compartible

### 2. AUTO CLIPS (nuevo módulo, Sprint 14)
El informe insiste en que cada grabación = unidad de adquisición viral:
- Al terminar de grabar en Karaoke, generar un video vertical 9:16 con waveform + score + marca de agua MakeYourDream
- Botón "Compartir en TikTok/IG" que descarga el clip
- **Implementación**: Canvas API o MediaRecorder para generar el video en el navegador
- Insertar `// BACKEND-REQUEST: auto-clip { recording_id } → { video_url, thumbnail_url }`

### 3. BEFORE & AFTER COMPARATOR (Sprint 5 o 14)
El Comparator ya existe como placeholder. Hacerlo funcional:
- Query a `recordings` del usuario, ordenadas por fecha
- Seleccionar 2 grabaciones y reproducirlas lado a lado
- Mostrar diferencia de pitch accuracy entre ambas
- "Tu afinación mejoró un 18% en 1 mes"

### 4. CRONOGRAMA DE 90 DIAS (alinear con el informe)
El informe propone un plan de 90 días que mapea perfectamente a nuestros sprints:

```text
DIA 1-30 (Sprints 2-3):
├── Perfeccionar Activation Wedge (Fingerprint + Share Card)
├── Pulir StudioRoom en flujo de grabación
└── Primera función de análisis vocal via Lovable AI Gateway

DIA 31-60 (Sprints 4-7):
├── Sistema de rachas y XP
├── "Beginner Room" con canciones simples
└── Feedback suavizado para principiantes

DIA 61-90 (Sprints 8-11):
├── Primera temporada competitiva (Duelos)
├── Entry Fees para torneos
└── Integración de distribución para nivel "Artista"
```

### 5. METRICAS WAS (Claude Code)
El informe define la North Star Metric como **Weekly Activated Singers**. Esto requiere:
- Tabla `analytics_events` para trackear: grabaciones completadas, feedback recibido, sesiones de entrenamiento
- Dashboard interno (o query) que calcule WAS semanalmente
- Insertar en el master prompt para Claude Code

### 6. MONETIZACION DETALLADA (Sprint 16, expandido)
El informe da porcentajes concretos de revenue mix:
- **Año 1**: 60% suscripción, 20% coaching marketplace, 10% competencias, 5% servicios artista, 5% B2B
- **Value-Trigger**: Después de 3 análisis vocales gratis, pedir upgrade
- Esto se convierte en la especificación del Sprint 16

---

## SPRINTS ACTUALIZADOS CON COMPLEMENTOS DEL INFORME

| Sprint | Nombre | Complemento del Informe |
|--------|--------|------------------------|
| 1 | Limpieza | HECHO |
| **2** | **Home + Fingerprint + UX** | **+ Share Card viral ("75% similar a Adele")** |
| 3 | Karaoke perfecto | + Auto Clip preview (sin video aún, solo imagen compartible) |
| 4 | Entrenamiento unificado | + Beginner Room con feedback suavizado |
| 5 | Tu Voz analisis | + Before & After Comparator funcional |
| 6 | Arena Social | Sin cambios |
| 7 | Gamificación | + Rachas estilo Duolingo (reducir abandono 47%→28%) |
| 8 | Loop Station real | Sin cambios |
| 9 | Vocal FX real | Sin cambios |
| 10 | Coach IA | + Marketplace de coaching 1:1 (UI, backend después) |
| 11 | Duelos 1v1 | + Matchmaking por ELO real |
| 12 | Collab Room | Sin cambios |
| 13 | Voice Translator | + IPA phonetic mapping (como dice el informe) |
| 14 | Retención | **+ Auto Clips video 9:16 + Share Cards + Before&After** |
| 15 | Social avanzado | + Growth Loops del informe (3 bucles) |
| 16 | Monetización | **+ Value-Trigger paywall + Revenue mix 60/20/10/5/5** |
| **17** | **Manager del Artista (NUEVO)** | **Distribución a Spotify/Apple Music via API** |
| **18** | **Analytics WAS (NUEVO)** | **North Star Metric dashboard** |

### PARA EL MASTER PROMPT DE CLAUDE CODE, agregar:
- Tabla `analytics_events` (user_id, event_type, metadata, created_at)
- Edge function `generate-share-card` → genera imagen compartible con radar + artista similar
- Edge function `auto-clip` → genera video vertical con waveform
- Edge function `compare-recordings` → calcula delta entre 2 grabaciones
- Especificación de pYIN como algoritmo recomendado para pitch detection en edge functions
- Especificación de MFCC + x-vectors para vocal fingerprinting

---

## QUE PUEDO HACER YO AHORA (sin backend)

Todo lo del Sprint 2 original MAS:
1. **Share Card component** — Canvas que genera imagen con radar + score + "similar a [Artista]" + botón descargar/compartir
2. **Before & After UI** — Pantalla que muestra 2 grabaciones del usuario lado a lado con player dual
3. **Beginner mode flag** — En entrenamiento, detectar si es primera sesión y dar feedback más suave

Lo que NO puedo hacer sin Claude Code:
- pYIN real (necesita procesamiento server-side)
- MFCC/x-vectors (necesita ML backend)
- Auto Clips video (necesita MediaRecorder + canvas, factible en browser pero complejo)
- Distribución a Spotify (necesita APIs externas)
- Analytics WAS (necesita tabla + queries)

---

## RESUMEN EJECUTIVO

El informe valida al 100% nuestra hoja de ruta y agrega 3 conceptos clave que debemos incorporar:
1. **El Wedge es el Fingerprint viral, no el Karaoke** → Priorizar Share Card en Sprint 2
2. **Cada grabación = unidad de crecimiento** → Auto Clips en Sprint 14
3. **North Star Metric = WAS** → Analytics en Claude Code

No hay contradicción con nuestros 16 sprints. El informe los refuerza y agrega 2 sprints nuevos (17: Manager del Artista, 18: Analytics WAS).

