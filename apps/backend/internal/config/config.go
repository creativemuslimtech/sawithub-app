package config

import (
	"fmt"
	"os"
	"strconv"
	"strings"
	"time"
)

type Config struct {
	DatabaseURL          string
	DatabaseURLRead      string
	JWTSecret            string
	EncryptionKey        string
	Port                 string
	FrontendURL          string
	BaseURL              string
	ResendAPIKey         string
	EmailFrom            string
	SupportEmail         string
	RedisAddr            string
	RedisPassword        string
	RedisDB              int
	RedisPoolSize        int
	RedisPrefix          string
	RedisTLS             bool

	RedisFeatureRateLimit bool
	RedisFeatureCache     bool
	RedisFeatureSessions  bool
	RedisFeatureQueue     bool
	RedisFeaturePresence  bool

	SMTPHost                  string
	SMTPPort                  int
	SMTPUser                  string
	SMTPPassword              string
	SMTPFromName              string
	SMTPFromEmail             string
	MailProvider              string
	SubscriptionTrialDays     int
	SubscriptionPlanName      string
	SubscriptionPlanPrice     float64
	SubscriptionCurrency      string
	SubscriptionProvider      string
	SubscriptionEnforcement   bool
	MidtransServerKey         string
	MidtransClientKey         string
	MidtransIsProduction      bool
	EnableRuntimeSchemaSync   bool
	ReminderJobEnabled        bool
	ReminderJobInterval       time.Duration
	NotificationRetentionDays int
	DBMaxOpenConns            int
	DBMaxIdleConns            int
	DBConnMaxLifetime         time.Duration
	DBConnMaxIdleTime         time.Duration

	SentryDSN         string
	SentryEnvironment string
	SentryRelease     string

	LokiURL      string
	LokiUsername string
	LokiPassword string
}

func Load() *Config {
	cfg := &Config{
		DatabaseURL:          getEnv("DATABASE_URL", ""),
		DatabaseURLRead:      getEnv("DATABASE_URL_READ", ""),
		JWTSecret:            getEnv("JWT_SECRET", "sawit_hub_secret"),
		EncryptionKey:        getEnv("ENCRYPTION_KEY", "sawit_hub_aes_key_32_bytes_long!!"),
		Port:                 getEnv("PORT", "8000"),
		FrontendURL:          getEnv("FRONTEND_URL", "http://localhost:5173"),
		BaseURL:              getEnv("BASE_URL", "http://localhost:8000"),
		ResendAPIKey:         getEnv("RESEND_API_KEY", ""),
		EmailFrom:            getEnv("EMAIL_FROM", "onboarding@resend.dev"),
		SupportEmail:         getEnv("SUPPORT_EMAIL", "bantuan@sawithub.app"),
		RedisAddr:            getEnv("REDIS_ADDR", ""),
		RedisPassword:        getEnv("REDIS_PASSWORD", ""),
		RedisDB:              getEnvInt("REDIS_DB", 0),
		RedisPoolSize:        getEnvInt("REDIS_POOL_SIZE", 20),
		RedisPrefix:          getEnv("REDIS_PREFIX", "sawithub:prod"),
		RedisTLS:             getEnvBool("REDIS_TLS", true),

		RedisFeatureRateLimit: getEnvBool("REDIS_FEATURE_RATE_LIMIT", true),
		RedisFeatureCache:     getEnvBool("REDIS_FEATURE_CACHE", true),
		RedisFeatureSessions:  getEnvBool("REDIS_FEATURE_SESSIONS", true),
		RedisFeatureQueue:     getEnvBool("REDIS_FEATURE_QUEUE", true),
		RedisFeaturePresence:  getEnvBool("REDIS_FEATURE_PRESENCE", true),
		SMTPHost:              getEnv("SMTP_HOST", ""),
		SMTPPort:              getEnvInt("SMTP_PORT", 587),
		SMTPUser:              getEnv("SMTP_USER", ""),
		SMTPPassword:          getEnv("SMTP_PASSWORD", ""),
		SMTPFromName:          getEnv("SMTP_FROM_NAME", "SawitHub"),
		SMTPFromEmail:         getEnv("SMTP_FROM_EMAIL", ""),
		MailProvider:          strings.ToLower(strings.TrimSpace(getEnv("MAIL_PROVIDER", ""))),
		SubscriptionTrialDays: getEnvInt("SUBSCRIPTION_TRIAL_DAYS", 14),
		SubscriptionPlanName:  getEnv("SUBSCRIPTION_PLAN_NAME", "Pro Monthly"),
		SubscriptionPlanPrice: getEnvFloat("SUBSCRIPTION_PLAN_PRICE", 30000),
		SubscriptionCurrency:  strings.ToUpper(strings.TrimSpace(getEnv("SUBSCRIPTION_CURRENCY", "IDR"))),
		SubscriptionProvider:  strings.ToLower(strings.TrimSpace(getEnv("PAYMENT_PROVIDER", "mock"))),
		SubscriptionEnforcement: getEnvBool("SUBSCRIPTION_ENFORCEMENT", true),
		MidtransServerKey:       getEnvWithFallback("MIDTRANS_SERVER_KEY", "server_key", ""),
		MidtransClientKey:       getEnvWithFallback("MIDTRANS_CLIENT_KEY", "client_key", ""),
		MidtransIsProduction:    getEnvBool("MIDTRANS_IS_PRODUCTION", false),
		EnableRuntimeSchemaSync: getEnvBool("ENABLE_RUNTIME_SCHEMA_SYNC", false),
		ReminderJobEnabled:      getEnvBool("REMINDER_JOB_ENABLED", true),
		ReminderJobInterval:     getEnvDuration("REMINDER_JOB_INTERVAL", 6*time.Hour),
		NotificationRetentionDays: getEnvInt("NOTIFICATION_RETENTION_DAYS", 90),
		DBMaxOpenConns:            getEnvInt("DB_MAX_OPEN_CONNS", 25),
		DBMaxIdleConns:            getEnvInt("DB_MAX_IDLE_CONNS", 10),
		DBConnMaxLifetime:         getEnvDuration("DB_CONN_MAX_LIFETIME", 10*time.Minute),
		DBConnMaxIdleTime:         getEnvDuration("DB_CONN_MAX_IDLE_TIME", 2*time.Minute),

		SentryDSN:         getEnv("SENTRY_DSN", ""),
		SentryEnvironment: getEnv("SENTRY_ENVIRONMENT", "production"),
		SentryRelease:     getEnv("SENTRY_RELEASE", ""),

		LokiURL:      getEnv("LOKI_URL", ""),
		LokiUsername: getEnv("LOKI_USERNAME", ""),
		LokiPassword: getEnv("LOKI_PASSWORD", ""),
	}
	if strings.TrimSpace(cfg.MidtransServerKey) != "" && strings.TrimSpace(cfg.MidtransClientKey) != "" {
		cfg.SubscriptionProvider = "midtrans"
	} else if strings.TrimSpace(cfg.SubscriptionProvider) == "" {
		cfg.SubscriptionProvider = "mock"
	}
	return cfg
}

