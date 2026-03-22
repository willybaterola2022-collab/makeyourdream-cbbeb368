

# Recuperar la mística del micrófono y la estética musical

## El problema

Las pantallas principales que el usuario ve primero — **Home no-auth**, **Home auth**, **VocalDnaTest** y **Landing** — son pantallas minimalistas de texto sin ningún elemento visual que evoque música o estudio. El super micrófono (VintageMicrophone) solo aparece cuando ya estás DENTRO del Karaoke grabando. La primera impresión de la app es fría y genérica.

```text
AHORA:                           OBJETIVO:
┌─────────────┐                 ┌─────────────┐
│             │                 │    ╭───╮    │
│  Tu voz     │                 │   ╭│ ▓▓│╮   │
│  deja una   │     →           │  ╭│ ▓▓▓│╮  │
│  huella     │                 │   ╰│───│╯   │
│             │                 │  Tu voz deja │
│  [Botón]    │                 │  una huella  │
│             │                 │  [Botón]     │
└─────────────┘                 └─────────────┘
  Solo texto                    Micrófono hero + mística
```

## Cambios propuestos

### 1. Home no-auth — VintageMicrophone como hero central
- Importar `VintageMicrophone` en `Index.tsx`
- Reemplazar el bloque de texto minimalista con el micrófono en tamaño `hero`, estado `idle` (respirando con glow ámbar/cobre)
- Al hacer click en el micrófono → navegar a `/vocal-dna-test`
- El texto "Tu voz deja una huella" queda DEBAJO del micrófono como subtítulo
- Los anillos pulsantes del micrófono dan vida a la pantalla

### 2. Home auth — Micro mini como CTA principal
- Reemplazar el botón plano "Cantar ahora" con un `VintageMicrophone` tamaño `section` (más compacto)
- Estado `idle` con glow sutil. Click → navega a `/karaoke`
- Mantener saludo, tensión, cards de Vocal DNA y Soy Leyenda debajo

### 3. VocalDnaTest intro — VintageMicrophone reemplaza el botón circular
- En la fase "intro", reemplazar el `<button>` circular con `<Mic>` icon por un `VintageMicrophone` en tamaño `section`, estado `idle`
- Click → arranca la grabación de 30 segundos
- En la fase "recording", el micrófono pasa a estado `recording` con reactividad al volumen (usar `useMicrophone` para obtener volume)

### 4. VintageMicrophone — Migrar colores a paleta Luxury Íntimo
- Reemplazar `hsl(275 85% 60%)` → `hsl(40 55% 58%)` (ámbar #D4A853)
- Reemplazar `hsl(185 90% 55%)` → `hsl(20 52% 54%)` (cobre #C47D4E)
- Afecta: anillos, glow, grille lines, border color animado
- El micrófono se integra visualmente con toda la app

### 5. Landing hero — Agregar VintageMicrophone detrás del ecualizador
- En el hero de `Landing.tsx`, agregar un `VintageMicrophone` en `hero` size como elemento visual central (detrás o junto al ecualizador animado)
- Reemplazar también `stage-gradient` y `hsl(275 85% 60%)` por la paleta ámbar/cobre

## Archivos modificados

| Archivo | Cambio |
|---------|--------|
| `src/components/karaoke/VintageMicrophone.tsx` | Migrar paleta violet/cyan → ámbar/cobre |
| `src/pages/Index.tsx` | Agregar VintageMicrophone hero en no-auth + section en auth |
| `src/pages/VocalDnaTest.tsx` | Reemplazar botón circular por VintageMicrophone |
| `src/pages/Landing.tsx` | Agregar VintageMicrophone en hero + fix paleta |

## Lo que NO se toca
- FreestyleMode, CustomLyricsMode, PresetSongsMode siguen usando VintageMicrophone exactamente como están
- StudioRoom configs no cambian
- Ningún componente se elimina

