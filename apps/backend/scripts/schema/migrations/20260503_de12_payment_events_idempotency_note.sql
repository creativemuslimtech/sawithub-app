-- DE-12: Midtrans webhook replay idempotency is enforced in application code using
-- t_sawit_hub_payment_events (UNIQUE provider + event_key). Run the main schema
-- sync (non_admin_services_legacy_sync.sql) if these tables are missing.
--
-- Optional hardening: one ledger row per provider + Midtrans transaction_id (NULLs allowed multiple times).
ALTER TABLE t_sawit_hub_payments
  ADD UNIQUE KEY uk_payments_provider_transaction_id (provider, transaction_id);
