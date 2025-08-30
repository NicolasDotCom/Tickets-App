# 🎟️ Sistema de Tickets - Curso Miembros Nivel Oro

Bienvenido al proyecto del curso **Sistema de Tickets** desarrollado con Laravel 12, Inertia y React.  
Este código es exclusivo para los miembros **Nivel Oro** del canal.
Se añade la Feature: Roles y Permisos con la librería Spatie Laravel Permission.

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

Una vez descargado, descomprimí el archivo `curso-tickets-rolesypermisos.zip` en una carpeta de tu preferencia.

### 2. **Entrar a la carpeta del proyecto**

Desde la terminal, navega a la carpeta del proyecto:

cd curso-tickets


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
DB_DATABASE=curso_tickets
DB_USERNAME=root
DB_PASSWORD=


Luego, asegurate de crear la base de datos `curso_tickets` en tu sistema (puedes hacerlo desde phpMyAdmin, MySQL Workbench, o con consola).

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

El usuario administrador por defecto, tiene las siguientes credenciales:
email: admin@example.com
password: 12345678


## 🧭 ¿Qué incluye este proyecto?

- Laravel 12
- Inertia.js + React 19
- CRUD completo de:
  - Clientes
  - Técnicos de soporte
  - Tickets
- Relaciones entre entidades
- Eliminación con control de dependencias
- Flash messages globales
- Feature Roles y Permisos
- Estructura limpia para aprender o escalar

## ⚠️ Licencia

Este proyecto es exclusivo para uso **educativo**
