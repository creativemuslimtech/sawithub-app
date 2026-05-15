package platform

import (
	"fmt"
	"net/http"
	"sort"
	"strings"
	"sync"
	"time"

	"github.com/go-chi/chi/v5"
	chimw "github.com/go-chi/chi/v5/middleware"
)

type apiEndpointDefinition struct {
	Key         string
	Name        string
	Method      string
	Path        string
	Group       string
	Access      string
	Description string
}

type apiEndpointMetric struct {
	definition         apiEndpointDefinition
	totalRequests      int64
	clientErrorCount   int64
	serverErrorCount   int64
	lastStatusCode     int
	totalLatency       time.Duration
	lastLatency        time.Duration
	maxLatency         time.Duration
	lastSeenAt         time.Time
	observedUnknownDef bool
}

type InternalAPIStatus struct {
	Key              string `json:"key"`
	Name             string `json:"name"`
	Method           string `json:"method"`
	Path             string `json:"path"`
	Group            string `json:"group"`
	Access           string `json:"access"`
	Description      string `json:"description"`
	Status           string `json:"status"`
	Enabled          bool   `json:"enabled"`
	TotalRequests    int64  `json:"total_requests"`
	ClientErrors     int64  `json:"client_error_requests"`
	ServerErrors     int64  `json:"server_error_requests"`
	AvgLatencyMS     int64  `json:"avg_latency_ms"`
	LastLatencyMS    int64  `json:"last_latency_ms"`
	MaxLatencyMS     int64  `json:"max_latency_ms"`
	LastStatusCode   int    `json:"last_status_code,omitempty"`
	LastSeenAt       string `json:"last_seen_at"`
	LastSeenRelative string `json:"last_seen_relative"`
	Observed         bool   `json:"observed"`
	ObservedUnknown  bool   `json:"observed_unknown"`
	HealthNote       string `json:"health_note,omitempty"`
}

type InternalAPISummary struct {
	TotalEndpoints int   `json:"total"`
	Observed       int   `json:"observed"`
	Healthy        int   `json:"healthy"`
	Degraded       int   `json:"degraded"`
	Critical       int   `json:"critical"`
	Idle           int   `json:"idle"`
	TotalRequests  int64 `json:"total_requests"`
	ClientErrors   int64 `json:"client_error_requests"`
	ServerErrors   int64 `json:"server_error_requests"`
}

type PlatformApiObservabilityService struct {
	mu      sync.RWMutex
	catalog []apiEndpointDefinition
	metrics map[string]*apiEndpointMetric
}

func NewPlatformApiObservabilityService() *PlatformApiObservabilityService {
	catalog := defaultAPICatalog()
	metrics := make(map[string]*apiEndpointMetric, len(catalog))
	for _, def := range catalog {
		key := apiMetricKey(def.Method, def.Path)
		defCopy := def
		metrics[key] = &apiEndpointMetric{definition: defCopy}
	}

	return &PlatformApiObservabilityService{
		catalog: catalog,
		metrics: metrics,
	}
}

func apiRoute(key, name, method, path, group, access, description string) apiEndpointDefinition {
	return apiEndpointDefinition{
		Key:         key,
		Name:        name,
		Method:      strings.ToUpper(method),
		Path:        normalizeAPIPath(path),
		Group:       group,
		Access:      access,
		Description: description,
	}
}

