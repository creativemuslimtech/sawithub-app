package billing

import (
	"context"
	"database/sql"

	"sawithub/backend/internal/config"
)

type BillingRevenueDataService struct {
	db     *sql.DB
	dbRead *sql.DB
	cfg    *config.Config
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

func (s *BillingRevenueDataService) Summary(ctx context.Context) (Summary, error) {
	var out Summary
	err := s.dbRead.QueryRowContext(ctx, `SELECT COALESCE(SUM(CASE WHEN payment_status IN ('active','settlement','capture') THEN gross_amount ELSE 0 END),0) FROM t_sawit_hub_payments`).Scan(&out.TotalRevenue)
	return out, err
}
