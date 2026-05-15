package farmcore

import (
	"context"
	"database/sql"
	"time"
)

type FarmCoreMaintenanceService struct {
	db     *sql.DB
	dbRead *sql.DB
}

func NewFarmCoreMaintenanceService(db, dbRead *sql.DB) *FarmCoreMaintenanceService {
	if dbRead == nil {
		dbRead = db
	}
	return &FarmCoreMaintenanceService{db: db, dbRead: dbRead}
}

func (s *FarmCoreMaintenanceService) List(ctx context.Context, userID string) ([]PerawatanRow, error) {
	rows, err := s.dbRead.QueryContext(ctx,
		`SELECT id_perawatan, id_lahan, tanggal_perawatan, jenis_perawatan,
		        COALESCE(bahan,''), COALESCE(jumlah,0), COALESCE(satuan,'kg'),
		        COALESCE(harga_satuan,0), COALESCE(total_harga_material,0), COALESCE(biaya_pekerja,0),
		        COALESCE(total_biaya_perawatan,0), COALESCE(keterangan,'')
		 FROM t_sawit_hub_perawatan WHERE user_id=? AND deleted_at IS NULL
		 ORDER BY tanggal_perawatan DESC LIMIT 20`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []PerawatanRow
	for rows.Next() {
		var p PerawatanRow
		var tgl time.Time
		rows.Scan(&p.IDPerawatan, &p.IDLahan, &tgl, &p.JenisPerawatan,
			&p.Bahan, &p.Jumlah, &p.Satuan, &p.HargaSatuan, &p.TotalHargaMaterial, &p.BiayaPekerja,
			&p.Biaya, &p.Keterangan)
		p.TanggalPerawatan = tgl.Format("2006-01-02")
		result = append(result, p)
	}
	return result, nil
}

type CreatePerawatanInput struct {
	IDLahan          string
	TanggalPerawatan string
	JenisPerawatan   string
	Bahan            string
	Jumlah           float64
	Satuan           string
	HargaSatuan      float64
	BiayaPekerja     float64
	Keterangan       string
}

func (s *FarmCoreMaintenanceService) Create(ctx context.Context, userID string, in CreatePerawatanInput) (int64, error) {
	satuan := in.Satuan
	if satuan == "" {
		satuan = "kg"
	}
	totalHargaMaterial := in.Jumlah * in.HargaSatuan
	totalBiayaPerawatan := totalHargaMaterial + in.BiayaPekerja
	result, err := s.db.ExecContext(ctx,
		`INSERT INTO t_sawit_hub_perawatan
		 (user_id, id_lahan, tanggal_perawatan, jenis_perawatan, bahan, jumlah, satuan, harga_satuan, total_harga_material, biaya_pekerja, total_biaya_perawatan, keterangan)
		 VALUES (?,?,?,?,?,?,?,?,?,?,?,?)`,
		userID, in.IDLahan, in.TanggalPerawatan, in.JenisPerawatan,
		in.Bahan, in.Jumlah, satuan, in.HargaSatuan, totalHargaMaterial, in.BiayaPekerja, totalBiayaPerawatan, in.Keterangan)
	if err != nil {
		return 0, err
	}
	id, _ := result.LastInsertId()
	SyncPendapatanForLahan(ctx, s.db, s.dbRead, userID, in.IDLahan)
	return id, nil
}

type UpdatePerawatanInput struct {
	IDLahan          string
	TanggalPerawatan string
	JenisPerawatan   string
	Bahan            string
	Jumlah           float64
	Satuan           string
	HargaSatuan      float64
	BiayaPekerja     float64
	Keterangan       string
}

func (s *FarmCoreMaintenanceService) Update(ctx context.Context, userID, idPerawatan string, in UpdatePerawatanInput) (rowsAffected int64, err error) {
	totalHargaMaterial := in.Jumlah * in.HargaSatuan
	totalBiayaPerawatan := totalHargaMaterial + in.BiayaPekerja
	res, err := s.db.ExecContext(ctx,
		`UPDATE t_sawit_hub_perawatan SET id_lahan=?, tanggal_perawatan=?, jenis_perawatan=?,
		 bahan=?, jumlah=?, satuan=?, harga_satuan=?, total_harga_material=?, biaya_pekerja=?, total_biaya_perawatan=?, keterangan=?
		 WHERE id_perawatan=? AND user_id=? AND deleted_at IS NULL`,
		in.IDLahan, in.TanggalPerawatan, in.JenisPerawatan,
		in.Bahan, in.Jumlah, in.Satuan, in.HargaSatuan, totalHargaMaterial, in.BiayaPekerja, totalBiayaPerawatan, in.Keterangan, idPerawatan, userID)
	if err != nil {
		return 0, err
	}
	n, err := res.RowsAffected()
	if err != nil || n == 0 {
		return n, err
	}
	SyncPendapatanForLahan(ctx, s.db, s.dbRead, userID, in.IDLahan)
	return n, nil
}

func (s *FarmCoreMaintenanceService) SoftDelete(ctx context.Context, userID, idPerawatan string) (rowsAffected int64, err error) {
	res, err := s.db.ExecContext(ctx,
		"UPDATE t_sawit_hub_perawatan SET deleted_at=NOW() WHERE id_perawatan=? AND user_id=? AND deleted_at IS NULL",
		idPerawatan, userID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
