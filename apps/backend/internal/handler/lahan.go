package handler

import (
	"encoding/json"
	"net/http"

	mw "sawithub/backend/internal/middleware"
	"sawithub/backend/internal/farmcore"
	"sawithub/backend/internal/validator"
	"github.com/go-chi/chi/v5"
)

func (h *Handler) ListLahan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	lahan, err := h.farmCorePlot.List(r.Context(), userID)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(lahan)
}

func (h *Handler) CreateLahan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	if err := h.subscription.EnsureLahanCreationAllowed(r.Context(), userID); err != nil {
		jsonError(w, err.Error(), http.StatusPaymentRequired)
		return
	}
	var req struct {
		NamaKebun   string  `json:"nama_kebun"`
		JenisBibit  string  `json:"jenis_bibit"`
		Lokasi      string  `json:"lokasi"`
		LuasHa      float64 `json:"luas_ha"`
		JumlahPohon int     `json:"jumlah_pohon"`
		TahunTanam  int     `json:"tahun_tanam"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	v := validator.New().
		RequiredString("nama_kebun", req.NamaKebun).
		PositiveFloat("luas_ha", req.LuasHa).
		PositiveInt("jumlah_pohon", req.JumlahPohon).
		IntRange("tahun_tanam", req.TahunTanam, 1900, 2100)

	if !v.IsValid() {
		jsonError(w, v.ErrorString(), http.StatusBadRequest)
		return
	}

	id, err := h.farmCorePlot.Insert(r.Context(), userID, farmcore.CreateLahanInput{
		NamaKebun:   req.NamaKebun,
		JenisBibit:  req.JenisBibit,
		Lokasi:      req.Lokasi,
		LuasHa:      req.LuasHa,
		JumlahPohon: req.JumlahPohon,
		TahunTanam:  req.TahunTanam,
	})
	if err != nil {
		jsonError(w, "server error: "+err.Error(), http.StatusInternalServerError)
		return
	}
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusCreated)
	json.NewEncoder(w).Encode(map[string]interface{}{"message": "lahan created", "id_lahan": id})
}

func (h *Handler) UpdateLahan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chi.URLParam(r, "id")
	var req struct {
		NamaKebun   string  `json:"nama_kebun"`
		JenisBibit  string  `json:"jenis_bibit"`
		Lokasi      string  `json:"lokasi"`
		LuasHa      float64 `json:"luas_ha"`
		JumlahPohon int     `json:"jumlah_pohon"`
		TahunTanam  int     `json:"tahun_tanam"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	v := validator.New().
		RequiredString("nama_kebun", req.NamaKebun).
		PositiveFloat("luas_ha", req.LuasHa).
		PositiveInt("jumlah_pohon", req.JumlahPohon).
		IntRange("tahun_tanam", req.TahunTanam, 1900, 2100)

	if !v.IsValid() {
		jsonError(w, v.ErrorString(), http.StatusBadRequest)
		return
	}

	n, err := h.farmCorePlot.Update(r.Context(), userID, id, farmcore.UpdateLahanInput{
		NamaKebun:   req.NamaKebun,
		JenisBibit:  req.JenisBibit,
		Lokasi:      req.Lokasi,
		LuasHa:      req.LuasHa,
		JumlahPohon: req.JumlahPohon,
		TahunTanam:  req.TahunTanam,
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

func (h *Handler) DeleteLahan(w http.ResponseWriter, r *http.Request) {
	userID := r.Context().Value(mw.UserIDKey).(string)
	id := chi.URLParam(r, "id")
	n, err := h.farmCorePlot.SoftDelete(r.Context(), userID, id)
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