func (c *Config) Validate() error {
	required := map[string]string{
		"DATABASE_URL":   c.DatabaseURL,
		"JWT_SECRET":     c.JWTSecret,
		"ENCRYPTION_KEY": c.EncryptionKey,
	}
	var missing []string
	for key, value := range required {
		if strings.TrimSpace(value) == "" {
			missing = append(missing, key)
		}
	}
	if len(missing) > 0 {
		return fmt.Errorf("missing required env: %s", strings.Join(missing, ", "))
	}
	if c.ReminderJobInterval <= 0 {
		return fmt.Errorf("REMINDER_JOB_INTERVAL must be > 0")
	}
	if strings.Contains(c.FrontendURL, "*") {
		return fmt.Errorf("FRONTEND_URL must not contain wildcard (*)")
	}
	return nil
}

// ParseFrontendOrigins splits comma-separated FRONTEND_URL values for CORS. Origins containing '*' are skipped.
func ParseFrontendOrigins(frontendURL string) []string {
	allowed := []string{"capacitor://localhost"}
	if strings.TrimSpace(frontendURL) == "" {
		return allowed
	}
	for _, o := range strings.Split(frontendURL, ",") {
		trim := strings.TrimSpace(o)
		if trim == "" || strings.Contains(trim, "*") {
			continue
		}
		allowed = append(allowed, trim)
	}
	return allowed
}

func getEnv(key, fallback string) string {
	if v := os.Getenv(key); v != "" {
		return v
	}
	return fallback
}

func getEnvInt(key string, fallback int) int {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	parsed, err := strconv.Atoi(v)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvBool(key string, fallback bool) bool {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	parsed, err := strconv.ParseBool(v)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvFloat(key string, fallback float64) float64 {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	parsed, err := strconv.ParseFloat(v, 64)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvDuration(key string, fallback time.Duration) time.Duration {
	v := strings.TrimSpace(os.Getenv(key))
	if v == "" {
		return fallback
	}
	parsed, err := time.ParseDuration(v)
	if err != nil {
		return fallback
	}
	return parsed
}

func getEnvWithFallback(primary, secondary, fallback string) string {
	if v := os.Getenv(primary); v != "" {
		return v
	}
	if v := os.Getenv(secondary); v != "" {
		return v
	}
	return fallback
}
