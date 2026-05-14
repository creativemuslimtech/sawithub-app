package handler

import (
	"encoding/json"
	"net/http"

	mw "SawitHub/internal/middleware"
	"SawitHub/internal/farmfinance"
	"SawitHub/internal/validator"
	"github.com/go-chi/chi/v5"
)

func (h *Handler) ListPendapatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	result, err := h.farmFinanceIncome.List(r.Context(), userID)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) CreatePendapatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	var req struct {
		IDLahan         string  `json:"id_lahan"`
		TanggalPanen    string  `json:"tanggal_panen"`
		TotalJanjang    int     `json:"total_janjang"`
		TotalBeratKg    float64 `json:"total_berat_kg"`
		PendapatanKotor float64 `json:"pendapatan_kotor"`
		BiayaTotal      float64 `json:"biaya_total"`
		Catatan         string  `json:"catatan"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	v := validator.New().
		RequiredString("id_lahan", req.IDLahan).
		RequiredString("tanggal_panen", req.TanggalPanen).
		DateRange("tanggal_panen", req.TanggalPanen).
		DateNotInFuture("tanggal_panen", req.TanggalPanen).
		PositiveInt("total_janjang", req.TotalJanjang).
		PositiveFloat("total_berat_kg", req.TotalBeratKg).
		NonNegativeFloat("pendapatan_kotor", req.PendapatanKotor).
		NonNegativeFloat("biaya_total", req.BiayaTotal)

	if !v.IsValid() {
		jsonError(w, v.ErrorString(), http.StatusBadRequest)
		return
	}

	id, err := h.farmFinanceIncome.Insert(r.Context(), userID, farmfinance.CreatePendapatanInput{
		IDLahan:         req.IDLahan,
		TanggalPanen:    req.TanggalPanen,
		TotalJanjang:    req.TotalJanjang,
		TotalBeratKg:    req.TotalBeratKg,
		PendapatanKotor: req.PendapatanKotor,
		BiayaTotal:      req.BiayaTotal,
		Catatan:         req.Catatan,
	})
	if err != nil {
		jsonError(w, "server error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "pendapatan created", "id_pendapatan": id})
}

func (h *Handler) UpdatePendapatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chi.URLParam(r, "id")
	var req struct {
		IDLahan         string  `json:"id_lahan"`
		TanggalPanen    string  `json:"tanggal_panen"`
		TotalJanjang    int     `json:"total_janjang"`
		TotalBeratKg    float64 `json:"total_berat_kg"`
		PendapatanKotor float64 `json:"pendapatan_kotor"`
		BiayaTotal      float64 `json:"biaya_total"`
		Catatan         string  `json:"catatan"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	v := validator.New().
		RequiredString("id_lahan", req.IDLahan).
		RequiredString("tanggal_panen", req.TanggalPanen).
		DateRange("tanggal_panen", req.TanggalPanen).
		DateNotInFuture("tanggal_panen", req.TanggalPanen).
		PositiveInt("total_janjang", req.TotalJanjang).
		PositiveFloat("total_berat_kg", req.TotalBeratKg).
		NonNegativeFloat("pendapatan_kotor", req.PendapatanKotor).
		NonNegativeFloat("biaya_total", req.BiayaTotal)

	if !v.IsValid() {
		jsonError(w, v.ErrorString(), http.StatusBadRequest)
		return
	}

	n, err := h.farmFinanceIncome.Update(r.Context(), userID, id, farmfinance.UpdatePendapatanInput{
		IDLahan:         req.IDLahan,
		TanggalPanen:    req.TanggalPanen,
		TotalJanjang:    req.TotalJanjang,
		TotalBeratKg:    req.TotalBeratKg,
		PendapatanKotor: req.PendapatanKotor,
		BiayaTotal:      req.BiayaTotal,
		Catatan:         req.Catatan,
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

func (h *Handler) DeletePendapatan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chi.URLParam(r, "id")
	n, err := h.farmFinanceIncome.SoftDelete(r.Context(), userID, id)
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