func defaultAPICatalog() []apiEndpointDefinition {
	return []apiEndpointDefinition{
		apiRoute("platform-theme", "Platform Theme", http.MethodGet, "/api/PlatformThemeService", "PlatformThemeService", "public", "Konfigurasi tema publik."),
		apiRoute("platform-traffic", "Platform Traffic", http.MethodPost, "/api/PlatformTrafficService", "PlatformTrafficService", "public", "Pencatatan kunjungan."),
		apiRoute("contact", "Contact Form", http.MethodPost, "/api/Contact", "Contact", "public", "Form kontak publik."),
		apiRoute("billing-callback", "Payment Callback", http.MethodPost, "/api/BillingPaymentService/callback", "BillingPaymentService", "public", "Callback gateway pembayaran."),
		apiRoute("billing-mock-callback", "Mock Payment Callback", http.MethodPost, "/api/BillingPaymentService/mock/callback", "BillingPaymentService", "public", "Callback mock pembayaran."),

		apiRoute("identity-auth-register", "Register", http.MethodPost, "/api/IdentityAuthService/register", "IdentityAuthService", "public", "Pendaftaran akun."),
		apiRoute("identity-auth-login", "Login", http.MethodPost, "/api/IdentityAuthService/login", "IdentityAuthService", "public", "Login."),
		apiRoute("identity-auth-forgot", "Forgot Password", http.MethodPost, "/api/IdentityAuthService/forgot-password", "IdentityAuthService", "public", "Permintaan reset password."),
		apiRoute("identity-auth-verify", "Verify Reset", http.MethodPost, "/api/IdentityAuthService/verify-reset", "IdentityAuthService", "public", "Verifikasi kode reset."),
		apiRoute("identity-auth-reset", "Reset Password", http.MethodPost, "/api/IdentityAuthService/reset-password", "IdentityAuthService", "public", "Reset password."),

		apiRoute("identity-auth-me", "Current User", http.MethodGet, "/api/IdentityAuthService/me", "IdentityAuthService", "protected", "Profil sesi."),
		apiRoute("identity-auth-ping", "Presence Ping", http.MethodGet, "/api/IdentityAuthService/ping", "IdentityAuthService", "protected", "Heartbeat online."),
		apiRoute("identity-session-logout", "Logout", http.MethodPost, "/api/IdentitySessionService/logout", "IdentitySessionService", "protected", "Logout device ini."),
		apiRoute("identity-session-logout-all", "Logout All", http.MethodPost, "/api/IdentitySessionService/logout-all", "IdentitySessionService", "protected", "Logout semua device."),
		apiRoute("identity-profile-name", "Update Full Name", http.MethodPut, "/api/IdentityProfileService/update-full-name", "IdentityProfileService", "protected", "Ubah nama lengkap."),
		apiRoute("identity-profile-email", "Update Email", http.MethodPut, "/api/IdentityProfileService/update-email", "IdentityProfileService", "protected", "Ubah email."),
		apiRoute("identity-profile-phone", "Update Phone", http.MethodPut, "/api/IdentityProfileService/update-phone", "IdentityProfileService", "protected", "Ubah telepon."),
		apiRoute("identity-profile-username", "Update Username", http.MethodPut, "/api/IdentityProfileService/update-username", "IdentityProfileService", "protected", "Ubah username."),
		apiRoute("identity-auth-password", "Update Password", http.MethodPut, "/api/IdentityAuthService/update-password", "IdentityAuthService", "protected", "Ubah password."),

		apiRoute("reporting-dashboard", "Dashboard Summary", http.MethodGet, "/api/ReportingDashboardService", "ReportingDashboardService", "protected", "Ringkasan dashboard."),
		apiRoute("billing-sub-status", "Subscription Status", http.MethodGet, "/api/BillingSubscriptionService/status", "BillingSubscriptionService", "protected", "Status langganan."),
		apiRoute("billing-sub-checkout", "Subscription Checkout", http.MethodPost, "/api/BillingSubscriptionService/checkout", "BillingSubscriptionService", "protected", "Checkout langganan."),
		apiRoute("notification-list", "List Notifications", http.MethodGet, "/api/NotificationCenterService", "NotificationCenterService", "protected", "Daftar notifikasi."),
		apiRoute("notification-read-all", "Read All Notifications", http.MethodPatch, "/api/NotificationCenterService/read-all", "NotificationCenterService", "protected", "Tandai semua dibaca."),
		apiRoute("notification-delete-read", "Delete Read Notifications", http.MethodDelete, "/api/NotificationCenterService/read", "NotificationCenterService", "protected", "Hapus notifikasi yang sudah dibaca."),
		apiRoute("notification-read-one", "Read Notification", http.MethodPatch, "/api/NotificationCenterService/{id}/read", "NotificationCenterService", "protected", "Tandai satu dibaca."),

		apiRoute("core-plot-list", "List Plots", http.MethodGet, "/api/CorePlotService", "CorePlotService", "protected", "Daftar lahan."),
		apiRoute("core-plot-create", "Create Plot", http.MethodPost, "/api/CorePlotService", "CorePlotService", "protected", "Tambah lahan."),
		apiRoute("core-plot-update", "Update Plot", http.MethodPut, "/api/CorePlotService/{id}", "CorePlotService", "protected", "Ubah lahan."),
		apiRoute("core-plot-delete", "Delete Plot", http.MethodDelete, "/api/CorePlotService/{id}", "CorePlotService", "protected", "Hapus lahan."),

		apiRoute("core-harvest-list", "List Harvest", http.MethodGet, "/api/CoreHarvestService", "CoreHarvestService", "protected", "Daftar panen."),
		apiRoute("core-harvest-create", "Create Harvest", http.MethodPost, "/api/CoreHarvestService", "CoreHarvestService", "protected", "Tambah panen."),
		apiRoute("core-harvest-detail", "Harvest Detail", http.MethodGet, "/api/CoreHarvestService/{id}", "CoreHarvestService", "protected", "Detail panen."),
		apiRoute("core-harvest-update", "Update Harvest", http.MethodPut, "/api/CoreHarvestService/{id}", "CoreHarvestService", "protected", "Ubah panen."),
		apiRoute("core-harvest-delete", "Delete Harvest", http.MethodDelete, "/api/CoreHarvestService/{id}", "CoreHarvestService", "protected", "Hapus panen."),

		apiRoute("core-maint-list", "List Maintenance", http.MethodGet, "/api/CoreMaintenanceService", "CoreMaintenanceService", "protected", "Daftar perawatan."),
		apiRoute("core-maint-create", "Create Maintenance", http.MethodPost, "/api/CoreMaintenanceService", "CoreMaintenanceService", "protected", "Tambah perawatan."),
		apiRoute("core-maint-update", "Update Maintenance", http.MethodPut, "/api/CoreMaintenanceService/{id}", "CoreMaintenanceService", "protected", "Ubah perawatan."),
		apiRoute("core-maint-delete", "Delete Maintenance", http.MethodDelete, "/api/CoreMaintenanceService/{id}", "CoreMaintenanceService", "protected", "Hapus perawatan."),

		apiRoute("core-sched-upcoming", "Upcoming Schedule", http.MethodGet, "/api/CoreMaintenanceScheduleService/upcoming", "CoreMaintenanceScheduleService", "protected", "Jadwal terdekat."),
		apiRoute("core-sched-list", "List Schedule", http.MethodGet, "/api/CoreMaintenanceScheduleService", "CoreMaintenanceScheduleService", "protected", "Daftar jadwal."),
		apiRoute("core-sched-create", "Create Schedule", http.MethodPost, "/api/CoreMaintenanceScheduleService", "CoreMaintenanceScheduleService", "protected", "Tambah jadwal."),
		apiRoute("core-sched-update", "Update Schedule", http.MethodPut, "/api/CoreMaintenanceScheduleService/{id}", "CoreMaintenanceScheduleService", "protected", "Ubah jadwal."),
		apiRoute("core-sched-delete", "Delete Schedule", http.MethodDelete, "/api/CoreMaintenanceScheduleService/{id}", "CoreMaintenanceScheduleService", "protected", "Hapus jadwal."),

		apiRoute("finance-income-list", "List Income", http.MethodGet, "/api/FinanceIncomeService", "FinanceIncomeService", "protected", "Daftar pendapatan."),
		apiRoute("finance-income-create", "Create Income", http.MethodPost, "/api/FinanceIncomeService", "FinanceIncomeService", "protected", "Tambah pendapatan."),
		apiRoute("finance-income-update", "Update Income", http.MethodPut, "/api/FinanceIncomeService/{id}", "FinanceIncomeService", "protected", "Ubah pendapatan."),
		apiRoute("finance-income-delete", "Delete Income", http.MethodDelete, "/api/FinanceIncomeService/{id}", "FinanceIncomeService", "protected", "Hapus pendapatan."),

		apiRoute("finance-price-list", "Commodity Prices", http.MethodGet, "/api/FinanceCommodityPriceService", "FinanceCommodityPriceService", "protected", "Daftar harga TBS."),

		apiRoute("reporting-farm-finance", "Farm Finance Report", http.MethodGet, "/api/ReportingFarmFinanceService", "ReportingFarmFinanceService", "protected", "Laporan keuangan."),
		apiRoute("reporting-export-email", "Export Email", http.MethodPost, "/api/ReportingExportService/email-export", "ReportingExportService", "protected", "Ekspor laporan ke email."),

		apiRoute("core-checklist-list", "List Checklists", http.MethodGet, "/api/CoreChecklistService", "CoreChecklistService", "protected", "Daftar checklist."),
		apiRoute("core-checklist-create", "Create Checklist Run", http.MethodPost, "/api/CoreChecklistService", "CoreChecklistService", "protected", "Buat run checklist."),
		apiRoute("core-checklist-status", "Update Checklist Status", http.MethodPatch, "/api/CoreChecklistService/{id}/status", "CoreChecklistService", "protected", "Ubah status checklist."),
	}
}

