package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"log"
	"net/http"
	"net/url"
	"strconv"
	"strings"
	"time"

	"SawitHubAdmin/internal/crypto"
	mw "SawitHubAdmin/internal/middleware"
	"SawitHubAdmin/internal/observability"
	"golang.org/x/crypto/bcrypt"
)

var jakartaTimeZone = time.FixedZone("UTC+7", 7*60*60)

const onlineUserWindow = 3 * time.Minute

func prefsOnboardingDoneJSON(raw string) bool {
	raw = strings.TrimSpace(raw)
	if raw == "" {
		return false
	}
	var m map[string]interface{}
	if err := json.Unmarshal([]byte(raw), &m); err != nil {
		return false
	}
	v, ok := m["onboarding_done"]
	if !ok || v == nil {
		return false
	}
	if b, ok := v.(bool); ok {
		return b
	}
	if f, ok := v.(float64); ok {
		return f != 0
	}
	return false
}
const apiEnabledRedisKeySuffix = "control:api_enabled"
const apiEndpointDisabledKeyPrefix = "control:api_endpoint_disabled"

func formatJakartaRFC3339(t time.Time) string {
	if t.IsZero() {
		return "-"
	}
	return t.In(jakartaTimeZone).Format(time.RFC3339)
}

func formatRelativeTime(t time.Time) string {
	if t.IsZero() {
		return "belum pernah aktif"
	}

	diff := time.Since(t)
	if diff < 0 {
		diff = 0
	}

	switch {
	case diff < time.Minute:
		return "baru saja"
	case diff < time.Hour:
		return fmt.Sprintf("%d menit lalu", int(diff.Minutes()))
	case diff < 24*time.Hour:
		return fmt.Sprintf("%d jam lalu", int(diff.Hours()))
	default:
		return fmt.Sprintf("%d hari lalu", int(diff.Hours()/24))
	}
}

func safeDivide(numerator, denominator float64) float64 {
	if denominator == 0 {
		return 0
	}
	return numerator / denominator
}

func percentChange(current, previous float64) float64 {
	switch {
	case previous == 0 && current == 0:
		return 0
	case previous == 0:
		return 100
	default:
		return ((current - previous) / previous) * 100
	}
}

func (h *Handler) loadPaymentsRevenueColumnMeta() {
	h.paymentsRevenueMetaOnce.Do(func() {
		bg, cancel := context.WithTimeout(context.Background(), 5*time.Second)
		defer cancel()
		var n int
		err := h.dbRead.QueryRowContext(bg,
			`SELECT COUNT(*) FROM information_schema.COLUMNS
			 WHERE TABLE_SCHEMA = DATABASE()
			   AND TABLE_NAME = 't_sawit_hub_payments'
			   AND COLUMN_NAME = 'environment'`).Scan(&n)
		if err == nil && n > 0 {
			h.paymentsRevenueHasEnvironment = true
		}
	})
}

// saasPaymentsRevenueExtraWhere adds BI-08 filters: production-only when `environment`
// exists, exclude mock provider/type, exclude mock_* order_ids (Midtrans remains unaffected).
func (h *Handler) saasPaymentsRevenueExtraWhere() string {
	h.loadPaymentsRevenueColumnMeta()
	s := ` AND LOWER(COALESCE(provider,'')) != 'mock'
		   AND (payment_type IS NULL OR LOWER(TRIM(payment_type)) != 'mock')
		   AND SUBSTRING(order_id, 1, 5) != 'mock_'`
	if h.paymentsRevenueHasEnvironment {
		s += `
		   AND LOWER(COALESCE(environment,'')) = 'production'`
	}
	return s
}

func (h *Handler) saasRevenueFiltersApplied() map[string]interface{} {
	h.loadPaymentsRevenueColumnMeta()
	return map[string]interface{}{
		"payment_status_in":              []string{"active", "settlement", "capture"},
		"exclude_provider_mock":          true,
		"exclude_payment_type_mock":      true,
		"exclude_order_id_prefix_mock_":  true,
		"environment_production_when_col": h.paymentsRevenueHasEnvironment,
	}
}

