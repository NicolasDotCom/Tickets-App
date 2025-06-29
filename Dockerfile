# Dockerfile para Sistema de Tickets TES LTDA
FROM php:8.2-fpm-alpine

# Instalar dependencias del sistema
RUN apk add --no-cache \
    nginx \
    supervisor \
    bash \
    curl \
    git \
    zip \
    unzip \
    nodejs \
    npm \
    mysql-client \
    netcat-openbsd \
    freetype-dev \
    libjpeg-turbo-dev \
    libpng-dev \
    libzip-dev \
    icu-dev \
    oniguruma-dev

# Instalar extensiones PHP
RUN docker-php-ext-configure gd --with-freetype --with-jpeg \
    && docker-php-ext-install -j$(nproc) \
        pdo_mysql \
        zip \
        gd \
        intl \
        mbstring \
        bcmath \
        opcache

# Instalar Composer
COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

# Configurar directorio de trabajo
WORKDIR /var/www/html

# Copiar archivos del proyecto
COPY . .

# Asegurar que el directorio bootstrap/cache exista y sea escribible antes de composer install
RUN mkdir -p /var/www/html/bootstrap/cache \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Instalar dependencias PHP
RUN composer install --no-dev --optimize-autoloader

# Instalar dependencias Node.js y compilar assets
RUN npm ci && npm run build

# Configurar permisos
RUN chown -R www-data:www-data /var/www/html \
    && chmod -R 755 /var/www/html/storage \
    && chmod -R 755 /var/www/html/bootstrap/cache

# Configurar Git para confiar en el directorio del proyecto
RUN git config --global --add safe.directory /var/www/html

# Copiar configuraciones
COPY docker/nginx.conf /etc/nginx/nginx.conf
COPY docker/supervisor.conf /etc/supervisor/conf.d/supervisord.conf
COPY docker/php.ini /usr/local/etc/php/conf.d/custom.ini
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh
COPY docker/wait-for-db.sh /usr/local/bin/wait-for-db.sh

# Hacer ejecutable el script de entrada y el script de espera
RUN chmod +x /usr/local/bin/entrypoint.sh \
    && chmod +x /usr/local/bin/wait-for-db.sh

# Crear directorio para logs
RUN mkdir -p /var/log/supervisor

# Exponer puerto
EXPOSE 80

# Script de entrada y comando de inicio
ENTRYPOINT ["/usr/local/bin/wait-for-db.sh", "mysql", "/usr/local/bin/entrypoint.sh"]
CMD ["/usr/bin/supervisord", "-c", "/etc/supervisor/conf.d/supervisord.conf"]
