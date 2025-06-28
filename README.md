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


## 🧭 ¿Qué incluye este proyecto?

- Laravel 11
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
