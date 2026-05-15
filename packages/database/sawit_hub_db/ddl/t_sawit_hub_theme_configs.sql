CREATE TABLE IF NOT EXISTS `t_sawit_hub_theme_configs` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `primary_color` varchar(7) DEFAULT '#16a34a',
  `secondary_color` varchar(7) DEFAULT '#059669',
  `accent_color` varchar(7) DEFAULT '#f97316',
  `background_color` varchar(7) DEFAULT '#ffffff',
  `text_color` varchar(7) DEFAULT '#111827',
  `border_color` varchar(7) DEFAULT '#e5e7eb',
  `dark_mode` tinyint(1) DEFAULT '0',
  `theme_mode` varchar(20) DEFAULT 'light',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  `updated_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_0900_ai_ci;
