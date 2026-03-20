

# Plan: DREAM BOOTH — De Dashboard a Ritual Vocal

## El problema exacto

La home actual tiene 5 secciones compitiendo: mic hero → 3 CTAs → stats → reto del día → SongBrowser. Transmite "dashboard musical ordenado". El informe pide exactamente lo contrario: una sola acción, una sola promesa, feedback inmediato.

## Lo que voy a construir

### 1. NUEVO: `src/components/DreamBooth.tsx` — La escena central

Reemplaza el VintageMicrophone en la Home (el mic se mantiene intacto para Karaoke).

**Estructura visual** (SVG + framer-motion, sin dependencias 3D):
- **Portal ovalado vertical** (~55% del viewport height): arco con gradiente violet→cyan como borde, interior oscuro profundo con niebla radial
- **Scan beam**: línea horizontal luminosa que sube y baja lentamente dentro del portal
- **Barras de frecuencia radiales**: 24 barras distribuidas en semicírculo dentro del arco, animación de ecualizador fantasma en idle
- **Partículas convergentes**: 15-20 puntos que flotan hacia el interior del portal, como si te "absorbiera"
- **Doble halo**: corona exterior de glow breathing violet + cyan en lados opuestos

**Estados**:
- `idle`: breathing 4s, partículas lentas, scan beam visible, barras titilando suave
- `ready` (hover/touch): luz se intensifica, partículas aceleran
- Click → navega a `/karaoke`

### 2. NUEVO: Sistema de botones de marca (expandir `StageButton.tsx`)

El `StageButton` actual es genérico. Lo convierto en un sistema con 6 variantes reales:

| Variante | Uso | Visual |
|----------|-----|--------|
| `monolith` | CTA principal único | Alto, oscuro, borde iridiscente rotante, glow interior, hundimiento al tap |
| `launchpad` | Acciones rápidas (3 pads) | Cuadrado, volumen real (inner-shadow), borde iluminado, vibración hover |
| `capsule` | Mood/intención | Pastilla pequeña, semitransparente, glow puntual al seleccionar |
| `glass` | Navegación secundaria | Ya existe, refinarlo |
| `scan` | Diagnóstico/análisis | Textura de fingerprint interna, scan line animada |
| `lever` | Toggles/FX | Switch con chasquido visual, movimiento mecánico |

### 3. REESCRIBIR: `src/pages/Index.tsx` — Dream Booth Home

**Estructura radical — 3 pantallas, no 5 secciones:**

**Pantalla 1 (100vh)** — La escena inmersiva:
- Fondo: 3 capas de radial-gradient superpuestas (niebla volumétrica)
- DreamBooth centrado (55% alto)
- Frase viva arriba: rota entre "Tu estudio está encendido", "Descubre cómo suena tu voz", "Haz una toma antes de pensarlo" (cada 6s, fade transition)
- **4 Mood Capsules** debajo del portal: `Soltar` / `Crear` / `Entrenar` / `Mostrar` — pastillas semitransparentes con glow al seleccionar
- **1 CTA monolith** dominante: "GRABAR AHORA" — alto, oscuro, borde iridiscente, hundimiento al tap

**Pantalla 2 (scroll)** — 3 Quick Actions como Launch Pads:
- `Hacer una toma` → /karaoke (pad violet)
- `Escuchar mi voz` → /fingerprint (pad cyan)
- `Entrenar 2 min` → /warmup (pad amber)
- Cada pad: cuadrado, inner-shadow, borde iluminado, icono grande, línea viva breathing

**Pantalla 3 (scroll)** — Señal de vida (minimalista):
- Si logueado: una línea: "Tu última toma fue hace 2 días" + "Racha: 3 🔥" + reto del día en una sola card
- Si no logueado: "Inicia sesión para que tu estudio te recuerde"
- **Eliminar**: SongBrowser de la home, stats grid de 4 columnas, sección de canciones

### 4. MODIFICAR: `src/components/layout/AppSidebar.tsx` — Más tenue

- Group labels: quitar emojis, reemplazar por separadores de línea fina
- Items inactivos: `text-muted-foreground/40` (ahora es /60), font-weight normal (ahora es bold)
- Items activos: mantener glow pero reducir el bg a `bg-primary/5`
- Background sidebar: `--sidebar-background: 0 0% 4%` (más oscuro, se funde con el fondo)

### 5. MODIFICAR: `src/components/layout/AppLayout.tsx` — Header invisible

- Desktop header: `h-10` (era h-12), borde `border-border/20` (era /40)
- Background más transparente: `bg-background/60`

### 6. AGREGAR CSS: `src/index.css` — Utilidades de escena

```css
.fog-layer { /* radial-gradients multicapa para niebla */ }
.portal-glow { /* boxShadow multicapa para el booth */ }
.scan-line { /* animación de línea de escaneo */ }
.pad-depth { /* inner-shadow + borde para launch pads */ }
```

## Lo que NO se toca
- `VintageMicrophone.tsx` — intacto, se usa en Karaoke
- `BottomNav.tsx` — ya funciona bien
- Supabase, auth, backend — nada
- Todas las demás páginas funcionales

## Archivos

| Archivo | Acción |
|---------|--------|
| `src/components/DreamBooth.tsx` | CREAR — escena portal pseudo-3D |
| `src/components/ui/StageButton.tsx` | REESCRIBIR — 6 variantes de marca |
| `src/pages/Index.tsx` | REESCRIBIR — 3 pantallas ritual |
| `src/components/layout/AppSidebar.tsx` | MODIFICAR — más tenue |
| `src/components/layout/AppLayout.tsx` | MODIFICAR — header invisible |
| `src/index.css` | AGREGAR — utilidades de escena |

