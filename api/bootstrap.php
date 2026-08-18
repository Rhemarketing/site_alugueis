<?php
declare(strict_types=1);

require __DIR__ . '/_bootstrap.php';
require_method('GET');

$db = database();

$properties = $db->query(<<<'SQL'
    SELECT
        p.id AS database_id,
        p.external_id,
        p.code,
        p.short_code,
        p.property_type,
        p.group_name,
        p.address,
        p.occupancy_status,
        p.current_use,
        p.notes AS property_notes,
        p.source_url,
        l.id AS lease_id,
        l.status AS contract_status,
        l.billing_frequency,
        l.billing_description,
        l.charges_description,
        l.current_rent,
        l.reference_rent,
        l.next_adjustment_date,
        l.notes AS lease_notes,
        GROUP_CONCAT(t.name ORDER BY lt.is_primary DESC, t.name SEPARATOR ' / ') AS tenant_names
    FROM properties p
    LEFT JOIN leases l
        ON l.id = (
            SELECT active_lease.id
            FROM leases active_lease
            WHERE active_lease.property_id = p.id
              AND active_lease.deleted_at IS NULL
              AND active_lease.status = 'Ativo'
            ORDER BY active_lease.id DESC
            LIMIT 1
        )
    LEFT JOIN lease_tenants lt ON lt.lease_id = l.id
    LEFT JOIN tenants t ON t.id = lt.tenant_id AND t.deleted_at IS NULL
    WHERE p.deleted_at IS NULL AND p.is_active = 1
    GROUP BY p.id, l.id
    ORDER BY p.id
SQL)->fetchAll();

$lastEvents = $db->query(<<<'SQL'
    SELECT e.property_id, e.event_type, e.event_date
    FROM property_events e
    INNER JOIN (
        SELECT property_id, MAX(id) AS max_id
        FROM property_events
        GROUP BY property_id
    ) latest ON latest.max_id = e.id
SQL)->fetchAll();
$lastEventByProperty = [];
foreach ($lastEvents as $event) {
    $lastEventByProperty[(int) $event['property_id']] = $event;
}

$iptu = $db->query(<<<'SQL'
    SELECT property_id, amount_due
    FROM property_charges
    WHERE charge_type = 'IPTU' AND is_current = 1
SQL)->fetchAll();
$iptuByProperty = [];
foreach ($iptu as $charge) {
    $iptuByProperty[(int) $charge['property_id']] = (float) $charge['amount_due'];
}

$resultProperties = array_map(static function (array $row) use ($lastEventByProperty, $iptuByProperty): array {
    $databaseId = (int) $row['database_id'];
    $lastEvent = $lastEventByProperty[$databaseId] ?? null;
    return [
        'databaseId' => $databaseId,
        'leaseId' => $row['lease_id'] === null ? null : (int) $row['lease_id'],
        'id' => $row['external_id'],
        'code' => $row['code'],
        'shortCode' => $row['short_code'],
        'type' => $row['property_type'],
        'group' => $row['group_name'],
        'address' => $row['address'],
        'tenant' => $row['tenant_names'] ?: ($row['current_use'] ?: 'Sem inquilino'),
        'occupancy' => $row['occupancy_status'],
        'currentUse' => $row['current_use'],
        'rent' => (float) ($row['current_rent'] ?? 0),
        'referenceRent' => $row['reference_rent'] === null ? null : (float) $row['reference_rent'],
        'lastEvent' => $lastEvent['event_type'] ?? 'Cadastro',
        'lastDate' => $lastEvent['event_date'] ?? null,
        'nextAdjustment' => $row['next_adjustment_date'],
        'source' => $row['source_url'],
        'billing' => $row['billing_description'] ?: ($row['billing_frequency'] ?: 'Mensal'),
        'charges' => $row['charges_description'] ?: 'Não informado',
        'contractStatus' => $row['contract_status'] ?: 'Não se aplica',
        'notes' => $row['lease_notes'] ?: $row['property_notes'],
        'iptu' => $iptuByProperty[$databaseId] ?? null,
    ];
}, $properties);

$events = $db->query(<<<'SQL'
    SELECT
        e.external_id,
        p.external_id AS property_external_id,
        p.code AS property_code,
        e.event_type,
        e.event_date,
        e.description,
        e.source_type,
        e.created_at
    FROM property_events e
    INNER JOIN properties p ON p.id = e.property_id
    ORDER BY COALESCE(e.event_date, DATE(e.created_at)) DESC, e.id DESC
SQL)->fetchAll();

$history = [];
$activities = [];
foreach ($events as $event) {
    $item = [
        'id' => $event['external_id'],
        'propertyId' => $event['property_external_id'],
        'propertyCode' => $event['property_code'],
        'type' => $event['event_type'],
        'title' => $event['event_type'],
        'date' => $event['event_date'],
        'description' => $event['description'],
        'createdAt' => (new DateTimeImmutable($event['created_at']))->format(DateTimeInterface::ATOM),
    ];
    if ($event['source_type'] === 'manual') {
        $activities[] = $item;
    } else {
        $history[] = $item;
    }
}

$sourceUpdatedAt = $db->query("SELECT setting_value FROM app_settings WHERE setting_key = 'source_updated_at'")->fetchColumn() ?: null;

json_response([
    'properties' => $resultProperties,
    'history' => $history,
    'activities' => $activities,
    'sourceUpdatedAt' => $sourceUpdatedAt,
]);
