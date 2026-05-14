-- DE-13 (senior database engineer): composite indexes aligned with reporting queries
-- in internal/reporting/farm_finance.go (user_id + date range + deleted_at IS NULL),
-- pendapatan fallback filters with id_lahan, payments list by user + time, harga TBS by user + date.
-- Referential integrity remains application-enforced (no FKs).

ALTER TABLE t_sawit_hub_panen
  ADD INDEX idx_panen_user_date_deleted (user_id, tanggal_panen, deleted_at);

ALTER TABLE t_sawit_hub_perawatan
  ADD INDEX idx_perawatan_user_date_deleted (user_id, tanggal_perawatan, deleted_at);

ALTER TABLE t_sawit_hub_pendapatan
  ADD INDEX idx_pendapatan_user_date_lahan_deleted (user_id, tanggal_panen, id_lahan, deleted_at);

ALTER TABLE t_sawit_hub_payments
  ADD INDEX idx_payments_user_created (user_id, created_at);

ALTER TABLE t_sawit_hub_harga_tbs
  ADD INDEX idx_harga_tbs_user_tanggal (user_id, tanggal);