func (h *Handler) AdminOverview(w http.ResponseWriter, r *http.Request) {
	cacheKey := ""
	if h.cacheEnabled() {
		cacheKey = h.cacheKey("admin", "admin-overview", r.URL.RawQuery)
		var cached map[string]interface{}
		if ok, _ := h.redis.GetJSON(r.Context(), cacheKey, &cached); ok {
			observability.IncCacheHit()
			w.Header().Set("Content-Type", "application/json")
			json.NewEncoder(w).Encode(cached)
			return
		}
		observability.IncCacheMiss()
	}
	var totalUsers, activeUsers, totalPanen, totalLahan, totalPerawatan, newUsers7d, onlineUsersNow int64
	var totalRevenue, totalBeratTon float64

	_ = h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_users WHERE deleted_at IS NULL").Scan(&totalUsers)

	thirtyDaysAgo := time.Now().AddDate(0, 0, -30)
	sevenDaysAgo := time.Now().AddDate(0, 0, -7)

	_ = h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(DISTINCT user_id) FROM t_sawit_hub_panen WHERE tanggal_panen >= ?", thirtyDaysAgo).Scan(&activeUsers)

	_ = h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_users WHERE deleted_at IS NULL AND created_at >= ?", sevenDaysAgo).Scan(&newUsers7d)
	if h.presenceEnabled {
		if h.redis != nil && h.redis.Enabled() && h.cfg.RedisFeaturePresence {
			onlineUsersNow = h.redis.CountPresence(r.Context())
		} else {
			_ = h.dbRead.QueryRowContext(r.Context(),
				"SELECT COUNT(*) FROM t_sawit_hub_users WHERE deleted_at IS NULL AND last_seen_at >= ?", time.Now().Add(-onlineUserWindow)).Scan(&onlineUsersNow)
		}
	}

	_ = h.dbRead.QueryRowContext(r.Context(),
		"SELECT COALESCE(SUM(total_pendapatan), 0) FROM t_sawit_hub_panen WHERE deleted_at IS NULL").Scan(&totalRevenue)

	_ = h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_panen WHERE deleted_at IS NULL").Scan(&totalPanen)

	_ = h.dbRead.QueryRowContext(r.Context(),
		"SELECT COALESCE(SUM(berat_kg)/1000, 0) FROM t_sawit_hub_panen WHERE deleted_at IS NULL").Scan(&totalBeratTon)

	_ = h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_lahan WHERE deleted_at IS NULL").Scan(&totalLahan)

	_ = h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_perawatan WHERE deleted_at IS NULL").Scan(&totalPerawatan)

	// Recent activities: actual panen records joined with user info
	var recentActivities []map[string]interface{}
	rows, err := h.dbRead.QueryContext(r.Context(),
		`SELECT u.username, u.email_enc, p.berat_kg, p.total_pendapatan, p.tanggal_panen
		 FROM t_sawit_hub_panen p
		 JOIN t_sawit_hub_users u ON p.user_id = u.user_id
		 WHERE p.deleted_at IS NULL
		 ORDER BY p.tanggal_panen DESC LIMIT 10`)
	if err == nil && rows != nil {
		defer rows.Close()
		for rows.Next() {
			var username, emailEnc, tanggal string
			var beratKg, totalPendapatan float64
			if err := rows.Scan(&username, &emailEnc, &beratKg, &totalPendapatan, &tanggal); err == nil {
				email, _ := decryptField(emailEnc, h.cfg.EncryptionKey)
				recentActivities = append(recentActivities, map[string]interface{}{
					"user":             username,
					"email":            email,
					"action":           "Melakukan panen",
					"berat_kg":         beratKg,
					"total_pendapatan": totalPendapatan,
					"timestamp":        tanggal,
				})
			}
		}
	}

	// Top users by total revenue
	var topUsers []map[string]interface{}
	topRows, err := h.dbRead.QueryContext(r.Context(),
		`SELECT u.username, u.email_enc,
		        COUNT(p.id_panen) as jumlah_panen,
		        COALESCE(SUM(p.berat_kg), 0) as total_berat_kg,
		        COALESCE(SUM(p.total_pendapatan), 0) as total_pendapatan
		 FROM t_sawit_hub_users u
		 LEFT JOIN t_sawit_hub_panen p ON u.user_id = p.user_id AND p.deleted_at IS NULL
		 WHERE u.deleted_at IS NULL
		 GROUP BY u.user_id, u.username, u.email_enc
		 ORDER BY total_pendapatan DESC LIMIT 5`)
	if err == nil && topRows != nil {
		defer topRows.Close()
		for topRows.Next() {
			var username, emailEnc string
			var jumlahPanen int64
			var totalBeratKg, totalPendapatan float64
			if err := topRows.Scan(&username, &emailEnc, &jumlahPanen, &totalBeratKg, &totalPendapatan); err == nil {
				email, _ := decryptField(emailEnc, h.cfg.EncryptionKey)
				topUsers = append(topUsers, map[string]interface{}{
					"username":         username,
					"email":            email,
					"jumlah_panen":     jumlahPanen,
					"total_berat_ton":  totalBeratKg / 1000,
					"total_pendapatan": totalPendapatan,
				})
			}
		}
	}

	// Visit stats
	var visitTotal, visitToday, visitWeb, visitMobile int64
	_ = h.dbRead.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM t_sawit_hub_visits`).Scan(&visitTotal)
	_ = h.dbRead.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM t_sawit_hub_visits WHERE DATE(created_at) = CURDATE()`).Scan(&visitToday)
	_ = h.dbRead.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM t_sawit_hub_visits WHERE device_type = 'web'`).Scan(&visitWeb)
	_ = h.dbRead.QueryRowContext(r.Context(), `SELECT COUNT(*) FROM t_sawit_hub_visits WHERE device_type = 'mobile'`).Scan(&visitMobile)

	var topCountries []map[string]interface{}
	cRows, _ := h.dbRead.QueryContext(r.Context(),
		`SELECT country, COUNT(*) as cnt FROM t_sawit_hub_visits
		 WHERE country != '' AND country IS NOT NULL
		 GROUP BY country ORDER BY cnt DESC LIMIT 5`)
	if cRows != nil {
		defer cRows.Close()
		for cRows.Next() {
			var country string
			var cnt int64
			if cRows.Scan(&country, &cnt) == nil {
				topCountries = append(topCountries, map[string]interface{}{"country": country, "count": cnt})
			}
		}
	}

	// Daily visits last 7 days
	var visitTrend []map[string]interface{}
	tRows, _ := h.dbRead.QueryContext(r.Context(),
		`SELECT DATE(created_at) as day,
		        COUNT(*) as total,
		        SUM(device_type = 'web') as web,
		        SUM(device_type = 'mobile') as mobile
		 FROM t_sawit_hub_visits
		 WHERE created_at >= DATE_SUB(CURDATE(), INTERVAL 6 DAY)
		 GROUP BY DATE(created_at)
		 ORDER BY day ASC`)
	if tRows != nil {
		defer tRows.Close()
		for tRows.Next() {
			var day string
			var total, web, mobile int64
			if tRows.Scan(&day, &total, &web, &mobile) == nil {
				visitTrend = append(visitTrend, map[string]interface{}{
					"day": day, "total": total, "web": web, "mobile": mobile,
				})
			}
		}
	}

	var onlineUsersList []map[string]interface{}
	if h.presenceEnabled {
		onlineRows, err := h.dbRead.QueryContext(r.Context(),
			`SELECT user_id, username, COALESCE(email_enc, ''), COALESCE(full_name_enc, ''), role, last_seen_at
			 FROM t_sawit_hub_users
			 WHERE deleted_at IS NULL AND last_seen_at >= ?
			 ORDER BY last_seen_at DESC
			 LIMIT 8`, time.Now().Add(-onlineUserWindow))
		if err == nil && onlineRows != nil {
			defer onlineRows.Close()
			for onlineRows.Next() {
				var userID, username, emailEnc, fullNameEnc, role string
				var lastSeenAt sql.NullTime
				if err := onlineRows.Scan(&userID, &username, &emailEnc, &fullNameEnc, &role, &lastSeenAt); err == nil {
					email, _ := decryptField(emailEnc, h.cfg.EncryptionKey)
					fullName, _ := decryptField(fullNameEnc, h.cfg.EncryptionKey)
					lastSeenValue := ""
					lastSeenRelative := "belum pernah aktif"
					if lastSeenAt.Valid {
						lastSeenValue = formatJakartaRFC3339(lastSeenAt.Time)
						lastSeenRelative = formatRelativeTime(lastSeenAt.Time)
					}
					onlineUsersList = append(onlineUsersList, map[string]interface{}{
						"user_id":            userID,
						"username":           username,
						"email":              email,
						"full_name":          fullName,
						"role":               role,
						"last_seen_at":       lastSeenValue,
						"last_seen_relative": lastSeenRelative,
					})
				}
			}
		}
	}

	// New users details (last 30 days)
	var newUsersList []map[string]interface{}
	nuRows, err := h.dbRead.QueryContext(r.Context(),
		`SELECT user_id, username, COALESCE(email_enc, ''), COALESCE(full_name_enc, ''), role, created_at
		 FROM t_sawit_hub_users
		 WHERE deleted_at IS NULL AND created_at >= ?
		 ORDER BY created_at DESC LIMIT 20`, thirtyDaysAgo)
	if err != nil {
		log.Printf("admin overview new users query failed: %v", err)
	} else if nuRows != nil {
		defer nuRows.Close()
		for nuRows.Next() {
			var userID, username, emailEnc, fullNameEnc, role, createdAt string
			if nuRows.Scan(&userID, &username, &emailEnc, &fullNameEnc, &role, &createdAt) == nil {
				email, _ := decryptField(emailEnc, h.cfg.EncryptionKey)
				fullName, _ := decryptField(fullNameEnc, h.cfg.EncryptionKey)
				newUsersList = append(newUsersList, map[string]interface{}{
					"user_id":    userID,
					"username":   username,
					"email":      email,
					"full_name":  fullName,
					"role":       role,
					"created_at": createdAt,
				})
			}
		}
	}

	payload := map[string]interface{}{
		"total_users":       totalUsers,
		"online_users_now":  onlineUsersNow,
		"active_users_30d":  activeUsers,
		"new_users_7d":      newUsers7d,
		"total_revenue":     totalRevenue,
		"total_panen":       totalPanen,
		"total_berat_ton":   totalBeratTon,
		"total_lahan":       totalLahan,
		"total_perawatan":   totalPerawatan,
		"system_uptime":     "99.9%",
		"recent_activities": recentActivities,
		"top_users":         topUsers,
		"visit_total":       visitTotal,
		"visit_today":       visitToday,
		"visit_web":         visitWeb,
		"visit_mobile":      visitMobile,
		"visit_trend":       visitTrend,
		"top_countries":     topCountries,
		"online_users_list": onlineUsersList,
		"new_users_list":    newUsersList,
	}
	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(payload)
	if cacheKey != "" {
		h.cacheSetUserPayload(cacheKey, payload, 3*time.Minute)
	}
}

func (h *Handler) AdminUsers(w http.ResponseWriter, r *http.Request) {
	page := 1
	if p := r.URL.Query().Get("page"); p != "" {
		if num, err := strconv.Atoi(p); err == nil && num > 0 {
			page = num
		}
	}

	const perPage = 20
	offset := (page - 1) * perPage

	onlineCutoff := time.Now().Add(-onlineUserWindow)

	var totalCount, activeCount, inactiveCount, onlineCount int64
	_ = h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_users").Scan(&totalCount)
	_ = h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_users WHERE deleted_at IS NULL").Scan(&activeCount)
	_ = h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_users WHERE deleted_at IS NOT NULL").Scan(&inactiveCount)
	if h.presenceEnabled {
		_ = h.dbRead.QueryRowContext(r.Context(),
			"SELECT COUNT(*) FROM t_sawit_hub_users WHERE deleted_at IS NULL AND last_seen_at >= ?", onlineCutoff).Scan(&onlineCount)
	}

	query := `SELECT user_id, username, role, created_at,
	        COALESCE(email_enc, ''),
	        COALESCE(full_name_enc, ''),
	        COALESCE(CAST(preferences_json AS CHAR), ''),
	        deleted_at IS NULL AS is_active,
	        deleted_at
	 FROM t_sawit_hub_users
	 ORDER BY created_at DESC
	 LIMIT ? OFFSET ?`
	args := []interface{}{perPage, offset}
	if h.presenceEnabled {
		query = `SELECT user_id, username, role, created_at,
		        COALESCE(email_enc, ''),
		        COALESCE(full_name_enc, ''),
		        COALESCE(CAST(preferences_json AS CHAR), ''),
		        deleted_at IS NULL AS is_active,
		        deleted_at,
		        last_seen_at,
		        CASE
		          WHEN deleted_at IS NULL AND last_seen_at IS NOT NULL AND last_seen_at >= ? THEN 1
		          ELSE 0
		        END AS is_online
		 FROM t_sawit_hub_users
		 ORDER BY created_at DESC
		 LIMIT ? OFFSET ?`
		args = []interface{}{onlineCutoff, perPage, offset}
	}

	rows, err := h.dbRead.QueryContext(r.Context(), query, args...)
	if err != nil {
		log.Printf("admin users query failed: %v", err)
		jsonError(w, "gagal membaca data pengguna", http.StatusInternalServerError)
		return
	}

	var users []map[string]interface{}
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var userID, username, role, emailEnc, fullNameEnc, prefsEnc string
			var createdAt time.Time
			var deactivatedAt sql.NullTime
			var isActive bool
			lastSeenValue := ""
			lastSeenRelative := "belum pernah aktif"
			isOnline := false
			var scanErr error
			if h.presenceEnabled {
				var lastSeenAt sql.NullTime
				var isOnlineFlag int64
				scanErr = rows.Scan(&userID, &username, &role, &createdAt, &emailEnc, &fullNameEnc, &prefsEnc, &isActive, &deactivatedAt, &lastSeenAt, &isOnlineFlag)
				if lastSeenAt.Valid {
					lastSeenValue = formatJakartaRFC3339(lastSeenAt.Time)
					lastSeenRelative = formatRelativeTime(lastSeenAt.Time)
				}
				isOnline = isOnlineFlag == 1
			} else {
				scanErr = rows.Scan(&userID, &username, &role, &createdAt, &emailEnc, &fullNameEnc, &prefsEnc, &isActive, &deactivatedAt)
			}
			if scanErr == nil {
				email, _ := decryptField(emailEnc, h.cfg.EncryptionKey)
				fullName, _ := decryptField(fullNameEnc, h.cfg.EncryptionKey)
				deactivatedAtValue := ""
				if deactivatedAt.Valid {
					deactivatedAtValue = formatJakartaRFC3339(deactivatedAt.Time)
				}
				users = append(users, map[string]interface{}{
					"user_id":            userID,
					"username":           username,
					"email":              email,
					"full_name":          fullName,
					"role":               role,
					"created_at":         formatJakartaRFC3339(createdAt),
					"is_active":          isActive,
					"is_online":          isOnline,
					"last_seen_at":       lastSeenValue,
					"last_seen_relative": lastSeenRelative,
					"deactivated_at":     deactivatedAtValue,
					"onboarding_done":    prefsOnboardingDoneJSON(prefsEnc),
				})
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"users":          users,
		"total":          totalCount,
		"active_total":   activeCount,
		"inactive_total": inactiveCount,
		"online_total":   onlineCount,
		"page":           page,
		"per_page":       perPage,
		"total_pages":    (totalCount + int64(perPage) - 1) / int64(perPage),
	})
}

func (h *Handler) AdminChangeRole(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	if userID == "" {
		jsonError(w, "invalid user id", http.StatusBadRequest)
		return
	}

	var req struct {
		Role string `json:"role"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	if req.Role != "user" && req.Role != "admin" {
		jsonError(w, "invalid role", http.StatusBadRequest)
		return
	}

	var currentRole string
	var isActive bool
	err := h.dbRead.QueryRowContext(r.Context(),
		"SELECT role, deleted_at IS NULL FROM t_sawit_hub_users WHERE user_id = ?", userID).
		Scan(&currentRole, &isActive)
	if err == sql.ErrNoRows {
		jsonError(w, "pengguna tidak ditemukan", http.StatusNotFound)
		return
	}
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	if currentRole == "admin" && req.Role != "admin" && isActive {
		var activeAdminCount int64
		if err := h.dbRead.QueryRowContext(r.Context(),
			"SELECT COUNT(*) FROM t_sawit_hub_users WHERE role = 'admin' AND deleted_at IS NULL").
			Scan(&activeAdminCount); err == nil && activeAdminCount <= 1 {
			jsonError(w, "admin aktif terakhir tidak bisa diturunkan menjadi user", http.StatusBadRequest)
			return
		}
	}

	_, err = h.db.ExecContext(r.Context(),
		"UPDATE t_sawit_hub_users SET role = ? WHERE user_id = ?", req.Role, userID)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "ok"})
}

