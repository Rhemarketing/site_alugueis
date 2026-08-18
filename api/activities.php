<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';
require_method('POST');

$input = request_json();
$propertyExternalId = trim((string) ($input['propertyId'] ?? ''));
$type = trim((string) ($input['type'] ?? ''));
$description = trim((string) ($input['description'] ?? ''));

if ($propertyExternalId === '' || $type === '' || $description === '') {
    json_response(['error' => 'Imóvel, tipo e descrição são obrigatórios.'], 422);
}
if (mb_strlen($type) > 100 || mb_strlen($description) > 5000) {
    json_response(['error' => 'O registro excede o tamanho permitido.'], 422);
}

$db = database();
$propertyQuery = $db->prepare('SELECT id, code FROM properties WHERE external_id = ? AND deleted_at IS NULL');
$propertyQuery->execute([$propertyExternalId]);
$property = $propertyQuery->fetch();
if (!$property) {
    json_response(['error' => 'Imóvel não encontrado.'], 404);
}

$externalId = sprintf(
    '%04x%04x-%04x-%04x-%04x-%04x%04x%04x',
    random_int(0, 0xffff), random_int(0, 0xffff), random_int(0, 0xffff),
    random_int(0, 0x0fff) | 0x4000, random_int(0, 0x3fff) | 0x8000,
    random_int(0, 0xffff), random_int(0, 0xffff), random_int(0, 0xffff),
);
$now = new DateTimeImmutable('now');
$createdAt = $now->format('Y-m-d H:i:s');
$eventDate = $now->format('Y-m-d');

$insert = $db->prepare(<<<'SQL'
    INSERT INTO property_events
        (external_id, property_id, event_type, event_date, description, source_type, created_at)
    VALUES (?, ?, ?, ?, ?, 'manual', ?)
SQL);
$insert->execute([$externalId, $property['id'], $type, $eventDate, $description, $createdAt]);

json_response([
    'activity' => [
        'id' => $externalId,
        'propertyId' => $propertyExternalId,
        'propertyCode' => $property['code'],
        'type' => $type,
        'title' => $type,
        'date' => $eventDate,
        'description' => $description,
        'createdAt' => $now->format(DateTimeInterface::ATOM),
    ],
], 201);
