package farmcore

type LahanRow struct {
	IDLahan     string  `json:"id_lahan"`
	UserID      string  `json:"user_id"`
	NamaKebun   string  `json:"nama_kebun"`
	JenisBibit  string  `json:"jenis_bibit"`
	Lokasi      string  `json:"lokasi"`
	LuasHa      float64 `json:"luas_ha"`
	JumlahPohon int     `json:"jumlah_pohon"`
	TahunTanam  int     `json:"tahun_tanam"`
}

type PanenRow struct {
	IDPanen         string  `json:"id_panen"`
	IDLahan         string  `json:"id_lahan"`
	TanggalPanen    string  `json:"tanggal_panen"`
	LuasPanenHa     float64 `json:"luas_panen_ha"`
	JumlahJanjang   int     `json:"jumlah_janjang"`
	BeratKg         float64 `json:"berat_kg"`
	BeratTon        float64 `json:"berat_ton"`
	HargaPerKg      float64 `json:"harga_per_kg"`
	TotalPendapatan float64 `json:"total_pendapatan"`
	BiayaPanen      float64 `json:"biaya_panen"`
	HasilBersih     float64 `json:"hasil_bersih"`
}

type PerawatanRow struct {
	IDPerawatan        string  `json:"id_perawatan"`
	IDLahan            string  `json:"id_lahan"`
	TanggalPerawatan   string  `json:"tanggal_perawatan"`
	JenisPerawatan     string  `json:"jenis_perawatan"`
	Bahan              string  `json:"bahan"`
	Jumlah             float64 `json:"jumlah"`
	Satuan             string  `json:"satuan"`
	HargaSatuan        float64 `json:"harga_satuan"`
	TotalHargaMaterial float64 `json:"total_harga_material"`
	BiayaPekerja       float64 `json:"biaya_pekerja"`
	Biaya              float64 `json:"biaya"`
	Keterangan         string  `json:"keterangan"`
}

type JadwalPerawatanRow struct {
	IDJadwal        string  `json:"id_jadwal_perawatan"`
	IDLahan         string  `json:"id_lahan"`
	NamaKebun       string  `json:"nama_kebun"`
	JenisPerawatan  string  `json:"jenis_perawatan"`
	Deskripsi       string  `json:"deskripsi"`
	FrequensiTipe   string  `json:"frequensi_tipe"`
	FrequensiCustom int     `json:"frequensi_custom_hari"`
	TanggalMulai    string  `json:"tanggal_mulai"`
	TanggalAkhir    string  `json:"tanggal_akhir"`
	EstimasiBiaya   float64 `json:"estimasi_biaya"`
	IsActive        bool    `json:"is_active"`
	Catatan         string  `json:"catatan"`
}

type UpcomingScheduleItem struct {
	IDJadwal       string  `json:"id_jadwal_perawatan"`
	IDLahan        string  `json:"id_lahan"`
	NamaKebun      string  `json:"nama_kebun"`
	JenisPerawatan string  `json:"jenis_perawatan"`
	TanggalNext    string  `json:"tanggal_next"`
	Deskripsi      string  `json:"deskripsi"`
	EstimasiBiaya  float64 `json:"estimasi_biaya"`
	DaysUntil      int     `json:"days_until"`
}

type ChecklistItem struct {
	ID       string `json:"id"`
	Label    string `json:"label"`
	Required bool   `json:"required"`
	Status   string `json:"status"`
	Note     string `json:"note"`
}

type ChecklistRun struct {
	ID, Title, Status, DueDate, IDLahan, NamaKebun string
	Items                                          []ChecklistItem `json:"items"`
}

type ChecklistListResponse struct {
	GeneratedAt string         `json:"generated_at"`
	Runs        []ChecklistRun `json:"runs"`
}
