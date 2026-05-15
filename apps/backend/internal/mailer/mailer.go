package mailer

import (
	"bytes"
	"encoding/json"
	"fmt"
	"html"
	"log"
	"net/http"
	"net/url"
	"strings"
)

type Mailer struct {
	APIKey      string
	From        string
	FrontendURL string
}

type Attachment struct {
	Filename    string `json:"filename"`
	Content     string `json:"content"`
	ContentType string `json:"content_type,omitempty"`
}

type resendPayload struct {
	From        string       `json:"from"`
	To          []string     `json:"to"`
	Subject     string       `json:"subject"`
	HTML        string       `json:"html"`
	Attachments []Attachment `json:"attachments,omitempty"`
}

func (m *Mailer) Enabled() bool {
	return strings.TrimSpace(m.APIKey) != ""
}

func (m *Mailer) send(to, subject, html string, attachments []Attachment) error {
	if m.APIKey == "" {
		log.Printf("WARN: RESEND_API_KEY not set, skipping email to %s", to)
		return nil
	}
	payload, err := json.Marshal(resendPayload{
		From:        m.From,
		To:          []string{to},
		Subject:     subject,
		HTML:        html,
		Attachments: attachments,
	})
	if err != nil {
		return err
	}
	req, err := http.NewRequest("POST", "https://api.resend.com/emails", bytes.NewReader(payload))
	if err != nil {
		return err
	}
	req.Header.Set("Authorization", "Bearer "+m.APIKey)
	req.Header.Set("Content-Type", "application/json")

	resp, err := http.DefaultClient.Do(req)
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode >= 400 {
		var e map[string]interface{}
		json.NewDecoder(resp.Body).Decode(&e)
		return fmt.Errorf("resend API %d: %v", resp.StatusCode, e)
	}
	return nil
}

func (m *Mailer) SendResetCode(toEmail, code string) error {
	resetURL := strings.TrimRight(m.FrontendURL, "/") + "/reset-password?email=" + url.QueryEscape(toEmail)
	html := fmt.Sprintf(`
<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
  <h2 style="color:#16a34a;margin-bottom:8px">Reset Password SawitHub</h2>
  <p style="color:#555">Gunakan kode berikut untuk mereset password Anda:</p>
  <div style="font-size:36px;font-weight:bold;letter-spacing:12px;color:#111;background:#f3f4f6;padding:24px;text-align:center;border-radius:8px;margin:24px 0">%s</div>
  <p style="color:#666;font-size:13px">Kode berlaku selama <strong>15 menit</strong>. Jangan bagikan kode ini kepada siapapun.</p>
  <div style="margin:24px 0">
    <a href="%s" style="display:inline-block;background:#16a34a;color:#fff;text-decoration:none;padding:12px 18px;border-radius:8px;font-weight:600">Buka Halaman Reset Password</a>
  </div>
  <p style="color:#666;font-size:13px;line-height:1.6">Jika tombol tidak bisa dibuka, masuk ke halaman reset password SawitHub lalu masukkan email dan kode 6 digit di atas.</p>
  <p style="color:#999;font-size:12px;margin-top:32px">Jika Anda tidak meminta reset password, abaikan email ini.</p>
</div>`, code, resetURL)

	err := m.send(toEmail, "Kode Reset Password SawitHub", html, nil)
	if err != nil {
		log.Printf("ERROR sending reset code to %s: %v", toEmail, err)
	} else {
		log.Printf("Reset code sent to %s", toEmail)
	}
	return err
}

func (m *Mailer) SendWelcome(toEmail, fullName string) error {
	html := fmt.Sprintf(`
<div style="font-family:sans-serif;max-width:480px;margin:auto;padding:24px">
  <h2 style="color:#16a34a;margin-bottom:8px">Selamat Datang di SawitHub, %s! 👋</h2>
  <p style="color:#555">Akun Anda telah berhasil dibuat. Anda sekarang dapat login dan mulai mengelola data perkebunan sawit Anda.</p>
  <div style="margin:24px 0;padding:16px;background:#f0fdf4;border-radius:8px">
    <p style="font-weight:600;color:#15803d;margin:0 0 8px">Fitur yang tersedia:</p>
    <ul style="color:#555;margin:0;padding-left:20px;line-height:1.8">
      <li>📍 Kelola data lahan perkebunan Anda</li>
      <li>🌾 Catat hasil panen dan tingkat produktivitas</li>
      <li>🔧 Log perawatan dan maintenance</li>
      <li>💰 Tracking pendapatan dan laba bersih</li>
      <li>📊 Laporan keuangan otomatis</li>
    </ul>
  </div>
  <p style="color:#999;font-size:12px;margin-top:32px">Ini adalah email otomatis dari SawitHub. Jangan reply ke email ini.</p>
</div>`, fullName)

	err := m.send(toEmail, "Selamat Datang di SawitHub", html, nil)
	if err != nil {
		log.Printf("ERROR sending welcome email to %s: %v", toEmail, err)
	} else {
		log.Printf("Welcome email sent to %s", toEmail)
	}
	return err
}

func (m *Mailer) SendReport(toEmail, subject, html string, attachment Attachment) error {
	err := m.send(toEmail, subject, html, []Attachment{attachment})
	if err != nil {
		log.Printf("ERROR sending report email to %s: %v", toEmail, err)
	} else {
		log.Printf("Report email sent to %s", toEmail)
	}
	return err
}

func (m *Mailer) SendContactMessage(toEmail, senderName, senderEmail, subject, message string) error {
	if strings.TrimSpace(subject) == "" {
		subject = "Pesan dari halaman Tentang Kami"
	}

	body := fmt.Sprintf(`
<div style="font-family:sans-serif;max-width:560px;margin:auto;padding:24px">
  <h2 style="color:#16a34a;margin-bottom:8px">Pesan baru dari halaman Tentang Kami</h2>
  <p style="color:#555;line-height:1.7">Ada pesan baru yang dikirim dari website SawitHub.</p>
  <table style="width:100%%;border-collapse:collapse;margin:20px 0">
    <tr>
      <td style="padding:10px 0;color:#666;width:140px">Nama</td>
      <td style="padding:10px 0;color:#111;font-weight:600">%s</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#666">Email</td>
      <td style="padding:10px 0;color:#111;font-weight:600">%s</td>
    </tr>
    <tr>
      <td style="padding:10px 0;color:#666">Judul</td>
      <td style="padding:10px 0;color:#111;font-weight:600">%s</td>
    </tr>
  </table>
  <div style="margin-top:20px;padding:16px;background:#f8fafc;border:1px solid #e5e7eb;border-radius:10px">
    <p style="margin:0 0 8px;color:#666;font-size:12px;letter-spacing:0.08em;text-transform:uppercase">Isi pesan</p>
    <div style="white-space:pre-wrap;color:#111;line-height:1.8">%s</div>
  </div>
</div>`,
		html.EscapeString(senderName),
		html.EscapeString(senderEmail),
		html.EscapeString(subject),
		html.EscapeString(message),
	)

	err := m.send(toEmail, "Pesan SawitHub: "+subject, body, nil)
	if err != nil {
		log.Printf("ERROR sending contact message to %s: %v", toEmail, err)
	} else {
		log.Printf("Contact message sent to %s from %s", toEmail, senderEmail)
	}
	return err
}
