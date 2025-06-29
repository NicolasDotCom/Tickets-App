#!/bin/bash

# Script de inicialización para Coolify
set -e

echo "🚀 Iniciando despliegue del Sistema de Tickets TES LTDA..."

# Esperar por la base de datos
echo "⏳ Esperando conexión a la base de datos..."
until php artisan migrate:status >/dev/null 2>&1; do
    echo "⏳ Base de datos no disponible, esperando..."
    sleep 5
done

echo "✅ Base de datos conectada"

# Generar clave de aplicación si no existe
if [ -z "$APP_KEY" ]; then
    echo "🔑 Generando clave de aplicación..."
    php artisan key:generate --force
fi

# Limpiar y optimizar caché
echo "🧹 Limpiando caché..."
php artisan config:clear
php artisan cache:clear
php artisan route:clear
php artisan view:clear

# Optimizar para producción
echo "⚡ Optimizando para producción..."
php artisan config:cache
php artisan route:cache
php artisan view:cache

# Ejecutar migraciones
echo "📊 Ejecutando migraciones..."
php artisan migrate --force

# Crear directorio de storage si no existe
echo "📁 Configurando storage..."
php artisan storage:link

# Verificar permisos
echo "🔐 Configurando permisos..."
chown -R www-data:www-data /var/www/html/storage
chown -R www-data:www-data /var/www/html/bootstrap/cache
chmod -R 775 /var/www/html/storage
chmod -R 775 /var/www/html/bootstrap/cache

echo "✅ Despliegue completado exitosamente!"

# Iniciar supervisord
exec "$@"
