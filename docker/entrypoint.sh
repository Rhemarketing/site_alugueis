#!/bin/sh
set -eu

attempt=1
max_attempts="${DB_WAIT_ATTEMPTS:-60}"

echo "Aguardando o MySQL em ${DB_HOST:-127.0.0.1}:${DB_PORT:-3306}..."
until php -r '
    require "/var/www/app/api/_bootstrap.php";
    $config = database_config();
    try {
        database();
        exit(0);
    } catch (PDOException $error) {
        $unknownDb = (int) $error->getCode() === 1049 || str_contains($error->getMessage(), "Unknown database");
        if ($unknownDb) {
            // MySQL está online, mas o banco ainda não foi criado. O migrate.php fará isso.
            exit(0);
        }
        try {
            $dsn = sprintf("mysql:host=%s;port=%s;charset=%s", $config["host"], $config["port"], $config["charset"]);
            new PDO($dsn, $config["username"], $config["password"], [PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION]);
            exit(0);
        } catch (Throwable $serverError) {
            fwrite(STDERR, sprintf("[%s] Falha ao conectar no MySQL: %s\n", date("H:i:s"), $serverError->getMessage()));
            exit(1);
        }
    } catch (Throwable $error) {
        fwrite(STDERR, sprintf("[%s] Falha ao conectar: %s\n", date("H:i:s"), $error->getMessage()));
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
