package taskqueue

import (
	"context"
	"encoding/json"
	"fmt"

	"github.com/hibiken/asynq"
	"sawithub/backend/internal/mailer"
)

func NewEmailHandler(m *mailer.Mailer) *asynq.ServeMux {
	mux := asynq.NewServeMux()
	mux.HandleFunc(TypeEmailWelcome, handleEmailTask(m))
	mux.HandleFunc(TypeEmailResetCode, handleEmailTask(m))
	mux.HandleFunc(TypeEmailReport, handleEmailTask(m))
	return mux
}

func handleEmailTask(m *mailer.Mailer) func(ctx context.Context, t *asynq.Task) error {
	return func(ctx context.Context, t *asynq.Task) error {
		var p EmailPayload
		if err := json.Unmarshal(t.Payload(), &p); err != nil {
			return fmt.Errorf("unmarshal email payload: %w", err)
		}
		switch p.Type {
		case "welcome":
			return m.SendWelcome(p.ToEmail, p.FullName)
		case "reset_code":
			return m.SendResetCode(p.ToEmail, p.Code)
		case "report":
			return m.SendReport(p.ToEmail, p.Subject, p.HTML, mailer.Attachment{
				Filename:    p.Filename,
				Content:     p.Attachment,
				ContentType: p.ContentType,
			})
		default:
			return nil
		}
	}
}