func (h *Handler) AdminDeactivateUser(w http.ResponseWriter, r *http.Request) {
	h.AdminToggleUserStatus(w, r)
}

func (h *Handler) AdminToggleUserStatus(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	if userID == "" {
		jsonError(w, "invalid user id", http.StatusBadRequest)
		return
	}

	var role string
	var isActive bool
	err := h.dbRead.QueryRowContext(r.Context(),
		"SELECT role, deleted_at IS NULL FROM t_sawit_hub_users WHERE user_id = ?", userID).
		Scan(&role, &isActive)
	if err == sql.ErrNoRows {
		jsonError(w, "pengguna tidak ditemukan", http.StatusNotFound)
		return
	}
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	currentUserID, _ := r.Context().Value(mw.UserIDKey).(string)
	if isActive && currentUserID != "" && currentUserID == userID {
		jsonError(w, "akun admin yang sedang dipakai tidak bisa dinonaktifkan", http.StatusBadRequest)
		return
	}

	if isActive && role == "admin" {
		var activeAdminCount int64
		if err := h.dbRead.QueryRowContext(r.Context(),
			"SELECT COUNT(*) FROM t_sawit_hub_users WHERE role = 'admin' AND deleted_at IS NULL").
			Scan(&activeAdminCount); err == nil && activeAdminCount <= 1 {
			jsonError(w, "admin aktif terakhir tidak bisa dinonaktifkan", http.StatusBadRequest)
			return
		}
	}

	nextActive := !isActive
	query := "UPDATE t_sawit_hub_users SET deleted_at = NOW() WHERE user_id = ?"
	message := "pengguna berhasil dinonaktifkan"
	if nextActive {
		query = "UPDATE t_sawit_hub_users SET deleted_at = NULL WHERE user_id = ?"
		message = "pengguna berhasil diaktifkan"
	}

	_, err = h.db.ExecContext(r.Context(),
		query, userID)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":   message,
		"is_active": nextActive,
	})
}

