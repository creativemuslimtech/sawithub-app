package billingdomain

import (
	"context"
	"crypto/sha512"
	"encoding/hex"
	"fmt"
	"strings"

	"sawithub/backend/internal/config"
	"sawithub/backend/internal/subscription"
)

type BillingPaymentService struct {
	cfg *config.Config
	sub *subscription.BillingSubscriptionDataService
}

func NewBillingPaymentService(cfg *config.Config, sub *subscription.BillingSubscriptionDataService) *BillingPaymentService {
	return &BillingPaymentService{cfg: cfg, sub: sub}
}

func verifyMidtransSignature(serverKey string, input subscription.CallbackInput) error {
	if strings.TrimSpace(serverKey) == "" {
		return fmt.Errorf("server key missing")
	}
	payload := input.OrderID + input.StatusCode + input.GrossAmount + serverKey
	sum := sha512.Sum512([]byte(payload))
	expected := hex.EncodeToString(sum[:])
	if !strings.EqualFold(expected, strings.TrimSpace(input.SignatureKey)) {
		return fmt.Errorf("signature mismatch")
	}
	return nil
}

func (s *BillingPaymentService) ProcessCallback(ctx context.Context, input subscription.CallbackInput) (map[string]interface{}, error) {
	input.Provider = strings.ToLower(strings.TrimSpace(input.Provider))
	if input.Provider == "" {
		input.Provider = strings.ToLower(strings.TrimSpace(s.sub.ProviderName()))
	}
	if input.Provider == "midtrans" {
		if err := verifyMidtransSignature(s.cfg.MidtransServerKey, input); err != nil {
			verified, lookupErr := s.sub.LookupTransactionStatus(input.OrderID)
			if lookupErr != nil {
				return nil, &ProcessError{HTTPStatus: 401, Message: "signature tidak valid"}
			}
			input = verified
		}
	}
	state, err := s.sub.ApplyCallback(ctx, input)
	if err != nil {
		if err == subscription.ErrSubscriptionNotFound() {
			return nil, &ProcessError{HTTPStatus: 404, Message: "subscription tidak ditemukan"}
		}
		return nil, &ProcessError{HTTPStatus: 500, Message: "gagal memproses pembayaran"}
	}
	return map[string]interface{}{
		"message":      "callback diproses",
		"subscription": s.sub.BuildStatusView(state),
	}, nil
}
