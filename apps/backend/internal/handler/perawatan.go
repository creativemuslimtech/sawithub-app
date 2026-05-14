package handler

import (
	"encoding/json"
	"net/http"

	mw "SawitHub/internal/middleware"
	"SawitHub/internal/farmcore"
	"SawitHub/internal/validator"
	"github.com/go-chi/chi/v5"
)

func (h *Handler) ListPerawatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	result, err := h.farmCoreMaintenance.List(r.Context(), userID)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) CreatePerawatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	var req struct {
		IDLahan          string  `json:"id_lahan"`
		TanggalPerawatan string  `json:"tanggal_perawatan"`
		JenisPerawatan   string  `json:"jenis_perawatan"`
		Bahan            string  `json:"bahan"`
		Jumlah           float64 `json:"jumlah"`
		Satuan           string  `json:"satuan"`
		HargaSatuan      float64 `json:"harga_satuan"`
		BiayaPekerja     float64 `json:"biaya_pekerja"`
		Keterangan       string  `json:"keterangan"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	v := validator.New().
		RequiredString("id_lahan", req.IDLahan).
		RequiredString("tanggal_perawatan", req.TanggalPerawatan).
		RequiredString("jenis_perawatan", req.JenisPerawatan).
		DateRange("tanggal_perawatan", req.TanggalPerawatan).
		DateNotInFuture("tanggal_perawatan", req.TanggalPerawatan).
		PositiveFloat("jumlah", req.Jumlah).
		NonNegativeFloat("harga_satuan", req.HargaSatuan).
		NonNegativeFloat("biaya_pekerja", req.BiayaPekerja)

	if !v.IsValid() {
		jsonError(w, v.ErrorString(), http.StatusBadRequest)
		return
	}

	id, err := h.farmCoreMaintenance.Create(r.Context(), userID, farmcore.CreatePerawatanInput{
		IDLahan:          req.IDLahan,
		TanggalPerawatan: req.TanggalPerawatan,
		JenisPerawatan:   req.JenisPerawatan,
		Bahan:            req.Bahan,
		Jumlah:           req.Jumlah,
		Satuan:           req.Satuan,
		HargaSatuan:      req.HargaSatuan,
		BiayaPekerja:     req.BiayaPekerja,
		Keterangan:       req.Keterangan,
	})
	if err != nil {
		jsonError(w, "server error: "+err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "perawatan created", "id_perawatan": id})
}

func (h *Handler) UpdatePerawatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chi.URLParam(r, "id")
	var req struct {
		IDLahan          string  `json:"id_lahan"`
		TanggalPerawatan string  `json:"tanggal_perawatan"`
		JenisPerawatan   string  `json:"jenis_perawatan"`
		Bahan            string  `json:"bahan"`
		Jumlah           float64 `json:"jumlah"`
		Satuan           string  `json:"satuan"`
		HargaSatuan      float64 `json:"harga_satuan"`
		BiayaPekerja     float64 `json:"biaya_pekerja"`
		Keterangan       string  `json:"keterangan"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	v := validator.New().
		RequiredString("id_lahan", req.IDLahan).
		RequiredString("tanggal_perawatan", req.TanggalPerawatan).
		RequiredString("jenis_perawatan", req.JenisPerawatan).
		DateRange("tanggal_perawatan", req.TanggalPerawatan).
		DateNotInFuture("tanggal_perawatan", req.TanggalPerawatan).
		PositiveFloat("jumlah", req.Jumlah).
		NonNegativeFloat("harga_satuan", req.HargaSatuan).
		NonNegativeFloat("biaya_pekerja", req.BiayaPekerja)

	if !v.IsValid() {
		jsonError(w, v.ErrorString(), http.StatusBadRequest)
		return
	}

	n, err := h.farmCoreMaintenance.Update(r.Context(), userID, id, farmcore.UpdatePerawatanInput{
		IDLahan:          req.IDLahan,
		TanggalPerawatan: req.TanggalPerawatan,
		JenisPerawatan:   req.JenisPerawatan,
		Bahan:            req.Bahan,
		Jumlah:           req.Jumlah,
		Satuan:           req.Satuan,
		HargaSatuan:      req.HargaSatuan,
		BiayaPekerja:     req.BiayaPekerja,
		Keterangan:       req.Keterangan,
	})
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	if n == 0 {
		jsonError(w, "not found", http.StatusNotFound)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "updated"})
}

func (h *Handler) DeletePerawatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chi.URLParam(r, "id")
	n, err := h.farmCoreMaintenance.SoftDelete(r.Context(), userID, id)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	if n == 0 {
		jsonError(w, "not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "deleted"})
}
