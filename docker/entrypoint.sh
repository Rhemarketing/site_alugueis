#!/bin/sh
set -eu

attempt=1
max_attempts="${DB_WAIT_ATTEMPTS:-60}"

echo "Aguardando o MySQL em ${DB_HOST:-127.0.0.1}:${DB_PORT:-3306}..."
until php -r '
    require "/var/www/app/api/_bootstrap.php";
    try {
        database();
        exit(0);
    } catch (Throwable $error) {
        exit(1);
    }
'; do
    if [ "$attempt" -ge "$max_attempts" ]; then
        echo "MySQL indisponível após ${max_attempts} tentativas." >&2
        exit 1
    fi
    attempt=$((attempt + 1))
    sleep 2
done

echo "MySQL disponível. Aplicando migrações..."
php /var/www/app/database/migrate.php

echo "Migrações concluídas. Iniciando Apache..."
exec "$@"
