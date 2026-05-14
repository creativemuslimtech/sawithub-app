package platform

import (
	"context"
	"database/sql"
	"encoding/json"
	"fmt"
	"net"
	"net/http"
	"strings"
	"sync"
	"time"

	"github.com/google/uuid"
)

type geoResult struct {
	Country string
	City    string
}

var (
	ipGeoCache sync.Map
	geoClient  = &http.Client{Timeout: 3 * time.Second}
)

func lookupGeo(ip string) geoResult {
	if cached, ok := ipGeoCache.Load(ip); ok {
		return cached.(geoResult)
	}
	parsed := net.ParseIP(ip)
	if parsed == nil || parsed.IsLoopback() || parsed.IsPrivate() {
		return geoResult{Country: "Local", City: "-"}
	}
	resp, err := geoClient.Get(fmt.Sprintf("http://ip-api.com/json/%s?fields=country,city", ip))
	if err != nil {
		return geoResult{}
	}
	defer resp.Body.Close()
	var raw struct {
		Country string `json:"country"`
		City    string `json:"city"`
	}
	json.NewDecoder(resp.Body).Decode(&raw)
	geo := geoResult{Country: raw.Country, City: raw.City}
	ipGeoCache.Store(ip, geo)
	return geo
}

func ClientIPFromRequest(r *http.Request) string {
	if xff := r.Header.Get("X-Forwarded-For"); xff != "" {
		return strings.TrimSpace(strings.Split(xff, ",")[0])
	}
	if xri := r.Header.Get("X-Real-IP"); xri != "" {
		return strings.TrimSpace(xri)
	}
	host, _, err := net.SplitHostPort(r.RemoteAddr)
	if err != nil {
		return r.RemoteAddr
	}
	return host
}

type VisitInput struct {
	SessionID  string
	VisitorID  string
	DeviceType string
	Page       string
	ClientIP   string
}

type PlatformTrafficService struct {
	db *sql.DB
}

func NewPlatformTrafficService(db *sql.DB) *PlatformTrafficService {
	return &PlatformTrafficService{db: db}
}

func (s *PlatformTrafficService) EnqueueRecordVisit(in VisitInput) {
	id := uuid.New().String()
	ip := in.ClientIP
	go func() {
		geo := lookupGeo(ip)
		s.db.ExecContext(context.Background(),
			`INSERT IGNORE INTO t_sawit_hub_visits
			 (id, session_id, visitor_id, ip_address, device_type, country, city, page, created_at)
			 VALUES (?, ?, ?, ?, ?, ?, ?, ?, NOW())`,
			id, in.SessionID, in.VisitorID, ip, in.DeviceType, geo.Country, geo.City, in.Page)
	}()
}
