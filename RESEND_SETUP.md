# 🚀 Configuración de Resend en Laravel Cloud - PASO A PASO

## ✅ Configuración Local Completada

Ya configuré Resend en tu entorno local. Ahora debes configurarlo en **Laravel Cloud** para producción.

---

## 📋 Variables para Laravel Cloud (Producción)

### Ve a tu panel de Laravel Cloud:
```
https://cloud.laravel.com → Tickets-App → Settings → Environment Variables
```

### Agrega/Modifica estas variables EXACTAMENTE como aparecen:

```env
# ============================================
# CORREO - RESEND
# ============================================
MAIL_MAILER=resend
RESEND_KEY=re_ZzPJ3heE_GJXSY6ZTX7i1yPT4S9PhCFit
MAIL_FROM_ADDRESS=soporte.tesltda@gmail.com
MAIL_FROM_NAME=Tickets-App

# ============================================
# SESIÓN (Si aún no las agregaste)
# ============================================
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax
SESSION_DRIVER=database

# ============================================
# COLA
# ============================================
QUEUE_CONNECTION=sync

# ============================================
# APLICACIÓN
# ============================================
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tickets-app-main-dbvpcm.laravel.cloud
APP_LOCALE=es
APP_FALLBACK_LOCALE=es
```

---

## 🔧 Pasos en Laravel Cloud

### 1. Ir a Environment Variables
- Abre tu proyecto en Laravel Cloud
- Ve a **Settings** (Configuración)
- Clic en **Environment Variables**

### 2. Buscar MAIL_MAILER
- Busca si ya existe `MAIL_MAILER`
- Si existe, edítalo y cambia el valor a: `resend`
- Si NO existe, clic en **Add Variable**

### 3. Agregar RESEND_KEY
- Clic en **Add Variable**
- **Name:** `RESEND_KEY`
- **Value:** `re_ZzPJ3heE_GJXSY6ZTX7i1yPT4S9PhCFit`
- Clic en **Save**

### 4. Verificar MAIL_FROM_ADDRESS
- Busca `MAIL_FROM_ADDRESS`
- Valor debe ser: `soporte.tesltda@gmail.com`
- Busca `MAIL_FROM_NAME`
- Valor debe ser: `Tickets-App`

### 5. Guardar Cambios
- Laravel Cloud reiniciará automáticamente la aplicación
- Espera 30-60 segundos

### 6. Limpiar Cache (Opcional pero recomendado)
Si tienes acceso a terminal en Laravel Cloud:
```bash
php artisan config:clear
php artisan cache:clear
```

---

## 🧪 Probar en Producción

### 1. Crear Usuario de Prueba
- Ve a tu app en producción: https://tickets-app-main-dbvpcm.laravel.cloud
- Inicia sesión como admin
- Ve a **Usuarios** → **Agregar Usuario**
- Crea un usuario con TU email personal
- Haz clic en **Guardar**

### 2. Verificar Correo
- **Revisa tu bandeja de entrada** (NO spam)
- El correo debería llegar en **menos de 5 segundos**
- Asunto: "Confirme su correo electrónico"
- Remitente: Tickets-App <soporte.tesltda@gmail.com>

### 3. Dashboard de Resend
- Ve a: https://resend.com/emails
- Verás el correo enviado con estado **Delivered** ✅
- Si hay problemas, verás el error específico

---

## 📊 Verificación en Dashboard de Resend

En https://resend.com/emails podrás ver:

- ✅ **Email enviado** - Marca verde
- ✅ **Delivered** - Entregado exitosamente
- ✅ **Opened** - Si el destinatario abrió el correo
- ❌ **Bounced** - Si rebotó (email no válido)
- ⚠️ **Complained** - Si fue marcado como spam

---

## 🚨 Solución de Problemas

### Error: "RESEND_KEY not set"
**Causa:** No agregaste la variable en Laravel Cloud  
**Solución:** 
1. Ve a Settings → Environment Variables
2. Agrega: `RESEND_KEY=re_ZzPJ3heE_GJXSY6ZTX7i1yPT4S9PhCFit`
3. Guarda y espera a que reinicie

### Correos NO llegan
**Causa:** Configuración incorrecta o cache  
**Solución:**
1. Verifica que `MAIL_MAILER=resend` (no smtp)
2. Verifica que `RESEND_KEY` esté correcto
3. Ejecuta: `php artisan config:clear`
4. Revisa logs: `php artisan tail`

### Error 500 al crear usuario
**Causa:** API key inválida  
**Solución:**
1. Ve a https://resend.com/api-keys
2. Verifica que la API key esté activa
3. Si fue borrada, genera una nueva
4. Actualiza `RESEND_KEY` en Laravel Cloud

### Correos van a spam
**Causa:** Dominio no verificado (raro con Resend)  
**Solución:**
1. Ve a https://resend.com/domains
2. Agrega tu dominio tesltda.com
3. Configura registros DNS
4. Espera verificación (24-48 horas)

---

## 📈 Límites del Plan Gratuito

- ✅ 3,000 correos/mes (antes decía 10,000, Resend cambió su plan)
- ✅ 100 correos/día
- ✅ Todos los features incluidos
- ✅ Sin tarjeta de crédito requerida

Si necesitas más, puedes actualizar a plan de pago.

---

## ✅ Checklist Final

- [ ] `MAIL_MAILER=resend` agregado en Laravel Cloud
- [ ] `RESEND_KEY=re_ZzPJ3heE_GJXSY6ZTX7i1yPT4S9PhCFit` agregado
- [ ] `MAIL_FROM_ADDRESS=soporte.tesltda@gmail.com` configurado
- [ ] Aplicación reiniciada (automático al guardar variables)
- [ ] Cache limpiado (si tienes acceso a terminal)
- [ ] Usuario de prueba creado
- [ ] Correo recibido en bandeja de entrada ✅
- [ ] Verificado en dashboard de Resend

---

## 🎯 Resultado Esperado

**Antes (Gmail SMTP):**
- ❌ Correos bloqueados
- ❌ Van a spam
- ❌ Tardan minutos u horas

**Ahora (Resend):**
- ✅ Correos entregados instantáneamente
- ✅ Bandeja de entrada (no spam)
- ✅ Visible en dashboard de Resend
- ✅ Estadísticas de apertura

---

## 📞 Contacto de Soporte

Si después de seguir TODOS los pasos anteriores sigues teniendo problemas:

1. **Revisa logs de Laravel Cloud:**
   ```bash
   php artisan tail
   ```

2. **Revisa dashboard de Resend:**
   https://resend.com/emails

3. **Verifica variables de entorno:**
   - Que estén escritas exactamente como se indica
   - Sin espacios extras
   - Sin comillas en los valores

---

**Fecha:** 15 de noviembre de 2025  
**API Key configurada:** `re_ZzPJ3heE_GJXSY6ZTX7i1yPT4S9PhCFit`  
**Estado:** ✅ Listo para usar en producción
