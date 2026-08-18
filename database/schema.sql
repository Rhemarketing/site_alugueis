CREATE TABLE IF NOT EXISTS properties (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    external_id VARCHAR(100) NOT NULL,
    code VARCHAR(160) NOT NULL,
    short_code VARCHAR(80) NULL,
    property_type VARCHAR(80) NOT NULL,
    group_name VARCHAR(120) NULL,
    address VARCHAR(255) NULL,
    occupancy_status VARCHAR(40) NOT NULL DEFAULT 'Disponivel',
    current_use VARCHAR(160) NULL,
    notes TEXT NULL,
    source_url VARCHAR(2048) NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    UNIQUE KEY uq_properties_external_id (external_id),
    KEY idx_properties_status (occupancy_status, is_active),
    KEY idx_properties_type (property_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS tenants (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    name VARCHAR(180) NOT NULL,
    legal_name VARCHAR(220) NULL,
    document_number VARCHAR(30) NULL,
    email VARCHAR(190) NULL,
    phone VARCHAR(30) NULL,
    notes TEXT NULL,
    is_active BOOLEAN NOT NULL DEFAULT TRUE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    KEY idx_tenants_name (name),
    KEY idx_tenants_document (document_number)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS leases (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    status VARCHAR(40) NOT NULL DEFAULT 'Ativo',
    start_date DATE NULL,
    end_date DATE NULL,
    billing_frequency VARCHAR(60) NULL,
    billing_description VARCHAR(160) NULL,
    charges_description VARCHAR(255) NULL,
    current_rent DECIMAL(12,2) NOT NULL DEFAULT 0,
    reference_rent DECIMAL(12,2) NULL,
    security_deposit DECIMAL(12,2) NULL,
    next_adjustment_date DATE NULL,
    adjustment_index VARCHAR(40) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_leases_property FOREIGN KEY (property_id) REFERENCES properties(id),
    KEY idx_leases_property_status (property_id, status),
    KEY idx_leases_next_adjustment (next_adjustment_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS lease_tenants (
    lease_id BIGINT UNSIGNED NOT NULL,
    tenant_id BIGINT UNSIGNED NOT NULL,
    role VARCHAR(40) NOT NULL DEFAULT 'Locatario',
    is_primary BOOLEAN NOT NULL DEFAULT FALSE,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (lease_id, tenant_id),
    CONSTRAINT fk_lease_tenants_lease FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE CASCADE,
    CONSTRAINT fk_lease_tenants_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS property_events (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    external_id CHAR(36) NULL,
    property_id BIGINT UNSIGNED NOT NULL,
    lease_id BIGINT UNSIGNED NULL,
    tenant_id BIGINT UNSIGNED NULL,
    event_type VARCHAR(100) NOT NULL,
    event_date DATE NULL,
    description TEXT NOT NULL,
    source_type VARCHAR(30) NOT NULL DEFAULT 'manual',
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    UNIQUE KEY uq_property_events_external_id (external_id),
    CONSTRAINT fk_property_events_property FOREIGN KEY (property_id) REFERENCES properties(id),
    CONSTRAINT fk_property_events_lease FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE SET NULL,
    CONSTRAINT fk_property_events_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    KEY idx_property_events_timeline (property_id, event_date, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS rent_adjustments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lease_id BIGINT UNSIGNED NOT NULL,
    effective_date DATE NOT NULL,
    previous_amount DECIMAL(12,2) NULL,
    new_amount DECIMAL(12,2) NOT NULL,
    index_name VARCHAR(40) NULL,
    index_percentage DECIMAL(8,4) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_rent_adjustments_lease FOREIGN KEY (lease_id) REFERENCES leases(id),
    UNIQUE KEY uq_rent_adjustment_date (lease_id, effective_date)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS payments (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    lease_id BIGINT UNSIGNED NOT NULL,
    reference_month DATE NOT NULL COMMENT 'Primeiro dia do mes de competencia',
    due_date DATE NOT NULL,
    amount_due DECIMAL(12,2) NOT NULL,
    amount_paid DECIMAL(12,2) NULL,
    status VARCHAR(30) NOT NULL DEFAULT 'Pendente',
    paid_at DATETIME NULL,
    payment_method VARCHAR(50) NULL,
    transaction_reference VARCHAR(120) NULL,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_payments_lease FOREIGN KEY (lease_id) REFERENCES leases(id),
    KEY idx_payments_reference (reference_month, status),
    KEY idx_payments_due (due_date, status),
    KEY idx_payments_lease (lease_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS property_charges (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NOT NULL,
    lease_id BIGINT UNSIGNED NULL,
    charge_type VARCHAR(50) NOT NULL,
    amount_due DECIMAL(12,2) NOT NULL,
    frequency VARCHAR(30) NOT NULL DEFAULT 'Mensal',
    effective_from DATE NULL,
    effective_until DATE NULL,
    is_current BOOLEAN NOT NULL DEFAULT TRUE,
    notes TEXT NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
    CONSTRAINT fk_property_charges_property FOREIGN KEY (property_id) REFERENCES properties(id),
    CONSTRAINT fk_property_charges_lease FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE SET NULL,
    KEY idx_property_charges_current (property_id, charge_type, is_current)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS documents (
    id BIGINT UNSIGNED AUTO_INCREMENT PRIMARY KEY,
    property_id BIGINT UNSIGNED NULL,
    lease_id BIGINT UNSIGNED NULL,
    tenant_id BIGINT UNSIGNED NULL,
    payment_id BIGINT UNSIGNED NULL,
    document_type VARCHAR(60) NOT NULL,
    title VARCHAR(200) NOT NULL,
    competence_month DATE NULL,
    storage_provider VARCHAR(40) NOT NULL DEFAULT 'google_drive',
    external_url VARCHAR(2048) NOT NULL,
    mime_type VARCHAR(120) NULL,
    created_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    deleted_at TIMESTAMP NULL,
    CONSTRAINT fk_documents_property FOREIGN KEY (property_id) REFERENCES properties(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_lease FOREIGN KEY (lease_id) REFERENCES leases(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_tenant FOREIGN KEY (tenant_id) REFERENCES tenants(id) ON DELETE SET NULL,
    CONSTRAINT fk_documents_payment FOREIGN KEY (payment_id) REFERENCES payments(id) ON DELETE SET NULL,
    KEY idx_documents_context (property_id, lease_id, document_type)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS app_settings (
    setting_key VARCHAR(100) PRIMARY KEY,
    setting_value TEXT NOT NULL,
    updated_at TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
