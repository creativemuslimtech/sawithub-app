package middleware

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"strings"

	"SawitHub/internal/subscription"
)

type subscriptionContextKey string

const SubscriptionKey subscriptionContextKey = "subscription_state"

type SubscriptionFeature string

const FeatureCreateHarvest SubscriptionFeature = "create_harvest"

func SubscriptionContext(_ *sql.DB, svc *subscription.BillingSubscriptionDataService) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			userID, _ := r.Context().Value(UserIDKey).(string)
			if userID == "" || svc == nil {
				next.ServeHTTP(w, r)
				return
			}
			state, _ := svc.GetStatus(r.Context(), userID)
			next.ServeHTTP(w, r.WithContext(context.WithValue(r.Context(), SubscriptionKey, state)))
		})
	}
}

func SubscriptionFromContext(ctx context.Context) (subscription.State, bool) {
	state, ok := ctx.Value(SubscriptionKey).(subscription.State)
	return state, ok
}

func RequireFullAccess() func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, _ := r.Context().Value(RoleKey).(string)
			if role == "admin" {
				next.ServeHTTP(w, r)
				return
			}
			state, ok := SubscriptionFromContext(r.Context())
			if !ok || !state.IsFullAccess() {
				w.Header().Set("Content-Type", "application/json")
				w.WriteHeader(http.StatusPaymentRequired)
				_ = json.NewEncoder(w).Encode(map[string]string{"error": "Langganan tidak aktif atau sudah berakhir.", "error_code": "SUBSCRIPTION_REQUIRED"})
				return
			}
			next.ServeHTTP(w, r)
		})
	}
}

func RequireFeature(feature SubscriptionFeature) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			role, _ := r.Context().Value(RoleKey).(string)
			if role == "admin" {
				next.ServeHTTP(w, r)
				return
			}
			state, ok := SubscriptionFromContext(r.Context())
			if !ok {
				http.Error(w, `{"error":"subscription state unavailable"}`, http.StatusInternalServerError)
				return
			}
			if state.IsFullAccess() {
				next.ServeHTTP(w, r)
				return
			}
			if feature == FeatureCreateHarvest && strings.EqualFold(strings.TrimSpace(state.HarvestAccessMode), "current_month_only") && state.Status != string(subscription.StatusPendingPayment) {
				next.ServeHTTP(w, r)
				return
			}
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusPaymentRequired)
			_ = json.NewEncoder(w).Encode(map[string]string{"error": "Langganan tidak aktif atau sudah berakhir.", "error_code": "SUBSCRIPTION_REQUIRED"})
		})
	}
}
