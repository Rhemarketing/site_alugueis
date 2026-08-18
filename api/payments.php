<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';
require_method('GET', 'POST');

const PAYMENT_COLORS = ['blue', 'green', 'purple', 'yellow', 'pink', 'peach', 'teal'];

function valid_iso_date(string $value): bool
{
    $date = DateTimeImmutable::createFromFormat('!Y-m-d', $value);
    return $date !== false && $date->format('Y-m-d') === $value;
}

function payment_payload(array $row): array
{
    return [
        'id' => (int) $row['id'],
        'propertyId' => $row['property_external_id'],
        'propertyCode' => $row['property_code'],
        'tenant' => $row['tenant_names'] ?: 'Sem inquilino',
        'periodStart' => $row['period_start'],
        'periodEnd' => $row['period_end'],
        'amountPaid' => (float) $row['amount_paid'],
        'color' => $row['calendar_color'],
        'paidAt' => $row['paid_at'] === null
            ? null
            : (new DateTimeImmutable($row['paid_at']))->format(DateTimeInterface::ATOM),
        'status' => $row['status'],
    ];
}

$db = database();

if (($_SERVER['REQUEST_METHOD'] ?? 'GET') === 'GET') {
    $propertyExternalId = trim((string) ($_GET['propertyId'] ?? ''));
    if ($propertyExternalId === '') {
        json_response(['error' => 'Selecione um imóvel.'], 422);
    }

    $property = $db->prepare('SELECT id, code FROM properties WHERE external_id = ? AND deleted_at IS NULL');
    $property->execute([$propertyExternalId]);
    if (!$property->fetch()) {
        json_response(['error' => 'Imóvel não encontrado.'], 404);
    }

    $query = $db->prepare(<<<'SQL'
        SELECT
            pay.id,
            p.external_id AS property_external_id,
            p.code AS property_code,
            pay.period_start,
            pay.period_end,
            pay.amount_paid,
            pay.calendar_color,
            pay.paid_at,
            pay.status,
            GROUP_CONCAT(t.name ORDER BY lt.is_primary DESC, t.name SEPARATOR ' / ') AS tenant_names
        FROM payments pay
        INNER JOIN leases l ON l.id = pay.lease_id
        INNER JOIN properties p ON p.id = l.property_id
        LEFT JOIN lease_tenants lt ON lt.lease_id = l.id
        LEFT JOIN tenants t ON t.id = lt.tenant_id AND t.deleted_at IS NULL
        WHERE p.external_id = ?
          AND pay.deleted_at IS NULL
          AND pay.period_start IS NOT NULL
          AND pay.period_end IS NOT NULL
        GROUP BY pay.id, p.id
        ORDER BY pay.period_start DESC, pay.id DESC
    SQL);
    $query->execute([$propertyExternalId]);
    json_response(['payments' => array_map('payment_payload', $query->fetchAll())]);
}

$input = request_json();
$propertyExternalId = trim((string) ($input['propertyId'] ?? ''));
$periodStart = trim((string) ($input['periodStart'] ?? ''));
$periodEnd = trim((string) ($input['periodEnd'] ?? ''));
$color = trim((string) ($input['color'] ?? ''));
$amountPaid = $input['amountPaid'] ?? null;

if ($propertyExternalId === '' || !valid_iso_date($periodStart) || !valid_iso_date($periodEnd)) {
    json_response(['error' => 'Imóvel e período válido são obrigatórios.'], 422);
}
if ($periodStart > $periodEnd) {
    json_response(['error' => 'A data final não pode ser anterior à data inicial.'], 422);
}
if (!is_numeric($amountPaid) || (float) $amountPaid <= 0 || (float) $amountPaid > 99999999.99) {
    json_response(['error' => 'Informe um valor pago válido.'], 422);
}
if (!in_array($color, PAYMENT_COLORS, true)) {
    json_response(['error' => 'Selecione uma cor pastel válida.'], 422);
}
$startDate = new DateTimeImmutable($periodStart);
$endDate = new DateTimeImmutable($periodEnd);
if ($startDate->diff($endDate)->days > 3660) {
    json_response(['error' => 'O período não pode ultrapassar dez anos.'], 422);
}

$db->beginTransaction();
try {
    $leaseQuery = $db->prepare(<<<'SQL'
        SELECT l.id, p.id AS property_id, p.code
        FROM properties p
        INNER JOIN leases l ON l.property_id = p.id
        WHERE p.external_id = ?
          AND p.deleted_at IS NULL
          AND l.deleted_at IS NULL
          AND l.status = 'Ativo'
        ORDER BY l.id DESC
        LIMIT 1
        FOR UPDATE
    SQL);
    $leaseQuery->execute([$propertyExternalId]);
    $lease = $leaseQuery->fetch();
    if (!$lease) {
        $db->rollBack();
        json_response(['error' => 'O imóvel não possui contrato ativo para receber pagamentos.'], 422);
    }

    $overlap = $db->prepare(<<<'SQL'
        SELECT id
        FROM payments
        WHERE lease_id = ?
          AND deleted_at IS NULL
          AND period_start <= ?
          AND period_end >= ?
        LIMIT 1
    SQL);
    $overlap->execute([$lease['id'], $periodEnd, $periodStart]);
    if ($overlap->fetch()) {
        $db->rollBack();
        json_response(['error' => 'Este período se sobrepõe a um pagamento já registrado.'], 422);
    }

    $referenceMonth = $startDate->modify('first day of this month')->format('Y-m-d');
    $paidAt = (new DateTimeImmutable('now'))->format('Y-m-d H:i:s');
    $insert = $db->prepare(<<<'SQL'
        INSERT INTO payments
            (lease_id, period_start, period_end, calendar_color, reference_month, due_date,
             amount_due, amount_paid, status, paid_at, payment_method)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?, 'Pago', ?, 'Não informado')
    SQL);
    $amount = round((float) $amountPaid, 2);
    $insert->execute([
        $lease['id'], $periodStart, $periodEnd, $color, $referenceMonth, $periodEnd,
        $amount, $amount, $paidAt,
    ]);
    $paymentId = (int) $db->lastInsertId();
    $db->commit();
} catch (Throwable $error) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    throw $error;
}

json_response([
    'payment' => [
        'id' => $paymentId,
        'propertyId' => $propertyExternalId,
        'propertyCode' => $lease['code'],
        'periodStart' => $periodStart,
        'periodEnd' => $periodEnd,
        'amountPaid' => $amount,
        'color' => $color,
        'paidAt' => (new DateTimeImmutable($paidAt))->format(DateTimeInterface::ATOM),
        'status' => 'Pago',
    ],
], 201);
