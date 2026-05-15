package farmcore

import (
	"context"
	"database/sql"
	"sort"
	"time"
)

type FarmCoreMaintenanceScheduleService struct {
	db     *sql.DB
	dbRead *sql.DB
}

func NewFarmCoreMaintenanceScheduleService(db, dbRead *sql.DB) *FarmCoreMaintenanceScheduleService {
	if dbRead == nil {
		dbRead = db
	}
	return &FarmCoreMaintenanceScheduleService{db: db, dbRead: dbRead}
}

func (s *FarmCoreMaintenanceScheduleService) List(ctx context.Context, userID string) ([]JadwalPerawatanRow, error) {
	rows, err := s.dbRead.QueryContext(ctx,
		`SELECT j.id_jadwal_perawatan, j.id_lahan, COALESCE(l.nama_kebun,''),
		        j.jenis_perawatan, COALESCE(j.deskripsi,''), j.frequensi_tipe,
		        COALESCE(j.frequensi_custom_hari,0), j.tanggal_mulai, j.tanggal_akhir,
		        COALESCE(j.estimasi_biaya,0), j.is_active, COALESCE(j.catatan,'')
		 FROM t_sawit_hub_jadwal_perawatan j
		 LEFT JOIN t_sawit_hub_lahan l ON l.id_lahan=j.id_lahan AND l.deleted_at IS NULL
		 WHERE j.user_id=? AND j.deleted_at IS NULL
		 ORDER BY j.is_active DESC, j.tanggal_mulai ASC`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []JadwalPerawatanRow
	for rows.Next() {
		var j JadwalPerawatanRow
		var mulai time.Time
		var akhir sql.NullTime
		rows.Scan(&j.IDJadwal, &j.IDLahan, &j.NamaKebun, &j.JenisPerawatan, &j.Deskripsi,
			&j.FrequensiTipe, &j.FrequensiCustom, &mulai, &akhir, &j.EstimasiBiaya,
			&j.IsActive, &j.Catatan)
		j.FrequensiTipe = NormalizeFrequencyType(j.FrequensiTipe)
		j.TanggalMulai = mulai.Format("2006-01-02")
		if akhir.Valid {
			j.TanggalAkhir = akhir.Time.Format("2006-01-02")
		}
		result = append(result, j)
	}
	return result, nil
}

type CreateJadwalInput struct {
	IDLahan         string
	JenisPerawatan  string
	Deskripsi       string
	FrequensiTipe   string
	FrequensiCustom int
	TanggalMulai    string
	TanggalAkhir    string
	EstimasiBiaya   float64
	Catatan         string
}

func (s *FarmCoreMaintenanceScheduleService) Create(ctx context.Context, userID string, in CreateJadwalInput) (int64, error) {
	ft := in.FrequensiTipe
	if ft == "" {
		ft = "bulanan"
	}
	ft = NormalizeFrequencyType(ft)
	var tanggalAkhirCreate interface{}
	if in.TanggalAkhir != "" {
		tanggalAkhirCreate = in.TanggalAkhir
	}
	result, err := s.db.ExecContext(ctx,
		`INSERT INTO t_sawit_hub_jadwal_perawatan
		 (user_id, id_lahan, jenis_perawatan, deskripsi, frequensi_tipe, frequensi_custom_hari,
		  tanggal_mulai, tanggal_akhir, estimasi_biaya, is_active, catatan)
		 VALUES (?,?,?,?,?,?,?,?,?,1,?)`,
		userID, in.IDLahan, in.JenisPerawatan, in.Deskripsi, ft,
		in.FrequensiCustom, in.TanggalMulai, tanggalAkhirCreate, in.EstimasiBiaya, in.Catatan)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

type UpdateJadwalInput struct {
	IDLahan         string
	JenisPerawatan  string
	Deskripsi       string
	FrequensiTipe   string
	FrequensiCustom int
	TanggalMulai    string
	TanggalAkhir    string
	EstimasiBiaya   float64
	IsActive        bool
	Catatan         string
}

func (s *FarmCoreMaintenanceScheduleService) Update(ctx context.Context, userID, idJadwal string, in UpdateJadwalInput) error {
	ft := in.FrequensiTipe
	if ft == "" {
		ft = "bulanan"
	}
	ft = NormalizeFrequencyType(ft)
	var tanggalAkhirUpdate interface{}
	if in.TanggalAkhir != "" {
		tanggalAkhirUpdate = in.TanggalAkhir
	}
	_, err := s.db.ExecContext(ctx,
		`UPDATE t_sawit_hub_jadwal_perawatan
		 SET id_lahan=?, jenis_perawatan=?, deskripsi=?, frequensi_tipe=?,
		     frequensi_custom_hari=?, tanggal_mulai=?, tanggal_akhir=?, estimasi_biaya=?,
		     is_active=?, catatan=?, updated_at=NOW()
		 WHERE id_jadwal_perawatan=? AND user_id=?`,
		in.IDLahan, in.JenisPerawatan, in.Deskripsi, ft,
		in.FrequensiCustom, in.TanggalMulai, tanggalAkhirUpdate, in.EstimasiBiaya,
		in.IsActive, in.Catatan, idJadwal, userID)
	return err
}

func (s *FarmCoreMaintenanceScheduleService) SoftDelete(ctx context.Context, userID, idJadwal string) error {
	_, err := s.db.ExecContext(ctx,
		`UPDATE t_sawit_hub_jadwal_perawatan SET deleted_at=NOW() WHERE id_jadwal_perawatan=? AND user_id=?`,
		idJadwal, userID)
	return err
}

func (s *FarmCoreMaintenanceScheduleService) GetUpcoming(ctx context.Context, userID, lahanID, daysStr string) ([]UpcomingScheduleItem, error) {
	days := 90
	if daysStr == "7" || daysStr == "14" || daysStr == "30" {
		days = parseIntSchedule(daysStr)
	}

	rows, err := s.dbRead.QueryContext(ctx,
		`SELECT j.id_jadwal_perawatan, j.id_lahan, COALESCE(l.nama_kebun,''),
		        j.jenis_perawatan, j.tanggal_mulai, COALESCE(j.deskripsi,''),
		        COALESCE(j.estimasi_biaya,0), j.frequensi_tipe, COALESCE(j.frequensi_custom_hari,0),
		        j.tanggal_akhir
		 FROM t_sawit_hub_jadwal_perawatan j
		 LEFT JOIN t_sawit_hub_lahan l ON l.id_lahan=j.id_lahan AND l.deleted_at IS NULL
		 WHERE j.user_id=? AND j.is_active=1 AND j.deleted_at IS NULL`,
		userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()

	now := time.Now()
	result := []UpcomingScheduleItem{}

	for rows.Next() {
		var j struct {
			IDJadwal        string
			IDLahan         string
			NamaKebun       string
			JenisPerawatan  string
			TanggalMulai    time.Time
			Deskripsi       string
			EstimasiBiaya   float64
			FrequensiTipe   string
			FrequensiCustom int
			TanggalAkhir    sql.NullTime
		}
		rows.Scan(&j.IDJadwal, &j.IDLahan, &j.NamaKebun, &j.JenisPerawatan,
			&j.TanggalMulai, &j.Deskripsi, &j.EstimasiBiaya, &j.FrequensiTipe,
			&j.FrequensiCustom, &j.TanggalAkhir)

		if lahanID != "" && j.IDLahan != lahanID {
			continue
		}
		today := NormalizeDateOnly(now.In(j.TanggalMulai.Location()), j.TanggalMulai.Location())

		scheduleHorizon := today.AddDate(0, 0, days)
		if j.TanggalAkhir.Valid {
			akhirDate := NormalizeDateOnly(j.TanggalAkhir.Time, j.TanggalMulai.Location())
			if akhirDate.Before(scheduleHorizon) {
				scheduleHorizon = akhirDate
			}
		}
		if scheduleHorizon.Before(today) {
			continue
		}

		for _, nextDate := range CalculateUpcomingDates(j.TanggalMulai, j.FrequensiTipe, j.FrequensiCustom, now, scheduleHorizon, 24) {
			daysUntil := int(nextDate.Sub(today).Hours() / 24)

			result = append(result, UpcomingScheduleItem{
				IDJadwal:       j.IDJadwal,
				IDLahan:        j.IDLahan,
				NamaKebun:      j.NamaKebun,
				JenisPerawatan: j.JenisPerawatan,
				TanggalNext:    nextDate.Format("2006-01-02"),
				Deskripsi:      j.Deskripsi,
				EstimasiBiaya:  j.EstimasiBiaya,
				DaysUntil:      daysUntil,
			})
		}
	}

	sort.Slice(result, func(i, j int) bool {
		if result[i].TanggalNext == result[j].TanggalNext {
			if result[i].NamaKebun == result[j].NamaKebun {
				return result[i].JenisPerawatan < result[j].JenisPerawatan
			}
			return result[i].NamaKebun < result[j].NamaKebun
		}
		return result[i].TanggalNext < result[j].TanggalNext
	})

	if len(result) > 24 {
		result = result[:24]
	}

	return result, nil
}
