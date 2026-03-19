

# Rediseno Visual: Colores de Musica + Mic Magnetico + Hero Killer

## Problema
1. El color dorado/oro no transmite musica — es generico
2. El microfono vintage es pequeno, no invita a hacer click, no titila
3. El hero copy "El escenario es tuyo" es vacio — no vende nada

## Cambios

### 1. Nueva paleta de color — Electric Violet + Neon Cyan
Reemplazar el dorado por una paleta que grite musica y energia:
- **Primary**: Violeta electrico `275 85% 60%` (como luces de escenario)
- **Accent**: Cyan neon `185 90% 55%` (como ecualizadores y LEDs de estudio)
- Gradientes: violet-to-cyan en lugar de gold-to-gold
- El fondo oscuro se mantiene (#0A0A0A)
- Eliminar todas las referencias a `gold-gradient`, `gold-text`, `glow-gold` y reemplazar por `stage-gradient`, `neon-text`, `glow-stage`

Archivos: `src/index.css`, `tailwind.config.ts`

### 2. Microfono ENORME que titila y llama a hacer click
Redisenar `VintageMicrophone.tsx` completamente:
- **2x mas grande**: cabeza de 40x48 a 72x88 (mobile), aun mas en desktop
- **Titilacion idle**: cuando no esta grabando, el microfono pulsa suavemente con glow cyan/violeta — invitando al toque
- **Anillos concentricos siempre visibles** (no solo cuando graba) — mas suaves en idle, intensos al grabar
- **Label mas claro**: en idle dice "TOCA Y CANTA" grande y brillante, no un texto gris pequeno
- **Efecto hover/tap** mas dramatico: scale 1.1 con flash de luz

Archivo: `src/components/karaoke/VintageMicrophone.tsx`

### 3. Hero copy que vende — marketing puro
Reescribir `Index.tsx`:
- **Headline**: "TU VOZ. TU MOMENTO." o "DESCUBRE LO QUE TU VOZ PUEDE HACER" — algo que genere curiosidad
- **Subtitulo**: linea corta de beneficio real, no frase motivacional vacia
- **CTA button**: "EMPEZAR A CANTAR GRATIS" con el nuevo gradiente stage
- **El boton gigante del home tambien titila** con la nueva paleta — anillos violeta/cyan
- **Badge live**: cambiar color a la nueva paleta
- **Stats, cards**: actualizar colores a la nueva identidad

Archivo: `src/pages/Index.tsx`

### 4. Actualizar componentes dependientes
- `FreestyleMode.tsx`, `CustomLyricsMode.tsx`, `PresetSongsMode.tsx`: reemplazar referencias a gold-gradient
- `Karaoke.tsx`: actualizar selector de modos con nuevos colores
- `AppSidebar.tsx`, `FloatingBar.tsx`: actualizar acentos
- `SingingFeedback.tsx`: mantener colores de scoring (verde/amarillo/rojo) pero actualizar bordes

## Archivos a modificar
| Archivo | Cambio |
|---------|--------|
| `src/index.css` | Nueva paleta: violet+cyan reemplaza gold |
| `src/components/karaoke/VintageMicrophone.tsx` | 2x mas grande, titila en idle, label claro |
| `src/pages/Index.tsx` | Hero copy killer, nuevos colores, boton titilante |
| `src/pages/Karaoke.tsx` | Colores actualizados en selector |
| `src/components/karaoke/FreestyleMode.tsx` | Nuevos colores en waveform/UI |
| `src/components/karaoke/CustomLyricsMode.tsx` | Nuevos colores |
| `src/components/karaoke/PresetSongsMode.tsx` | Nuevos colores |

## Resultado
- Paleta que grita musica y escenario (violeta electrico + cyan neon)
- Microfono enorme que titila y dice "TOCA Y CANTA" — imposible no clickearlo
- Hero que vende: copy de marketing real, no frases vacias
- Toda la app consistente con la nueva identidad visual

