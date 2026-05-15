package reporting

import (
	"context"
	"encoding/base64"
	"fmt"
	"net/http"
	"strings"

	"sawithub/backend/internal/config"
	"sawithub/backend/internal/identity"
	"sawithub/backend/internal/mailer"
	redisx "sawithub/backend/internal/redis"
	"sawithub/backend/internal/subscription"
)

type ReportingExportService struct {
	cfg             *config.Config
	mailer          *mailer.Mailer
	redis           *redisx.Client
	subscription    *subscription.BillingSubscriptionDataService
	identityProfile *identity.IdentityProfileService
}

func NewReportingExportService(
	cfg *config.Config,
	mailer *mailer.Mailer,
	redis *redisx.Client,
	subscription *subscription.BillingSubscriptionDataService,
	identityProfile *identity.IdentityProfileService,
) *ReportingExportService {
	return &ReportingExportService{
		cfg:             cfg,
		mailer:          mailer,
		redis:           redis,
		subscription:    subscription,
		identityProfile: identityProfile,
	}
}

// SendFarmFinanceExportEmail returns JSON body fields for the client. Trial usage is incremented only on synchronous send (not when queued).
func (s *ReportingExportService) SendFarmFinanceExportEmail(ctx context.Context, userID string, req FarmFinanceExportEmailRequest) (map[string]string, error) {
	if strings.TrimSpace(s.mailer.APIKey) == "" {
		return nil, httpErr(http.StatusServiceUnavailable, "layanan email belum dikonfigurasi")
	}

	req.Format = strings.ToLower(strings.TrimSpace(req.Format))
	req.Filename = strings.TrimSpace(req.Filename)
	req.MimeType = strings.TrimSpace(req.MimeType)
	req.ContentBase = strings.TrimSpace(req.ContentBase)
	req.PeriodLabel = strings.TrimSpace(req.PeriodLabel)
	req.LahanName = strings.TrimSpace(req.LahanName)

	if req.Format != "pdf" && req.Format != "xlsx" {
		return nil, httpErr(http.StatusBadRequest, "format export tidak didukung")
	}
	if req.Filename == "" || req.MimeType == "" || req.ContentBase == "" {
		return nil, httpErr(http.StatusBadRequest, "lampiran export belum lengkap")
	}
	if err := s.subscription.EnsureTrialUsageAllowed(ctx, userID, "trial_report_export_used", 1, "batas trial export laporan sudah tercapai (maksimal 1 kali)"); err != nil {
		return nil, httpErr(http.StatusPaymentRequired, err.Error())
	}
	if _, err := base64.StdEncoding.DecodeString(req.ContentBase); err != nil {
		return nil, httpErr(http.StatusBadRequest, "isi file export tidak valid")
	}

	email, fullName, username, err := s.identityProfile.GetUserContact(ctx, userID)
	if err != nil || email == "" {
		return nil, httpErr(http.StatusNotFound, "email pengguna tidak ditemukan")
	}
	if fullName == "" {
		fullName = username
	}
	if fullName == "" {
		fullName = "Pengguna SawitHub"
	}
	if req.LahanName == "" {
		req.LahanName = "Semua Kebun"
	}

	subject := fmt.Sprintf("Laporan Keuangan SawitHub %s • %s", req.PeriodLabel, fullName)
	html := buildFarmFinanceExportEmailHTML(fullName, username, req)

	if s.redis != nil && s.redis.Enabled() && s.cfg.RedisFeatureQueue {
		jobID, qErr := s.redis.EnqueueEmailJob(ctx, "email", redisx.EmailJob{
			Type:        "report",
			ToEmail:     email,
			Subject:     subject,
			HTML:        html,
			Attachment:  req.ContentBase,
			Filename:    req.Filename,
			ContentType: req.MimeType,
		})
		if qErr != nil {
			return nil, httpErr(http.StatusBadGateway, "gagal enqueue laporan email")
		}
		return map[string]string{
			"message": "Laporan masuk antrean pengiriman email",
			"email":   email,
			"job_id":  jobID,
		}, nil
	}

	err = s.mailer.SendReport(email, subject, html, mailer.Attachment{
		Filename:    req.Filename,
		Content:     req.ContentBase,
		ContentType: req.MimeType,
	})
	if err != nil {
		return nil, httpErr(http.StatusBadGateway, "gagal mengirim laporan ke email")
	}

	_ = s.subscription.IncrementTrialUsage(ctx, userID, "trial_report_export_used")
	return map[string]string{
		"message": "Laporan berhasil dikirim ke email Anda",
		"email":   email,
	}, nil
}

