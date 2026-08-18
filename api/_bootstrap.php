<?php
declare(strict_types=1);

function load_environment(string $path): void
{
    if (!is_file($path)) {
        return;
    }

    foreach (file($path, FILE_IGNORE_NEW_LINES | FILE_SKIP_EMPTY_LINES) ?: [] as $line) {
        $line = trim($line);
        if ($line === '' || str_starts_with($line, '#') || !str_contains($line, '=')) {
            continue;
        }

        [$key, $value] = array_map('trim', explode('=', $line, 2));
        $value = trim($value, "\"'");
        if (getenv($key) === false) {
            putenv("{$key}={$value}");
            $_ENV[$key] = $value;
        }
    }
}

load_environment(dirname(__DIR__) . '/.env');

function env_value(string $key, string $default = ''): string
{
    $value = getenv($key);
    return $value === false ? $default : $value;
}

$timezone = env_value('APP_TIMEZONE', 'America/Sao_Paulo');
try {
    date_default_timezone_set((new DateTimeZone($timezone))->getName());
} catch (Throwable) {
    date_default_timezone_set('America/Sao_Paulo');
}

function database_config(): array
{
    return [
        'host' => env_value('DB_HOST', '127.0.0.1'),
        'port' => env_value('DB_PORT', '3306'),
        'database' => env_value('DB_DATABASE', 'site_alugueis'),
        'username' => env_value('DB_USERNAME', 'root'),
        'password' => env_value('DB_PASSWORD', ''),
        'charset' => env_value('DB_CHARSET', 'utf8mb4'),
    ];
}

function database(): PDO
{
    static $connection = null;
    if ($connection instanceof PDO) {
        return $connection;
    }

    $config = database_config();
    $dsn = sprintf(
        'mysql:host=%s;port=%s;dbname=%s;charset=%s',
        $config['host'],
        $config['port'],
        $config['database'],
        $config['charset'],
    );

    $connection = new PDO($dsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_DEFAULT_FETCH_MODE => PDO::FETCH_ASSOC,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);

    return $connection;
}

function json_response(mixed $data, int $status = 200): never
{
    http_response_code($status);
    header('Content-Type: application/json; charset=utf-8');
    header('Cache-Control: no-store');
    echo json_encode($data, JSON_UNESCAPED_UNICODE | JSON_UNESCAPED_SLASHES | JSON_THROW_ON_ERROR);
    exit;
}

function request_json(): array
{
    $contentType = $_SERVER['CONTENT_TYPE'] ?? '';
    if (!str_contains(strtolower($contentType), 'application/json')) {
        json_response(['error' => 'Envie os dados como application/json.'], 415);
    }

    try {
        $body = json_decode(file_get_contents('php://input') ?: '', true, 512, JSON_THROW_ON_ERROR);
    } catch (JsonException) {
        json_response(['error' => 'JSON inválido.'], 400);
    }

    if (!is_array($body)) {
        json_response(['error' => 'O corpo da requisição deve ser um objeto JSON.'], 400);
    }

    return $body;
}

function require_method(string ...$allowed): void
{
    $method = strtoupper($_SERVER['REQUEST_METHOD'] ?? 'GET');
    if (!in_array($method, $allowed, true)) {
        header('Allow: ' . implode(', ', $allowed));
        json_response(['error' => 'Método não permitido.'], 405);
    }
}

set_exception_handler(static function (Throwable $error): never {
    error_log((string) $error);
    $message = env_value('APP_DEBUG', 'false') === 'true'
        ? $error->getMessage()
        : 'Não foi possível concluir a operação no banco de dados.';
    if (PHP_SAPI === 'cli') {
        fwrite(STDERR, $message . PHP_EOL);
        exit(1);
    }
    json_response(['error' => $message], 500);
});
