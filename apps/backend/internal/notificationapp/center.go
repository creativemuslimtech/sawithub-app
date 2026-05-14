package notificationapp

import (
	"context"
	"errors"

	"SawitHub/internal/notification"
)

var ErrUnavailable = errors.New("notification service unavailable")

type NotificationCenterService struct {
	svc *notification.NotificationDeliveryService
}

func NewNotificationCenterService(svc *notification.NotificationDeliveryService) *NotificationCenterService {
	return &NotificationCenterService{svc: svc}
}

func (c *NotificationCenterService) Raw() *notification.NotificationDeliveryService {
	if c == nil {
		return nil
	}
	return c.svc
}

func (c *NotificationCenterService) Available() bool {
	return c != nil && c.svc != nil
}

func (c *NotificationCenterService) List(ctx context.Context, userID string, limit int) ([]notification.Notification, error) {
	if !c.Available() {
		return nil, ErrUnavailable
	}
	return c.svc.List(ctx, userID, limit)
}

func (c *NotificationCenterService) MarkRead(ctx context.Context, userID, id string) error {
	if !c.Available() {
		return ErrUnavailable
	}
	return c.svc.MarkRead(ctx, userID, id)
}

func (c *NotificationCenterService) MarkAllRead(ctx context.Context, userID string) error {
	if !c.Available() {
		return ErrUnavailable
	}
	return c.svc.MarkAllRead(ctx, userID)
}

func (c *NotificationCenterService) DeleteReadNotifications(ctx context.Context, userID string) error {
	if !c.Available() {
		return ErrUnavailable
	}
	return c.svc.DeleteReadNotifications(ctx, userID)
}
