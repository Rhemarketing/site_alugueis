ALTER TABLE payments
    ADD COLUMN period_start DATE NULL AFTER lease_id,
    ADD COLUMN period_end DATE NULL AFTER period_start,
    ADD COLUMN calendar_color VARCHAR(20) NULL AFTER period_end,
    ADD KEY idx_payments_period (lease_id, period_start, period_end);
