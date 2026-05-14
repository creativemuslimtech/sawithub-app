INSERT INTO `t_sawit_hub_theme_configs`
  (primary_color, secondary_color, accent_color, background_color, text_color, border_color, theme_mode)
SELECT
  '#16a34a', '#059669', '#f97316', '#ffffff', '#111827', '#e5e7eb', 'light'
WHERE NOT EXISTS (
  SELECT 1 FROM `t_sawit_hub_theme_configs`
);