func (h *Handler) AdminData(w http.ResponseWriter, r *http.Request) {
	dataType := r.URL.Query().Get("type")
	if dataType == "" {
		dataType = "panen"
	}

	var data []map[string]interface{}

	switch dataType {
	case "panen":
		rows, _ := h.dbRead.QueryContext(r.Context(),
			`SELECT p.id_panen, u.username, u.email_enc, p.tanggal_panen,
			        COALESCE(p.berat_kg,0), COALESCE(p.harga_per_kg,0), COALESCE(p.total_pendapatan,0)
			 FROM t_sawit_hub_panen p
			 JOIN t_sawit_hub_users u ON p.user_id = u.user_id
			 WHERE p.deleted_at IS NULL
			 ORDER BY p.tanggal_panen DESC LIMIT 100`)
		if rows != nil {
			defer rows.Close()
			for rows.Next() {
				var id, username, emailEnc, tanggal string
				var berat, harga, total float64
				if rows.Scan(&id, &username, &emailEnc, &tanggal, &berat, &harga, &total) == nil {
					email, _ := decryptField(emailEnc, h.cfg.EncryptionKey)
					data = append(data, map[string]interface{}{
						"id":               id,
						"username":         username,
						"user_email":       email,
						"tanggal_panen":    tanggal,
						"berat_kg":         berat,
						"harga_per_kg":     harga,
						"total_pendapatan": total,
					})
				}
			}
		}

	case "lahan":
		rows, _ := h.dbRead.QueryContext(r.Context(),
			`SELECT l.id_lahan, u.username, u.email_enc, l.nama_kebun,
			        COALESCE(l.lokasi,''), COALESCE(l.luas_ha,0)
			 FROM t_sawit_hub_lahan l
			 JOIN t_sawit_hub_users u ON l.user_id = u.user_id
			 WHERE l.deleted_at IS NULL
			 ORDER BY l.created_at DESC LIMIT 100`)
		if rows != nil {
			defer rows.Close()
			for rows.Next() {
				var id, username, emailEnc, namaKebun, lokasi string
				var luasHa float64
				if rows.Scan(&id, &username, &emailEnc, &namaKebun, &lokasi, &luasHa) == nil {
					email, _ := decryptField(emailEnc, h.cfg.EncryptionKey)
					data = append(data, map[string]interface{}{
						"id":         id,
						"username":   username,
						"user_email": email,
						"nama_kebun": namaKebun,
						"lokasi":     lokasi,
						"luas_ha":    luasHa,
					})
				}
			}
		}

	case "perawatan":
		rows, _ := h.dbRead.QueryContext(r.Context(),
			`SELECT p.id_perawatan, u.username, u.email_enc, p.tanggal_perawatan,
			        p.jenis_perawatan, COALESCE(p.bahan,''), COALESCE(p.jumlah,0),
			        COALESCE(p.satuan,''), COALESCE(p.total_biaya_perawatan,0)
			 FROM t_sawit_hub_perawatan p
			 JOIN t_sawit_hub_users u ON p.user_id = u.user_id
			 WHERE p.deleted_at IS NULL
			 ORDER BY p.tanggal_perawatan DESC LIMIT 100`)
		if rows != nil {
			defer rows.Close()
			for rows.Next() {
				var id, username, emailEnc, tanggal, jenis, bahan, satuan string
				var jumlah, totalBiaya float64
				if rows.Scan(&id, &username, &emailEnc, &tanggal, &jenis, &bahan, &jumlah, &satuan, &totalBiaya) == nil {
					email, _ := decryptField(emailEnc, h.cfg.EncryptionKey)
					data = append(data, map[string]interface{}{
						"id":              id,
						"username":        username,
						"user_email":      email,
						"tanggal":         tanggal,
						"jenis_perawatan": jenis,
						"bahan":           bahan,
						"jumlah":          jumlah,
						"satuan":          satuan,
						"total_biaya":     totalBiaya,
					})
				}
			}
		}

	case "pendapatan":
		rows, _ := h.dbRead.QueryContext(r.Context(),
			`SELECT p.id_pendapatan, u.username, u.email_enc, p.tanggal_panen,
			        COALESCE(p.total_janjang,0), COALESCE(p.total_berat_kg,0),
			        COALESCE(p.pendapatan_kotor,0), COALESCE(p.biaya_total,0),
			        COALESCE(p.pendapatan_bersih,0)
			 FROM t_sawit_hub_pendapatan p
			 JOIN t_sawit_hub_users u ON p.user_id = u.user_id
			 WHERE p.deleted_at IS NULL
			 ORDER BY p.tanggal_panen DESC LIMIT 100`)
		if rows != nil {
			defer rows.Close()
			for rows.Next() {
				var id, username, emailEnc, tanggal string
				var totalJanjang, totalBeratKg, pendapatanKotor, biayaTotal, pendapatanBersih float64
				if rows.Scan(&id, &username, &emailEnc, &tanggal, &totalJanjang, &totalBeratKg, &pendapatanKotor, &biayaTotal, &pendapatanBersih) == nil {
					email, _ := decryptField(emailEnc, h.cfg.EncryptionKey)
					data = append(data, map[string]interface{}{
						"id":                id,
						"username":          username,
						"user_email":        email,
						"tanggal_panen":     tanggal,
						"total_janjang":     totalJanjang,
						"total_berat_kg":    totalBeratKg,
						"pendapatan_kotor":  pendapatanKotor,
						"biaya_total":       biayaTotal,
						"pendapatan_bersih": pendapatanBersih,
					})
				}
			}
		}

	case "kunjungan":
		rows, _ := h.dbRead.QueryContext(r.Context(),
			`SELECT id, COALESCE(session_id,''), COALESCE(visitor_id,''),
			        COALESCE(ip_address,'-'), COALESCE(device_type,'-'),
			        COALESCE(country,'-'), COALESCE(city,'-'),
			        COALESCE(page,'-'), created_at
			 FROM t_sawit_hub_visits
			 ORDER BY created_at DESC LIMIT 200`)
		if rows != nil {
			defer rows.Close()
			for rows.Next() {
				var id, sessionID, visitorID, ip, deviceType, country, city, page string
				var createdAt sql.NullTime
				if rows.Scan(&id, &sessionID, &visitorID, &ip, &deviceType, &country, &city, &page, &createdAt) == nil {
					createdAtValue := "-"
					if createdAt.Valid {
						createdAtValue = formatJakartaRFC3339(createdAt.Time)
					}
					data = append(data, map[string]interface{}{
						"id":          id,
						"session_id":  sessionID,
						"visitor_id":  visitorID,
						"ip_address":  ip,
						"device_type": deviceType,
						"country":     country,
						"city":        city,
						"page":        page,
						"created_at":  createdAtValue,
					})
				}
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"data": data,
	})
}

func (h *Handler) AdminAnalytics(w http.ResponseWriter, r *http.Request) {
	now := time.Now().In(jakartaTimeZone)
	currentMonthStart := time.Date(now.Year(), now.Month(), 1, 0, 0, 0, 0, jakartaTimeZone)
	periodStart := currentMonthStart.AddDate(0, -5, 0)

	type panenMonthStat struct {
		PanenCount int64
		WeightTon  float64
		Revenue    float64
	}

	monthKeys := make([]string, 0, 6)
	userCounts := make(map[string]int64, 6)
	panenCounts := make(map[string]panenMonthStat, 6)

	for i := 0; i < 6; i++ {
		key := periodStart.AddDate(0, i, 0).Format("2006-01")
		monthKeys = append(monthKeys, key)
		userCounts[key] = 0
		panenCounts[key] = panenMonthStat{}
	}

	uRows, _ := h.dbRead.QueryContext(r.Context(),
		`SELECT DATE_FORMAT(created_at, '%Y-%m') as month, COUNT(*) as count
		 FROM t_sawit_hub_users
		 WHERE deleted_at IS NULL AND created_at >= ?
		 GROUP BY DATE_FORMAT(created_at, '%Y-%m')
		 ORDER BY month ASC`, periodStart)
	if uRows != nil {
		defer uRows.Close()
		for uRows.Next() {
			var month string
			var count int64
			if uRows.Scan(&month, &count) == nil {
				userCounts[month] = count
			}
		}
	}

	pRows, _ := h.dbRead.QueryContext(r.Context(),
		`SELECT DATE_FORMAT(tanggal_panen, '%Y-%m') as month,
		        COUNT(*) as jumlah_panen,
		        COALESCE(SUM(berat_kg)/1000, 0) as berat_ton,
		        COALESCE(SUM(total_pendapatan), 0) as total_pendapatan
		 FROM t_sawit_hub_panen
		 WHERE deleted_at IS NULL AND tanggal_panen >= ?
		 GROUP BY DATE_FORMAT(tanggal_panen, '%Y-%m')
		 ORDER BY month ASC`, periodStart.Format("2006-01-02"))
	if pRows != nil {
		defer pRows.Close()
		for pRows.Next() {
			var month string
			var jumlah int64
			var beratTon, totalPendapatan float64
			if pRows.Scan(&month, &jumlah, &beratTon, &totalPendapatan) == nil {
				panenCounts[month] = panenMonthStat{
					PanenCount: jumlah,
					WeightTon:  beratTon,
					Revenue:    totalPendapatan,
				}
			}
		}
	}

	usersTrend := make([]map[string]interface{}, 0, len(monthKeys))
	panenTrend := make([]map[string]interface{}, 0, len(monthKeys))

	var totalUsers6M, totalPanen6M int64
	var totalRevenue6M, totalWeight6M float64
	bestMonthKey := ""
	bestMonthRevenue := -1.0
	bestMonthStat := panenMonthStat{}

	for _, key := range monthKeys {
		userCount := userCounts[key]
		panenStat := panenCounts[key]

		usersTrend = append(usersTrend, map[string]interface{}{
			"month": key,
			"count": userCount,
		})
		panenTrend = append(panenTrend, map[string]interface{}{
			"month":                  key,
			"jumlah_panen":           panenStat.PanenCount,
			"berat_ton":              panenStat.WeightTon,
			"total_pendapatan":       panenStat.Revenue,
			"avg_pendapatan":         safeDivide(panenStat.Revenue, float64(panenStat.PanenCount)),
			"avg_berat_ton":          safeDivide(panenStat.WeightTon, float64(panenStat.PanenCount)),
			"avg_harga_per_kg":       safeDivide(panenStat.Revenue, panenStat.WeightTon*1000),
			"revenue_per_ton":        safeDivide(panenStat.Revenue, panenStat.WeightTon),
			"registrasi_pengguna":    userCount,
			"kontribusi_revenue_pct": 0,
		})

		totalUsers6M += userCount
		totalPanen6M += panenStat.PanenCount
		totalRevenue6M += panenStat.Revenue
		totalWeight6M += panenStat.WeightTon

		if panenStat.Revenue > bestMonthRevenue {
			bestMonthRevenue = panenStat.Revenue
			bestMonthKey = key
			bestMonthStat = panenStat
		}
	}

	if totalRevenue6M > 0 {
		for _, point := range panenTrend {
			revenue, _ := point["total_pendapatan"].(float64)
			point["kontribusi_revenue_pct"] = safeDivide(revenue, totalRevenue6M) * 100
		}
	}

	currentKey := currentMonthStart.Format("2006-01")
	previousKey := currentMonthStart.AddDate(0, -1, 0).Format("2006-01")

	currentUsers := userCounts[currentKey]
	previousUsers := userCounts[previousKey]
	currentPanen := panenCounts[currentKey]
	previousPanen := panenCounts[previousKey]

	var activeUsers30D, activeLahan90D int64
	_ = h.dbRead.QueryRowContext(r.Context(),
		`SELECT COUNT(DISTINCT user_id)
		 FROM t_sawit_hub_panen
		 WHERE deleted_at IS NULL AND tanggal_panen >= ?`,
		now.AddDate(0, 0, -30).Format("2006-01-02"),
	).Scan(&activeUsers30D)
	_ = h.dbRead.QueryRowContext(r.Context(),
		`SELECT COUNT(DISTINCT id_lahan)
		 FROM t_sawit_hub_panen
		 WHERE deleted_at IS NULL AND tanggal_panen >= ?`,
		now.AddDate(0, 0, -90).Format("2006-01-02"),
	).Scan(&activeLahan90D)

	topProducers := make([]map[string]interface{}, 0, 5)
	topRows, _ := h.dbRead.QueryContext(r.Context(),
		`SELECT u.username,
		        COUNT(p.id_panen) AS panen_count,
		        COALESCE(SUM(p.berat_kg)/1000, 0) AS total_berat_ton,
		        COALESCE(SUM(p.total_pendapatan), 0) AS total_pendapatan,
		        COALESCE(AVG(p.harga_per_kg), 0) AS avg_harga_per_kg
		 FROM t_sawit_hub_users u
		 JOIN t_sawit_hub_panen p ON p.user_id = u.user_id
		 WHERE u.deleted_at IS NULL
		   AND p.deleted_at IS NULL
		   AND p.tanggal_panen >= ?
		 GROUP BY u.user_id, u.username
		 ORDER BY total_pendapatan DESC, total_berat_ton DESC, u.username ASC
		 LIMIT 5`, periodStart.Format("2006-01-02"))
	if topRows != nil {
		defer topRows.Close()
		for topRows.Next() {
			var username string
			var panenCount int64
			var totalBeratTon, totalPendapatan, avgHargaPerKg float64
			if topRows.Scan(&username, &panenCount, &totalBeratTon, &totalPendapatan, &avgHargaPerKg) == nil {
				topProducers = append(topProducers, map[string]interface{}{
					"username":          username,
					"panen_count":       panenCount,
					"total_berat_ton":   totalBeratTon,
					"total_pendapatan":  totalPendapatan,
					"avg_harga_per_kg":  avgHargaPerKg,
					"avg_revenue_panen": safeDivide(totalPendapatan, float64(panenCount)),
				})
			}
		}
	}

	var bestMonth map[string]interface{}
	if bestMonthRevenue > 0 {
		bestMonth = map[string]interface{}{
			"month":            bestMonthKey,
			"jumlah_panen":     bestMonthStat.PanenCount,
			"berat_ton":        bestMonthStat.WeightTon,
			"total_pendapatan": bestMonthStat.Revenue,
		}
	}

	// SaaS / langganan (Midtrans) — terpisah dari revenue panen petani (CFO-13).
	// BI-08: exclude mock / non-production (when `environment` column exists) for finance parity.
	var saasGross6M, saasGrossMonth float64
	paidStatuses := `payment_status IN ('active','settlement','capture')`
	saasPayWhere := h.saasPaymentsRevenueExtraWhere()
	_ = h.dbRead.QueryRowContext(r.Context(),
		`SELECT COALESCE(SUM(CASE WHEN `+paidStatuses+` THEN gross_amount ELSE 0 END), 0)
		 FROM t_sawit_hub_payments
		 WHERE deleted_at IS NULL
		   AND COALESCE(paid_at, created_at) >= ?
		   AND COALESCE(paid_at, created_at) < ?`+saasPayWhere,
		periodStart, now.AddDate(0, 0, 1),
	).Scan(&saasGross6M)
	monthEnd := currentMonthStart.AddDate(0, 1, 0)
	_ = h.dbRead.QueryRowContext(r.Context(),
		`SELECT COALESCE(SUM(CASE WHEN `+paidStatuses+` THEN gross_amount ELSE 0 END), 0)
		 FROM t_sawit_hub_payments
		 WHERE deleted_at IS NULL
		   AND COALESCE(paid_at, created_at) >= ?
		   AND COALESCE(paid_at, created_at) < ?`+saasPayWhere,
		currentMonthStart, monthEnd,
	).Scan(&saasGrossMonth)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"generated_at":                     formatJakartaRFC3339(now),
		"period_label":                     "6 bulan terakhir",
		"users_trend":                      usersTrend,
		"panen_trend":                      panenTrend,
		"new_users_month":                  currentUsers,
		"panen_month":                      currentPanen.PanenCount,
		"revenue_month":                    currentPanen.Revenue,
		"weight_month":                     currentPanen.WeightTon,
		"new_users_growth_pct":             percentChange(float64(currentUsers), float64(previousUsers)),
		"panen_growth_pct":                 percentChange(float64(currentPanen.PanenCount), float64(previousPanen.PanenCount)),
		"revenue_growth_pct":               percentChange(currentPanen.Revenue, previousPanen.Revenue),
		"weight_growth_pct":                percentChange(currentPanen.WeightTon, previousPanen.WeightTon),
		"active_users_30d":                 activeUsers30D,
		"active_lahan_90d":                 activeLahan90D,
		"avg_revenue_per_harvest_month":    safeDivide(currentPanen.Revenue, float64(currentPanen.PanenCount)),
		"avg_weight_ton_per_harvest_month": safeDivide(currentPanen.WeightTon, float64(currentPanen.PanenCount)),
		"avg_price_per_kg_month":           safeDivide(currentPanen.Revenue, currentPanen.WeightTon*1000),
		"total_users_6m":                   totalUsers6M,
		"total_panen_6m":                   totalPanen6M,
		"total_revenue_6m":                 totalRevenue6M,
		"total_weight_6m":                  totalWeight6M,
		"avg_revenue_per_harvest_6m":       safeDivide(totalRevenue6M, float64(totalPanen6M)),
		"avg_weight_ton_per_harvest_6m":    safeDivide(totalWeight6M, float64(totalPanen6M)),
		"avg_price_per_kg_6m":              safeDivide(totalRevenue6M, totalWeight6M*1000),
		"best_month":                       bestMonth,
		"top_producers":                    topProducers,
		"saas_gross_revenue_6m":            saasGross6M,
		"saas_gross_revenue_month":         saasGrossMonth,
		"saas_revenue_filters_applied":     h.saasRevenueFiltersApplied(),
		"revenue_attribution_note":         "revenue_month dan total_revenue_6m di blok panen berasal dari t_sawit_hub_panen (ekonomi kebun). Pendapatan langganan SaaS (saas_gross_*) dihitung dari t_sawit_hub_payments dengan status settlement/capture/active, mengecualikan pembayaran mock dan — jika kolom tersedia — membatasi environment=production.",
	})
}

