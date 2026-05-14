package farmfinance

import "time"

type PendapatanRow struct {
	IDPendapatan     string  `json:"id_pendapatan"`
	IDLahan          string  `json:"id_lahan"`
	TanggalPanen     string  `json:"tanggal_panen"`
	TotalJanjang     int     `json:"total_janjang"`
	TotalBeratKg     float64 `json:"total_berat_kg"`
	PendapatanKotor  float64 `json:"pendapatan_kotor"`
	BiayaTotal       float64 `json:"biaya_total"`
	PendapatanBersih float64 `json:"pendapatan_bersih"`
	Catatan          string  `json:"catatan"`
}

type HargaRow struct {
	IDHarga    string    `json:"id_harga"`
	Tanggal    string    `json:"tanggal"`
	HargaPerKg float64   `json:"harga_per_kg"`
	Sumber     string    `json:"sumber"`
	CreatedAt  time.Time `json:"created_at"`
}
