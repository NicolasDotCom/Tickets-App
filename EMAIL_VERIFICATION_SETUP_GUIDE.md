# 📧 Guía de Configuración: Verificación de Email

## ✅ Estado Actual de la Implementación

La funcionalidad de **verificación de email automática** ya está completamente implementada en el código:

### Características Implementadas:
- ✅ El modelo `User` implementa `MustVerifyEmail`
- ✅ Cuando el admin crea un usuario, se dispara automáticamente el evento `Registered`
- ✅ El evento envía un correo de verificación al usuario creado
- ✅ El usuario debe verificar su email antes de acceder al sistema
- ✅ Las rutas de verificación están configuradas correctamente
- ✅ La interfaz está traducida al español

### Ubicación del Código:
**Archivo:** `app/Http/Controllers/UserController.php` (línea 66-67)
```php
// Disparar el evento Registered para enviar el correo de verificación
event(new Registered($user));
```

---

## 🔧 Configuración para Desarrollo Local

### ✅ Tu configuración actual (Resend):
Tu entorno local **YA ESTÁ CONFIGURADO** correctamente con Resend:

```env
MAIL_MAILER=resend
RESEND_KEY=re_ZzPJ3heE_GJXSY6ZTX7i1yPT4S9PhCFit
MAIL_FROM_ADDRESS="soporte.tesltda@gmail.com"
MAIL_FROM_NAME="${APP_NAME}"
```

### Opciones alternativas para desarrollo:

#### Opción 1: LOG (Para pruebas sin envío real)
```env
MAIL_MAILER=log
```
Los correos se guardarán en `storage/logs/laravel.log`

