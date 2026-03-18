

# Karaoke Libre + Login Diferido

## Problema
1. El login bloquea toda la app — el usuario no puede probar nada sin registrarse
2. El Karaoke solo tiene "Bésame Mucho" hardcodeado — no hay libertad para cantar lo que quieras
3. Falta un modo freestyle donde simplemente cantas, grabas, y escuchas

## Cambios

### 1. Quitar login obligatorio — dejar probar todo
- Cambiar `App.tsx`: todas las rutas dentro de `AppLayout` son publicas (sin `ProtectedRoute`)
- El login solo se pide cuando el usuario quiere **guardar en la nube** (grabar permanentemente, ver historial, perfil)
- Crear un wrapper `OptionalAuth`: si no hay usuario, muestra un modal "Crea tu cuenta para guardar" cuando intenta guardar, pero deja usar todo lo demas

### 2. Karaoke con modos de uso
Reescribir `Karaoke.tsx` con 3 modos seleccionables:

**a) Freestyle (modo principal)**
- Sin letras, sin cancion de fondo
- Solo activa el mic, detecta pitch en tiempo real, graba
- El usuario canta lo que quiera — inventar, improvisar, practicar
- Muestra: nota detectada, waveform, volumen, duracion
- Al terminar: escucha tu grabacion, descarga

**b) Con letra propia**
- El usuario pega o escribe la letra que quiera en un textarea
- Las lineas avanzan automaticamente con timer configurable (velocidad)
- Graba mientras canta, scoring basico (timing por volumen)

**c) Canciones predefinidas**
- Lista de canciones con letras (empezamos con 3-4 canciones ejemplo)
- El usuario elige cual cantar
- Letras sincronizadas + scoring completo (pitch + timing)

### 3. Selector de genero/estilo
- Antes de empezar: elegir genero (Pop, Rock, Balada, R&B, Rap, Freestyle)
- Elegir tono base (grave, medio, agudo) — ajusta las notas target
- Con/sin ritmo: opcion de metrónomo de fondo (BPM configurable)

### 4. Controles de grabacion simplificados
- Boton grande "Cantar" — activa mic + empieza a grabar inmediatamente
- Boton "Pausa" y "Terminar"
- Al terminar: replay + descarga + (si logueado) guardar en nube
- Si no logueado: "Crea tu cuenta para guardar esta grabacion" con boton a login

## Archivos a modificar

| Archivo | Cambio |
|---------|--------|
| `src/App.tsx` | Rutas publicas, login solo para guardar |
| `src/pages/Karaoke.tsx` | Reescribir con 3 modos + selector genero |
| `src/components/ProtectedRoute.tsx` | Convertir en `OptionalAuthGate` para guardar |
| `src/hooks/useSupabaseRecorder.ts` | Verificar auth antes de upload, fallback local |

## Resultado
- El usuario entra, ve el Home, navega a Karaoke, pulsa "Cantar" y ya esta cantando
- Puede inventar un tema, cantar lo que quiera, escucharse
- Solo ve login cuando quiere guardar algo permanentemente
- Tiene opciones de genero, tono, y ritmo para personalizar

