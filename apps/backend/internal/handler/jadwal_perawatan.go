package handler

import (
	"encoding/json"
	"net/http"

	mw "sawithub/backend/internal/middleware"
	"sawithub/backend/internal/farmcore"
	"sawithub/backend/internal/validator"
	"github.com/go-chi/chi/v5"
)

func (h *Handler) ListJadwalPerawatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	result, err := h.farmCoreSchedule.List(r.Context(), userID)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) CreateJadwalPerawatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	var req struct {
		IDLahan         string  `json:"id_lahan"`
		JenisPerawatan  string  `json:"jenis_perawatan"`
		Deskripsi       string  `json:"deskripsi"`
		FrequensiTipe   string  `json:"frequensi_tipe"`
		FrequensiCustom int     `json:"frequensi_custom_hari"`
		TanggalMulai    string  `json:"tanggal_mulai"`
		TanggalAkhir    string  `json:"tanggal_akhir"`
		EstimasiBiaya   float64 `json:"estimasi_biaya"`
		Catatan         string  `json:"catatan"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	v := validator.New().
		RequiredString("id_lahan", req.IDLahan).
		RequiredString("jenis_perawatan", req.JenisPerawatan).
		RequiredString("tanggal_mulai", req.TanggalMulai).
		DateRange("tanggal_mulai", req.TanggalMulai).
		DateRange("tanggal_akhir", req.TanggalAkhir).
		NonNegativeFloat("estimasi_biaya", req.EstimasiBiaya)

	if req.TanggalAkhir != "" {
		v.DateStartBeforeEnd("tanggal_mulai", "tanggal_akhir", req.TanggalMulai, req.TanggalAkhir)
	}

	if req.FrequensiTipe == "custom" && req.FrequensiCustom <= 0 {
		v = validator.New().PositiveInt("frequensi_custom_hari", req.FrequensiCustom)
	}

	if !v.IsValid() {
		jsonError(w, v.ErrorString(), http.StatusBadRequest)
		return
	}

	id, err := h.farmCoreSchedule.Create(r.Context(), userID, farmcore.CreateJadwalInput{
		IDLahan:         req.IDLahan,
		JenisPerawatan:  req.JenisPerawatan,
		Deskripsi:       req.Deskripsi,
		FrequensiTipe:   req.FrequensiTipe,
		FrequensiCustom: req.FrequensiCustom,
		TanggalMulai:    req.TanggalMulai,
		TanggalAkhir:    req.TanggalAkhir,
		EstimasiBiaya:   req.EstimasiBiaya,
		Catatan:         req.Catatan,
	})
	if err != nil {
		jsonError(w, "server error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "jadwal perawatan created", "id": id})
}

func (h *Handler) UpdateJadwalPerawatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chi.URLParam(r, "id")
	var req struct {
		IDLahan         string  `json:"id_lahan"`
		JenisPerawatan  string  `json:"jenis_perawatan"`
		Deskripsi       string  `json:"deskripsi"`
		FrequensiTipe   string  `json:"frequensi_tipe"`
		FrequensiCustom int     `json:"frequensi_custom_hari"`
		TanggalMulai    string  `json:"tanggal_mulai"`
		TanggalAkhir    string  `json:"tanggal_akhir"`
		EstimasiBiaya   float64 `json:"estimasi_biaya"`
		IsActive        bool    `json:"is_active"`
		Catatan         string  `json:"catatan"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	v := validator.New().
		RequiredString("id_lahan", req.IDLahan).
		RequiredString("jenis_perawatan", req.JenisPerawatan).
		RequiredString("tanggal_mulai", req.TanggalMulai).
		DateRange("tanggal_mulai", req.TanggalMulai).
		DateRange("tanggal_akhir", req.TanggalAkhir).
		NonNegativeFloat("estimasi_biaya", req.EstimasiBiaya)

	if req.TanggalAkhir != "" {
		v.DateStartBeforeEnd("tanggal_mulai", "tanggal_akhir", req.TanggalMulai, req.TanggalAkhir)
	}

	if req.FrequensiTipe == "custom" && req.FrequensiCustom <= 0 {
		v = validator.New().PositiveInt("frequensi_custom_hari", req.FrequensiCustom)
	}

	if !v.IsValid() {
		jsonError(w, v.ErrorString(), http.StatusBadRequest)
		return
	}

	err := h.farmCoreSchedule.Update(r.Context(), userID, id, farmcore.UpdateJadwalInput{
		IDLahan:         req.IDLahan,
		JenisPerawatan:  req.JenisPerawatan,
		Deskripsi:       req.Deskripsi,
		FrequensiTipe:   req.FrequensiTipe,
		FrequensiCustom: req.FrequensiCustom,
		TanggalMulai:    req.TanggalMulai,
		TanggalAkhir:    req.TanggalAkhir,
		EstimasiBiaya:   req.EstimasiBiaya,
		IsActive:        req.IsActive,
		Catatan:         req.Catatan,
	})
	if err != nil {
		jsonError(w, "server error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "jadwal perawatan updated"})
}

func (h *Handler) DeleteJadwalPerawatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chi.URLParam(r, "id")
	err := h.farmCoreSchedule.SoftDelete(r.Context(), userID, id)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "jadwal perawatan deleted"})
}

func (h *Handler) GetUpcomingJadwal(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	lahanID := r.URL.Query().Get("lahan_id")
	daysStr := r.URL.Query().Get("days")

	result, err := h.farmCoreSchedule.GetUpcoming(r.Context(), userID, lahanID, daysStr)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}