#### Opción 2: Mailtrap (Sandbox de emails)
1. Regístrate gratis en [Mailtrap.io](https://mailtrap.io)
2. Obtén tus credenciales SMTP de tu inbox
3. Configura en `.env`:
```env
MAIL_MAILER=smtp
MAIL_HOST=sandbox.smtp.mailtrap.io
MAIL_PORT=2525
MAIL_USERNAME=tu_usuario_mailtrap
MAIL_PASSWORD=tu_password_mailtrap
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="noreply@tickets.com"
MAIL_FROM_NAME="${APP_NAME}"
```

---

## 🚀 Configuración para Producción (Laravel Cloud)

### Variables de Entorno Requeridas

Ve a: **Laravel Cloud Dashboard → Tu Proyecto → Settings → Environment Variables**

#### Variables Principales de Email:

```env
MAIL_MAILER=resend
RESEND_KEY=tu_clave_resend_de_produccion
MAIL_FROM_ADDRESS=soporte.tesltda@gmail.com
MAIL_FROM_NAME=Tickets-App
```

#### Variables Complementarias (si no existen):

```env
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tickets-app-main-dbvpcm.laravel.cloud
APP_LOCALE=es
APP_FALLBACK_LOCALE=es

SESSION_DRIVER=database
SESSION_SECURE_COOKIE=true
SESSION_HTTP_ONLY=true
SESSION_SAME_SITE=lax

QUEUE_CONNECTION=sync
```

### 🔐 Seguridad: NO subir credenciales a Git

**IMPORTANTE:** Nunca subas las siguientes variables al repositorio:
- ❌ `RESEND_KEY`
- ❌ `MAIL_PASSWORD`
- ❌ `MAIL_USERNAME` (si contiene información sensible)
- ❌ Cualquier clave API o token

#### Archivo `.gitignore` ya configurado:
```
.env
.env.local
.env.*.local
```

---

## 📋 Pasos para Configurar en Laravel Cloud

### 1️⃣ Obtener Clave de Resend (si necesitas una nueva)
1. Ve a [resend.com](https://resend.com)
2. Inicia sesión o crea cuenta
3. Ve a **API Keys**
4. Crea una nueva clave para producción
5. **Cópiala inmediatamente** (solo se muestra una vez)

### 2️⃣ Configurar en Laravel Cloud
1. Abre [cloud.laravel.com](https://cloud.laravel.com)
2. Selecciona tu proyecto: **Tickets-App**
3. Ve a **Settings** → **Environment Variables**
4. Busca o agrega estas variables:

| Variable | Valor | Nota |
|----------|-------|------|
| `MAIL_MAILER` | `resend` | Usar Resend como driver |
| `RESEND_KEY` | `re_xxxxx...` | Tu clave de producción |
| `MAIL_FROM_ADDRESS` | `soporte.tesltda@gmail.com` | Email remitente |
| `MAIL_FROM_NAME` | `Tickets-App` | Nombre del remitente |

### 3️⃣ Verificar Dominio en Resend
Para evitar que los emails vayan a spam:

1. Ve a tu dashboard de Resend
2. Agrega tu dominio: `tesltda.com` o el dominio que uses
3. Configura los registros DNS (SPF, DKIM, DMARC)
4. Espera la verificación (puede tardar minutos u horas)

**Mientras tanto:** Puedes usar cualquier email `@gmail.com` como `MAIL_FROM_ADDRESS`, pero algunos servicios pueden marcarlo como spam.

### 4️⃣ Forzar Redeploy
Después de agregar las variables:

1. Ve a **Deployments** en Laravel Cloud
2. Haz clic en **Deploy Now** o **Redeploy**
3. Espera 2-3 minutos a que termine

### 5️⃣ Limpiar Cache (Opcional)
Si tienes acceso a terminal en Laravel Cloud:
```bash
php artisan config:clear
php artisan cache:clear
```

O desde el panel de Laravel Cloud:
- Ve a **Commands**
- Ejecuta: `php artisan config:clear`

---

## 🧪 Cómo Probar la Funcionalidad

### En Desarrollo Local:

1. Asegúrate de tener configurado `MAIL_MAILER=resend` o `MAIL_MAILER=log`
2. Limpia la caché de configuración:
   ```bash
   php artisan config:clear
   ```
3. Inicia sesión como administrador
4. Ve a **Usuarios** → **Crear Usuario**
5. Crea un nuevo usuario con un email válido
6. Verifica:
   - **Si usas Resend:** El usuario recibirá el email de verificación
   - **Si usas LOG:** Revisa `storage/logs/laravel.log` para ver el email generado

### En Producción (Laravel Cloud):

1. Inicia sesión como admin en la app de producción
2. Crea un usuario de prueba
3. El usuario debe recibir el email de verificación
4. Verifica que el enlace funcione correctamente

---

## 🐛 Solución de Problemas

### Problema: No se envían los emails

**Posibles causas:**
1. **Caché de configuración:** Ejecuta `php artisan config:clear`
2. **Variables mal configuradas:** Verifica que las variables de entorno estén correctas
3. **Cola no procesada:** Si usas `QUEUE_CONNECTION=database`, ejecuta `php artisan queue:work`
4. **Dominio no verificado en Resend:** Verifica tu dominio o usa un email de prueba

### Problema: Los emails van a spam

**Soluciones:**
1. Verifica tu dominio en Resend (SPF, DKIM, DMARC)
2. Usa un dominio propio en vez de `@gmail.com`
3. Evita palabras spam en el asunto del email
4. Calienta tu dominio enviando pocos emails al principio

### Problema: Error de autenticación

**Verifica:**
1. La clave `RESEND_KEY` es correcta
2. La clave no ha expirado
3. El paquete `resend/resend-php` está instalado: `composer require resend/resend-php`

---

## 📦 Dependencias Requeridas

Verifica que estos paquetes estén instalados en `composer.json`:

```json
{
    "require": {
        "resend/resend-php": "^0.13.0",
        "spatie/laravel-permission": "^6.9"
    }
}
```

Si faltan, instálalos:
```bash
composer require resend/resend-php
```

---

## 🔄 Flujo Completo de Verificación

### 1. Admin crea usuario
- El admin va a `/users/create`
- Completa el formulario (nombre, email, contraseña, rol)
- Hace clic en **Crear Usuario**

### 2. Sistema procesa
- Se crea el usuario en la base de datos
- Se dispara el evento `Registered`
- Laravel envía automáticamente el email de verificación

### 3. Usuario recibe email
- Asunto: "Verifica tu dirección de correo electrónico"
- Contiene un enlace único: `/verify-email/{id}/{hash}`
- El enlace expira en 60 minutos (configurable)

### 4. Usuario verifica
- Hace clic en el enlace del email
- Laravel valida el hash y marca el email como verificado
- El usuario puede ahora acceder al sistema

### 5. Protección de rutas
- Todas las rutas tienen el middleware `verified`
- Si el usuario no ha verificado, es redirigido a `/verify-email`
- Puede solicitar reenvío del email si no lo recibió

---

## 📚 Referencias

- [Documentación de Laravel - Email Verification](https://laravel.com/docs/11.x/verification)
- [Documentación de Resend](https://resend.com/docs)
- [Laravel Cloud - Environment Variables](https://cloud.laravel.com/docs/environment-variables)

---

## ✅ Checklist Final

### Para Desarrollo Local:
- [✅] Variable `MAIL_MAILER` configurada
- [✅] Clave `RESEND_KEY` configurada
- [✅] `MAIL_FROM_ADDRESS` configurada
- [ ] Prueba creando un usuario
- [ ] Verifica que llegue el email

### Para Producción (Laravel Cloud):
- [ ] Variables de entorno agregadas en Laravel Cloud
- [ ] Dominio verificado en Resend (opcional pero recomendado)
- [ ] Redeploy forzado
- [ ] Cache limpiada
- [ ] Prueba creando un usuario en producción
- [ ] Verifica que llegue el email

---

## 🎯 Resumen

**✅ La funcionalidad YA ESTÁ IMPLEMENTADA en el código.**

**Lo único que necesitas hacer es:**
1. Para local: Ya está configurado ✅
2. Para producción: Agregar las variables de entorno en Laravel Cloud
3. Probar creando un usuario

**No necesitas modificar código**, solo configurar las variables de entorno correctamente.
