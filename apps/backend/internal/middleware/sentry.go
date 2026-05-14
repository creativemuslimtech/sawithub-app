package middleware

import (
	"net/http"

	"github.com/getsentry/sentry-go"
	sentryhttp "github.com/getsentry/sentry-go/http"
)

func SentryMiddleware() func(http.Handler) http.Handler {
	handler := sentryhttp.New(sentryhttp.Options{
		Repanic: true,
	})
	return handler.Handle
}

// SentrySetUser attaches the authenticated user to the current Sentry scope.
// Call this after auth middleware has set UserIDKey and EmailKey in context.
func SentrySetUser(userID, email string, r *http.Request) {
	if hub := sentry.GetHubFromContext(r.Context()); hub != nil {
		hub.Scope().SetUser(sentry.User{
			ID:    userID,
			Email: email,
		})
	}
}