func apiMetricKey(method, path string) string {
	return strings.ToUpper(strings.TrimSpace(method)) + " " + normalizeAPIPath(path)
}

func normalizeAPIPath(path string) string {
	path = strings.TrimSpace(path)
	if path == "" {
		return ""
	}
	path = strings.Split(path, "?")[0]
	path = strings.TrimSuffix(path, "/*")
	if !strings.HasPrefix(path, "/") {
		path = "/" + path
	}
	if len(path) > 1 {
		path = strings.TrimRight(path, "/")
	}
	return path
}

func routePatternForMonitoring(r *http.Request) string {
	if routeCtx := chi.RouteContext(r.Context()); routeCtx != nil {
		if pattern := normalizeAPIPath(routeCtx.RoutePattern()); pattern != "" {
			return pattern
		}
	}
	return normalizeAPIPath(r.URL.Path)
}

func (m *PlatformApiObservabilityService) Middleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if !strings.HasPrefix(r.URL.Path, "/api") {
			next.ServeHTTP(w, r)
			return
		}

		recorder := chimw.NewWrapResponseWriter(w, r.ProtoMajor)
		start := time.Now()

		next.ServeHTTP(recorder, r)

		statusCode := recorder.Status()
		if statusCode == 0 {
			statusCode = http.StatusOK
		}

		m.Record(r.Method, routePatternForMonitoring(r), statusCode, time.Since(start))
	})
}

