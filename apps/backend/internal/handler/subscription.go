package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strings"

	"SawitHub/internal/billingdomain"
	mw "SawitHub/internal/middleware"
	"SawitHub/internal/subscription"
	"github.com/go-chi/chi/v5"
)

func (h *Handler) PutBillingSubscriptionActiveFarm(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	var req struct {
		IDLahan string `json:"id_lahan"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}
	id := strings.TrimSpace(req.IDLahan)
	if id == "" {
		if err := h.subscription.SetCurrentActiveFarmID(r.Context(), userID, ""); err != nil {
			jsonError(w, "gagal menyimpan kebun aktif", http.StatusInternalServerError)
			return
		}
		st, err := h.subscription.GetStatus(r.Context(), userID)
		if err != nil {
			jsonError(w, "gagal memuat status", http.StatusInternalServerError)
			return
		}
		w.Header().Set("Content-Type", "application/json")
		_ = json.NewEncoder(w).Encode(map[string]interface{}{
			"message":                "kebun aktif diperbarui",
			"current_active_farm_id": strings.TrimSpace(st.CurrentActiveFarmID),
		})
		return
	}
	lahan, err := h.farmCorePlot.List(r.Context(), userID)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	ok := false
	for _, l := range lahan {
		if strings.TrimSpace(l.IDLahan) == id {
			ok = true
			break
		}
	}
	if !ok {
		jsonError(w, "lahan tidak ditemukan", http.StatusNotFound)
		return
	}
	if err := h.subscription.SetCurrentActiveFarmID(r.Context(), userID, id); err != nil {
		jsonError(w, "gagal menyimpan kebun aktif", http.StatusInternalServerError)
		return
	}
	st, err := h.subscription.GetStatus(r.Context(), userID)
	if err != nil {
		jsonError(w, "gagal memuat status", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{
		"message":                "kebun aktif diperbarui",
		"current_active_farm_id": strings.TrimSpace(st.CurrentActiveFarmID),
	})
}

func (h *Handler) GetSubscriptionStatus(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	payload, err := h.billingSubscription.SubscriptionPayload(r.Context(), userID)
	if err != nil {
		jsonError(w, "gagal memuat status subscription", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payload)
}

func (h *Handler) CheckoutSubscription(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	email, fullName, username, _ := h.getUserContact(r.Context(), userID)
	var req struct {
		ReturnURL         string `json:"return_url"`
		ReturnURLUnfinish string `json:"return_url_unfinish"`
		ReturnURLError    string `json:"return_url_error"`
	}
	_ = json.NewDecoder(r.Body).Decode(&req)
	urls := subscription.CheckoutURLs{
		Finish:   strings.TrimSpace(req.ReturnURL),
		Unfinish: strings.TrimSpace(req.ReturnURLUnfinish),
		Error:    strings.TrimSpace(req.ReturnURLError),
	}
	if urls.Finish == "" {
		jsonError(w, "return_url wajib diisi", http.StatusBadRequest)
		return
	}
	payload, err := h.billingSubscription.CheckoutPayload(r.Context(), subscription.UserIdentity{
		UserID: userID, Email: email, Username: username, FullName: fullName,
	}, urls)
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
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(payload)
}

func (h *Handler) MockPaymentCallback(w http.ResponseWriter, r *http.Request) {
	if strings.ToLower(strings.TrimSpace(h.cfg.SubscriptionProvider)) != "mock" {
		jsonError(w, "mock callback tidak tersedia di environment ini", http.StatusNotFound)
		return
	}
	if strings.ToLower(strings.TrimSpace(h.billingSubscription.ProviderName())) != "mock" {
		jsonError(w, "mock callback tidak tersedia di environment ini", http.StatusNotFound)
		return
	}
	h.PaymentCallback(w, r)
}

func chiURLParam(r *http.Request, key string) string { return chi.URLParam(r, key) }
