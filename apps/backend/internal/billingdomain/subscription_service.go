package billingdomain

import (
	"context"

	"sawithub/backend/internal/subscription"
)

type BillingSubscriptionService struct {
	sub *subscription.BillingSubscriptionDataService
}

func NewBillingSubscriptionService(sub *subscription.BillingSubscriptionDataService) *BillingSubscriptionService {
	return &BillingSubscriptionService{sub: sub}
}

func (s *BillingSubscriptionService) SubscriptionPayload(ctx context.Context, userID string) (map[string]interface{}, error) {
	state, err := s.sub.GetStatus(ctx, userID)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{"subscription": s.sub.BuildStatusView(state)}, nil
}

func (s *BillingSubscriptionService) CheckoutPayload(ctx context.Context, identity subscription.UserIdentity, returnURL string) (map[string]interface{}, error) {
	result, state, err := s.sub.Checkout(ctx, identity, returnURL)
	if err != nil {
		return nil, err
	}
	return map[string]interface{}{
		"checkout":     result,
		"subscription": s.sub.BuildStatusView(state),
	}, nil
}

func (s *BillingSubscriptionService) ProviderName() string {
	return s.sub.ProviderName()
}
