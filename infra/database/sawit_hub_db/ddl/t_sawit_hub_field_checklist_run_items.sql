CREATE TABLE IF NOT EXISTS `t_sawit_hub_field_checklist_run_items` (
  `id_item` bigint unsigned NOT NULL AUTO_INCREMENT,
  `id_run` bigint unsigned NOT NULL,
  `item_label` varchar(255) COLLATE utf8mb4_unicode_ci NOT NULL,
  `item_order` int NOT NULL DEFAULT '0',
  `is_required` tinyint(1) NOT NULL DEFAULT '1',
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `note` text COLLATE utf8mb4_unicode_ci,
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id_item`),
  KEY `idx_checklist_items_run` (`id_run`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
