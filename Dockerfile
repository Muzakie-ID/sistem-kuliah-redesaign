# Stage 1: Build Frontend Assets
FROM node:20-alpine AS node_builder
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
RUN npm run build

# Stage 2: PHP & Nginx Application
FROM php:8.3-fpm-alpine
WORKDIR /var/www/html

RUN apk add --no-cache \
    nginx \
    postgresql-dev \
    libpng-dev \
    libzip-dev \
    zip \
    unzip \
    curl \
    tzdata

ENV TZ=Asia/Jakarta

RUN docker-php-ext-install pdo pdo_pgsql pgsql gd zip bcmath opcache

COPY --from=composer:latest /usr/bin/composer /usr/bin/composer

COPY . .
COPY --from=node_builder /app/public/build /var/www/html/public/build

RUN composer install --no-dev --optimize-autoloader --no-interaction

RUN chown -R www-data:www-data /var/www/html/storage /var/www/html/bootstrap/cache

EXPOSE 80

CMD ["sh", "-c", "php-fpm -D && nginx -g 'daemon off;'"]
