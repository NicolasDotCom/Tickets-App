# 🎟️ Sistema de Tickets TES LTDA

Bienvenido al **Sistema de Tickets de TES LTDA**, una aplicación web moderna desarrollada con Laravel 11, Inertia.js y React con tema oscuro minimalista.

## 🌟 Características

- **🎨 Tema oscuro minimalista**: Interfaz moderna con fondo negro y tarjetas grises
- **🔐 Sistema de autenticación**: Login, registro y recuperación de contraseña
- **📱 Diseño responsivo**: Optimizado para escritorio y dispositivos móviles
- **🇪🇸 Interfaz en español**: Todas las etiquetas y mensajes en español
- **🏢 Branding TES LTDA**: Logo personalizado y branding corporativo
- **⚡ Tecnología moderna**: Laravel 12 + Inertia.js + React + TypeScript
- **📎 Gestión de adjuntos**: Subida de archivos (fotos, videos, documentos) en tickets
- **👥 Gestión avanzada**: Asignación de clientes y técnicos de soporte
- **🔧 Categorización de equipos**: Clasificación por categoría, nombre, serial y área
- **📊 Estados de tickets**: Seguimiento completo (Abierto, En Progreso, Cerrado)

---

## 🎯 Funcionalidades Principales

### 📋 Gestión de Tickets
- **Creación completa**: Formulario con todos los campos necesarios
- **Adjuntos**: Subida de archivos (imágenes, videos, documentos PDF, Word, etc.)
- **Asignación**: Selección de cliente y técnico de soporte
- **Categorización**: Clasificación del equipo por tipo
- **Datos del equipo**: Nombre/referencia, número de serie, área
- **Estados**: Control de flujo (Abierto → En Progreso → Cerrado)
- **Edición**: Modificación completa incluyendo cambio de adjuntos

### 👥 Gestión de Clientes
- **Información completa**: Nombre, email, teléfono, dirección
- **Campo empresa**: Asociación con empresa o institución
- **Relación con tickets**: Visualización de tickets asignados

### 🔧 Gestión de Soporte Técnico
- **Perfil completo**: Datos personales y de contacto
- **Asignación de tickets**: Control de carga de trabajo
- **Seguimiento**: Tickets asignados por técnico

---

## ✅ Requisitos

Antes de empezar, asegurate de tener instalado en tu PC:

- PHP >= 8.2
- Composer
- Node.js y npm
- MySQL o MariaDB (u otro sistema compatible)
- Extensiones PHP necesarias (pdo, mbstring, etc.)

---

## ⚙️ Instalación

### 1. **Descomprimir el archivo ZIP**

Una vez descargado, descomprimí el archivo `app-tickets.zip` en una carpeta de tu preferencia.

### 2. **Entrar a la carpeta del proyecto**

Desde la terminal, navega a la carpeta del proyecto:

cd app-tickets


### 3. **Instalar dependencias de PHP**

Ejecuta el siguiente comando para instalar las dependencias de PHP:

composer install

### 4. **Copiar archivo de entorno y generar clave**

Copia el archivo de configuración `.env.example` a `.env` y genera la clave de aplicación de Laravel:

cp .env.example .env
php artisan key:generate


### 5. **Configurar la base de datos**

Abre el archivo `.env` y configura la conexión a la base de datos. Por ejemplo, si usas MySQL, el archivo debería verse así:


DB_CONNECTION=mysql
DB_HOST=127.0.0.1
DB_PORT=3306
DB_DATABASE=tickets_tesltda
DB_USERNAME=root
DB_PASSWORD=


APP_TIMEZONE=America/Bogota
APP_LOCALE=es_CO
APP_FALLBACK_LOCALE=es_CO
APP_FAKER_LOCALE=es_CO


MAIL_DRIVER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=xxxxxx@gmail.com
MAIL_PASSWORD=xxxxxxxxx
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="hello@example.com"
MAIL_FROM_NAME="${APP_NAME}"


Luego, asegurate de crear la base de datos `tickets_tesltda` en tu sistema (puedes hacerlo desde phpMyAdmin, MySQL Workbench, o con consola).

### 6. **Ejecutar migraciones y seeders**

Esto creará las tablas necesarias y cargará algunos datos de prueba:

php artisan migrate --seed

### 7. **Instalar dependencias de JavaScript**

Ejecuta el siguiente comando para instalar las dependencias de JavaScript:

npm install

### 8. **Ejecutar las tareas de compilación**

Ejecuta el siguiente comando para compilar los archivos de frontend e iniciar el servidor:

composer run dev


## 🚀 Iniciar el servidor

Y abre tu navegador en:

http://localhost:8000

Registra un usuario cualquiera

---

## 🌐 Despliegue en Coolify

### 📋 Prerrequisitos

Antes de desplegar en Coolify, asegurate de tener:

1. **Servidor con Coolify instalado** (VPS/Dedicado)
2. **Dominio configurado** apuntando a tu servidor
3. **Repositorio Git** con el código del proyecto

### 🔧 Configuración en Coolify

#### 1. **Crear nueva aplicación**

