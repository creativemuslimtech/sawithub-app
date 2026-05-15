package reporting

import (
	"time"

	"sawithub/backend/internal/farmcore"
	"sawithub/backend/internal/farmfinance"
)

type LaporanSummary struct {
	TotalTon            float64 `json:"total_ton"`
	TotalPendapatan     float64 `json:"total_pendapatan"`
	TotalBiayaPanen     float64 `json:"total_biaya_panen"`
	TotalBiayaPerawatan float64 `json:"total_biaya_perawatan"`
	HasilBersih         float64 `json:"hasil_bersih"`
	AvgHargaPerKg       float64 `json:"avg_harga_per_kg"`
	JumlahPanen         int     `json:"jumlah_panen"`
	RataProductivitas   float64 `json:"rata_produktivitas"`
}

type LaporanChartPoint struct {
	Label          string             `json:"label"`
	TotalTon       float64            `json:"total_ton"`
	Pendapatan     float64            `json:"pendapatan"`
	BiayaPanen     float64            `json:"biaya_panen"`
	BiayaPerawatan float64            `json:"biaya_perawatan"`
	HasilBersih    float64            `json:"hasil_bersih"`
	HargaAvg       float64            `json:"harga_avg"`
	PerLahan       map[string]float64 `json:"per_lahan"`
}

type FarmRanking struct {
	IDLahan         string  `json:"id_lahan"`
	NamaKebun       string  `json:"nama_kebun"`
	TotalTon        float64 `json:"total_ton"`
	LuasHa          float64 `json:"luas_ha"`
	Produktivitas   float64 `json:"produktivitas"`
	TotalPendapatan float64 `json:"total_pendapatan"`
	HasilBersih     float64 `json:"hasil_bersih"`
	JumlahPanen     int     `json:"jumlah_panen"`
}

type LaporanDetailRow struct {
	IDPanen          string  `json:"id_panen"`
	TanggalPanen     string  `json:"tanggal_panen"`
	NamaKebun        string  `json:"nama_kebun"`
	LuasPanenHa      float64 `json:"luas_panen_ha"`
	JumlahJanjang    int     `json:"jumlah_janjang"`
	BeratKg          float64 `json:"berat_kg"`
	BeratTon         float64 `json:"berat_ton"`
	BeratRataJanjang float64 `json:"berat_rata_janjang"`
	HargaPerKg       float64 `json:"harga_per_kg"`
	TotalPendapatan  float64 `json:"total_pendapatan"`
	BiayaPanen       float64 `json:"biaya_panen"`
	HasilBersih      float64 `json:"hasil_bersih"`
	Produktivitas    float64 `json:"produktivitas"`
	Catatan          string  `json:"catatan"`
}

type LaporanKeuanganResponse struct {
	Summary LaporanSummary      `json:"summary"`
	Chart   []LaporanChartPoint `json:"chart"`
	Ranking []FarmRanking       `json:"ranking"`
	Detail  []LaporanDetailRow  `json:"detail"`
}

type LaporanParams struct {
	UserID  string
	Period  string
	LahanID string
	Year    int
	Month   int
	Week    int
	Since   time.Time
	Until   time.Time
}

type FarmFinanceExportEmailRequest struct {
	Format      string   `json:"format"`
	Filename    string   `json:"filename"`
	MimeType    string   `json:"mime_type"`
	ContentBase string   `json:"content_base64"`
	PeriodLabel string   `json:"period_label"`
	LahanName   string   `json:"lahan_name"`
	Insights    []string `json:"insights"`
	Summary     struct {
		TotalTon        string `json:"total_ton"`
		TotalPendapatan string `json:"total_pendapatan"`
		TotalBiaya      string `json:"total_biaya"`
		HasilBersih     string `json:"hasil_bersih"`
	} `json:"summary"`
}

type HTTPError struct {
	Status  int
	Message string
}

func (e *HTTPError) Error() string { return e.Message }

func httpErr(status int, msg string) error {
	return &HTTPError{Status: status, Message: msg}
}

// Dashboard aggregates farm operational + finance metrics for the home dashboard API.
type DashboardLahanInfo struct {
	IDLahan     string  `json:"id_lahan"`
	NamaKebun   string  `json:"nama_kebun"`
	JenisBibit  string  `json:"jenis_bibit"`
	Lokasi      string  `json:"lokasi"`
	LuasHa      float64 `json:"luas_ha"`
	JumlahPohon int     `json:"jumlah_pohon"`
	TahunTanam  int     `json:"tahun_tanam"`
}

type DashboardChartPoint struct {
	Label      string             `json:"label"`
	Total      float64            `json:"total"`
	Pendapatan float64            `json:"pendapatan"`
	NetIncome  float64            `json:"net_income"`
	Janjang    int64              `json:"janjang"`
	HargaAvg   float64            `json:"harga_avg"`
	PerLahan   map[string]float64 `json:"per_lahan"`
}

type DashboardBiayaItem struct {
	Jenis string  `json:"jenis"`
	Total float64 `json:"total"`
}

type DashboardUpcomingItem struct {
	Tanggal        string `json:"tanggal"`
	JenisPerawatan string `json:"jenis_perawatan"`
	NamaBlok       string `json:"nama_blok"`
	Keterangan     string `json:"keterangan"`
}

type DashboardResponse struct {
	Period        string `json:"period"`
	SelectedLahan string `json:"selected_lahan"`

	LahanList []DashboardLahanInfo `json:"lahan_list"`

	TotalBeratTon   float64 `json:"total_berat_ton"`
	TotalPendapatan float64 `json:"total_pendapatan"`
	TotalBiaya      float64 `json:"total_biaya"`
	NetIncome       float64 `json:"net_income"`

	ChartData []DashboardChartPoint `json:"chart_data"`

	BiayaBreakdown    []DashboardBiayaItem    `json:"biaya_breakdown"`
	UpcomingPerawatan []DashboardUpcomingItem `json:"upcoming_perawatan"`
	LastHargaPerKg    float64                 `json:"last_harga_per_kg"`
	AvgTonPerPeriod   float64                 `json:"avg_ton_per_period"`

	RecentPanen      []farmcore.PanenRow         `json:"recent_panen"`
	RecentPerawatan  []farmcore.PerawatanRow     `json:"recent_perawatan"`
	RecentPendapatan []farmfinance.PendapatanRow `json:"recent_pendapatan"`
}
