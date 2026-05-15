package handler

import (
	"encoding/json"
	"errors"
	"net/http"
	"strconv"
	"strings"

	mw "sawithub/backend/internal/middleware"
	"sawithub/backend/internal/notificationapp"
)

func (h *Handler) ListNotifications(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	limit, _ := strconv.Atoi(r.URL.Query().Get("limit"))
	items, err := h.notificationCenter.List(r.Context(), userID, limit)
	if err != nil {
		if errors.Is(err, notificationapp.ErrUnavailable) {
			jsonError(w, "notification service belum tersedia", http.StatusServiceUnavailable)
			return
		}
		jsonError(w, "gagal memuat notifikasi", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]interface{}{"items": items})
}

func (h *Handler) ReadNotification(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chiURLParam(r, "id")
	if strings.TrimSpace(id) == "" {
		jsonError(w, "id notifikasi wajib diisi", http.StatusBadRequest)
		return
	}
	if err := h.notificationCenter.MarkRead(r.Context(), userID, id); err != nil {
		if errors.Is(err, notificationapp.ErrUnavailable) {
			jsonError(w, "notification service belum tersedia", http.StatusServiceUnavailable)
			return
		}
		jsonError(w, "gagal memperbarui notifikasi", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "notifikasi dibaca"})
}

func (h *Handler) DeleteReadNotifications(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	if err := h.notificationCenter.DeleteReadNotifications(r.Context(), userID); err != nil {
		if errors.Is(err, notificationapp.ErrUnavailable) {
			jsonError(w, "notification service belum tersedia", http.StatusServiceUnavailable)
			return
		}
		jsonError(w, "gagal menghapus notifikasi", http.StatusInternalServerError)
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "notifikasi yang sudah dibaca dihapus"})
}

func (h *Handler) ReadAllNotifications(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	if err := h.notificationCenter.MarkAllRead(r.Context(), userID); err != nil {
		if errors.Is(err, notificationapp.ErrUnavailable) {
			jsonError(w, "notification service belum tersedia", http.StatusServiceUnavailable)
			return
		}
		jsonError(w, "gagal memperbarui notifikasi", http.StatusInternalServerError)
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "semua notifikasi dibaca"})
}
