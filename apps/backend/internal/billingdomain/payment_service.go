package billingdomain

import (
	"context"
	"crypto/sha512"
	"database/sql"
	"encoding/hex"
	"fmt"
	"log"
	"strings"
	"unicode"

	"SawitHub/internal/config"
	"SawitHub/internal/subscription"
)

type BillingPaymentService struct {
	cfg    *config.Config
	sub    *subscription.BillingSubscriptionDataService
	dbRead *sql.DB
}

func NewBillingPaymentService(cfg *config.Config, sub *subscription.BillingSubscriptionDataService, dbRead *sql.DB) *BillingPaymentService {
	return &BillingPaymentService{cfg: cfg, sub: sub, dbRead: dbRead}
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

func logCallbackSigFailure(orderID string) {
	orderID = strings.TrimSpace(orderID)
	var b strings.Builder
	for _, r := range orderID {
		if unicode.IsLetter(r) || unicode.IsDigit(r) || r == '-' || r == '_' {
			b.WriteRune(r)
		}
	}
	log.Printf("billing: midtrans callback signature verification failed order_id=%s", b.String())
}

func (s *BillingPaymentService) ProcessCallback(ctx context.Context, input subscription.CallbackInput) (map[string]interface{}, error) {
	configured := strings.ToLower(strings.TrimSpace(s.sub.ProviderName()))
	input.Provider = strings.ToLower(strings.TrimSpace(input.Provider))
	if input.Provider == "" {
		input.Provider = configured
	}
	// SEC-01: when this deployment uses Midtrans, verify every callback — do not trust client-supplied `provider` to skip the signature check.
	if configured == "midtrans" {
		if err := verifyMidtransSignature(s.cfg.MidtransServerKey, input); err != nil {
			logCallbackSigFailure(input.OrderID)
			return nil, &ProcessError{HTTPStatus: 401, Message: "signature tidak valid"}
		}
	}
	state, duplicate, err := s.sub.ApplyCallback(ctx, input)
	if err != nil {
		if err == subscription.ErrSubscriptionNotFound() {
			return nil, &ProcessError{HTTPStatus: 404, Message: "subscription tidak ditemukan"}
		}
		return nil, &ProcessError{HTTPStatus: 500, Message: "gagal memproses pembayaran"}
	}
	payload := map[string]interface{}{
		"message":      "callback diproses",
		"subscription": s.sub.BuildStatusView(state),
	}
	if duplicate {
		payload["duplicate"] = true
		payload["message"] = "notifikasi pembayaran sudah diproses sebelumnya"
	}
	return payload, nil
}