func (h *Handler) AdminSystem(w http.ResponseWriter, r *http.Request) {
	// Real DB health check
	dbStatus := "healthy"
	if err := h.dbRead.PingContext(r.Context()); err != nil {
		dbStatus = "critical"
	}

	today := time.Now().In(jakartaTimeZone).Format("2006-01-02")
	var totalUsers, newUsersToday, totalPanenToday, totalLahan, totalPerawatan int64
	var revenueToday float64

	h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_users WHERE deleted_at IS NULL").Scan(&totalUsers)
	h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_users WHERE deleted_at IS NULL AND DATE(created_at) = ?", today).Scan(&newUsersToday)
	h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*), COALESCE(SUM(total_pendapatan),0) FROM t_sawit_hub_panen WHERE deleted_at IS NULL AND DATE(tanggal_panen) = ?", today).Scan(&totalPanenToday, &revenueToday)
	h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_lahan WHERE deleted_at IS NULL").Scan(&totalLahan)
	h.dbRead.QueryRowContext(r.Context(),
		"SELECT COUNT(*) FROM t_sawit_hub_perawatan WHERE deleted_at IS NULL").Scan(&totalPerawatan)

	apiStatuses := h.getAPIStatuses(r.Context())
	apiEnabled := h.readAPIEnabled(r.Context())
	apiSummary := internalAPISummary{}
	internalAPIStatuses := []internalAPIStatus{}
	if h.apiMonitor != nil {
		apiSummary, internalAPIStatuses = h.apiMonitor.Snapshot()
	}
	for i := range internalAPIStatuses {
		internalAPIStatuses[i].Enabled = h.readEndpointEnabled(
			r.Context(),
			internalAPIStatuses[i].Method,
			internalAPIStatuses[i].Path,
		)
	}

	// Recent registrations as activity feed
	var recentActivity []map[string]interface{}
	aRows, _ := h.dbRead.QueryContext(r.Context(),
		`SELECT username, COALESCE(email_enc,''), role, created_at
		 FROM t_sawit_hub_users WHERE deleted_at IS NULL
		 ORDER BY created_at DESC LIMIT 10`)
	if aRows != nil {
		defer aRows.Close()
		for aRows.Next() {
			var username, emailEnc, role, createdAt string
			if aRows.Scan(&username, &emailEnc, &role, &createdAt) == nil {
				email, _ := decryptField(emailEnc, h.cfg.EncryptionKey)
				recentActivity = append(recentActivity, map[string]interface{}{
					"username":   username,
					"email":      email,
					"role":       role,
					"created_at": createdAt,
				})
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"db_status":           dbStatus,
		"total_users":         totalUsers,
		"new_users_today":     newUsersToday,
		"panen_today":         totalPanenToday,
		"revenue_today":       revenueToday,
		"total_lahan":         totalLahan,
		"total_perawatan":     totalPerawatan,
		"api_status":          apiStatuses,
		"api_enabled":         apiEnabled,
		"api_summary":         apiSummary,
		"internal_api_status": internalAPIStatuses,
		"recent_activity":     recentActivity,
	})
}