func buildFarmFinanceExportEmailHTML(fullName, username string, req FarmFinanceExportEmailRequest) string {
	insightItems := ""
	for index, insight := range req.Insights {
		if strings.TrimSpace(insight) == "" {
			continue
		}
		insightItems += fmt.Sprintf(
			`<li style="margin:0 0 12px;padding:12px 14px;border:1px solid rgba(255,255,255,0.08);border-radius:14px;background:rgba(255,255,255,0.03);line-height:1.6;color:#dbe7de"><strong style="color:#86efac">%d.</strong> %s</li>`,
			index+1,
			insight,
		)
	}
	if insightItems == "" {
		insightItems = `<li style="margin:0;padding:12px 14px;border:1px solid rgba(255,255,255,0.08);border-radius:14px;background:rgba(255,255,255,0.03);line-height:1.6;color:#dbe7de">Lampiran laporan sudah disiapkan dan terpasang di email ini.</li>`
	}

	return fmt.Sprintf(`
<div style="font-family:Inter,Segoe UI,Arial,sans-serif;max-width:760px;margin:0 auto;padding:28px;background:#07110b;color:#ffffff">
  <div style="padding:28px;border-radius:28px;border:1px solid rgba(255,255,255,0.08);background:linear-gradient(145deg,#0c1c13 0%%,#112317 52%%,#2a1b0f 100%%);box-shadow:0 26px 60px rgba(0,0,0,0.28)">
    <div style="display:inline-block;padding:8px 12px;border-radius:999px;background:rgba(34,197,94,0.14);border:1px solid rgba(34,197,94,0.22);color:#d1fae5;font-size:11px;letter-spacing:0.18em;text-transform:uppercase">Finance Command View</div>
    <h1 style="margin:18px 0 10px;font-size:30px;line-height:1.2">Halo %s, laporan keuangan Anda sudah siap.</h1>
    <p style="margin:0;color:rgba(255,255,255,0.72);line-height:1.8">Lampiran %s ini dibuat untuk <strong style="color:#ffffff">%s</strong> pada periode <strong style="color:#ffffff">%s</strong>. Salinan file yang sama dengan hasil unduhan Anda sudah kami kirimkan ke email ini.</p>

    <div style="display:grid;grid-template-columns:repeat(2,minmax(0,1fr));gap:12px;margin-top:24px">
      <div style="padding:16px 18px;border-radius:18px;background:rgba(7,12,16,0.48);border:1px solid rgba(34,197,94,0.18)">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#86efac">Total Produksi</div>
        <div style="margin-top:8px;font-size:24px;font-weight:700">%s</div>
      </div>
      <div style="padding:16px 18px;border-radius:18px;background:rgba(7,12,16,0.48);border:1px solid rgba(250,204,21,0.18)">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#fde68a">Pendapatan</div>
        <div style="margin-top:8px;font-size:24px;font-weight:700">%s</div>
      </div>
      <div style="padding:16px 18px;border-radius:18px;background:rgba(7,12,16,0.48);border:1px solid rgba(248,113,113,0.18)">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#fda4af">Total Biaya</div>
        <div style="margin-top:8px;font-size:24px;font-weight:700">%s</div>
      </div>
      <div style="padding:16px 18px;border-radius:18px;background:rgba(7,12,16,0.48);border:1px solid rgba(56,189,248,0.18)">
        <div style="font-size:11px;letter-spacing:0.18em;text-transform:uppercase;color:#bae6fd">Hasil Bersih</div>
        <div style="margin-top:8px;font-size:24px;font-weight:700">%s</div>
      </div>
    </div>

    <div style="margin-top:22px;padding:18px;border-radius:22px;border:1px solid rgba(255,255,255,0.08);background:rgba(6,10,14,0.52)">
      <div style="font-size:12px;letter-spacing:0.2em;text-transform:uppercase;color:rgba(255,255,255,0.52)">Insight Singkat</div>
      <ul style="margin:14px 0 0;padding:0;list-style:none">%s</ul>
    </div>

    <div style="margin-top:22px;padding:16px 18px;border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);color:rgba(255,255,255,0.66);font-size:13px;line-height:1.7">
      Username penerima: <strong style="color:#ffffff">%s</strong><br />
      Nama file: <strong style="color:#ffffff">%s</strong><br />
      Format: <strong style="color:#ffffff">%s</strong>
    </div>
  </div>
</div>`,
		fullName,
		strings.ToUpper(req.Format),
		req.LahanName,
		req.PeriodLabel,
		req.Summary.TotalTon,
		req.Summary.TotalPendapatan,
		req.Summary.TotalBiaya,
		req.Summary.HasilBersih,
		insightItems,
		username,
		req.Filename,
		strings.ToUpper(req.Format),
	)
}
