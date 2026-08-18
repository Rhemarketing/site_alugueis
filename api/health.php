<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';
require_method('GET');

try {
    database()->query('SELECT 1')->fetchColumn();
    json_response(['status' => 'ok']);
} catch (Throwable) {
    json_response(['status' => 'unavailable'], 503);
}
