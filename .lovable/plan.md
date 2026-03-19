

# Rediseño Total: El Escenario del Artista — Mobile-First

## Visión
Transformar el home y cada sección en un **escenario inmersivo**. El artista entra y siente que está en SU estudio/escenario. Cero texto innecesario. Todo visual, iconográfico, intuitivo. El micrófono old-school es el HÉROE absoluto — scroll 1 en todas partes.

## Cambios Principales

### 1. Home Completo — "El Escenario" (`Index.tsx`)

**ELIMINAR:**
- "Tu voz. Tu momento." y todo texto motivacional
- Stats (12 días, 847 puntos, 2/3 sesiones) — eso es backend, no hero
- "Tu próximo hit" card
- "Sube de nivel" con progress bars
- Live badge "847 artistas cantando ahora"
- CTA button "Empezar a cantar gratis" (el mic ES el CTA)

**NUEVO DISEÑO — 3 scrolls:**

**Scroll 1 — El Micrófono Héroe (fullscreen)**
- VintageMicrophone ENORME centrado (ocupa 60-70% del viewport)
- Fondo con efecto de escenario: spotlight sutil desde arriba, partículas/humo
- Sin texto excepto "TOCA Y CANTA" que titila debajo del mic
- Al tocar → navega directo a `/karaoke`

**Scroll 2 — Tu Estudio (grid de iconos)**
- 6 botones grandes tipo "sala de estudio": cada uno es una zona
- Iconos grandes + nombre corto, sin descripciones largas
- Diseño: círculos/cuadrados glassmorphism con icono grande
- Zonas: 🎤 Karaoke | 🎧 Practicar | 🎼 Crear | 🔬 Analizar | 🏆 Competir | 👤 Mi Perfil
- Al tocar cualquiera → navega a la sección correspondiente
- Selector de escenario: 3-4 botones visuales (Estudio, Club, Teatro, Arena) que cambian el fondo/ambiente

**Scroll 3 — Canciones por Género (horizontal scrolls)**
- Mínimo 20 canciones por género (Pop, Rock, Balada, R&B, Rap, Reggaeton, etc.)
- Cards visuales: imagen/color + título + artista
- Tap en una canción → abre karaoke directo con esa canción
- Chips de género arriba para filtrar

### 2. Micrófono Vintage 3x Más Grande (`VintageMicrophone.tsx`)

**Cambios:**
- Cabeza: de `w-28 h-36` a `w-44 h-56` mobile, `w-56 h-72` desktop
- Anillos: de 4 a 6 anillos, radio máximo 400px+ en desktop
- Glow idle: mucho más intenso — el mic "respira" con fuerza
- Label "TOCA Y CANTA": de `text-sm` a `text-xl md:text-2xl`, más brillante
- En estado recording: label dice "🔴 GRABANDO" con icono de stop visible
- En estado finished: botones claros de ▶️ Escuchar, 💾 Guardar, 📤 Compartir, 🔄 Otra vez
- Todo el componente acepta prop `size="hero" | "section"` para reutilizar en home (hero) y karaoke (section)

### 3. Karaoke Rediseñado (`Karaoke.tsx`)

**Selector de modo más visual:**
- En lugar de lista con texto, 3 tarjetas grandes con iconos enormes
- Freestyle: icono micrófono + ondas
- Tu Letra: icono papel/pluma
- Canciones: icono playlist/disco

**Canciones expandidas:**
- Mínimo 20 canciones por género (ampliar `PRESET_SONGS` de 10 a 80+)
- Géneros: Pop, Rock, Balada, R&B, Rap, Reggaeton, Latin Pop, Jazz, Bolero, Ranchera
- Filtro por género con chips horizontales
- Cards con color por género, dificultad visual (estrellas, no texto)

### 4. Controles Post-Grabación Intuitivos

Cuando termina de grabar, en lugar de un audio player genérico:
- 4 botones grandes circulares en fila:
  - ▶️ Escuchar (play/pause)
  - 💾 Guardar en nube
  - 📤 Compartir
  - 🔄 Grabar otra vez
- Waveform visual debajo con scrubber
- Sin texto "Escucha tu grabación" — los iconos hablan solos

### 5. Selector de Escenario (nuevo componente)

Componente `ScenePicker` con 4 opciones visuales:
- 🎙️ Estudio — fondo oscuro con luces tenues
- 🎪 Club — luces de colores, humo
- 🎭 Teatro — spotlight cálido, cortinas
- 🏟️ Arena — multitud, pantallas gigantes

Cada uno cambia el CSS del fondo (gradiente/colores del escenario). Botones intuitivos: tap y cambia. Sin texto explicativo.

### 6. Bilingüe ES/EN

- Toda la UI principal en español
- Toggle idioma en header (ES | EN)
- Nombres de canciones mantienen idioma original
- Labels de controles: internacionalizados

## Archivos a Modificar/Crear

| Archivo | Cambio |
|---------|--------|
| `src/pages/Index.tsx` | Reescritura total: mic hero fullscreen + estudio grid + canciones |
| `src/components/karaoke/VintageMicrophone.tsx` | 3x más grande, prop size, controles post-grab |
| `src/pages/Karaoke.tsx` | Selector visual, más canciones |
| `src/components/karaoke/PresetSongsMode.tsx` | 80+ canciones, 20 por género |
| `src/components/karaoke/FreestyleMode.tsx` | Controles post-grabación iconográficos |
| `src/components/karaoke/CustomLyricsMode.tsx` | Mismos controles post-grab |
| `src/components/ScenePicker.tsx` | NUEVO — selector de escenario visual |
| `src/components/StudioGrid.tsx` | NUEVO — grid de zonas del estudio |
| `src/components/SongBrowser.tsx` | NUEVO — browser de canciones por género |
| `src/components/layout/AppLayout.tsx` | Toggle idioma en header |

## Resultado
- Home = escenario inmersivo, cero texto innecesario
- Micrófono old-school ENORME que titila y grita "PÚLSAME"
- Controles 100% iconográficos — el artista sabe qué hacer sin leer
- 80+ canciones organizadas por género
- Selector de escenario intuitivo
- Mobile-first, todo funciona con el pulgar

