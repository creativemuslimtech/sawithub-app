package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"sawithub/backend/internal/billingdomain"
	mw "sawithub/backend/internal/middleware"
	"sawithub/backend/internal/subscription"
	"github.com/go-chi/chi/v5"
)

func (h *Handler) GetSubscriptionStatus(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	payload, err := h.billingSubscription.SubscriptionPayload(r.Context(), userID)
	if err != nil {
		jsonError(w, "gagal memuat status subscription", http.StatusInternalServerError)
		return
	}
	_ = json.NewEncoder(w).Encode(payload)
}

func (h *Handler) CheckoutSubscription(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	email, fullName, username, _ := h.getUserContact(r.Context(), userID)
	var req struct {
		ReturnURL string `json:"return_url"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	payload, err := h.billingSubscription.CheckoutPayload(r.Context(), subscription.UserIdentity{
		UserID: userID, Email: email, Username: username, FullName: fullName,
	}, strings.TrimSpace(req.ReturnURL))
	if err != nil {
		jsonError(w, "gagal membuat checkout", http.StatusBadGateway)
		return
	}
	_ = json.NewEncoder(w).Encode(payload)
}

func (h *Handler) PaymentCallback(w http.ResponseWriter, r *http.Request) {
	var input subscription.CallbackInput
	if err := json.NewDecoder(r.Body).Decode(&input); err != nil {
		jsonError(w, "invalid callback", http.StatusBadRequest)
		return
	}
	payload, err := h.billingPayment.ProcessCallback(r.Context(), input)
	if err != nil {
		var pe *billingdomain.ProcessError
		if errors.As(err, &pe) {
			jsonError(w, pe.Message, pe.HTTPStatus)
			return
		}
		jsonError(w, "gagal memproses pembayaran", http.StatusInternalServerError)
		return
	}
	_ = json.NewEncoder(w).Encode(payload)
}

func (h *Handler) MockPaymentCallback(w http.ResponseWriter, r *http.Request) {
	if strings.ToLower(strings.TrimSpace(h.billingSubscription.ProviderName())) != "mock" {
		jsonError(w, "mock callback tidak tersedia di environment ini", http.StatusNotFound)
		return
	}
	h.PaymentCallback(w, r)
}

func chiURLParam(r *http.Request, key string) string { return chi.URLParam(r, key) }
