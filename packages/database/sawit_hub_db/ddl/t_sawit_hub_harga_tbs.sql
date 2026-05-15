CREATE TABLE IF NOT EXISTS `t_sawit_hub_harga_tbs` (
  `id_harga` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `tanggal` date NOT NULL,
  `harga_per_kg` decimal(10,2) NOT NULL,
  `sumber` varchar(100) DEFAULT NULL,
  `catatan` text,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_harga`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_tanggal` (`tanggal`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