func (m *PlatformApiObservabilityService) Record(method, path string, statusCode int, duration time.Duration) {
	method = strings.ToUpper(strings.TrimSpace(method))
	path = normalizeAPIPath(path)
	if method == "" || path == "" || !strings.HasPrefix(path, "/api") {
		return
	}

	key := apiMetricKey(method, path)

	m.mu.Lock()
	defer m.mu.Unlock()

	metric, ok := m.metrics[key]
	if !ok {
		slug := strings.NewReplacer(
			" ", "-",
			"/", "-",
			"{", "",
			"}", "",
		).Replace(strings.TrimPrefix(path, "/"))
		def := apiEndpointDefinition{
			Key:         strings.ToLower(strings.Trim(slug, "-")),
			Name:        path,
			Method:      method,
			Path:        path,
			Group:       "Unknown",
			Access:      "unknown",
			Description: "Endpoint terdeteksi saat runtime, tetapi belum ada di katalog monitoring.",
		}
		metric = &apiEndpointMetric{
			definition:         def,
			observedUnknownDef: true,
		}
		m.metrics[key] = metric
	}

	metric.totalRequests++
	if statusCode >= 500 {
		metric.serverErrorCount++
	} else if statusCode >= 400 {
		metric.clientErrorCount++
	}

	metric.lastStatusCode = statusCode
	metric.totalLatency += duration
	metric.lastLatency = duration
	if duration > metric.maxLatency {
		metric.maxLatency = duration
	}
	metric.lastSeenAt = time.Now()
}

func (m *PlatformApiObservabilityService) Snapshot() (InternalAPISummary, []InternalAPIStatus) {
	m.mu.RLock()
	defer m.mu.RUnlock()

	now := time.Now()
	statuses := make([]InternalAPIStatus, 0, len(m.metrics))
	summary := InternalAPISummary{}
	seen := map[string]bool{}

	for _, def := range m.catalog {
		key := apiMetricKey(def.Method, def.Path)
		metric := m.metrics[key]
		if metric == nil {
			metric = &apiEndpointMetric{definition: def}
		}
		seen[key] = true

		status := buildInternalAPIStatus(metric, now)
		statuses = append(statuses, status)
		accumulateInternalAPISummary(&summary, status)
	}

	unknown := make([]InternalAPIStatus, 0)
	for key, metric := range m.metrics {
		if seen[key] {
			continue
		}
		status := buildInternalAPIStatus(metric, now)
		unknown = append(unknown, status)
		accumulateInternalAPISummary(&summary, status)
	}

	sort.SliceStable(unknown, func(i, j int) bool {
		if unknown[i].Method == unknown[j].Method {
			return unknown[i].Path < unknown[j].Path
		}
		return unknown[i].Method < unknown[j].Method
	})

	statuses = append(statuses, unknown...)
	return summary, statuses
}

