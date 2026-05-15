package billingdomain

import (
	"context"

	"sawithub/backend/internal/billing"
)

type BillingRevenueService struct {
	inner *billing.BillingRevenueDataService
}

func NewBillingRevenueService(inner *billing.BillingRevenueDataService) *BillingRevenueService {
	return &BillingRevenueService{inner: inner}
}

func (s *BillingRevenueService) Summary(ctx context.Context) (billing.Summary, error) {
	return s.inner.Summary(ctx)
}
