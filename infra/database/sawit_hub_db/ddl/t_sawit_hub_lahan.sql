CREATE TABLE IF NOT EXISTS `t_sawit_hub_lahan` (
  `id_lahan` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `nama_kebun` varchar(100) NOT NULL,
  `jenis_bibit` varchar(50) NOT NULL,
  `lokasi` varchar(255) NOT NULL,
  `luas_ha` decimal(10,2) NOT NULL,
  `jumlah_pohon` int NOT NULL,
  `tahun_tanam` year NOT NULL,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  `deleted_at` datetime DEFAULT NULL,
  PRIMARY KEY (`id_lahan`),
  KEY `idx_user_id` (`user_id`),
  KEY `idx_user_id_deleted_at` (`user_id`,`deleted_at`),
  KEY `idx_deleted_at` (`deleted_at`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
