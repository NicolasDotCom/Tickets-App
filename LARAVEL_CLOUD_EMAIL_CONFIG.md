# 🚀 GUÍA RÁPIDA: Configurar Email en Laravel Cloud

## ⚡ Pasos Rápidos (5 minutos)

### 1️⃣ Accede a Laravel Cloud
```
URL: https://cloud.laravel.com
Proyecto: Tickets-App
```

### 2️⃣ Ve a Environment Variables
```
Dashboard → Tickets-App → Settings → Environment Variables
```

### 3️⃣ Agrega/Edita estas variables

Copia y pega cada línea como variable individual:

#### 📧 Configuración de Email (OBLIGATORIO)

```env
MAIL_MAILER=resend
```
👆 Busca si existe, sino créala nueva

```env
RESEND_KEY=
```
👆 **IMPORTANTE:** Pega aquí tu clave de Resend de producción  
⚠️ NO uses la misma clave de desarrollo  
🔗 Obtén una nueva en: https://resend.com/api-keys

```env
MAIL_FROM_ADDRESS=soporte.tesltda@gmail.com
```
👆 Email que aparecerá como remitente

```env
MAIL_FROM_NAME=Tickets-App
```
👆 Nombre que aparecerá como remitente

#### 🌐 Variables de Aplicación (si no existen)

```env
APP_ENV=production
```

```env
APP_DEBUG=false
```

```env
APP_LOCALE=es
```

```env
APP_FALLBACK_LOCALE=es
```

```env
SESSION_DRIVER=database
```

```env
QUEUE_CONNECTION=sync
```

### 4️⃣ Guardar y Redeploy

1. Haz clic en **Save** para cada variable
2. Ve a **Deployments** en el menú lateral
3. Haz clic en **Deploy Now**
4. Espera 2-3 minutos

### 5️⃣ Probar

1. Inicia sesión en tu app de producción como admin
2. Ve a **Usuarios** → **Crear Usuario**
3. Crea un usuario de prueba
4. Verifica que reciba el email de verificación

---

## 🔐 Obtener Clave de Resend para Producción

### Opción A: Crear Nueva Clave (Recomendado)

