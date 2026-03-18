

# Home "Stage Mode" — Copy con Impacto y Engagement

## Problema actual

Los textos son genéricos, pequeños y no generan urgencia ni emoción:
- "Tu escenario" (11px, gris, invisible)
- "Buenas noches, Artista" (plano, no inspira)
- "Toca el micrófono. Canta. Brilla." (frase muerta, no CTA real)
- "Next Up" (inglés suelto, sin gancho)
- "Continúa aprendiendo" (aburrido)

## Nuevo Copy — Emocional, Grande, con CTA

### Hero (arriba del micrófono)
- **Pre-título**: `"🔥 847 artistas cantando ahora"` — badge animado con breathing glow, texto 13px, visible
- **Headline**: `"EL ESCENARIO ES TUYO"` — text-4xl en móvil (no 3xl), uppercase, tracking-wide, gold-text completo, font-bold. Ocupa espacio. Se siente GRANDE

### Debajo del micrófono (CTA)
- **CTA principal**: `"CANTAR AHORA"` — botón dorado full-width (max-w-xs), text-lg, uppercase, tracking-widest, con ícono Mic. No es un texto suelto, es un BOTÓN que grita "púlsame"
- **Sub-CTA**: `"Sin preparación. Sin excusas. Solo tú y tu voz."` — text-sm, text-foreground (no gris), italic, con peso emocional

### Stats row
- Mantener pero con labels visibles siempre (no hidden en mobile) y tamaño text-sm (no text-xs)
- Cambiar "Racha" por `"🔥 12 días seguidos"`, más humano

### Next Up card
- Cambiar "Next Up" por `"TU PRÓXIMO HIT"`
- Agregar subtítulo: `"Continúa donde lo dejaste"` en text-xs

### Sección inferior
- Cambiar "Continúa aprendiendo" por `"SUBE DE NIVEL"` — uppercase, tracking-wide, más agresivo
- Agregar badge `"⚡ Recomendado para ti"` encima del carousel

## Cambios técnicos en `src/pages/Index.tsx`

1. Reemplazar el pre-título por badge animado con motion.div (opacity breathing)
2. Headline: text-4xl md:text-6xl, uppercase, gold-text, tracking-wider
3. Eliminar el texto CTA suelto ("Toca el micrófono...") y reemplazar por botón real con gold-gradient, onClick -> /karaoke
4. Sub-CTA como párrafo italic debajo del botón
5. Stats: labels siempre visibles, tamaños más grandes
6. Next Up: copy nuevo
7. Sección inferior: copy nuevo + badge

Un solo archivo editado: `src/pages/Index.tsx`

