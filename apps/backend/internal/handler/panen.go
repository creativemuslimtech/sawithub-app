package handler

import (
	"encoding/json"
	"net/http"

	mw "SawitHub/internal/middleware"
	"SawitHub/internal/farmcore"
	"SawitHub/internal/validator"
	"github.com/go-chi/chi/v5"
)

func (h *Handler) ListPanen(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	result, err := h.farmCoreHarvest.List(r.Context(), userID)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(result)
}

func (h *Handler) GetPanen(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chi.URLParam(r, "id")
	p, err := h.farmCoreHarvest.Get(r.Context(), userID, id)
	if err != nil {
		jsonError(w, "not found", http.StatusNotFound)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(p)
}

func (h *Handler) CreatePanen(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	var req struct {
		IDLahan       string  `json:"id_lahan"`
		TanggalPanen  string  `json:"tanggal_panen"`
		LuasPanenHa   float64 `json:"luas_panen_ha"`
		JumlahJanjang int     `json:"jumlah_janjang"`
		BeratKg       float64 `json:"berat_kg"`
		HargaPerKg    float64 `json:"harga_per_kg"`
		BiayaPanen    float64 `json:"biaya_panen"`
		Catatan       string  `json:"catatan"`
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
		PositiveFloat("luas_panen_ha", req.LuasPanenHa).
		PositiveInt("jumlah_janjang", req.JumlahJanjang).
		PositiveFloat("berat_kg", req.BeratKg).
		PositiveFloat("harga_per_kg", req.HargaPerKg).
		NonNegativeFloat("biaya_panen", req.BiayaPanen)

	if !v.IsValid() {
		jsonError(w, v.ErrorString(), http.StatusBadRequest)
		return
	}
	if _, err := h.subscription.EnsureHarvestCreationAllowed(r.Context(), userID, req.IDLahan, req.TanggalPanen); err != nil {
		jsonSubscriptionRequired(w, err.Error())
		return
	}
	if err := h.subscription.EnsureTrialUsageAllowed(r.Context(), userID, "trial_harvest_used", 2, "batas trial panen sudah tercapai (maksimal 2 kali)"); err != nil {
		jsonSubscriptionRequired(w, err.Error())
		return
	}

	id, err := h.farmCoreHarvest.InsertPanen(r.Context(), userID, farmcore.CreatePanenInput{
		IDLahan:       req.IDLahan,
		TanggalPanen:  req.TanggalPanen,
		LuasPanenHa:   req.LuasPanenHa,
		JumlahJanjang: req.JumlahJanjang,
		BeratKg:       req.BeratKg,
		HargaPerKg:    req.HargaPerKg,
		BiayaPanen:    req.BiayaPanen,
		Catatan:       req.Catatan,
	})
	if err != nil {
		jsonError(w, "server error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	_ = h.subscription.IncrementTrialUsage(r.Context(), userID, "trial_harvest_used")

	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "panen created", "id_panen": id})
}

func (h *Handler) UpdatePanen(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chi.URLParam(r, "id")
	var req struct {
		IDLahan       string  `json:"id_lahan"`
		TanggalPanen  string  `json:"tanggal_panen"`
		LuasPanenHa   float64 `json:"luas_panen_ha"`
		JumlahJanjang int     `json:"jumlah_janjang"`
		BeratKg       float64 `json:"berat_kg"`
		HargaPerKg    float64 `json:"harga_per_kg"`
		BiayaPanen    float64 `json:"biaya_panen"`
		Catatan       string  `json:"catatan"`
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
		PositiveFloat("luas_panen_ha", req.LuasPanenHa).
		PositiveInt("jumlah_janjang", req.JumlahJanjang).
		PositiveFloat("berat_kg", req.BeratKg).
		PositiveFloat("harga_per_kg", req.HargaPerKg).
		NonNegativeFloat("biaya_panen", req.BiayaPanen)

	if !v.IsValid() {
		jsonError(w, v.ErrorString(), http.StatusBadRequest)
		return
	}

	n, err := h.farmCoreHarvest.Update(r.Context(), userID, id, farmcore.UpdatePanenInput{
		IDLahan:       req.IDLahan,
		TanggalPanen:  req.TanggalPanen,
		LuasPanenHa:   req.LuasPanenHa,
		JumlahJanjang: req.JumlahJanjang,
		BeratKg:       req.BeratKg,
		HargaPerKg:    req.HargaPerKg,
		BiayaPanen:    req.BiayaPanen,
		Catatan:       req.Catatan,
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

func (h *Handler) DeletePanen(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chi.URLParam(r, "id")
	n, err := h.farmCoreHarvest.SoftDelete(r.Context(), userID, id)
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