func (h *Handler) readAPIEnabled(ctx context.Context) bool {
	if h.redis == nil || !h.redis.Enabled() || h.redis.Raw() == nil {
		return true
	}
	raw, err := h.redis.Raw().Get(ctx, h.redis.Key(apiEnabledRedisKeySuffix)).Result()
	if err != nil {
		return true
	}
	v := strings.ToLower(strings.TrimSpace(raw))
	return !(v == "0" || v == "false" || v == "off" || v == "disabled")
}

func endpointToggleRedisKey(method, path string) string {
	method = strings.ToUpper(strings.TrimSpace(method))
	path = normalizeAPIPath(path)
	return apiEndpointDisabledKeyPrefix + ":" + url.QueryEscape(method+" "+path)
}

func (h *Handler) readEndpointEnabled(ctx context.Context, method, path string) bool {
	if h.redis == nil || !h.redis.Enabled() || h.redis.Raw() == nil {
		return true
	}
	raw, err := h.redis.Raw().Get(ctx, h.redis.Key(endpointToggleRedisKey(method, path))).Result()
	if err != nil {
		return true
	}
	v := strings.ToLower(strings.TrimSpace(raw))
	return !(v == "1" || v == "true" || v == "off" || v == "disabled")
}

func (h *Handler) AdminSetAPIState(w http.ResponseWriter, r *http.Request) {
	if h.redis == nil || !h.redis.Enabled() || h.redis.Raw() == nil {
		jsonError(w, "redis tidak aktif, toggle API tidak tersedia", http.StatusServiceUnavailable)
		return
	}

	var req struct {
		APIEnabled bool `json:"api_enabled"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	value := "0"
	if req.APIEnabled {
		value = "1"
	}
	if err := h.redis.Raw().Set(r.Context(), h.redis.Key(apiEnabledRedisKeySuffix), value, 0).Err(); err != nil {
		jsonError(w, "gagal menyimpan status API", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message":     "ok",
		"api_enabled": req.APIEnabled,
	})
}

func (h *Handler) AdminSetEndpointAPIState(w http.ResponseWriter, r *http.Request) {
	if h.redis == nil || !h.redis.Enabled() || h.redis.Raw() == nil {
		jsonError(w, "redis tidak aktif, toggle endpoint API tidak tersedia", http.StatusServiceUnavailable)
		return
	}

	var req struct {
		Method  string `json:"method"`
		Path    string `json:"path"`
		Enabled bool   `json:"enabled"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	req.Method = strings.ToUpper(strings.TrimSpace(req.Method))
	req.Path = normalizeAPIPath(req.Path)
	if req.Method == "" || req.Path == "" || !strings.HasPrefix(req.Path, "/api/") {
		jsonError(w, "method/path endpoint tidak valid", http.StatusBadRequest)
		return
	}

	key := h.redis.Key(endpointToggleRedisKey(req.Method, req.Path))
	value := "1"
	if req.Enabled {
		value = "0"
	}
	if err := h.redis.Raw().Set(r.Context(), key, value, 0).Err(); err != nil {
		jsonError(w, "gagal menyimpan status endpoint API", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"message": "ok",
		"method":  req.Method,
		"path":    req.Path,
		"enabled": req.Enabled,
	})
}

func (h *Handler) AdminSettings(w http.ResponseWriter, r *http.Request) {
	if r.Method == "GET" {
		var primaryColor, secondaryColor, bgColor string
		h.dbRead.QueryRowContext(r.Context(),
			"SELECT primary_color, secondary_color, background_color FROM t_sawit_hub_theme_configs LIMIT 1").
			Scan(&primaryColor, &secondaryColor, &bgColor)

		w.Header().Set("Content-Type", "application/json")
		json.NewEncoder(w).Encode(map[string]interface{}{
			"primary_color":    primaryColor,
			"secondary_color":  secondaryColor,
			"background_color": bgColor,
		})
	}
}

func (h *Handler) AdminUpdateSettings(w http.ResponseWriter, r *http.Request) {
	var req map[string]string
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	_, err := h.db.ExecContext(r.Context(),
		`UPDATE t_sawit_hub_theme_configs SET
		primary_color=?, secondary_color=?, background_color=?`,
		req["primary_color"], req["secondary_color"], req["background_color"])
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{"message": "ok"})
}

