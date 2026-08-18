<?php
declare(strict_types=1);

require dirname(__DIR__) . '/api/_bootstrap.php';

if (PHP_SAPI !== 'cli') {
    fwrite(STDERR, "Este script só pode ser executado pela linha de comando.\n");
    exit(1);
}

$config = database_config();
if (!preg_match('/^[a-zA-Z0-9_]+$/', $config['database'])) {
    fwrite(STDERR, "DB_DATABASE contém caracteres inválidos.\n");
    exit(1);
}

try {
    $db = database();
} catch (PDOException $error) {
    $unknownDatabase = (int) $error->getCode() === 1049
        || str_contains($error->getMessage(), 'Unknown database');
    if (!$unknownDatabase) {
        throw $error;
    }

    // Conveniência para desenvolvimento local. Em produção, o banco normalmente
    // já é criado pelo serviço MySQL e o usuário não precisa da permissão CREATE.
    $serverDsn = sprintf(
        'mysql:host=%s;port=%s;charset=%s',
        $config['host'],
        $config['port'],
        $config['charset'],
    );
    $server = new PDO($serverDsn, $config['username'], $config['password'], [
        PDO::ATTR_ERRMODE => PDO::ERRMODE_EXCEPTION,
        PDO::ATTR_EMULATE_PREPARES => false,
    ]);
    $databaseName = $config['database'];
    $server->exec("CREATE DATABASE `{$databaseName}` CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci");
    $db = database();
}

$lockName = substr('site_alugueis_migrations_' . $config['database'], 0, 64);
$lock = $db->prepare('SELECT GET_LOCK(?, 60)');
$lock->execute([$lockName]);
if ((int) $lock->fetchColumn() !== 1) {
    throw new RuntimeException('Não foi possível obter a trava de migração do banco.');
}
register_shutdown_function(static function () use ($db, $lockName): void {
    try {
        $release = $db->prepare('SELECT RELEASE_LOCK(?)');
        $release->execute([$lockName]);
    } catch (Throwable) {
        // A conexão pode já ter sido encerrada; o MySQL libera a trava nesse caso.
    }
});

$db->exec(<<<'SQL'
    CREATE TABLE IF NOT EXISTS schema_migrations (
        migration VARCHAR(190) PRIMARY KEY,
        applied_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
    ) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci
SQL);

$migrationFiles = ['001_initial' => __DIR__ . '/schema.sql'];
$additionalMigrations = glob(__DIR__ . '/migrations/*.sql') ?: [];
sort($additionalMigrations, SORT_STRING);
foreach ($additionalMigrations as $path) {
    $migrationFiles[pathinfo($path, PATHINFO_FILENAME)] = $path;
}

$isApplied = $db->prepare('SELECT COUNT(*) FROM schema_migrations WHERE migration = ?');
$markApplied = $db->prepare('INSERT INTO schema_migrations (migration) VALUES (?)');
foreach ($migrationFiles as $migration => $path) {
    $isApplied->execute([$migration]);
    if ((int) $isApplied->fetchColumn() > 0) {
        continue;
    }
    $sql = file_get_contents($path);
    if ($sql === false) {
        throw new RuntimeException("Não foi possível ler a migração {$migration}.");
    }
    $db->exec($sql);
    $markApplied->execute([$migration]);
    fwrite(STDOUT, "Migração aplicada: {$migration}\n");
}

$existingProperties = (int) $db->query('SELECT COUNT(*) FROM properties')->fetchColumn();
if ($existingProperties > 0) {
    fwrite(STDOUT, "Estrutura atualizada. Seed ignorado: o banco já possui {$existingProperties} imóveis.\n");
    exit(0);
}

$seedContents = file_get_contents(__DIR__ . '/seed-data.json');
if ($seedContents === false) {
    throw new RuntimeException('Execute npm run seed:export para gerar database/seed-data.json.');
}
$seed = json_decode($seedContents, true, 512, JSON_THROW_ON_ERROR);

