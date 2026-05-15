CREATE TABLE IF NOT EXISTS `t_sawit_admin_audit_logs` (
  `audit_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `admin_user_id` bigint unsigned DEFAULT NULL,
  `action` varchar(120) NOT NULL,
  `target_type` varchar(80) DEFAULT NULL,
  `target_id` varchar(120) DEFAULT NULL,
  `ip_address` varchar(64) DEFAULT NULL,
  `user_agent` varchar(255) DEFAULT NULL,
  `metadata_json` json DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`audit_id`),
  KEY `idx_admin_audit_user` (`admin_user_id`),
  KEY `idx_admin_audit_action` (`action`),
  KEY `idx_admin_audit_created` (`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
