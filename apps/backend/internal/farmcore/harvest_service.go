package farmcore

import (
	"context"
	"database/sql"
	"time"
)

type FarmCoreHarvestService struct {
	db     *sql.DB
	dbRead *sql.DB
}

func NewFarmCoreHarvestService(db, dbRead *sql.DB) *FarmCoreHarvestService {
	if dbRead == nil {
		dbRead = db
	}
	return &FarmCoreHarvestService{db: db, dbRead: dbRead}
}

func (s *FarmCoreHarvestService) List(ctx context.Context, userID string) ([]PanenRow, error) {
	rows, err := s.dbRead.QueryContext(ctx,
		`SELECT id_panen, id_lahan, tanggal_panen, luas_panen_ha, jumlah_janjang,
		        berat_kg, berat_ton, harga_per_kg, total_pendapatan, biaya_panen, hasil_bersih
		 FROM t_sawit_hub_panen WHERE user_id=? AND deleted_at IS NULL
		 ORDER BY tanggal_panen DESC LIMIT 20`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []PanenRow
	for rows.Next() {
		var p PanenRow
		var tgl time.Time
		rows.Scan(&p.IDPanen, &p.IDLahan, &tgl, &p.LuasPanenHa, &p.JumlahJanjang,
			&p.BeratKg, &p.BeratTon, &p.HargaPerKg, &p.TotalPendapatan, &p.BiayaPanen, &p.HasilBersih)
		p.TanggalPanen = tgl.Format("2006-01-02")
		result = append(result, p)
	}
	return result, nil
}

func (s *FarmCoreHarvestService) Get(ctx context.Context, userID, idPanen string) (PanenRow, error) {
	var p PanenRow
	var tgl time.Time
	err := s.dbRead.QueryRowContext(ctx,
		`SELECT id_panen, id_lahan, tanggal_panen, luas_panen_ha, jumlah_janjang,
		        berat_kg, berat_ton, harga_per_kg, total_pendapatan, biaya_panen, hasil_bersih
		 FROM t_sawit_hub_panen WHERE id_panen=? AND user_id=? AND deleted_at IS NULL`, idPanen, userID).
		Scan(&p.IDPanen, &p.IDLahan, &tgl, &p.LuasPanenHa, &p.JumlahJanjang,
			&p.BeratKg, &p.BeratTon, &p.HargaPerKg, &p.TotalPendapatan, &p.BiayaPanen, &p.HasilBersih)
	if err != nil {
		return PanenRow{}, err
	}
	p.TanggalPanen = tgl.Format("2006-01-02")
	return p, nil
}

type CreatePanenInput struct {
	IDLahan       string
	TanggalPanen  string
	LuasPanenHa   float64
	JumlahJanjang int
	BeratKg       float64
	HargaPerKg    float64
	BiayaPanen    float64
	Catatan       string
}

func (s *FarmCoreHarvestService) InsertPanen(ctx context.Context, userID string, in CreatePanenInput) (int64, error) {
	result, err := s.db.ExecContext(ctx,
		`INSERT INTO t_sawit_hub_panen
		 (user_id, id_lahan, tanggal_panen, luas_panen_ha, jumlah_janjang, berat_kg, harga_per_kg, biaya_panen, catatan)
		 VALUES (?,?,?,?,?,?,?,?,?)`,
		userID, in.IDLahan, in.TanggalPanen,
		in.LuasPanenHa, in.JumlahJanjang, in.BeratKg, in.HargaPerKg, in.BiayaPanen, in.Catatan)
	if err != nil {
		return 0, err
	}
	id, _ := result.LastInsertId()

	if in.HargaPerKg > 0 {
		s.db.ExecContext(ctx,
			`INSERT INTO t_sawit_hub_harga_tbs (user_id, tanggal, harga_per_kg, sumber)
			 VALUES (?,?,?,?)`,
			userID, in.TanggalPanen, in.HargaPerKg, "Panen")
	}

	SyncPendapatan(ctx, s.db, s.dbRead, userID, in.IDLahan, in.TanggalPanen)
	return id, nil
}

type UpdatePanenInput struct {
	IDLahan       string
	TanggalPanen  string
	LuasPanenHa   float64
	JumlahJanjang int
	BeratKg       float64
	HargaPerKg    float64
	BiayaPanen    float64
	Catatan       string
}

func (s *FarmCoreHarvestService) Update(ctx context.Context, userID, idPanen string, in UpdatePanenInput) (rowsAffected int64, err error) {
	res, err := s.db.ExecContext(ctx,
		`UPDATE t_sawit_hub_panen SET id_lahan=?, tanggal_panen=?, luas_panen_ha=?,
		 jumlah_janjang=?, berat_kg=?, harga_per_kg=?, biaya_panen=?, catatan=?
		 WHERE id_panen=? AND user_id=? AND deleted_at IS NULL`,
		in.IDLahan, in.TanggalPanen, in.LuasPanenHa,
		in.JumlahJanjang, in.BeratKg, in.HargaPerKg, in.BiayaPanen, in.Catatan,
		idPanen, userID)
	if err != nil {
		return 0, err
	}
	n, err := res.RowsAffected()
	if err != nil || n == 0 {
		return n, err
	}

	if in.HargaPerKg > 0 {
		s.db.ExecContext(ctx,
			`INSERT IGNORE INTO t_sawit_hub_harga_tbs (user_id, tanggal, harga_per_kg, sumber)
			 VALUES (?,?,?,?)`,
			userID, in.TanggalPanen, in.HargaPerKg, "Panen")
	}

	SyncPendapatan(ctx, s.db, s.dbRead, userID, in.IDLahan, in.TanggalPanen)
	return n, nil
}

func (s *FarmCoreHarvestService) SoftDelete(ctx context.Context, userID, idPanen string) (rowsAffected int64, err error) {
	res, err := s.db.ExecContext(ctx,
		"UPDATE t_sawit_hub_panen SET deleted_at=NOW() WHERE id_panen=? AND user_id=? AND deleted_at IS NULL",
		idPanen, userID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
