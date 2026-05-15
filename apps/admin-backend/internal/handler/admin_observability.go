package handler

import (
	"context"
	"encoding/json"
	"fmt"
	"net/http"
	"strings"
	"sync"
	"time"
)

type apiServiceStatus struct {
	Key       string `json:"key"`
	Name      string `json:"name"`
	Endpoint  string `json:"endpoint"`
	Status    string `json:"status"`
	Message   string `json:"message"`
	Code      int    `json:"code,omitempty"`
	LatencyMS int64  `json:"latency_ms"`
	CheckedAt string `json:"checked_at"`
}

var observabilityHTTPClient = &http.Client{
	Timeout: 4 * time.Second,
}

func monitorGeoAPI(ctx context.Context) apiServiceStatus {
	start := time.Now()
	status := apiServiceStatus{
		Key:       "ip-api",
		Name:      "IP-API Geo Lookup",
		Endpoint:  "http://ip-api.com/json/8.8.8.8?fields=status,message,country",
		Status:    "critical",
		CheckedAt: formatJakartaRFC3339(time.Now()),
	}

	req, err := http.NewRequestWithContext(ctx, http.MethodGet, status.Endpoint, nil)
	if err != nil {
		status.Message = err.Error()
		return status
	}

	resp, err := observabilityHTTPClient.Do(req)
	status.LatencyMS = time.Since(start).Milliseconds()
	if err != nil {
		status.Message = err.Error()
		return status
	}
	defer resp.Body.Close()

	status.Code = resp.StatusCode

	var payload struct {
		Status  string `json:"status"`
		Message string `json:"message"`
		Country string `json:"country"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&payload)

	switch {
	case resp.StatusCode >= 500:
		status.Status = "critical"
		status.Message = fmt.Sprintf("Server error %d dari IP-API.", resp.StatusCode)
	case resp.StatusCode >= 400:
		status.Status = "degraded"
		status.Message = fmt.Sprintf("Respons %d dari IP-API.", resp.StatusCode)
	case strings.EqualFold(payload.Status, "success"):
		status.Status = "healthy"
		status.Message = fmt.Sprintf("Lookup geo berhasil. Contoh negara: %s.", payload.Country)
	default:
		status.Status = "degraded"
		if payload.Message != "" {
			status.Message = payload.Message
		} else {
			status.Message = "IP-API merespons, tetapi payload tidak lengkap."
		}
	}

	return status
}

func monitorResendAPI(ctx context.Context, apiKey string) apiServiceStatus {
	status := apiServiceStatus{
		Key:       "resend",
		Name:      "Resend Email API",
		Endpoint:  "https://api.resend.com/emails",
		Status:    "disabled",
		Message:   "RESEND_API_KEY belum diatur.",
		CheckedAt: formatJakartaRFC3339(time.Now()),
	}

	apiKey = strings.TrimSpace(apiKey)
	if apiKey == "" {
		return status
	}

	start := time.Now()
	req, err := http.NewRequestWithContext(ctx, http.MethodPost, status.Endpoint, strings.NewReader(`{}`))
	if err != nil {
		status.Status = "critical"
		status.Message = err.Error()
		return status
	}
	req.Header.Set("Authorization", "Bearer "+apiKey)
	req.Header.Set("Content-Type", "application/json")
	req.Header.Set("User-Agent", "sawithub-monitor/1.0")

	resp, err := observabilityHTTPClient.Do(req)
	status.LatencyMS = time.Since(start).Milliseconds()
	if err != nil {
		status.Status = "critical"
		status.Message = err.Error()
		return status
	}
	defer resp.Body.Close()

	status.Code = resp.StatusCode

	var payload struct {
		Name    string `json:"name"`
		Message string `json:"message"`
	}
	_ = json.NewDecoder(resp.Body).Decode(&payload)

	switch {
	case resp.StatusCode >= 200 && resp.StatusCode < 300:
		status.Status = "healthy"
		status.Message = "Resend dapat dijangkau dan API key valid untuk pengiriman email."
	case (resp.StatusCode == http.StatusBadRequest || resp.StatusCode == http.StatusUnprocessableEntity) &&
		(payload.Name == "validation_error" || payload.Name == "missing_required_field"):
		status.Status = "healthy"
		status.Message = "Resend dapat dijangkau dan API key valid untuk pengiriman email."
	case resp.StatusCode == http.StatusUnauthorized || resp.StatusCode == http.StatusForbidden:
		status.Status = "critical"
		if payload.Message != "" {
			status.Message = payload.Message
		} else {
			status.Message = "API key Resend ditolak."
		}
	case resp.StatusCode >= 500:
		status.Status = "critical"
		status.Message = fmt.Sprintf("Server error %d dari Resend.", resp.StatusCode)
	default:
		status.Status = "degraded"
		if payload.Message != "" {
			status.Message = fmt.Sprintf("Respons %d dari Resend: %s", resp.StatusCode, payload.Message)
		} else {
			status.Message = fmt.Sprintf("Respons %d dari Resend.", resp.StatusCode)
		}
	}

	return status
}

func (h *Handler) getAPIStatuses(ctx context.Context) []apiServiceStatus {
	checks := []func(context.Context) apiServiceStatus{
		monitorGeoAPI,
		func(ctx context.Context) apiServiceStatus {
			return monitorResendAPI(ctx, h.cfg.ResendAPIKey)
		},
	}

	results := make([]apiServiceStatus, 0, len(checks))
	ch := make(chan apiServiceStatus, len(checks))
	var wg sync.WaitGroup

	for _, check := range checks {
		wg.Add(1)
		go func(check func(context.Context) apiServiceStatus) {
			defer wg.Done()
			childCtx, cancel := context.WithTimeout(ctx, 4*time.Second)
			defer cancel()
			ch <- check(childCtx)
		}(check)
	}

	wg.Wait()
	close(ch)

	for result := range ch {
		results = append(results, result)
	}

	return results
}
