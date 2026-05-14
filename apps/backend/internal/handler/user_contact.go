package handler

import (
	"context"
)

func (h *Handler) getUserContact(ctx context.Context, userID string) (email, fullName, username string, err error) {
	return h.identityProfile.GetUserContact(ctx, userID)
}
