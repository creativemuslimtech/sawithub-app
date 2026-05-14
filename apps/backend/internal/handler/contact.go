package handler

import (
	"encoding/json"
	"net/http"
	"net/mail"
	"strings"
)

type contactRequest struct {
	Name    string `json:"name"`
	Email   string `json:"email"`
	Subject string `json:"subject"`
	Message string `json:"message"`
}

func (h *Handler) Contact(w http.ResponseWriter, r *http.Request) {
	var req contactRequest
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "Format pesan tidak valid.", http.StatusBadRequest)
		return
	}

	req.Name = strings.TrimSpace(req.Name)
	req.Email = strings.TrimSpace(req.Email)
	req.Subject = strings.TrimSpace(req.Subject)
	req.Message = strings.TrimSpace(req.Message)

	if req.Name == "" || req.Email == "" || req.Message == "" {
		jsonError(w, "Nama, email, dan pesan wajib diisi.", http.StatusBadRequest)
		return
	}
	if _, err := mail.ParseAddress(req.Email); err != nil {
		jsonError(w, "Email belum valid.", http.StatusBadRequest)
		return
	}
	if len(req.Name) > 120 || len(req.Subject) > 180 || len(req.Message) > 5000 {
		jsonError(w, "Pesan terlalu panjang. Tolong diringkas sedikit.", http.StatusBadRequest)
		return
	}
	if h.cfg.SupportEmail == "" {
		jsonError(w, "Email tujuan bantuan belum diatur.", http.StatusServiceUnavailable)
		return
	}
	if !h.mailer.Enabled() {
		jsonError(w, "Layanan email sedang belum aktif. Coba lagi nanti.", http.StatusServiceUnavailable)
		return
	}
	if err := h.mailer.SendContactMessage(h.cfg.SupportEmail, req.Name, req.Email, req.Subject, req.Message); err != nil {
		jsonError(w, "Pesan belum berhasil dikirim. Coba lagi.", http.StatusBadGateway)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"message": "Pesan berhasil dikirim",
	})
}
