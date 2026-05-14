package handler

import (
	"context"
	"database/sql"
	"encoding/json"
	"net/http"
	"time"

	"SawitHub/internal/billing"
	"SawitHub/internal/billingdomain"
	"SawitHub/internal/config"
	"SawitHub/internal/farmcore"
	"SawitHub/internal/farmfinance"
	"SawitHub/internal/identity"
	"SawitHub/internal/mailer"
	"SawitHub/internal/notification"
	"SawitHub/internal/notificationapp"
	"SawitHub/internal/platform"
	redisx "SawitHub/internal/redis"
	"SawitHub/internal/reporting"
	"SawitHub/internal/subscription"
)

type Handler struct {
	db                        *sql.DB
	dbRead                    *sql.DB
	cfg                       *config.Config
	mailer                    *mailer.Mailer
	identityAuth              *identity.IdentityAuthService
	identityProfile           *identity.IdentityProfileService
	identitySession           *identity.IdentitySessionService
	farmCorePlot              *farmcore.FarmCorePlotService
	farmCoreHarvest           *farmcore.FarmCoreHarvestService
	farmCoreMaintenance       *farmcore.FarmCoreMaintenanceService
	farmCoreSchedule          *farmcore.FarmCoreMaintenanceScheduleService
	farmCoreChecklist         *farmcore.FarmCoreChecklistService
	farmFinanceIncome         *farmfinance.FarmFinanceIncomeService
	farmFinanceCommodityPrice *farmfinance.FarmFinanceCommodityPriceService
	reportingFarmFinance      *reporting.ReportingFarmFinanceService
	reportingDashboard        *reporting.ReportingDashboardService
	reportingExport           *reporting.ReportingExportService
	notificationCenter        *notificationapp.NotificationCenterService
	platformTheme             *platform.PlatformThemeService
	platformTraffic           *platform.PlatformTrafficService
	billingRevenue            *billingdomain.BillingRevenueService
	billingSubscription       *billingdomain.BillingSubscriptionService
	billingPayment            *billingdomain.BillingPaymentService
	subscription              *subscription.BillingSubscriptionDataService
	presenceEnabled           bool
	redis                     *redisx.Client
}

func New(db *sql.DB, dbRead *sql.DB, cfg *config.Config, presenceEnabled bool, redisClient *redisx.Client) *Handler {
	if dbRead == nil {
		dbRead = db
	}
	mailerSvc := &mailer.Mailer{
		APIKey:      cfg.ResendAPIKey,
		From:        cfg.EmailFrom,
		FrontendURL: cfg.FrontendURL,
	}
	subSvc := subscription.NewBillingSubscriptionDataService(db, dbRead, cfg)
	billingSvc := billing.NewBillingRevenueDataService(db, dbRead, cfg)
	identityProfileSvc := identity.NewIdentityProfileService(db, dbRead, cfg)
	notifSvc := notification.NewNotificationDeliveryService(db, dbRead)
	return &Handler{
		db:                        db,
		dbRead:                    dbRead,
		cfg:                       cfg,
		presenceEnabled:           presenceEnabled,
		redis:                     redisClient,
		mailer:                    mailerSvc,
		identityAuth:              identity.NewIdentityAuthService(db, dbRead, cfg),
		identityProfile:           identityProfileSvc,
		identitySession:           identity.NewIdentitySessionService(cfg, db, redisClient, presenceEnabled),
		farmCorePlot:              farmcore.NewFarmCorePlotService(db, dbRead),
		farmCoreHarvest:           farmcore.NewFarmCoreHarvestService(db, dbRead),
		farmCoreMaintenance:       farmcore.NewFarmCoreMaintenanceService(db, dbRead),
		farmCoreSchedule:          farmcore.NewFarmCoreMaintenanceScheduleService(db, dbRead),
		farmCoreChecklist:         farmcore.NewFarmCoreChecklistService(db, dbRead),
		farmFinanceIncome:         farmfinance.NewFarmFinanceIncomeService(db, dbRead),
		farmFinanceCommodityPrice: farmfinance.NewFarmFinanceCommodityPriceService(dbRead),
		reportingFarmFinance:      reporting.NewReportingFarmFinanceService(dbRead),
		reportingDashboard:        reporting.NewReportingDashboardService(dbRead),
		reportingExport: reporting.NewReportingExportService(
			cfg, mailerSvc, redisClient, subSvc, identityProfileSvc,
		),
		notificationCenter:  notificationapp.NewNotificationCenterService(notifSvc),
		platformTheme:       platform.NewPlatformThemeService(dbRead, cfg.BaseURL),
		platformTraffic:     platform.NewPlatformTrafficService(db),
		billingRevenue:      billingdomain.NewBillingRevenueService(billingSvc),
		billingSubscription: billingdomain.NewBillingSubscriptionService(subSvc),
		billingPayment:      billingdomain.NewBillingPaymentService(cfg, subSvc, dbRead),
		subscription:        subSvc,
	}
}

func jsonError(w http.ResponseWriter, msg string, code int) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(code)
	json.NewEncoder(w).Encode(map[string]string{"error": msg})
}

func jsonSubscriptionRequired(w http.ResponseWriter, msg string) {
	w.Header().Set("Content-Type", "application/json")
	w.WriteHeader(http.StatusPaymentRequired)
	json.NewEncoder(w).Encode(map[string]string{"error": msg, "error_code": "SUBSCRIPTION_REQUIRED"})
}

func (h *Handler) cacheEnabled() bool {
	return h.redis != nil && h.redis.Enabled() && h.cfg.RedisFeatureCache
}

// cacheKey scopes report/dashboard cache per user to avoid cross-user cache poisoning (SEC-12).
func (h *Handler) cacheKey(userID, endpoint, query string) string {
	return h.redis.Key("cache", endpoint, userID, query)
}

func (h *Handler) cacheSetUserPayload(key string, payload interface{}, ttl time.Duration) {
	if !h.cacheEnabled() {
		return
	}
	_ = h.redis.SetJSON(context.Background(), key, payload, ttl)
}

func (h *Handler) Mailer() *mailer.Mailer { return h.mailer }
func (h *Handler) Notification() *notification.NotificationDeliveryService {
	return h.notificationCenter.Raw()
}
func (h *Handler) Subscription() *subscription.BillingSubscriptionDataService { return h.subscription }
