package subscription

import (
	"fmt"
	"time"
)

type MockProvider struct{}

func NewMockProvider() *MockProvider { return &MockProvider{} }
func (p *MockProvider) Name() string { return "mock" }

func (p *MockProvider) CreateCheckout(req CheckoutRequest) (CheckoutResult, error) {
	orderID := fmt.Sprintf("mock_%s_%d", req.UserID, time.Now().Unix())
	return CheckoutResult{
		Provider:    p.Name(),
		OrderID:     orderID,
		PaymentURL:  fmt.Sprintf("/subscription?order_id=%s&provider=mock", orderID),
		Status:      string(StatusPendingPayment),
		GrossAmount: req.PlanPrice,
		Currency:    req.Currency,
		Description: "Mock payment session for development/staging",
	}, nil
}
