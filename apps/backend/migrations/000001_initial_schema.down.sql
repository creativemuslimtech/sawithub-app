START TRANSACTION;

DROP TABLE IF EXISTS t_sawit_hub_field_checklist_run_items;
DROP TABLE IF EXISTS t_sawit_hub_field_checklist_runs;
DROP TABLE IF EXISTS t_sawit_hub_subscription_reminders;
DROP TABLE IF EXISTS t_sawit_hub_email_logs;
DROP TABLE IF EXISTS t_sawit_hub_notifications;
DROP TABLE IF EXISTS t_sawit_hub_payment_events;
DROP TABLE IF EXISTS t_sawit_hub_payments;
DROP TABLE IF EXISTS t_sawit_hub_subscriptions;

COMMIT;
