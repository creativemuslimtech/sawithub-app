package config

import (
	"os"
	"strings"
)

type Config struct {
	DatabaseURL          string
	DatabaseURLRead      string
	AdminDatabaseURL     string
	AdminDatabaseURLRead string
	AdminJWTSecret       string
	EncryptionKey        string
	Port                 string
	FrontendURL          string
	BaseURL              string
	ResendAPIKey         string
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

	// SubscriptionEnforcement mirrors user-app SUBSCRIPTION_ENFORCEMENT for support tooling (BE-01).
	// Deploy should set the same value as backend-sawithub.
	SubscriptionEnforcement bool
}

func Load() *Config {
	return &Config{
		DatabaseURL:          getEnv("DATABASE_URL", ""),
		DatabaseURLRead:      getEnv("DATABASE_URL_READ", ""),
		AdminDatabaseURL:     getEnv("ADMIN_DATABASE_URL", ""),
		AdminDatabaseURLRead: getEnv("ADMIN_DATABASE_URL_READ", ""),
		AdminJWTSecret:       getEnv("ADMIN_JWT_SECRET", "sawit_hub_admin_secret"),
		EncryptionKey:        getEnv("ENCRYPTION_KEY", "sawit_hub_aes_key_32_bytes_long!!"),
		Port:                 getEnv("PORT", "8000"),
		FrontendURL:          getEnv("FRONTEND_URL", "http://localhost:5173"),
		BaseURL:              getEnv("BASE_URL", "http://localhost:8000"),
		ResendAPIKey:         getEnv("RESEND_API_KEY", ""),
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

		SubscriptionEnforcement: getEnvBool("SUBSCRIPTION_ENFORCEMENT", true),
	}
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
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	var n int
	for _, c := range v {
		if c < '0' || c > '9' {
			return fallback
		}
		n = n*10 + int(c-'0')
	}
	return n
}

func getEnvBool(key string, fallback bool) bool {
	v := os.Getenv(key)
	if v == "" {
		return fallback
	}
	switch v {
	case "1", "true", "TRUE", "yes", "YES", "on", "ON":
		return true
	case "0", "false", "FALSE", "no", "NO", "off", "OFF":
		return false
	default:
		return fallback
	}
}
