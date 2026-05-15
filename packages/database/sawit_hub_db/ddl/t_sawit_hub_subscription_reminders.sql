CREATE TABLE IF NOT EXISTS `t_sawit_hub_subscription_reminders` (
  `id` bigint unsigned NOT NULL AUTO_INCREMENT,
  `user_id` bigint unsigned NOT NULL,
  `subscription_id` bigint unsigned DEFAULT NULL,
  `reminder_type` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL,
  `scheduled_for` datetime NOT NULL,
  `sent_at` datetime DEFAULT NULL,
  `status` varchar(32) COLLATE utf8mb4_unicode_ci NOT NULL DEFAULT 'pending',
  `created_at` datetime NOT NULL DEFAULT CURRENT_TIMESTAMP,
  PRIMARY KEY (`id`),
  UNIQUE KEY `uk_subscription_reminders_unique` (`user_id`,`reminder_type`,`scheduled_for`),
  KEY `idx_subscription_reminders_status_schedule` (`status`,`scheduled_for`)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;
