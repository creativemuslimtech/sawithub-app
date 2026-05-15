package subscription

import (
	"bytes"
	"encoding/base64"
	"encoding/json"
	"fmt"
	"net/http"
	"net/url"
	"strings"
	"time"
)

type MidtransProvider struct {
	ServerKey    string
	ClientKey    string
	IsProduction bool
}

func NewMidtransProvider(serverKey, clientKey string, isProduction bool) *MidtransProvider {
	return &MidtransProvider{ServerKey: serverKey, ClientKey: clientKey, IsProduction: isProduction}
}
func (p *MidtransProvider) Name() string { return "midtrans" }

func (p *MidtransProvider) CreateCheckout(req CheckoutRequest) (CheckoutResult, error) {
	orderID := fmt.Sprintf("ORDER-%d-%s", time.Now().Unix(), safeOrderSuffix(req.UserID))
	baseURL := "https://app.sandbox.midtrans.com"
	if p.IsProduction {
		baseURL = "https://app.midtrans.com"
	}
	snapReq := map[string]interface{}{
		"transaction_details": map[string]interface{}{"order_id": orderID, "gross_amount": int(req.PlanPrice)},
		"customer_details":    map[string]interface{}{"first_name": req.FullName, "email": req.Email},
		"item_details":        []map[string]interface{}{{"id": "subscription-pro", "price": int(req.PlanPrice), "quantity": 1, "name": req.PlanName}},
		"callbacks":           map[string]interface{}{"finish": req.ReturnURL},
	}
	payload, _ := json.Marshal(snapReq)
	httpReq, err := http.NewRequest("POST", baseURL+"/snap/v1/transactions", bytes.NewBuffer(payload))
	if err != nil {
		return CheckoutResult{}, err
	}
	auth := base64.StdEncoding.EncodeToString([]byte(p.ServerKey + ":"))
	httpReq.Header.Set("Authorization", "Basic "+auth)
	httpReq.Header.Set("Content-Type", "application/json")
	httpReq.Header.Set("Accept", "application/json")
	resp, err := (&http.Client{Timeout: 30 * time.Second}).Do(httpReq)
	if err != nil {
		return CheckoutResult{}, fmt.Errorf("failed to call Midtrans Snap API: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusCreated && resp.StatusCode != http.StatusOK {
		return CheckoutResult{}, fmt.Errorf("midtrans Snap API error: status %d", resp.StatusCode)
	}
	var snapResp struct {
		Token       string `json:"token"`
		RedirectURL string `json:"redirect_url"`
	}
	if err := json.NewDecoder(resp.Body).Decode(&snapResp); err != nil {
		return CheckoutResult{}, fmt.Errorf("failed to decode Midtrans response: %w", err)
	}
	return CheckoutResult{
		Provider: p.Name(), OrderID: orderID, SnapToken: snapResp.Token, SnapURL: snapResp.RedirectURL, PaymentURL: snapResp.RedirectURL,
		Status: string(StatusPendingPayment), GrossAmount: req.PlanPrice, Currency: req.Currency, Description: fmt.Sprintf("Subscription: %s", req.PlanName),
	}, nil
}

func (p *MidtransProvider) GetTransactionStatus(orderID string) (CallbackInput, error) {
	orderID = strings.TrimSpace(orderID)
	if orderID == "" {
		return CallbackInput{}, fmt.Errorf("order_id is required")
	}
	baseURL := "https://api.sandbox.midtrans.com"
	if p.IsProduction {
		baseURL = "https://api.midtrans.com"
	}
	endpoint := fmt.Sprintf("%s/v2/%s/status", baseURL, url.PathEscape(orderID))
	httpReq, err := http.NewRequest("GET", endpoint, nil)
	if err != nil {
		return CallbackInput{}, err
	}
	auth := base64.StdEncoding.EncodeToString([]byte(p.ServerKey + ":"))
	httpReq.Header.Set("Authorization", "Basic "+auth)
	httpReq.Header.Set("Accept", "application/json")
	resp, err := (&http.Client{Timeout: 30 * time.Second}).Do(httpReq)
	if err != nil {
		return CallbackInput{}, fmt.Errorf("failed to call Midtrans status API: %w", err)
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusOK {
		return CallbackInput{}, fmt.Errorf("midtrans status API error: status %d", resp.StatusCode)
	}
	var out struct {
		OrderID, TransactionID, TransactionStatus, FraudStatus, StatusCode, GrossAmount, PaymentType string
	}
	if err := json.NewDecoder(resp.Body).Decode(&out); err != nil {
		return CallbackInput{}, fmt.Errorf("failed to decode Midtrans status response: %w", err)
	}
	if strings.TrimSpace(out.OrderID) == "" {
		out.OrderID = orderID
	}
	return CallbackInput{
		Provider: p.Name(), OrderID: out.OrderID, TransactionID: out.TransactionID, TransactionStatus: out.TransactionStatus,
		FraudStatus: out.FraudStatus, StatusCode: out.StatusCode, GrossAmount: out.GrossAmount, PaymentType: out.PaymentType,
	}, nil
}

func safeOrderSuffix(userID string) string {
	if len(userID) <= 8 {
		return userID
	}
	return userID[:8]
}
