package billingdomain

import (
	"context"
	"database/sql"
	"fmt"
	"strconv"
	"time"
)

// PaymentTransactionItem is a row for GET /api/BillingPaymentService/transactions (BE-05).
type PaymentTransactionItem struct {
	OrderID          string  `json:"order_id"`
	GrossAmount      float64 `json:"gross_amount"`
	Currency         string  `json:"currency"`
	PaymentStatus    string  `json:"payment_status"`
	PaymentType      string  `json:"payment_type,omitempty"`
	TransactionTime  string  `json:"transaction_time"`
}

// ListTransactions returns payment rows for the authenticated user, newest first.
// nextCursor is non-nil when another page exists (opaque page token: next page number as string).
func (s *BillingPaymentService) ListTransactions(ctx context.Context, userID string, page, limit int) ([]PaymentTransactionItem, *string, error) {
	if s.dbRead == nil {
		return nil, nil, fmt.Errorf("read database not configured")
	}
	if userID == "" {
		return nil, nil, fmt.Errorf("user id required")
	}
	if page < 1 {
		page = 1
	}
	if limit < 1 {
		limit = 20
	}
	if limit > 100 {
		limit = 100
	}
	offset := (page - 1) * limit

	rows, err := s.dbRead.QueryContext(ctx, `
		SELECT order_id, gross_amount, currency, payment_status, payment_type,
			COALESCE(paid_at, created_at)
		FROM t_sawit_hub_payments
		WHERE user_id = ? AND deleted_at IS NULL
		ORDER BY created_at DESC, id DESC
		LIMIT ? OFFSET ?`,
		userID, limit+1, offset,
	)
	if err != nil {
		return nil, nil, err
	}
	defer rows.Close()

	var out []PaymentTransactionItem
	for rows.Next() {
		var (
			orderID, currency, status string
			gross                     float64
			payType                   sql.NullString
			ts                        time.Time
		)
		if scanErr := rows.Scan(&orderID, &gross, &currency, &status, &payType, &ts); scanErr != nil {
			return nil, nil, scanErr
		}
		item := PaymentTransactionItem{
			OrderID:         orderID,
			GrossAmount:     gross,
			Currency:        currency,
			PaymentStatus:   status,
			TransactionTime: ts.UTC().Format(time.RFC3339),
		}
		if payType.Valid && payType.String != "" {
			item.PaymentType = payType.String
		}
		out = append(out, item)
	}
	if err := rows.Err(); err != nil {
		return nil, nil, err
	}

	var next *string
	if len(out) > limit {
		out = out[:limit]
		p := strconv.Itoa(page + 1)
		next = &p
	}
	return out, next, nil
}