$insertProperty = $db->prepare(<<<'SQL'
    INSERT INTO properties
        (external_id, code, short_code, property_type, group_name, address, occupancy_status,
         current_use, notes, source_url)
    VALUES
        (:external_id, :code, :short_code, :property_type, :group_name, :address, :occupancy_status,
         :current_use, :notes, :source_url)
SQL);
$insertTenant = $db->prepare('INSERT INTO tenants (name) VALUES (?)');
$findTenant = $db->prepare('SELECT id FROM tenants WHERE name = ? AND deleted_at IS NULL LIMIT 1');
$insertLease = $db->prepare(<<<'SQL'
    INSERT INTO leases
        (property_id, status, start_date, billing_frequency, billing_description, charges_description,
         current_rent, reference_rent, next_adjustment_date, notes)
    VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
SQL);
$insertLeaseTenant = $db->prepare(
    "INSERT INTO lease_tenants (lease_id, tenant_id, role, is_primary) VALUES (?, ?, 'Locatario', 1)"
);
$insertCharge = $db->prepare(<<<'SQL'
    INSERT INTO property_charges (property_id, lease_id, charge_type, amount_due, frequency, is_current)
    VALUES (?, ?, 'IPTU', ?, 'Mensal', 1)
SQL);
$insertEvent = $db->prepare(<<<'SQL'
    INSERT INTO property_events (property_id, event_type, event_date, description, source_type)
    VALUES (?, ?, ?, ?, 'import')
SQL);

$propertyIds = [];
$db->beginTransaction();
try {
    foreach ($seed['properties'] as $property) {
        $insertProperty->execute([
            'external_id' => $property['id'],
            'code' => $property['code'],
            'short_code' => $property['shortCode'] ?? null,
            'property_type' => $property['type'],
            'group_name' => $property['group'] ?? null,
            'address' => $property['address'] ?? null,
            'occupancy_status' => $property['occupancy'],
            'current_use' => $property['currentUse'] ?? null,
            'notes' => $property['notes'] ?? null,
            'source_url' => $property['source'] ?? null,
        ]);
        $propertyId = (int) $db->lastInsertId();
        $propertyIds[$property['id']] = $propertyId;

        $leaseId = null;
        if ($property['occupancy'] === 'Locado') {
            $billing = (string) ($property['billing'] ?? 'Mensal');
            $frequency = str_contains($billing, 'Anual') ? 'Anual'
                : (str_contains($billing, 'Semestral') ? 'Semestral' : 'Mensal');
            $startDate = ($property['lastEvent'] ?? '') === 'Início do contrato'
                ? ($property['lastDate'] ?? null)
                : null;
            $insertLease->execute([
                $propertyId,
                $property['contractStatus'] ?? 'Ativo',
                $startDate,
                $frequency,
                $billing,
                $property['charges'] ?? null,
                $property['rent'] ?? 0,
                $property['referenceRent'] ?? null,
                $property['nextAdjustment'] ?? null,
                null,
            ]);
            $leaseId = (int) $db->lastInsertId();

            $tenantName = trim((string) ($property['tenant'] ?? ''));
            if ($tenantName !== '') {
                $findTenant->execute([$tenantName]);
                $tenantId = $findTenant->fetchColumn();
                if ($tenantId === false) {
                    $insertTenant->execute([$tenantName]);
                    $tenantId = (int) $db->lastInsertId();
                }
                $insertLeaseTenant->execute([$leaseId, $tenantId]);
            }
        }

        if (isset($property['iptu']) && $property['iptu'] !== null) {
            $insertCharge->execute([$propertyId, $leaseId, $property['iptu']]);
        }
    }

    foreach ($seed['history'] as $event) {
        $propertyId = $propertyIds[$event['propertyId']] ?? null;
        if ($propertyId === null) {
            throw new RuntimeException("Evento aponta para imóvel inexistente: {$event['propertyId']}");
        }
        $insertEvent->execute([
            $propertyId,
            $event['title'],
            $event['date'] ?? null,
            $event['description'],
        ]);
    }

    $setting = $db->prepare(<<<'SQL'
        INSERT INTO app_settings (setting_key, setting_value)
        VALUES ('source_updated_at', ?)
        ON DUPLICATE KEY UPDATE setting_value = VALUES(setting_value)
    SQL);
    $setting->execute([$seed['sourceUpdatedAt']]);
    $db->commit();
} catch (Throwable $error) {
    if ($db->inTransaction()) {
        $db->rollBack();
    }
    throw $error;
}

fwrite(
    STDOUT,
    sprintf(
        "Migração concluída: %d imóveis, %d inquilinos e %d eventos importados.\n",
        count($seed['properties']),
        (int) $db->query('SELECT COUNT(*) FROM tenants')->fetchColumn(),
        count($seed['history']),
    ),
);
