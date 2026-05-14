-- SawitHub non-admin services schema sync (manual migration)
-- Source reference:
-- 1) ../lagecy/railway-sawithub/mysql_init_schema.sql
-- 2) legacy + current service query usage in internal/*

START TRANSACTION;

-- =========================================================
-- 1) USERS TABLE EXTENSIONS (subscription + trial + presence)
-- =========================================================
-- Idempotent for MySQL 5.7+ / 8.0+ (avoids ADD COLUMN IF NOT EXISTS, which
-- needs MySQL 8.0.12+, and avoids duplicate index errors on re-run).

-- Columns on t_sawit_hub_users (one ALTER per missing column; order preserved).
SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'last_seen_at') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN last_seen_at DATETIME NULL AFTER updated_at',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'subscription_status') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN subscription_status VARCHAR(32) NOT NULL DEFAULT ''trialing'' AFTER role',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'trial_starts_at') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN trial_starts_at DATETIME DEFAULT CURRENT_TIMESTAMP AFTER subscription_status',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'trial_ends_at') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN trial_ends_at DATETIME DEFAULT (DATE_ADD(CURRENT_TIMESTAMP, INTERVAL 14 DAY)) AFTER trial_starts_at',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'subscription_starts_at') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN subscription_starts_at DATETIME NULL AFTER trial_ends_at',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'subscription_ends_at') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN subscription_ends_at DATETIME NULL AFTER subscription_starts_at',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'last_payment_status') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN last_payment_status VARCHAR(64) NOT NULL DEFAULT '''' AFTER subscription_ends_at',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'midtrans_order_id') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN midtrans_order_id VARCHAR(128) NOT NULL DEFAULT '''' AFTER last_payment_status',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'plan_name') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN plan_name VARCHAR(64) NOT NULL DEFAULT '''' AFTER midtrans_order_id',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'plan_price') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN plan_price DECIMAL(12,2) NOT NULL DEFAULT 0 AFTER plan_name',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'billing_exempt') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN billing_exempt TINYINT(1) NOT NULL DEFAULT 0 AFTER plan_price',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'active_farm_limit') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN active_farm_limit INT NOT NULL DEFAULT 1 AFTER billing_exempt',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'current_active_farm_id') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN current_active_farm_id VARCHAR(64) NOT NULL DEFAULT '''' AFTER active_farm_limit',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'trial_farm_create_used') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN trial_farm_create_used INT NOT NULL DEFAULT 0 AFTER current_active_farm_id',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'trial_panen_used') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN trial_panen_used INT NOT NULL DEFAULT 0 AFTER trial_farm_create_used',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'trial_perawatan_used') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN trial_perawatan_used INT NOT NULL DEFAULT 0 AFTER trial_panen_used',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'trial_jadwal_used') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN trial_jadwal_used INT NOT NULL DEFAULT 0 AFTER trial_perawatan_used',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'trial_harvest_used') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN trial_harvest_used INT NOT NULL DEFAULT 0 AFTER trial_jadwal_used',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'trial_report_export_used') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN trial_report_export_used INT NOT NULL DEFAULT 0 AFTER trial_harvest_used',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.COLUMNS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND COLUMN_NAME = 'preferences_json') = 0,
  'ALTER TABLE t_sawit_hub_users ADD COLUMN preferences_json JSON NULL AFTER trial_report_export_used',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

-- Legacy/runtime indexes used by auth + presence (skip if name already exists).
SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND INDEX_NAME = 'idx_username_unique') = 0,
  'ALTER TABLE t_sawit_hub_users ADD UNIQUE KEY idx_username_unique (username)',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND INDEX_NAME = 'idx_email_hash_unique') = 0,
  'ALTER TABLE t_sawit_hub_users ADD UNIQUE KEY idx_email_hash_unique (email_hash)',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND INDEX_NAME = 'idx_deleted_at_last_seen_at') = 0,
  'ALTER TABLE t_sawit_hub_users ADD KEY idx_deleted_at_last_seen_at (deleted_at, last_seen_at)',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND INDEX_NAME = 'idx_subscription_status') = 0,
  'ALTER TABLE t_sawit_hub_users ADD KEY idx_subscription_status (subscription_status)',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

SET @sql := (SELECT IF(
  (SELECT COUNT(*) FROM information_schema.STATISTICS
   WHERE TABLE_SCHEMA = DATABASE() AND TABLE_NAME = 't_sawit_hub_users' AND INDEX_NAME = 'idx_midtrans_order_id') = 0,
  'ALTER TABLE t_sawit_hub_users ADD KEY idx_midtrans_order_id (midtrans_order_id)',
  'SELECT 1')); PREPARE _s FROM @sql; EXECUTE _s; DEALLOCATE PREPARE _s;

-- =========================================================
-- 2) SUBSCRIPTION + PAYMENT TABLES
-- =========================================================
CREATE TABLE IF NOT EXISTS t_sawit_hub_subscriptions (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(32) NOT NULL DEFAULT 'midtrans',
  order_id VARCHAR(128) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending_payment',
  plan_name VARCHAR(64) NOT NULL DEFAULT '',
  plan_price DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'IDR',
  starts_at DATETIME NULL,
  ends_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_subscriptions_order_id (order_id),
  KEY idx_subscriptions_user_status (user_id, status),
  KEY idx_subscriptions_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS t_sawit_hub_payments (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  provider VARCHAR(32) NOT NULL DEFAULT 'midtrans',
  order_id VARCHAR(128) NOT NULL,
  transaction_id VARCHAR(128) DEFAULT NULL,
  payment_status VARCHAR(32) NOT NULL DEFAULT 'pending',
  gross_amount DECIMAL(12,2) NOT NULL DEFAULT 0,
  currency VARCHAR(8) NOT NULL DEFAULT 'IDR',
  payment_type VARCHAR(64) DEFAULT NULL,
  paid_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  UNIQUE KEY uk_payments_order_id (order_id),
  UNIQUE KEY uk_payments_provider_transaction_id (provider, transaction_id),
  KEY idx_payments_user_status (user_id, payment_status),
  KEY idx_payments_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS t_sawit_hub_payment_events (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  provider VARCHAR(32) NOT NULL,
  event_key VARCHAR(191) NOT NULL,
  order_id VARCHAR(128) NOT NULL,
  status VARCHAR(64) NOT NULL,
  payload JSON NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_payment_events_provider_event (provider, event_key),
  KEY idx_payment_events_order_id (order_id)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 3) NOTIFICATION + EMAIL LOG + REMINDER TABLES
-- =========================================================
CREATE TABLE IF NOT EXISTS t_sawit_hub_notifications (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  type VARCHAR(64) NOT NULL,
  title VARCHAR(255) NOT NULL,
  message TEXT NOT NULL,
  action_url VARCHAR(255) DEFAULT NULL,
  is_read TINYINT(1) NOT NULL DEFAULT 0,
  read_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id),
  KEY idx_notifications_user_created (user_id, created_at),
  KEY idx_notifications_user_read (user_id, is_read),
  KEY idx_notifications_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS t_sawit_hub_email_logs (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED DEFAULT NULL,
  event_key VARCHAR(191) NOT NULL,
  email VARCHAR(191) NOT NULL,
  type VARCHAR(64) NOT NULL,
  subject VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  provider VARCHAR(32) DEFAULT NULL,
  error_message TEXT NULL,
  sent_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_email_logs_event_key (event_key),
  KEY idx_email_logs_user_created (user_id, created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS t_sawit_hub_subscription_reminders (
  id BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  subscription_id BIGINT UNSIGNED NULL,
  reminder_type VARCHAR(32) NOT NULL,
  scheduled_for DATETIME NOT NULL,
  sent_at DATETIME NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (id),
  UNIQUE KEY uk_subscription_reminders_unique (user_id, reminder_type, scheduled_for),
  KEY idx_subscription_reminders_status_schedule (status, scheduled_for)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- =========================================================
-- 4) FIELD CHECKLIST TABLES
-- =========================================================
CREATE TABLE IF NOT EXISTS t_sawit_hub_field_checklist_runs (
  id_run BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  user_id BIGINT UNSIGNED NOT NULL,
  id_lahan BIGINT UNSIGNED NOT NULL,
  title VARCHAR(255) NOT NULL,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  task_date DATE NOT NULL,
  completed_at DATETIME NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  deleted_at DATETIME NULL,
  PRIMARY KEY (id_run),
  KEY idx_checklist_runs_user_date (user_id, task_date),
  KEY idx_checklist_runs_status (status),
  KEY idx_checklist_runs_deleted_at (deleted_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

CREATE TABLE IF NOT EXISTS t_sawit_hub_field_checklist_run_items (
  id_item BIGINT UNSIGNED NOT NULL AUTO_INCREMENT,
  id_run BIGINT UNSIGNED NOT NULL,
  item_label VARCHAR(255) NOT NULL,
  item_order INT NOT NULL DEFAULT 0,
  is_required TINYINT(1) NOT NULL DEFAULT 1,
  status VARCHAR(32) NOT NULL DEFAULT 'pending',
  note TEXT NULL,
  created_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP,
  updated_at DATETIME NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (id_item),
  KEY idx_checklist_items_run (id_run)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

COMMIT;
