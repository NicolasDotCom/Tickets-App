# 🌐 Guía Completa de Despliegue en Coolify

## Sistema de Tickets TES LTDA

Esta guía te llevará paso a paso para desplegar el Sistema de Tickets TES LTDA en Coolify.

---

## 📋 Pre-requisitos

### ✅ Lo que necesitas tener listo:

1. **Servidor con Coolify instalado**
   - VPS o servidor dedicado con Ubuntu/Debian
   - Mínimo 2GB RAM, 2 CPU cores
   - 20GB de espacio en disco

2. **Dominio configurado**
   - Apuntando a la IP de tu servidor
   - Registros A configurados correctamente

3. **Repositorio Git**
   - Código subido a GitHub, GitLab o similar
   - Acceso desde Coolify configurado

---

## 🚀 Paso a Paso

### 1. **Preparar el repositorio**

Asegurate de que tu repositorio tenga estos archivos (ya incluidos):

```
📁 tu-repositorio/
├── 📄 Dockerfile
├── 📄 docker-compose.yml
├── 📄 .dockerignore
├── 📄 .env.production
└── 📁 docker/
    ├── 📄 nginx.conf
    ├── 📄 supervisor.conf
    ├── 📄 php.ini
    └── 📄 entrypoint.sh
```

### 2. **Crear proyecto en Coolify**

1. **Acceder a Coolify**: `https://tu-servidor.com:8000`

2. **Nuevo proyecto**:
   - Click en **"+ New"** → **"Project"**
   - Nombre: `tickets-tesltda`
   - Descripción: `Sistema de Tickets TES LTDA`

3. **Configurar repositorio**:
   - **Source**: `Git Repository`
   - **Repository URL**: `https://github.com/usuario/app-tickets`
   - **Branch**: `main` (o `master`)
   - **Build Pack**: `Dockerfile`

### 3. **Configurar la aplicación**

#### **General Settings**:
```yaml
Application Name: tickets-tesltda
Port: 80
Dockerfile: ./Dockerfile
Health Check Path: /
```

#### **Build Settings**:
```yaml
Build Command: (dejar vacío - se usa Dockerfile)
Install Command: (dejar vacío - se usa Dockerfile)
Start Command: (dejar vacío - se usa Dockerfile)
```

### 4. **Crear base de datos MySQL**

1. **En tu proyecto**, click **"+ Add Resource"**
2. **Seleccionar**: `Database` → `MySQL`
3. **Configurar**:
   ```yaml
   Service Name: mysql-tickets
   Database Name: tickets_tesltda
   Username: tickets
   Password: [Generar contraseña segura]
   ```
4. **Guardar** y esperar que se despliegue

### 5. **Configurar variables de entorno**

En la sección **"Environment Variables"** de tu aplicación:

#### **🔧 Variables de aplicación**:
```bash
APP_NAME=Sistema Tickets TES LTDA
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tickets.tu-dominio.com
APP_TIMEZONE=America/Bogota
APP_LOCALE=es_CO
APP_FALLBACK_LOCALE=es_CO
APP_FAKER_LOCALE=es_CO
```

#### **🗄️ Variables de base de datos**:
```bash
DB_CONNECTION=mysql
DB_HOST=mysql-tickets  # Nombre del servicio MySQL
DB_PORT=3306
DB_DATABASE=tickets_tesltda
DB_USERNAME=tickets
DB_PASSWORD=[La contraseña que generaste]
```

#### **📧 Variables de correo**:
```bash
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu_app_password_de_gmail
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS=no-reply@tesltda.com
MAIL_FROM_NAME=Sistema Tickets TES LTDA
```

#### **⚡ Variables de sesión y caché**:
```bash
SESSION_DRIVER=database
SESSION_LIFETIME=120
CACHE_STORE=database
QUEUE_CONNECTION=database
FILESYSTEM_DISK=local
LOG_CHANNEL=stack
LOG_LEVEL=info
```

### 6. **Configurar dominio y SSL**

1. **En la sección "Domains"**:
   - **Add Domain**: `tickets.tu-dominio.com`
   - **SSL**: Activar **"Generate SSL Certificate"**

2. **Configurar DNS** (en tu proveedor de dominio):
   ```
   Type: A
   Name: tickets
   Value: [IP de tu servidor]
   TTL: 300
   ```

