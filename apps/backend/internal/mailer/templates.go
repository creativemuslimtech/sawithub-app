package mailer

import (
	"fmt"
	"strings"
	"time"
)

func simpleEmailHTML(title string, bodyLines []string, ctaLabel, ctaURL string) string {
	body := ""
	for _, line := range bodyLines {
		if strings.TrimSpace(line) == "" {
			continue
		}
		body += fmt.Sprintf(`<p style="margin:0 0 10px;color:#4b5563;line-height:1.7">%s</p>`, line)
	}
	cta := ""
	if strings.TrimSpace(ctaLabel) != "" && strings.TrimSpace(ctaURL) != "" {
		cta = fmt.Sprintf(`<div style="margin-top:24px"><a href="%s" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 18px;border-radius:10px;font-weight:700">%s</a></div>`, ctaURL, ctaLabel)
	}
	return fmt.Sprintf(`<div style="font-family:Inter,Segoe UI,Arial,sans-serif;max-width:640px;margin:0 auto;padding:24px;background:#07110b"><div style="padding:24px;border-radius:24px;background:#fff;border:1px solid #e5e7eb"><p style="margin:0 0 8px;color:#16a34a;font-size:11px;letter-spacing:0.18em;text-transform:uppercase">SawitHub Subscription</p><h1 style="margin:0 0 18px;color:#111827;font-size:24px;line-height:1.35">%s</h1>%s%s</div></div>`, title, body, cta)
}
func (m *Mailer) ProviderName() string { if m.Enabled() { return "resend" }; return "mock" }
func (m *Mailer) SendSubscriptionSuccess(toEmail, fullName, planName string, price float64, paidAt, activeUntil time.Time, dashboardURL string) error {
	html := simpleEmailHTML("Pembayaran Berhasil - Langganan Aktif", []string{
		fmt.Sprintf("<strong>Nama:</strong> %s", fullName),
		fmt.Sprintf("<strong>Plan:</strong> %s", planName),
		fmt.Sprintf("<strong>Harga:</strong> Rp%s", strings.ReplaceAll(fmt.Sprintf("%.0f", price), ".", ",")),
		fmt.Sprintf("<strong>Tanggal pembayaran:</strong> %s", paidAt.In(time.FixedZone("WIB", 7*60*60)).Format("02 Jan 2006 15:04")),
		fmt.Sprintf("<strong>Masa aktif:</strong> sampai %s", activeUntil.In(time.FixedZone("WIB", 7*60*60)).Format("02 Jan 2006 15:04")),
	}, "Buka Dashboard", dashboardURL)
	return m.send(toEmail, "Pembayaran Berhasil - Langganan Aktif", html, nil)
}
func (m *Mailer) SendSubscriptionPending(toEmail, fullName, dashboardURL, paymentURL string, daysRemaining int) error {
	html := simpleEmailHTML("Pembayaran Sedang Menunggu", []string{
		fmt.Sprintf("<strong>Nama:</strong> %s", fullName), "Pembayaran Anda masih dalam status menunggu.", fmt.Sprintf("Sisa akses atau trial: %d hari.", daysRemaining),
	}, "Lanjutkan Pembayaran", paymentURL)
	return m.send(toEmail, "Pembayaran Sedang Menunggu", html, nil)
}
func (m *Mailer) SendSubscriptionReminder(toEmail, fullName, reminderTitle, reminderBody, ctaLabel, ctaURL string) error {
	return m.send(toEmail, reminderTitle, simpleEmailHTML(reminderTitle, []string{fmt.Sprintf("<strong>Nama:</strong> %s", fullName), reminderBody}, ctaLabel, ctaURL), nil)
}
func (m *Mailer) SendPaymentFailed(toEmail, fullName, paymentURL, reason string) error {
	return m.send(toEmail, "Pembayaran Gagal atau Kedaluwarsa", simpleEmailHTML("Pembayaran Gagal atau Kedaluwarsa", []string{
		fmt.Sprintf("<strong>Nama:</strong> %s", fullName), "Pembayaran Anda gagal, dibatalkan, atau kedaluwarsa.", strings.TrimSpace(reason),
	}, "Coba Lagi", paymentURL), nil)
}
