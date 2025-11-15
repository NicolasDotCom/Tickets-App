# 🔐 Solución al Problema de Autenticación en Producción

## ❌ Problema
La autenticación funciona localmente pero NO funciona en Laravel Cloud (producción).

## 🎯 Causa Principal
**Las cookies de sesión no se están configurando correctamente en HTTPS.**

Laravel Cloud usa HTTPS, y las cookies necesitan configuración específica para funcionar en conexiones seguras.

## ✅ Solución Paso a Paso

### 1️⃣ **Configurar Variables de Entorno en Laravel Cloud**

Ve a tu panel de Laravel Cloud:
```
https://cloud.laravel.com → Tu Proyecto → Settings → Environment Variables
```

**Agrega TODAS estas variables:**

```env
# CRÍTICO - Variables de Sesión
SESSION_DRIVER=database
SESSION_LIFETIME=120
SESSION_ENCRYPT=false
SESSION_PATH=/
SESSION_DOMAIN=null
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

# Aplicación
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tickets-app-main-dbvpcm.laravel.cloud
APP_LOCALE=es
APP_FALLBACK_LOCALE=es

# Cache y Cola
CACHE_STORE=database
QUEUE_CONNECTION=sync

# Log
LOG_CHANNEL=stack
LOG_LEVEL=error
```

### 2️⃣ **Verificar APP_URL**

**MUY IMPORTANTE:** La variable `APP_URL` debe ser EXACTAMENTE la URL de producción:

```env
APP_URL=https://tickets-app-main-dbvpcm.laravel.cloud
```

❌ **NO usar:**
- `http://` (debe ser `https://`)
- `localhost`
- URL con barra al final

### 3️⃣ **Limpiar Cache en Producción**

Después de agregar las variables, ejecuta en Laravel Cloud:

```bash
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear
```

O simplemente reinicia la aplicación desde el panel de Laravel Cloud.

### 4️⃣ **Verificar la Tabla de Sesiones**

Asegúrate de que la tabla `sessions` existe en la base de datos de producción:

```bash
php artisan migrate
```

Si la tabla no existe, créala:

```bash
php artisan session:table
php artisan migrate
```

---

## 🔍 Diagnóstico del Problema

### ¿Por qué funciona local pero no en producción?

| Aspecto | Local | Producción |
|---------|-------|------------|
| Protocolo | HTTP | HTTPS |
| Cookies Seguras | No requeridas | **REQUERIDAS** |
| SESSION_SECURE_COOKIE | `false` o `null` | **DEBE ser `true`** |
| APP_URL | localhost | **DEBE ser HTTPS** |

### El problema específico:

1. **Local (HTTP):** Las cookies funcionan sin `Secure` flag
2. **Producción (HTTPS):** Los navegadores **RECHAZAN** cookies sin `Secure` flag en HTTPS
3. **Resultado:** La sesión no se mantiene → logout automático

---

## 🧪 Cómo Probar

### 1. Después de configurar las variables:

1. Limpia cookies del navegador para `tickets-app-main-dbvpcm.laravel.cloud`
2. Abre el sitio en incógnito
3. Intenta hacer login
4. Verifica que te mantienes logueado al navegar

### 2. Verificar en DevTools del navegador:

1. Abre Chrome DevTools (F12)
2. Ve a la pestaña **Application** → **Cookies**
3. Busca la cookie de sesión (ej: `tickets_app_session`)
4. Verifica que tenga:
   - ✅ `Secure`: Yes
   - ✅ `HttpOnly`: Yes
   - ✅ `SameSite`: Lax
   - ✅ `Domain`: tickets-app-main-dbvpcm.laravel.cloud

---

## 🚨 Errores Comunes

### Error 1: "Session cookie no se crea"
**Causa:** `SESSION_SECURE_COOKIE` no está en `true`  
**Solución:** Agregar `SESSION_SECURE_COOKIE=true` en Laravel Cloud

### Error 2: "Logout después de cada request"
**Causa:** `SESSION_DOMAIN` mal configurado  
**Solución:** Usar `SESSION_DOMAIN=null` (déjalo vacío)

### Error 3: "419 Page Expired" al hacer login
**Causa:** Token CSRF expiró  
**Solución:**
- Verificar que `SESSION_DRIVER=database`
- Limpiar cache: `php artisan config:clear`
- Verificar que la tabla `sessions` existe

---

## 📋 Checklist de Verificación

- [ ] `SESSION_SECURE_COOKIE=true` agregado en Laravel Cloud
- [ ] `SESSION_HTTP_ONLY=true` agregado en Laravel Cloud
- [ ] `SESSION_SAME_SITE=lax` agregado en Laravel Cloud
- [ ] `APP_URL` apunta a la URL de producción con HTTPS
- [ ] `SESSION_DRIVER=database` configurado
- [ ] Tabla `sessions` existe en la base de datos
- [ ] Cache limpiado en producción
- [ ] Aplicación reiniciada en Laravel Cloud
- [ ] Cookies del navegador limpiadas
- [ ] Probado en modo incógnito

---

## 🎯 Resultado Esperado

Después de aplicar todos los cambios:

✅ El login debe funcionar correctamente  
✅ La sesión se mantiene al navegar entre páginas  
✅ No hay logout automático  
✅ Las cookies tienen el flag `Secure`  
✅ La autenticación funciona igual que en local  

---

## 📞 ¿Aún no funciona?

Si después de aplicar TODOS los pasos anteriores el problema persiste:

1. **Revisa los logs de Laravel Cloud:**
   ```bash
   php artisan tail
   ```

2. **Verifica que no haya errores 500:**
   - Ve a Logs en el panel de Laravel Cloud
   - Busca errores relacionados con sesiones

3. **Verifica la configuración del middleware:**
   ```php
   // routes/web.php
   Route::middleware(['web'])->group(function () {
       // tus rutas
   });
   ```

4. **Verifica que Inertia esté configurado correctamente:**
   ```php
   // app/Http/Middleware/HandleInertiaRequests.php
   // Debe compartir errores y flash messages
   ```

---

**Fecha:** 15 de noviembre de 2025  
**Estado:** Pendiente de aplicar en Laravel Cloud
