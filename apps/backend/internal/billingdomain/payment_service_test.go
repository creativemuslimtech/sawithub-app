package billingdomain

import (
	"crypto/sha512"
	"encoding/hex"
	"strings"
	"testing"

	"SawitHub/internal/subscription"
)

func midtransSignatureHex(serverKey string, in subscription.CallbackInput) string {
	payload := in.OrderID + in.StatusCode + in.GrossAmount + serverKey
	sum := sha512.Sum512([]byte(payload))
	return hex.EncodeToString(sum[:])
}

func TestVerifyMidtransSignature_AcceptsValidHex(t *testing.T) {
	t.Parallel()
	sk := "unit-test-server-key"
	in := subscription.CallbackInput{
		OrderID:      "ORDER-abc",
		StatusCode:   "200",
		GrossAmount:  "15000.00",
		SignatureKey: midtransSignatureHex(sk, subscription.CallbackInput{OrderID: "ORDER-abc", StatusCode: "200", GrossAmount: "15000.00"}),
	}
	if err := verifyMidtransSignature(sk, in); err != nil {
		t.Fatalf("expected valid signature: %v", err)
	}
}

func TestVerifyMidtransSignature_RejectWrongKey(t *testing.T) {
	t.Parallel()
	sk := "real-key"
	in := subscription.CallbackInput{
		OrderID:      "ORDER-abc",
		StatusCode:   "200",
		GrossAmount:  "15000.00",
		SignatureKey: midtransSignatureHex("other-key", subscription.CallbackInput{OrderID: "ORDER-abc", StatusCode: "200", GrossAmount: "15000.00"}),
	}
	if err := verifyMidtransSignature(sk, in); err == nil {
		t.Fatal("expected mismatch")
	}
}

func TestVerifyMidtransSignature_RejectTamperedAmount(t *testing.T) {
	t.Parallel()
	sk := "key"
	sig := midtransSignatureHex(sk, subscription.CallbackInput{OrderID: "O1", StatusCode: "200", GrossAmount: "100.00"})
	in := subscription.CallbackInput{
		OrderID: "O1", StatusCode: "200", GrossAmount: "999.00", SignatureKey: sig,
	}
	if err := verifyMidtransSignature(sk, in); err == nil {
		t.Fatal("expected mismatch on gross amount change")
	}
}

func TestVerifyMidtransSignature_CaseInsensitiveHex(t *testing.T) {
	t.Parallel()
	sk := "k"
	in := subscription.CallbackInput{
		OrderID: "a", StatusCode: "b", GrossAmount: "c", SignatureKey: strings.ToUpper(midtransSignatureHex(sk, subscription.CallbackInput{OrderID: "a", StatusCode: "b", GrossAmount: "c"})),
	}
	if err := verifyMidtransSignature(sk, in); err != nil {
		t.Fatalf("EqualFold should accept uppercase hex: %v", err)
	}
}

func TestVerifyMidtransSignature_MissingServerKey(t *testing.T) {
	t.Parallel()
	in := subscription.CallbackInput{OrderID: "x", StatusCode: "200", GrossAmount: "1", SignatureKey: "ab"}
	if err := verifyMidtransSignature("", in); err == nil {
		t.Fatal("expected error for empty server key")
	}
	if err := verifyMidtransSignature("   ", in); err == nil {
		t.Fatal("expected error for whitespace server key")
	}
}
