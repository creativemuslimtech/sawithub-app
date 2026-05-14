package subscription

import "testing"

func TestPaymentCallbackEventKey(t *testing.T) {
	t.Parallel()
	got := paymentCallbackEventKey(CallbackInput{
		TransactionID:     "txn-1",
		OrderID:           "ord-1",
		TransactionStatus: "settlement",
		StatusCode:        "200",
	})
	if got != "txn-1|settlement" {
		t.Fatalf("expected transaction id key, got %q", got)
	}
	got = paymentCallbackEventKey(CallbackInput{
		OrderID:           "ord-2",
		TransactionStatus: "pending",
		StatusCode:        "201",
	})
	if got != "ord-2|pending|201" {
		t.Fatalf("fallback key: got %q", got)
	}
}

func TestPaymentCallbackProvider(t *testing.T) {
	t.Parallel()
	if p := paymentCallbackProvider(CallbackInput{Provider: " Midtrans "}, "mock"); p != "midtrans" {
		t.Fatalf("got %q", p)
	}
	if p := paymentCallbackProvider(CallbackInput{}, "mock"); p != "mock" {
		t.Fatalf("fallback: got %q", p)
	}
}

func TestParseGrossAmountIDR(t *testing.T) {
	t.Parallel()
	if v := parseGrossAmountIDR("12,500.50"); v != 12500.5 {
		t.Fatalf("got %v", v)
	}
	if v := parseGrossAmountIDR(""); v != 0 {
		t.Fatalf("got %v", v)
	}
}
