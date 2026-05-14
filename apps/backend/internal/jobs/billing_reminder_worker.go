package jobs

import (
	"context"
	"database/sql"
	"log"
	"time"

	"SawitHub/internal/config"
	"SawitHub/internal/mailer"
	"SawitHub/internal/notification"
	"SawitHub/internal/subscription"
)

type BillingReminderWorker struct {
	db            *sql.DB
	cfg           *config.Config
	mailer        *mailer.Mailer
	notifications *notification.NotificationDeliveryService
	subscriptions *subscription.BillingSubscriptionDataService
}

func NewBillingReminderWorker(db *sql.DB, cfg *config.Config, mailerSvc *mailer.Mailer, notifSvc *notification.NotificationDeliveryService, subSvc *subscription.BillingSubscriptionDataService) *BillingReminderWorker {
	return &BillingReminderWorker{db: db, cfg: cfg, mailer: mailerSvc, notifications: notifSvc, subscriptions: subSvc}
}

func (j *BillingReminderWorker) Start(ctx context.Context) {
	if j == nil || !j.cfg.ReminderJobEnabled || j.notifications == nil || j.mailer == nil || !j.mailer.Enabled() {
		return
	}
	go func() {
		ticker := time.NewTicker(j.cfg.ReminderJobInterval)
		defer ticker.Stop()
		for {
			select {
			case <-ctx.Done():
				return
			case <-ticker.C:
				j.RunOnce(ctx)
			}
		}
	}()
}

func (j *BillingReminderWorker) RunOnce(ctx context.Context) {
	due, err := j.notifications.DueReminders(ctx, time.Now().UTC(), 100)
	if err != nil {
		log.Printf("WARN: billing reminder scan failed: %v", err)
		return
	}
	for _, reminder := range due {
		claimed, err := j.notifications.ClaimReminder(ctx, reminder.ID)
		if err != nil || !claimed {
			continue
		}
		_ = j.notifications.MarkReminderSent(ctx, reminder.ID)
	}
}
