package notification

import (
	"context"
	"database/sql"
	"fmt"
	"strings"
	"time"
)

type Notification struct {
	ID, UserID, Type, Title, Message, ActionURL, ReadAt, CreatedAt string
	IsRead                                                         bool
}
type Reminder struct {
	ID, UserID, SubscriptionID, ReminderType, Status string
	ScheduledFor                                     time.Time
	SentAt                                           sql.NullTime
	CreatedAt                                        time.Time
}
type NotificationDeliveryService struct {
	db     *sql.DB
	dbRead *sql.DB
}

func NewNotificationDeliveryService(db, dbRead *sql.DB) *NotificationDeliveryService {
	if dbRead == nil {
		dbRead = db
	}
	return &NotificationDeliveryService{db: db, dbRead: dbRead}
}

func (s *NotificationDeliveryService) CreateNotification(ctx context.Context, userID, typ, title, message, actionURL string) error {
	if strings.TrimSpace(userID) == "" || strings.TrimSpace(typ) == "" {
		return nil
	}
	_, err := s.db.ExecContext(ctx, `INSERT IGNORE INTO t_sawit_hub_notifications (user_id,type,title,message,action_url,is_read,created_at) VALUES (?,?,?,?,?,0,NOW())`,
		userID, typ, title, message, actionURL)
	return err
}
func (s *NotificationDeliveryService) List(ctx context.Context, userID string, limit int) ([]Notification, error) {
	if limit <= 0 {
		limit = 20
	}
	rows, err := s.dbRead.QueryContext(ctx, `SELECT id,user_id,type,title,message,COALESCE(action_url,''),is_read,read_at,created_at FROM t_sawit_hub_notifications WHERE user_id=? AND deleted_at IS NULL ORDER BY created_at DESC LIMIT ?`, userID, limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	out := make([]Notification, 0, limit)
	for rows.Next() {
		var n Notification
		var readAt, createdAt sql.NullTime
		if err := rows.Scan(&n.ID, &n.UserID, &n.Type, &n.Title, &n.Message, &n.ActionURL, &n.IsRead, &readAt, &createdAt); err != nil {
			return nil, err
		}
		if readAt.Valid {
			n.ReadAt = readAt.Time.UTC().Format(time.RFC3339)
		}
		if createdAt.Valid {
			n.CreatedAt = createdAt.Time.UTC().Format(time.RFC3339)
		}
		out = append(out, n)
	}
	return out, rows.Err()
}
func (s *NotificationDeliveryService) MarkRead(ctx context.Context, userID, id string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE t_sawit_hub_notifications SET is_read=1, read_at=COALESCE(read_at,NOW()) WHERE id=? AND user_id=?`, id, userID)
	return err
}
func (s *NotificationDeliveryService) MarkAllRead(ctx context.Context, userID string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE t_sawit_hub_notifications SET is_read=1, read_at=COALESCE(read_at,NOW()) WHERE user_id=? AND is_read=0`, userID)
	return err
}
func (s *NotificationDeliveryService) DeleteReadNotifications(ctx context.Context, userID string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE t_sawit_hub_notifications SET deleted_at=NOW() WHERE user_id=? AND is_read=1 AND deleted_at IS NULL`, userID)
	return err
}
func (s *NotificationDeliveryService) DeleteByTypeAndActionURL(ctx context.Context, userID, typ, actionURL string) error {
	_, err := s.db.ExecContext(ctx, `DELETE FROM t_sawit_hub_notifications WHERE user_id=? AND type=? AND COALESCE(action_url,'')=COALESCE(?, '')`, userID, typ, actionURL)
	return err
}
func (s *NotificationDeliveryService) LogEmail(ctx context.Context, userID, eventKey, email, typ, subject, provider, status, errMsg string) error {
	if strings.TrimSpace(eventKey) == "" {
		eventKey = fmt.Sprintf("%s:%s:%s", userID, typ, subject)
	}
	_, err := s.db.ExecContext(ctx, `INSERT INTO t_sawit_hub_email_logs (user_id,event_key,email,type,subject,status,provider,error_message,sent_at,created_at) VALUES (?,?,?,?,?,?,?,?,?,NOW()) ON DUPLICATE KEY UPDATE status=VALUES(status),provider=VALUES(provider),error_message=VALUES(error_message),sent_at=VALUES(sent_at)`,
		nullString(userID), eventKey, email, typ, subject, status, provider, errMsg, time.Now().UTC())
	return err
}
func (s *NotificationDeliveryService) ReserveEmailEvent(ctx context.Context, userID, eventKey, email, typ, subject, provider string) (bool, error) {
	res, err := s.db.ExecContext(ctx, `INSERT IGNORE INTO t_sawit_hub_email_logs (user_id,event_key,email,type,subject,status,provider,sent_at,created_at) VALUES (?,?,?,?,?,'pending',?,NULL,NOW())`,
		nullString(userID), eventKey, email, typ, subject, provider)
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}
func (s *NotificationDeliveryService) UpsertReminder(ctx context.Context, userID string, subscriptionID any, reminderType string, scheduledFor time.Time) (bool, error) {
	res, err := s.db.ExecContext(ctx, `INSERT IGNORE INTO t_sawit_hub_subscription_reminders (user_id,subscription_id,reminder_type,scheduled_for,status,created_at) VALUES (?,?,?,?, 'pending', NOW())`,
		userID, subscriptionID, reminderType, scheduledFor.UTC())
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}
func (s *NotificationDeliveryService) DueReminders(ctx context.Context, before time.Time, limit int) ([]Reminder, error) {
	if limit <= 0 {
		limit = 50
	}
	rows, err := s.dbRead.QueryContext(ctx, `SELECT id,user_id,COALESCE(subscription_id,0),reminder_type,scheduled_for,sent_at,status,created_at FROM t_sawit_hub_subscription_reminders WHERE status='pending' AND scheduled_for<=? ORDER BY scheduled_for ASC LIMIT ?`, before.UTC(), limit)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []Reminder
	for rows.Next() {
		var it Reminder
		var subID sql.NullInt64
		if err := rows.Scan(&it.ID, &it.UserID, &subID, &it.ReminderType, &it.ScheduledFor, &it.SentAt, &it.Status, &it.CreatedAt); err != nil {
			return nil, err
		}
		if subID.Valid {
			it.SubscriptionID = fmt.Sprintf("%d", subID.Int64)
		}
		out = append(out, it)
	}
	return out, rows.Err()
}
func (s *NotificationDeliveryService) MarkReminderSent(ctx context.Context, id string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE t_sawit_hub_subscription_reminders SET status='sent', sent_at=COALESCE(sent_at,NOW()) WHERE id=?`, id)
	return err
}
func (s *NotificationDeliveryService) MarkReminderFailed(ctx context.Context, id, reason string) error {
	_, _ = reason, id
	_, err := s.db.ExecContext(ctx, `UPDATE t_sawit_hub_subscription_reminders SET status='failed' WHERE id=?`, id)
	return err
}
func (s *NotificationDeliveryService) ClaimReminder(ctx context.Context, id string) (bool, error) {
	res, err := s.db.ExecContext(ctx, `UPDATE t_sawit_hub_subscription_reminders SET status='processing' WHERE id=? AND status='pending'`, id)
	if err != nil {
		return false, err
	}
	n, _ := res.RowsAffected()
	return n > 0, nil
}
func nullString(v string) interface{} {
	if strings.TrimSpace(v) == "" {
		return nil
	}
	return v
}
