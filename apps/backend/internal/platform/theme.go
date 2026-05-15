package platform

import (
	"context"
	"database/sql"
)

type ThemePublicConfig struct {
	PrimaryColor string `json:"primary_color"`
	BgColor      string `json:"bg_color"`
	FontFamily   string `json:"font_family"`
	LogoURL      string `json:"logo_url"`
	UpdatedAt    string `json:"updated_at"`
}

type PlatformThemeService struct {
	dbRead  *sql.DB
	baseURL string
}

func NewPlatformThemeService(dbRead *sql.DB, baseURL string) *PlatformThemeService {
	return &PlatformThemeService{dbRead: dbRead, baseURL: baseURL}
}

func (s *PlatformThemeService) PublicConfig(ctx context.Context) ThemePublicConfig {
	defaults := ThemePublicConfig{
		PrimaryColor: "#7a5cff",
		BgColor:      "#0f0f23",
		FontFamily:   "Inter",
		LogoURL:      s.baseURL + "/static/logo.png",
		UpdatedAt:    "2024-01-01T00:00:00Z",
	}
	var primaryColor, bgColor, updatedAt string
	err := s.dbRead.QueryRowContext(ctx, `
		SELECT primary_color, background_color,
		       DATE_FORMAT(updated_at, '%Y-%m-%dT%H:%i:%sZ')
		FROM t_sawit_hub_theme_configs
		LIMIT 1
	`).Scan(&primaryColor, &bgColor, &updatedAt)
	if err != nil {
		return defaults
	}
	return ThemePublicConfig{
		PrimaryColor: primaryColor,
		BgColor:      bgColor,
		FontFamily:   "Inter",
		LogoURL:      s.baseURL + "/static/logo.png",
		UpdatedAt:    updatedAt,
	}
}