### 7. **Desplegar aplicación**

1. **Click en "Deploy"**
2. **Monitorear logs** en tiempo real
3. **El proceso incluirá**:
   - Construcción de imagen Docker
   - Instalación de dependencias PHP y Node.js
   - Compilación de assets
   - Ejecución de migraciones
   - Configuración de permisos

### 8. **Verificar despliegue**

1. **Esperar a que termine** (5-10 minutos)
2. **Verificar estado**: Debe aparecer como "Running"
3. **Acceder a la URL**: `https://tickets.tu-dominio.com`
4. **Primer registro**: Crear tu usuario administrador

---

## 🔄 Configuraciones Adicionales

### **Auto-deploy**

Para que se despliegue automáticamente con cada `git push`:

1. **Settings** → **"Git"**
2. **Enable "Auto Deploy"**
3. **Select branch**: `main`

### **Backups automáticos**

1. **Ve a la base de datos MySQL**
2. **"Scheduled Backups"**
3. **Configurar**:
   ```yaml
   Frequency: Daily
   Time: 02:00 AM
   Retention: 7 days
   ```

### **Monitoring y alertas**

1. **"Settings"** → **"Notifications"**
2. **Configurar email** para alertas
3. **Activar alertas** para:
   - Aplicación caída
   - Alto uso de CPU/memoria
   - Errores de despliegue

---

## 🛠️ Comandos útiles

### **Ejecutar comandos en el contenedor**:

```bash
# Acceder al contenedor
docker exec -it tickets-tesltda bash

# Limpiar caché
php artisan cache:clear

# Ver configuración
php artisan config:show

# Ejecutar migraciones manualmente
php artisan migrate

# Ver logs de Laravel
tail -f storage/logs/laravel.log
```

---

## 🆘 Solución de problemas

### **Error 500 - Internal Server Error**

1. **Verificar logs**:
   ```bash
   # En Coolify, ir a "Logs" y buscar errores
   ```

2. **Verificar variables de entorno**:
   - `APP_KEY` debe estar generada
   - `DB_*` variables correctas
   - `APP_URL` debe coincidir con el dominio

3. **Verificar permisos**:
   ```bash
   # Ejecutar en el contenedor
   chown -R www-data:www-data storage/
   chmod -R 775 storage/
   ```

### **Base de datos no conecta**

1. **Verificar que MySQL esté running** en Coolify
2. **Verificar variables** `DB_HOST`, `DB_DATABASE`, etc.
3. **Probar conexión**:
   ```bash
   # En el contenedor
   php artisan migrate:status
   ```

### **Assets no cargan (CSS/JS)**

1. **Verificar `APP_URL`** en variables de entorno
2. **Recompilar assets**:
   ```bash
   # En el contenedor
   npm run build
   php artisan config:cache
   ```

### **Archivos no suben**

1. **Verificar permisos** de `storage/app/`
2. **Verificar configuración** en `config/filesystems.php`
3. **Crear enlace simbólico**:
   ```bash
   php artisan storage:link
   ```

---

## 📊 Monitoring

### **Métricas importantes**:

- **CPU**: Debe estar < 80%
- **RAM**: Debe estar < 85%
- **Disco**: Debe tener > 2GB libres
- **Response time**: Debe ser < 2 segundos

### **Logs a monitorear**:

- **Application logs**: `/var/www/html/storage/logs/`
- **Nginx logs**: `/var/log/nginx/`
- **PHP-FPM logs**: `/var/log/supervisor/`

---

## ✅ Lista de verificación final

- [ ] Aplicación accesible vía HTTPS
- [ ] SSL funcionando correctamente
- [ ] Base de datos conectada
- [ ] Primer usuario registrado
- [ ] Envío de emails configurado
- [ ] Backups automáticos configurados
- [ ] Auto-deploy activado
- [ ] Monitoreo y alertas configuradas

---

## 🎉 ¡Felicitaciones!

Tu Sistema de Tickets TES LTDA está ahora desplegado en producción con Coolify.

**Próximos pasos**:
1. Configurar usuarios y permisos
2. Personalizar branding si es necesario
3. Configurar backups adicionales
4. Establecer procedimientos de mantenimiento

¿Necesitas ayuda adicional? Revisa los logs en Coolify o contacta al equipo de soporte.
