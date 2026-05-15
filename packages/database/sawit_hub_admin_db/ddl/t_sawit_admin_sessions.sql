CREATE TABLE IF NOT EXISTS `t_sawit_admin_sessions` (
  `session_id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `admin_user_id` bigint unsigned NOT NULL,
  `jti` varchar(64) NOT NULL,
  `token_issued_at` datetime NOT NULL,
  `token_expires_at` datetime NOT NULL,
  `revoked_at` datetime DEFAULT NULL,
  `revoke_reason` varchar(100) DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`session_id`),
  UNIQUE KEY `idx_admin_session_jti` (`jti`),
  KEY `idx_admin_session_user` (`admin_user_id`),
  KEY `idx_admin_session_revoked` (`revoked_at`),
  KEY `idx_admin_session_expires` (`token_expires_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