1. Accede a tu panel de Coolify
2. Ve a **"Projects"** → **"Create New Project"**
3. Selecciona **"Git Repository"**
4. Conecta tu repositorio (GitHub, GitLab, etc.)

#### 2. **Configurar el proyecto**

**Configuración básica:**
- **Build Pack**: `Docker`
- **Dockerfile**: `./Dockerfile` (usar el Dockerfile incluido)
- **Port**: `80`
- **Health Check Path**: `/`

#### 3. **Variables de entorno**

Configura las siguientes variables de entorno en Coolify:

```bash
# Aplicación
APP_NAME="Sistema Tickets TES LTDA"
APP_ENV=production
APP_DEBUG=false
APP_URL=https://tu-dominio.com
APP_TIMEZONE=America/Bogota
APP_LOCALE=es_CO
APP_FALLBACK_LOCALE=es_CO

# Base de datos (Coolify proporcionará estos valores)
DB_CONNECTION=mysql
DB_HOST=<coolify-mysql-host>
DB_PORT=3306
DB_DATABASE=tickets_tesltda
DB_USERNAME=<coolify-mysql-user>
DB_PASSWORD=<coolify-mysql-password>

# Correo electrónico
MAIL_MAILER=smtp
MAIL_HOST=smtp.gmail.com
MAIL_PORT=587
MAIL_USERNAME=tu-email@gmail.com
MAIL_PASSWORD=tu_app_password
MAIL_ENCRYPTION=tls
MAIL_FROM_ADDRESS="no-reply@tesltda.com"
MAIL_FROM_NAME="Sistema Tickets TES LTDA"
```

#### 4. **Crear base de datos MySQL**

1. En tu proyecto de Coolify, ve a **"Resources"**
2. Haz clic en **"Add Resource"** → **"Database"** → **"MySQL"**
3. Configura:
   - **Database Name**: `tickets_tesltda`
   - **Username**: `tickets` (o el que prefieras)
   - **Password**: Genera una contraseña segura
4. Coolify te proporcionará los datos de conexión

#### 5. **Configurar dominio y SSL**

1. Ve a **"Domains"** en tu aplicación
2. Agrega tu dominio: `tickets.tu-dominio.com`
3. Habilita **SSL automático** (Let's Encrypt)

#### 6. **Desplegar**

1. Haz clic en **"Deploy"**
2. Coolify construirá la imagen Docker y desplegará automáticamente
3. El script de inicialización ejecutará:
   - Migraciones de base de datos
   - Optimizaciones de caché
   - Configuración de permisos

### 🔄 Actualizaciones automáticas

**Para habilitar despliegues automáticos:**

1. Ve a **"Settings"** → **"Git"**
2. Habilita **"Auto Deploy"**
3. Selecciona la rama (normalmente `main` o `master`)

Ahora cada vez que hagas `git push`, Coolify desplegará automáticamente.

### 📊 Monitoreo

**Coolify proporciona:**
- **Logs en tiempo real**: Ve a "Logs" para ver los logs de la aplicación
- **Métricas**: CPU, memoria, disco
- **Health checks**: Monitoreo automático del estado
- **Backups**: Configurar backups automáticos de la base de datos

### 🛠️ Comandos útiles

**Para ejecutar comandos en el contenedor:**

```bash
# Limpiar caché
php artisan cache:clear

# Ver logs
php artisan queue:work

# Ejecutar migraciones
php artisan migrate
```

### 🔐 Seguridad

**Configuraciones recomendadas:**

1. **Firewall**: Solo abrir puertos 80, 443 y 22
2. **SSL**: Let's Encrypt automático
3. **Backups**: Configurar backups diarios de la base de datos
4. **Monitoring**: Alertas por email si la aplicación está caída

### 📱 Acceso

Una vez desplegado exitosamente:

- **URL**: `https://tu-dominio.com`
- **Admin**: Registra el primer usuario (será admin automáticamente)
- **Base de datos**: Accesible desde phpMyAdmin si lo configuraste

### 🆘 Solución de problemas

**Errores comunes:**

1. **Error 500**: Verificar variables de entorno y permisos
2. **Base de datos**: Verificar conexión en las variables de entorno
3. **Assets no cargan**: Verificar que `APP_URL` sea correcto
4. **Archivos no suben**: Verificar permisos de `storage/`

Para más ayuda, revisa los logs en Coolify o contacta al soporte.

---


## 🧭 ¿Qué incluye este proyecto?

- Laravel 12
- Inertia.js + React 19
- CRUD completo de:
  - **Clientes** (con campo empresa)
  - **Técnicos de soporte**
  - **Tickets** (con adjuntos, categorías de equipo y estados)
- **Gestión de archivos adjuntos** (fotos, videos, documentos)
- **Categorización de equipos** (Hardware, Software, Red, Impresoras, etc.)
- **Estados de tickets** (Abierto, En Progreso, Cerrado)
- **Datos del equipo** (nombre/referencia, serial, área)
- **Asignación** de clientes y técnicos
- Relaciones entre entidades
- Eliminación con control de dependencias
- Flash messages globales
- Interfaz completamente en español
- Estructura limpia para aprender o escalar

## ⚠️ Licencia

Este proyecto es exclusivo para uso **TESLTDA**.