func accumulateInternalAPISummary(summary *InternalAPISummary, status InternalAPIStatus) {
	summary.TotalEndpoints++
	summary.TotalRequests += status.TotalRequests
	summary.ClientErrors += status.ClientErrors
	summary.ServerErrors += status.ServerErrors
	if status.Observed {
		summary.Observed++
	}

	switch status.Status {
	case "healthy":
		summary.Healthy++
	case "degraded":
		summary.Degraded++
	case "critical":
		summary.Critical++
	default:
		summary.Idle++
	}
}

func buildInternalAPIStatus(metric *apiEndpointMetric, now time.Time) InternalAPIStatus {
	avgLatencyMS := int64(0)
	if metric.totalRequests > 0 {
		avgLatencyMS = metric.totalLatency.Milliseconds() / metric.totalRequests
	}

	status := InternalAPIStatus{
		Key:              metric.definition.Key,
		Name:             metric.definition.Name,
		Method:           metric.definition.Method,
		Path:             metric.definition.Path,
		Group:            metric.definition.Group,
		Access:           metric.definition.Access,
		Description:      metric.definition.Description,
		Status:           "idle",
		Enabled:          true,
		TotalRequests:    metric.totalRequests,
		ClientErrors:     metric.clientErrorCount,
		ServerErrors:     metric.serverErrorCount,
		AvgLatencyMS:     avgLatencyMS,
		LastLatencyMS:    metric.lastLatency.Milliseconds(),
		MaxLatencyMS:     metric.maxLatency.Milliseconds(),
		LastStatusCode:   metric.lastStatusCode,
		LastSeenAt:       formatJakartaRFC3339(metric.lastSeenAt),
		LastSeenRelative: humanizeDurationSince(metric.lastSeenAt, now),
		Observed:         metric.totalRequests > 0,
		ObservedUnknown:  metric.observedUnknownDef,
	}

	if metric.totalRequests == 0 {
		status.HealthNote = "Belum ada request yang melewati endpoint ini sejak backend dinyalakan."
		return status
	}

	status.Status = "healthy"
	status.HealthNote = fmt.Sprintf(
		"%d request tercatat, rata-rata %d ms, terakhir %s.",
		metric.totalRequests,
		avgLatencyMS,
		status.LastSeenRelative,
	)

	switch {
	case metric.lastStatusCode >= 500 || metric.serverErrorCount > 0:
		status.Status = "critical"
		status.HealthNote = fmt.Sprintf(
			"Ada %d respons 5xx. Status terakhir %d, terakhir dipanggil %s.",
			metric.serverErrorCount,
			metric.lastStatusCode,
			status.LastSeenRelative,
		)
	case avgLatencyMS >= 1200 || metric.maxLatency >= 2500*time.Millisecond:
		status.Status = "degraded"
		status.HealthNote = fmt.Sprintf(
			"Latency cenderung tinggi. Rata-rata %d ms, puncak %d ms.",
			avgLatencyMS,
			metric.maxLatency.Milliseconds(),
		)
	case metric.clientErrorCount > 0:
		status.HealthNote = fmt.Sprintf(
			"%d request tercatat, %d respons 4xx, terakhir %s.",
			metric.totalRequests,
			metric.clientErrorCount,
			status.LastSeenRelative,
		)
	}

	if metric.observedUnknownDef && status.HealthNote != "" {
		status.HealthNote += " Endpoint ini belum masuk katalog manual."
	}

	return status
}

func formatJakartaRFC3339(t time.Time) string {
	if t.IsZero() {
		return "-"
	}
	jakarta := time.FixedZone("UTC+7", 7*60*60)
	return t.In(jakarta).Format(time.RFC3339)
}

func humanizeDurationSince(t, now time.Time) string {
	if t.IsZero() {
		return "-"
	}

	diff := now.Sub(t)
	switch {
	case diff < time.Minute:
		return "beberapa detik lalu"
	case diff < time.Hour:
		return fmt.Sprintf("%d menit lalu", int(diff.Minutes()))
	case diff < 24*time.Hour:
		return fmt.Sprintf("%d jam lalu", int(diff.Hours()))
	default:
		return fmt.Sprintf("%d hari lalu", int(diff.Hours()/24))
	}
}
