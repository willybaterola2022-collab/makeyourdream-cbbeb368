

# Plan: Conectar Frontend a Edge Functions + UI Fixes + Login Completo + Karaoke Real

Las 6 edge functions YA existen en el backend (construidas por Claude Code). Este plan conecta el frontend a ellas y arregla los bugs pendientes.

---

## 1. SQL Migration — Realtime + Triggers

Ejecutar migration para habilitar realtime y verificar triggers:

```sql
ALTER PUBLICATION supabase_realtime ADD TABLE social_feed;
ALTER PUBLICATION supabase_realtime ADD TABLE collab_rooms;
ALTER PUBLICATION supabase_realtime ADD TABLE duels;
```

Los triggers ya se crearon en la migration anterior (`20260320191926`), pero la config muestra "no triggers" — puede que hayan fallado por el trigger en `auth.users` (schema reservado). Se reintentara con `DO $$ BEGIN ... END $$` safety wrapper.

---

## 2. Fix 3 Bugs de UI

### 2.1 PageTransition — quitar AnimatePresence duplicado
`PageTransition.tsx` tiene `AnimatePresence` pero `App.tsx` ya tiene otro wrapping las Routes. Quitar el de `PageTransition` dejando solo el `motion.div`.

### 2.2 Mood capsules mobile overflow
`Index.tsx` linea 139: cambiar `className="flex gap-2 mt-6 z-10"` a `"flex gap-2 mt-6 z-10 overflow-x-auto max-w-full px-1 scrollbar-hide"` y agregar `shrink-0` a cada capsule.

### 2.3 Piano keys mobile overflow  
`HeroPiano.tsx` linea 76: agregar `scale-[0.7] sm:scale-90 md:scale-100 origin-bottom` al contenedor de teclas.

---

## 3. Conectar Frontend a Edge Functions Existentes

### 3.1 FreestyleMode.tsx — invocar `vocal-analysis` + `save-training-session`
Reemplazar el scoring manual y el `.insert()` directo con:
```typescript
const { data } = await supabase.functions.invoke("vocal-analysis", {
  body: { user_id, pitch_samples, onset_times_ms, expected_beat_ms, expression_score, song_title, module: "karaoke" }
});
// data.analysis.{pitch, timing, expression, overall}, data.grade, data.xp_earned
```
Fallback: si la edge function falla, mantener el scoring local existente.

### 3.2 Fingerprint.tsx — invocar `vocal-fingerprint`
Reemplazar `saveToBackend` con:
```typescript
const { data } = await supabase.functions.invoke("vocal-fingerprint", {
  body: { action: "save", user_id, dimensions, vocal_range_low, vocal_range_high, recording_id }
});
// data.fingerprint con classification + similar_artists reales
```

### 3.3 Coach.tsx — invocar `ai-coach-feedback`
Reemplazar la logica local de observaciones con:
```typescript
const { data } = await supabase.functions.invoke("ai-coach-feedback", {
  body: { user_id }
});
// data.metrics[], data.observations[], data.recommended_exercise
```
Fallback local si falla.

### 3.4 Exercises.tsx — invocar `daily-exercise`
Agregar fetch al montar para obtener ejercicio personalizado:
```typescript
const { data } = await supabase.functions.invoke("daily-exercise", {
  body: { action: "get_recommended", user_id }
});
```

### 3.5 Index.tsx — invocar `daily-challenge` + `gamification-engine`
Reemplazar queries directas a tablas con:
```typescript
const { data: challenge } = await supabase.functions.invoke("daily-challenge", {
  body: { action: "get_today", user_id }
});
const { data: progress } = await supabase.functions.invoke("gamification-engine", {
  body: { action: "get_progress", user_id }
});
```

---

## 4. Karaoke Scoring Real (mejorado)

Mejorar el algoritmo en FreestyleMode.tsx para que el scoring local sea mas preciso (como fallback y para feedback en tiempo real):

- **Pitch**: `score = max(0, 1 - |cents| / 50)` continuo, bonus 1.2x para notas sostenidas >1s
- **Timing**: ventana deslizante de 10s en vez de acumulativo
- **Expression**: deteccion de vibrato (varianza 15-50 cents a 4-7Hz) + dynamic range (p90/p10 de volume)
- Post-grabacion: enviar a `vocal-analysis` edge function para score definitivo

---

## 5. Login Flow Completo

### 5.1 Forgot Password en Login.tsx
Agregar boton "¿Olvidaste tu contrasena?" que llama `supabase.auth.resetPasswordForEmail(email, { redirectTo: origin + '/reset-password' })`.

### 5.2 Nueva pagina ResetPassword.tsx
- Detecta `type=recovery` en URL hash
- Formulario nueva contrasena + confirmacion
- Llama `supabase.auth.updateUser({ password })`
- Redirige a `/` post-exito

### 5.3 Ruta en App.tsx
Agregar `<Route path="/reset-password" element={<ResetPassword />} />` como ruta publica.

---

## 6. Scrollbar-hide CSS utility

Agregar a `src/index.css`:
```css
.scrollbar-hide { -ms-overflow-style: none; scrollbar-width: none; }
.scrollbar-hide::-webkit-scrollbar { display: none; }
```

---

## Archivos modificados/creados

| Archivo | Accion |
|---------|--------|
| Migration SQL | CREAR — realtime + retry triggers |
| `src/components/layout/PageTransition.tsx` | MODIFICAR — quitar AnimatePresence |
| `src/pages/Index.tsx` | MODIFICAR — edge functions + scroll fix |
| `src/components/studio/HeroPiano.tsx` | MODIFICAR — scale mobile |
| `src/components/karaoke/FreestyleMode.tsx` | MODIFICAR — edge function + scoring real |
| `src/pages/Fingerprint.tsx` | MODIFICAR — edge function |
| `src/pages/Coach.tsx` | MODIFICAR — edge function |
| `src/pages/Exercises.tsx` | MODIFICAR — edge function |
| `src/pages/Login.tsx` | MODIFICAR — forgot password |
| `src/pages/ResetPassword.tsx` | CREAR |
| `src/App.tsx` | MODIFICAR — ruta /reset-password |
| `src/index.css` | MODIFICAR — scrollbar-hide |

## Orden de ejecucion
1. SQL migration (realtime)
2. Fix 3 bugs UI
3. Conectar 5 modulos a edge functions
4. Scoring real en Karaoke
5. Login flow completo

