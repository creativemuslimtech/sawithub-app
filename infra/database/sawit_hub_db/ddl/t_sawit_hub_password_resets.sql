CREATE TABLE IF NOT EXISTS `t_sawit_hub_password_resets` (
  `id` varchar(36) NOT NULL,
  `email_hash` varchar(64) NOT NULL,
  `code` varchar(6) NOT NULL,
  `expires_at` datetime NOT NULL,
  `used_at` datetime DEFAULT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  KEY `idx_email_hash` (`email_hash`),
  KEY `idx_password_resets_lookup` (`email_hash`,`code`,`used_at`,`created_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
