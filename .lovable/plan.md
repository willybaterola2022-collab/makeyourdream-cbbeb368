

# Plan: Activar Lovable Cloud + Backend Fase 1

## Objetivo
Conectar Lovable Cloud y hacer que las grabaciones se guarden permanentemente, con autenticacion real de usuarios.

## Paso 1 — Activar Lovable Cloud
- Habilitar Cloud en el proyecto (crea instancia Supabase automaticamente)

## Paso 2 — Auth + Profiles
- Configurar autenticacion por email
- Crear tabla `profiles` con trigger on signup
- Crear tabla `user_roles` (seguridad)
- Crear componentes Login/Signup
- Proteger rutas de la app (redirigir a login si no autenticado)

## Paso 3 — Storage para grabaciones
- Crear bucket `recordings` con RLS (cada usuario accede solo a sus archivos)
- Modificar `useRecorder` para subir audio a Supabase Storage al terminar
- Crear tabla `recordings` (metadata: titulo, modulo, duracion, file_url)

## Paso 4 — Conectar modulos existentes
- Song Sketch: guardar bloques en tabla `song_sketches` + audio en storage
- Karaoke: guardar sesion + score en tabla `training_sessions`
- Voice Journal: guardar entradas diarias con audio

## Paso 5 — Hook useSupabaseRecorder
- Extiende useRecorder con upload automatico a Supabase
- Retorna `{ startRecording, stopRecording, isUploading, uploadProgress, savedUrl }`
- Reutilizable en todos los modulos que graban

## Archivos principales
- Activar Cloud (tool)
- SQL migrations: profiles, user_roles, recordings, song_sketches, training_sessions, voice_journal_entries, storage bucket + RLS
- `src/hooks/useSupabaseRecorder.ts` (nuevo)
- `src/pages/Login.tsx` (nuevo)
- `src/contexts/AuthContext.tsx` (nuevo)
- Editar: App.tsx (rutas protegidas), SongSketch, Karaoke, VoiceJournal

## Resultado
- Login funcional con email
- Grabaciones se guardan en la nube permanentemente
- Cada usuario tiene su perfil y sus datos separados
- Base lista para agregar mas features (IA, social, gamificacion)

