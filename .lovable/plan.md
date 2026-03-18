

# De Demo Visual a App Funcional — Lo Que Falta

## Estado actual (solo frontend)

Lo que SI funciona hoy:
- El microfono se activa y muestra barras de volumen en tiempo real (useMicrophone)
- La UI de los 30 modulos se ve correcta
- Navegacion y sidebar funcionan

Lo que NO funciona:
- **No graba audio** — no existe MediaRecorder, solo visualiza
- **No hay musica de fondo** — el Karaoke no reproduce ninguna cancion
- **Los scores son falsos** — Afinacion 94, Timing 88, Expresion 91 son numeros hardcodeados
- **Las letras no avanzan** — la linea activa no cambia con el tiempo
- **No hay deteccion de tono** — no sabe que nota estas cantando
- **No hay backend** — sin auth, sin base de datos, sin almacenamiento de grabaciones
- **Song Sketch no graba fragmentos reales** — los bloques son mock data

## Plan: Hacer Funcional el Karaoke + Grabacion (Fase 1)

### 1. Hook useRecorder — Grabacion real de audio
Nuevo archivo `src/hooks/useRecorder.ts`:
- Usa MediaRecorder API sobre el stream que ya captura useMicrophone
- Graba en formato webm/opus
- Retorna: `{ startRecording, stopRecording, isRecording, audioBlob, audioUrl }`
- Al detener: genera un Blob reproducible y descargable
- Sin backend por ahora: almacena en memoria/localStorage

### 2. Karaoke funcional — Letras sincronizadas + scoring basico
Editar `src/pages/Karaoke.tsx`:
- Timer real: al pulsar Play, inicia un contador que avanza las letras segun sus timestamps
- La linea activa cambia automaticamente cada 4 segundos
- Scoring basico: usa el volumen del mic (ya disponible) para detectar si estas cantando en el momento correcto (timing score)
- Integrar useRecorder para grabar la sesion completa
- Boton de replay: escucha tu grabacion al terminar

### 3. Deteccion de tono (pitch) — Cliente
Nuevo archivo `src/hooks/usePitchDetection.ts`:
- Usa autocorrelacion sobre `AnalyserNode.getFloatTimeDomainData()`
- Detecta frecuencia -> convierte a nota musical (C4, D#5, etc.)
- Retorna: `{ frequency, note, octave, cents }`
- Se conecta al Karaoke para comparar nota cantada vs nota esperada = score de afinacion real

### 4. Song Sketch — Grabacion real de fragmentos
Editar `src/pages/SongSketch.tsx`:
- Integrar useRecorder en el boton de grabar
- Cada fragmento se guarda como audioBlob en un array de estado
- Boton Play en cada bloque reproduce el audio real
- Los bloques tienen duracion real (no random)

### 5. Audio de fondo para Karaoke (simple)
- Incluir un archivo MP3 de ejemplo como backing track
- Reproducir con `new Audio()` sincronizado con el timer de letras
- O: permitir al usuario subir su propio MP3 como pista de fondo

## Archivos a crear/editar

| Archivo | Accion |
|---------|--------|
| `src/hooks/useRecorder.ts` | CREAR — MediaRecorder wrapper |
| `src/hooks/usePitchDetection.ts` | CREAR — Autocorrelacion pitch |
| `src/pages/Karaoke.tsx` | EDITAR — Timer real, letras sync, scoring, grabacion |
| `src/pages/SongSketch.tsx` | EDITAR — Grabacion real de bloques |
| `src/hooks/useMicrophone.ts` | EDITAR — Exponer stream para MediaRecorder |

## Resultado esperado

Despues de esta implementacion:
- Pulsas Play en Karaoke -> las letras avanzan en tiempo real
- El mic detecta tu voz y muestra volumen + nota que cantas
- Al terminar, puedes escuchar tu grabacion
- Los scores reflejan tu desempeno real (no numeros falsos)
- En Song Sketch, grabas ideas reales y las escuchas

El backend (Supabase) se necesitara despues para persistir grabaciones, perfiles y scores entre sesiones. Pero con este plan, la app funciona localmente de inmediato.

