

# Audio Real con Web Audio API — Plan de Implementación

## Alcance

Crear un hook centralizado `useAudioEngine` y agregar audio real a 5 módulos: Onboarding (micrófono), Karaoke (micrófono + waveform en vivo), Breath Trainer (tonos guía), Pitch Training (notas reales del piano), y Warm-Up (tono de referencia).

---

## Archivos

### Nuevo: `src/hooks/useAudioEngine.ts`
Hook centralizado con Web Audio API que expone:
- `playNote(frequency, duration)` — OscillatorNode con envelope ADSR suave (attack 0.02s, release 0.1s)
- `playTone(frequency, type)` — tono continuo que se puede parar
- `startMic()` / `stopMic()` — solicita micrófono con `getUserMedia`, conecta AnalyserNode
- `getFrequencyData()` — retorna Uint8Array del AnalyserNode para waveform en vivo
- `getVolume()` — RMS del input de micrófono
- Frecuencias precalculadas: mapa de nota (ej. "C4") a Hz usando `440 * 2^((n-69)/12)`

### Nuevo: `src/hooks/useMicrophone.ts`
Hook específico para captura de micrófono:
- `requestMic()` — pide permiso, crea MediaStream + AnalyserNode
- `waveformData: number[]` — array reactivo (useState) actualizado con requestAnimationFrame
- `volume: number` — nivel de volumen en tiempo real (0-100)
- `isListening: boolean`
- `stopMic()` — limpia stream y contexto
- Manejo de errores si el usuario deniega permiso (toast informativo)

### Editado: `src/pages/PitchTraining.tsx`
- Importar `useAudioEngine`
- Al mostrar nota target: reproducir `playNote(noteToFreq(target), 1.5)` automáticamente con botón "Escuchar de nuevo"
- Al hacer click en tecla del piano: reproducir `playNote(noteToFreq(clickedNote), 0.5)` — feedback auditivo inmediato
- En modo intervalos: reproducir las 2 notas del intervalo secuencialmente (nota base + nota base + semitonos)

### Editado: `src/pages/BreathTrainer.tsx`
- Importar `useAudioEngine`
- Al cambiar de fase: reproducir tono suave diferente por fase
  - Inhale: tono ascendente suave (C4→G4, 0.3s)
  - Hold: tono sostenido bajo (C3, mientras dure)
  - Exhale: tono descendente (G4→C4, 0.3s)
  - Pause: silencio
- Toggle de sonido (mute/unmute) con ícono Volume2/VolumeX
- Volumen bajo (gain 0.15) para no molestar

### Editado: `src/pages/Onboarding.tsx` (paso "record")
- Importar `useMicrophone`
- Al pulsar grabar: `requestMic()` real en vez de datos simulados
- Waveform alimentado por `waveformData` real del micrófono
- Fallback: si el usuario deniega permiso, mantener simulación actual + toast "Permiso de micrófono necesario"
- Indicador visual de volumen con color que cambia según intensidad

### Editado: `src/pages/Karaoke.tsx`
- Importar `useMicrophone`
- Al pulsar Play: solicitar micrófono y mostrar waveform en vivo del input real
- Barras del waveform se alimentan de `getFrequencyData()` en vez de `Math.random()`
- Indicador de volumen/nivel en tiempo real junto al score
- Toggle de micrófono (on/off)

### Editado: `src/pages/WarmUp.tsx`
- Importar `useAudioEngine`
- Al iniciar cada ejercicio: reproducir tono de referencia corto (0.5s, nota C4) como "campana de inicio"
- Al completar ejercicio: tono de "éxito" (acorde C-E-G rápido, 0.3s cada nota)

---

## Detalles Técnicos

- Un solo `AudioContext` compartido por hook (lazy init al primer uso, evita autoplay policy)
- `AudioContext.resume()` en primer click del usuario (Chrome autoplay policy)
- Oscillator type: "sine" para tonos guía, "triangle" para notas de piano (más musical)
- GainNode con ramp para evitar clicks de audio (linearRampToValueAtTime)
- AnalyserNode con fftSize 256 para waveform rápido
- Cleanup de streams y nodos en useEffect return

Total: 2 archivos nuevos, 5 archivos editados.