func (h *Handler) AdminAudit(w http.ResponseWriter, r *http.Request) {
	page := 1
	if p := r.URL.Query().Get("page"); p != "" {
		if num, err := strconv.Atoi(p); err == nil && num > 0 {
			page = num
		}
	}
	actionFilter := r.URL.Query().Get("type")
	offset := (page - 1) * 20

	// Activity feed from real data tables via UNION
	baseQuery := `
		SELECT activity_time, username, email_enc, action_type, entity_type, detail FROM (
			SELECT p.created_at as activity_time, u.username, u.email_enc,
			       'tambah_panen' as action_type, 'panen' as entity_type,
			       CONCAT('Panen ', COALESCE(p.berat_kg,0), ' kg • Rp ', FORMAT(COALESCE(p.total_pendapatan,0),0,'id_ID')) as detail
			FROM t_sawit_hub_panen p JOIN t_sawit_hub_users u ON p.user_id = u.user_id
			WHERE p.deleted_at IS NULL
			UNION ALL
			SELECT l.created_at, u.username, u.email_enc,
			       'tambah_lahan', 'lahan',
			       CONCAT(l.nama_kebun, ' • ', COALESCE(l.luas_ha,0), ' ha')
			FROM t_sawit_hub_lahan l JOIN t_sawit_hub_users u ON l.user_id = u.user_id
			WHERE l.deleted_at IS NULL
			UNION ALL
			SELECT pr.created_at, u.username, u.email_enc,
			       'tambah_perawatan', 'perawatan',
			       CONCAT(pr.jenis_perawatan, ' • Rp ', FORMAT(COALESCE(pr.total_biaya_perawatan,0),0,'id_ID'))
			FROM t_sawit_hub_perawatan pr JOIN t_sawit_hub_users u ON pr.user_id = u.user_id
			WHERE pr.deleted_at IS NULL
			UNION ALL
			SELECT u.created_at, u.username, u.email_enc,
			       'daftar', 'user',
			       CONCAT('Akun baru terdaftar sebagai ', u.role)
			FROM t_sawit_hub_users u
			WHERE u.deleted_at IS NULL
		) AS feed`

	var args []interface{}
	if actionFilter != "" && actionFilter != "all" {
		baseQuery += ` WHERE action_type = ?`
		args = append(args, actionFilter)
	}
	baseQuery += ` ORDER BY activity_time DESC LIMIT 20 OFFSET ?`
	args = append(args, offset)

	rows, _ := h.dbRead.QueryContext(r.Context(), baseQuery, args...)
	var logs []map[string]interface{}
	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var activityTime, username, emailEnc, actionType, entityType, detail string
			if rows.Scan(&activityTime, &username, &emailEnc, &actionType, &entityType, &detail) == nil {
				email, _ := decryptField(emailEnc, h.cfg.EncryptionKey)
				logs = append(logs, map[string]interface{}{
					"username":      username,
					"user_email":    email,
					"action_type":   actionType,
					"entity_type":   entityType,
					"detail":        detail,
					"activity_time": activityTime,
				})
			}
		}
	}

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]interface{}{
		"logs": logs,
		"page": page,
	})
}

