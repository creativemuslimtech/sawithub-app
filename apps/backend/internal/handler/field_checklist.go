package handler

import (
	"encoding/json"
	"net/http"

	mw "SawitHub/internal/middleware"
	"SawitHub/internal/farmcore"
)

func (h *Handler) ListFieldChecklistRuns(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	out, err := h.farmCoreChecklist.ListRuns(r.Context(), userID)
	if err != nil {
		jsonError(w, "gagal memuat checklist", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(out)
}

func (h *Handler) CreateFieldChecklistRun(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	var req struct {
		IDLahan, Title, TaskDate string
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "payload tidak valid", http.StatusBadRequest)
		return
	}
	if req.Title == "" || req.TaskDate == "" || req.IDLahan == "" {
		jsonError(w, "id_lahan, title, task_date wajib diisi", http.StatusBadRequest)
		return
	}
	id, err := h.farmCoreChecklist.CreateRun(r.Context(), userID, farmcore.CreateChecklistRunInput{
		IDLahan:  req.IDLahan,
		Title:    req.Title,
		TaskDate: req.TaskDate,
	})
	if err != nil {
		jsonError(w, "gagal membuat checklist", http.StatusInternalServerError)
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]any{"message": "ok", "id_run": id})
}

func (h *Handler) UpdateFieldChecklistRunStatus(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	runID := chiURLParam(r, "id")
	var req struct{ Status string `json:"status"` }
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "payload tidak valid", http.StatusBadRequest)
		return
	}
	affected, err := h.farmCoreChecklist.UpdateRunStatus(r.Context(), userID, runID, req.Status)
	if err != nil {
		jsonError(w, "gagal update status", http.StatusInternalServerError)
		return
	}
	if affected == 0 {
		jsonError(w, "checklist tidak ditemukan", http.StatusNotFound)
		return
	}
	_ = json.NewEncoder(w).Encode(map[string]string{"message": "ok"})
}