1. Ve a [resend.com](https://resend.com)
2. Inicia sesión con tu cuenta
3. En el panel izquierdo, clic en **API Keys**
4. Clic en **Create API Key**
5. Nombre: `Production - Tickets App`
6. Permiso: **Full Access** (o **Sending Access** si prefieres)
7. Clic en **Create**
8. **¡COPIA LA CLAVE INMEDIATAMENTE!** (solo se muestra una vez)
9. Pégala en `RESEND_KEY` en Laravel Cloud

### Opción B: Usar la Clave Existente (No recomendado)

⚠️ **No recomendado para producción**  
Si decides usar la misma clave de desarrollo (`re_ZzPJ3heE_GJXSY6ZTX7i1yPT4S9PhCFit`), ten en cuenta:
- No podrás diferenciar logs entre dev y prod
- Si la regeneras, afectará ambos ambientes
- Mayor riesgo de seguridad si el código se filtra

---

## 📋 Checklist de Verificación

Marca cada ítem cuando esté completo:

### En Laravel Cloud:
- [ ] Variable `MAIL_MAILER` = `resend`
- [ ] Variable `RESEND_KEY` configurada (clave de producción)
- [ ] Variable `MAIL_FROM_ADDRESS` = `soporte.tesltda@gmail.com`
- [ ] Variable `MAIL_FROM_NAME` = `Tickets-App`
- [ ] Deployment completado exitosamente
- [ ] Sin errores en los logs de deployment

### Prueba de Funcionalidad:
- [ ] Admin puede acceder al sistema
- [ ] Admin puede crear un nuevo usuario
- [ ] El nuevo usuario recibe el email de verificación
- [ ] El enlace de verificación funciona
- [ ] El usuario puede iniciar sesión después de verificar

---

## 🐛 Solución Rápida de Problemas

### ❌ No se envían los emails

**Paso 1:** Verifica las variables
```
Laravel Cloud → Settings → Environment Variables
Revisa que MAIL_MAILER=resend y RESEND_KEY esté configurada
```

**Paso 2:** Limpia la cache
```
Laravel Cloud → Commands → Ejecuta:
php artisan config:clear
```

**Paso 3:** Revisa los logs
```
Laravel Cloud → Logs → Busca errores de "resend" o "mail"
```

### ❌ Error: "resend driver not found"

**Causa:** El paquete de Resend no está instalado

**Solución:**
1. Verifica que `composer.json` incluya: `"resend/resend-php": "^0.13.0"`
2. Si no está, agrégalo manualmente al archivo
3. Haz commit y push al repositorio
4. Laravel Cloud lo instalará automáticamente en el siguiente deploy

### ❌ Los emails van a spam

**Solución a corto plazo:**
- Pide a los usuarios revisar carpeta de spam
- Marca como "No es spam"

**Solución permanente:**
1. Ve a [resend.com](https://resend.com) → **Domains**
2. Agrega tu dominio (ej: `tesltda.com`)
3. Configura los registros DNS:
   - SPF: `v=spf1 include:_spf.resend.com ~all`
   - DKIM: Copia el registro que te proporciona Resend
   - DMARC: `v=DMARC1; p=none`
4. Espera la verificación (15 min - 24 horas)
5. Cambia `MAIL_FROM_ADDRESS` a usar tu dominio verificado

---

## 📊 Monitorear Envíos de Email

### En Resend Dashboard:

1. Ve a [resend.com](https://resend.com)
2. Sección **Emails** → Verás todos los envíos
3. Puedes ver:
   - ✅ Emails entregados
   - ⏳ Emails en proceso
   - ❌ Emails fallidos
   - 📧 Contenido del email enviado

### En Laravel Cloud:

1. Ve a **Logs**
2. Busca por: `mail` o `verification`
3. Verás los registros de envío

---

## 🔄 Después de Configurar

### Mantenimiento Regular:

1. **Revisa tus cuotas en Resend:**
   - Plan gratuito: 100 emails/día
   - Plan de pago: Según tu plan
   - Ve a: https://resend.com/settings/billing

2. **Monitorea los rebotes:**
   - Si muchos emails rebotan, revisa la configuración DNS
   - Verifica que los emails de destino sean válidos

3. **Rota las claves periódicamente:**
   - Cada 6-12 meses
   - Crea nueva clave en Resend
   - Actualiza en Laravel Cloud
   - Elimina clave antigua en Resend

---

## 📞 Soporte

### Si tienes problemas:

1. **Revisa los logs de Laravel Cloud:**
   ```
   Dashboard → Logs → Busca errores
   ```

2. **Revisa el estado de Resend:**
   ```
   https://resend.com/status
   ```

3. **Consulta la documentación:**
   - Laravel: https://laravel.com/docs/11.x/verification
   - Resend: https://resend.com/docs

---

## 🎯 Resumen Ejecutivo

### ✅ Lo que YA funciona:
- Código de verificación de email implementado
- Evento `Registered` configurado en UserController
- Middleware de verificación aplicado
- Rutas de verificación activas

### ⚙️ Lo que DEBES hacer:
1. Agregar variables de entorno en Laravel Cloud (5 min)
2. Hacer redeploy (3 min)
3. Probar creando un usuario (2 min)

### ⏱️ Tiempo total estimado: **10 minutos**

---

## 🔒 Seguridad

### ✅ HACER:
- Usar claves diferentes para dev y prod
- Mantener `.env` fuera del repositorio Git
- Rotar claves periódicamente
- Limitar permisos de claves API (solo envío)

### ❌ NO HACER:
- Subir claves a GitHub
- Compartir claves en Slack/Discord
- Hardcodear claves en el código
- Usar la misma clave en todos los ambientes

---

## 📝 Notas Adicionales

### Límites de Resend (Plan Gratuito):
- 100 emails por día
- 3,000 emails por mes
- API rate limit: 10 req/segundo

Si necesitas más, considera actualizar a plan de pago.

### Alternativas a Resend:
Si prefieres otro servicio, solo cambia:
```env
# Para SendGrid
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
SENDGRID_API_KEY=tu_clave

# Para Mailgun
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=tu_dominio
MAILGUN_SECRET=tu_secreto

# Para Amazon SES
MAIL_MAILER=ses
AWS_ACCESS_KEY_ID=tu_key
AWS_SECRET_ACCESS_KEY=tu_secret
AWS_DEFAULT_REGION=us-east-1
```

---

## ✅ Listo!

Una vez completados todos los pasos, tu sistema de verificación de email estará funcionando tanto en local como en producción.

**¿Dudas?** Revisa el archivo `EMAIL_VERIFICATION_SETUP_GUIDE.md` para información más detallada.