func decryptField(encrypted string, key string) (string, error) {
	if encrypted == "" {
		return "", nil
	}
	return crypto.Decrypt(encrypted, key)
}

// AdminChangeUserPassword allows admin to change any user's password
func (h *Handler) AdminChangeUserPassword(w http.ResponseWriter, r *http.Request) {
	userID := r.PathValue("id")
	if userID == "" {
		jsonError(w, "user ID required", http.StatusBadRequest)
		return
	}

	var req struct {
		NewPassword     string `json:"new_password"`
		ConfirmPassword string `json:"confirm_password"`
	}
	if err := json.NewDecoder(r.Body).Decode(&req); err != nil {
		jsonError(w, "invalid request", http.StatusBadRequest)
		return
	}

	// Trim whitespace
	req.NewPassword = strings.TrimSpace(req.NewPassword)
	req.ConfirmPassword = strings.TrimSpace(req.ConfirmPassword)

	// Validate
	if req.NewPassword == "" {
		jsonError(w, "password tidak boleh kosong", http.StatusBadRequest)
		return
	}
	if len(req.NewPassword) < 8 {
		jsonError(w, "password minimal 8 karakter", http.StatusBadRequest)
		return
	}
	if req.NewPassword != req.ConfirmPassword {
		jsonError(w, "password tidak cocok", http.StatusBadRequest)
		return
	}

	// Check if user exists and is not deleted
	var username string
	err := h.dbRead.QueryRowContext(r.Context(),
		"SELECT username FROM t_sawit_hub_users WHERE user_id = ? AND deleted_at IS NULL",
		userID,
	).Scan(&username)
	if err == sql.ErrNoRows {
		jsonError(w, "pengguna tidak ditemukan", http.StatusNotFound)
		return
	}
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	// Hash new password
	pwHash, err := bcrypt.GenerateFromPassword([]byte(req.NewPassword), bcrypt.DefaultCost)
	if err != nil {
		jsonError(w, "server error", http.StatusInternalServerError)
		return
	}

	// Update password
	_, err = h.db.ExecContext(r.Context(),
		"UPDATE t_sawit_hub_users SET password_hash = ?, updated_at = NOW() WHERE user_id = ?",
		string(pwHash), userID,
	)
	if err != nil {
		jsonError(w, "gagal mengubah password", http.StatusInternalServerError)
		return
	}

	log.Printf("Admin changed password for user %s (%s)", userID, username)

	w.Header().Set("Content-Type", "application/json")
	json.NewEncoder(w).Encode(map[string]string{
		"message": "Password berhasil diubah",
	})
}
