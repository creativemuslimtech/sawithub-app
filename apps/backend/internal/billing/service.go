package billing

import (
	"context"
	"database/sql"
	"sync"
	"time"

	"SawitHub/internal/config"
)

type BillingRevenueDataService struct {
	db     *sql.DB
	dbRead *sql.DB
	cfg    *config.Config

	revenueMetaOnce    sync.Once
	revenueHasEnvCol bool
}

func NewBillingRevenueDataService(db, dbRead *sql.DB, cfg *config.Config) *BillingRevenueDataService {
	if dbRead == nil {
		dbRead = db
	}
	return &BillingRevenueDataService{db: db, dbRead: dbRead, cfg: cfg}
}

type Summary struct {
	TotalRevenue float64 `json:"total_revenue"`
}

func (s *BillingRevenueDataService) revenueExtraWhere(ctx context.Context) string {
	s.revenueMetaOnce.Do(func() {
		bg, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		var n int
		_ = s.dbRead.QueryRowContext(bg,
			`SELECT COUNT(*) FROM information_schema.COLUMNS
			 WHERE TABLE_SCHEMA = DATABASE()
			   AND TABLE_NAME = 't_sawit_hub_payments'
			   AND COLUMN_NAME = 'environment'`).Scan(&n)
		if n > 0 {
			s.revenueHasEnvCol = true
		}
	})
	w := ` AND LOWER(COALESCE(provider,'')) != 'mock'
		   AND (payment_type IS NULL OR LOWER(TRIM(payment_type)) != 'mock')
		   AND SUBSTRING(order_id, 1, 5) != 'mock_'`
	if s.revenueHasEnvCol {
		w += `
		   AND LOWER(COALESCE(environment,'')) = 'production'`
	}
	return w
}

func (s *BillingRevenueDataService) Summary(ctx context.Context) (Summary, error) {
	var out Summary
	xw := s.revenueExtraWhere(ctx)
	err := s.dbRead.QueryRowContext(ctx,
		`SELECT COALESCE(SUM(CASE WHEN payment_status IN ('active','settlement','capture') THEN gross_amount ELSE 0 END),0)
		 FROM t_sawit_hub_payments
		 WHERE deleted_at IS NULL`+xw,
	).Scan(&out.TotalRevenue)
	return out, err
}
