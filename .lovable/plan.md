

# Plan: Home "Stage Mode" + Mobile Optimization + Landing Cinematográfica + Animaciones Premium

## Concepto Central del Home

**"El Escenario"** -- El home deja de ser un dashboard de stats. Se convierte en un escenario negro premium con UN elemento dominante: un boton de microfono enorme al centro. El usuario abre la app y siente: "Estoy listo para cantar. AHORA."

**Experiencia en 360px (movil):**
- Fondo negro con halo dorado sutil que respira
- Microfono circular gigante (200px) al centro con glow pulsante dorado
- Texto minimo: "Tu escenario" arriba, "Toca para cantar" abajo
- Al tocar: navega a /karaoke directamente
- Debajo del mic: mini-stats en una linea (racha + score)
- Mas abajo: carousel horizontal de "Continua aprendiendo" (compacto)

**Experiencia en desktop:**
- El microfono es aun mas grande (280px) con ecualizador animado detras
- Stats cards aparecen a los lados del microfono
- "Next Up" card debajo
- Mismo impacto emocional: CANTAR ES LO PRIMERO

## Archivos a Modificar/Crear

### 1. `src/pages/Index.tsx` -- Reescritura completa
- Hero central: boton de microfono gigante con `motion.div` pulsante
  - Circulo exterior con glow dorado animado (boxShadow breathing)
  - Icono Mic de lucide-react en 64px (movil) / 80px (desktop)
  - Anillos concentricos animados que se expanden (3 rings con scale + opacity)
  - Click -> navega a /karaoke
- Texto: "Tu escenario, Artista" (serif, gold-text en "Artista")
- Subtitulo: "Toca el microfono. Canta. Brilla." 
- Mini-stats row debajo: racha (Flame) + score (Star) + sesiones (Play) -- compacto, 1 linea
- "Next Up" card (mantener pero mas compacto)
- Carousel de lecciones recientes (mantener)
- Quitar: progress ring semanal (moverlo a otra seccion, no es lo primero que ves)

### 2. `src/pages/Landing.tsx` -- Mejoras cinematograficas
- Agregar anillos de "sound wave" SVG animados detras del ecualizador (circulos concentricos que pulsan)
- Mejorar responsive: en 360px el headline baja a text-4xl, el CTA ocupa full-width
- Agregar seccion "Como funciona" con 3 pasos iconicos antes de features
- Footer mas completo con links a modulos

### 3. `src/components/layout/PageTransition.tsx` -- Transiciones mejoradas
- Variantes por tipo de pagina: slide-left para navegacion forward, fade para tabs
- Spring physics en vez de ease curves

### 4. `src/components/layout/StaggerContainer.tsx` -- Stagger mejorado
- Agregar variante `StaggerScale` para cards que aparecen con scale
- Mejorar timings: stagger 0.06s, spring damping

### 5. `public/manifest.json` -- PWA Manifest (nuevo)
- name, short_name, icons, theme_color (#0A0A0A), background_color, display: standalone
- start_url: "/"

### 6. `index.html` -- Meta tags PWA
- Link al manifest
- Meta theme-color
- Meta apple-mobile-web-app-capable

### 7. `src/index.css` -- Nuevas utilidades
- `.mic-glow` keyframe para el pulso del microfono
- `.ring-expand` keyframe para anillos concentricos
- Mejoras de spacing en mobile (safe-area-inset)

Total: 5 archivos editados, 1 archivo nuevo.

