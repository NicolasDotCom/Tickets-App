# 📧 Solución Definitiva - Correos en Producción con Resend

## ❌ Problema Actual
Los correos NO llegan a la bandeja de entrada en producción (Gmail los bloquea o van a spam).

## ✅ Solución Recomendada: Usar Resend

**Resend** es un servicio diseñado específicamente para correos transaccionales y tiene mejor deliverability que Gmail SMTP.

---

## 🚀 Configuración Paso a Paso

### 1️⃣ Crear Cuenta en Resend

1. Ve a: https://resend.com
2. Crea una cuenta gratuita (10,000 correos/mes gratis)
3. Verifica tu email

### 2️⃣ Obtener API Key

1. En el dashboard de Resend, ve a **API Keys**
2. Clic en **Create API Key**
3. Dale un nombre: `Tickets-App Production`
4. Copia la API key (solo se muestra una vez)

### 3️⃣ Configurar en Laravel Cloud

Ve a tu panel de Laravel Cloud → **Settings** → **Environment Variables**

**Agrega/Modifica estas variables:**

```env
# Cambiar de SMTP a Resend
MAIL_MAILER=resend
RESEND_KEY=re_TuApiKeyAqui_1234567890

# Mantener estas
MAIL_FROM_ADDRESS=soporte.tesltda@gmail.com
MAIL_FROM_NAME=Tickets-App
```

### 4️⃣ Instalar Dependencia

Resend ya viene instalado en Laravel 11+, pero verifica ejecutando en producción:

```bash
composer show | grep resend
```

Si no está instalado:

```bash
composer require resendlabs/resend-laravel
```

### 5️⃣ Limpiar Cache

Después de agregar las variables, ejecuta en Laravel Cloud:

```bash
php artisan config:clear
php artisan cache:clear
```

### 6️⃣ Probar

Crea un usuario de prueba desde el panel admin y verifica que llegue el correo.

---

## 📋 Configuración Completa para Producción

```env
# ============================================
# CORREO - RESEND (RECOMENDADO)
# ============================================
MAIL_MAILER=resend
RESEND_KEY=re_TuApiKeyReal_AquiVaElTokenLargo
MAIL_FROM_ADDRESS=soporte.tesltda@gmail.com
MAIL_FROM_NAME=Tickets-App

# ============================================
# COLA - IMPORTANTE
# ============================================
QUEUE_CONNECTION=sync
# Si usas database, necesitas ejecutar: php artisan queue:work
```

---

## 🔍 Alternativa: SendGrid (Si prefieres no usar Resend)

### Opción A: SendGrid

1. Crea cuenta en: https://sendgrid.com (100 correos/día gratis)
2. Obtén tu API Key
3. Configura:

```env
MAIL_MAILER=smtp
MAIL_HOST=smtp.sendgrid.net
MAIL_PORT=587
MAIL_USERNAME=apikey
MAIL_PASSWORD=SG.TuApiKeyDeSendGrid
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=soporte.tesltda@gmail.com
MAIL_FROM_NAME=Tickets-App
```

### Opción B: Mailgun (Recomendado por Laravel)

1. Crea cuenta en: https://mailgun.com
2. Verifica dominio o usa el sandbox
3. Obtén tus credenciales
4. Configura:

```env
MAIL_MAILER=mailgun
MAILGUN_DOMAIN=tu-dominio.mailgun.org
MAILGUN_SECRET=key-tuSecretKeyAqui
MAILGUN_ENDPOINT=api.mailgun.net
MAIL_FROM_ADDRESS=soporte.tesltda@gmail.com
MAIL_FROM_NAME=Tickets-App
```

---

## 🎯 ¿Por qué NO funciona Gmail SMTP en producción?

| Aspecto | Gmail SMTP | Resend/SendGrid |
|---------|------------|-----------------|
| Reputación del servidor | ❌ Baja (servidor nuevo) | ✅ Alta (IPs dedicadas) |
| SPF/DKIM | ❌ Difícil configurar | ✅ Automático |
| Rate Limits | ❌ 100-500/día | ✅ 10,000+/mes |
| Filtros de spam | ❌ Muy estrictos | ✅ Optimizados |
| Soporte | ❌ Ninguno | ✅ Documentación + API |

Gmail está diseñado para **uso personal**, no para envío masivo de correos transaccionales desde servidores.

---

## 🧪 Verificar que Funciona

### 1. Logs de Laravel Cloud

Revisa los logs para confirmar que se está usando Resend:

```bash
php artisan tail
```

Deberías ver algo como:
```
Sending email via Resend...
Email sent successfully
```

### 2. Dashboard de Resend

En el panel de Resend, ve a **Logs** y verás:
- ✅ Correos enviados
- ✅ Estado de entrega
- ✅ Si fueron abiertos
- ⚠️ Si rebotaron o fueron marcados como spam

### 3. Prueba Real

1. Crea un usuario de prueba con tu email personal
2. Revisa la bandeja de entrada (NO spam)
3. El correo debería llegar en menos de 5 segundos

---

## 🚨 Troubleshooting

### Error: "RESEND_KEY not set"
**Solución:** Verifica que agregaste `RESEND_KEY` en Laravel Cloud (no solo en .env local)

### Error: "Invalid API Key"
**Solución:** La API key de Resend debe empezar con `re_`. Copia y pega exactamente como aparece.

### Correos aún no llegan
**Solución:**
1. Verifica en Dashboard de Resend si se está enviando
2. Revisa spam de todos modos
3. Verifica que `MAIL_FROM_ADDRESS` sea válido
4. Ejecuta `php artisan config:clear` en producción

### Error: "Domain not verified"
**Solución:** Con plan gratuito de Resend, puedes enviar sin verificar dominio, pero algunos proveedores pueden filtrar. Para mejor deliverability, verifica tu dominio en Resend.

---

## 📝 Checklist Final

- [ ] Cuenta creada en Resend
- [ ] API Key obtenida
- [ ] `MAIL_MAILER=resend` agregado en Laravel Cloud
- [ ] `RESEND_KEY=re_xxx` agregado en Laravel Cloud
- [ ] `MAIL_FROM_ADDRESS` configurado
- [ ] Cache limpiado en producción (`php artisan config:clear`)
- [ ] Probado con usuario de prueba
- [ ] Correo llegó a bandeja de entrada (no spam)

---

## 💡 Beneficios Adicionales de Resend

✅ **Webhooks** - Notificaciones cuando correos son abiertos, botan, etc.  
✅ **Plantillas** - Puedes crear templates HTML en el dashboard  
✅ **Analytics** - Estadísticas de apertura, clics, etc.  
✅ **Testing** - Modo sandbox para desarrollo  
✅ **API moderna** - Mejor que Gmail SMTP  

---

## 🎯 Resultado Esperado

**Antes (Gmail SMTP):**
- ❌ Correos bloqueados
- ❌ Van a spam
- ❌ No llegan
- ❌ Sin visibilidad de errores

**Después (Resend):**
- ✅ Correos entregados en < 5 segundos
- ✅ Bandeja de entrada directa
- ✅ 99.9% deliverability
- ✅ Dashboard con estadísticas

---

**Fecha:** 15 de noviembre de 2025  
**Recomendación:** Usar Resend para producción  
**Estado:** Listo para implementar
