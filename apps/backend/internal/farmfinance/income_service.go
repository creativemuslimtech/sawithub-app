package farmfinance

import (
	"context"
	"database/sql"
	"time"
)

type FarmFinanceIncomeService struct {
	db     *sql.DB
	dbRead *sql.DB
}

func NewFarmFinanceIncomeService(db, dbRead *sql.DB) *FarmFinanceIncomeService {
	if dbRead == nil {
		dbRead = db
	}
	return &FarmFinanceIncomeService{db: db, dbRead: dbRead}
}

func (s *FarmFinanceIncomeService) List(ctx context.Context, userID string) ([]PendapatanRow, error) {
	rows, err := s.dbRead.QueryContext(ctx,
		`SELECT id_pendapatan, id_lahan, tanggal_panen, total_janjang,
		        total_berat_kg, pendapatan_kotor, biaya_total,
		        pendapatan_bersih, COALESCE(catatan,'')
		 FROM t_sawit_hub_pendapatan WHERE user_id=? AND deleted_at IS NULL
		 ORDER BY tanggal_panen DESC LIMIT 20`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []PendapatanRow
	for rows.Next() {
		var p PendapatanRow
		var tgl time.Time
		rows.Scan(&p.IDPendapatan, &p.IDLahan, &tgl, &p.TotalJanjang,
			&p.TotalBeratKg, &p.PendapatanKotor, &p.BiayaTotal,
			&p.PendapatanBersih, &p.Catatan)
		p.TanggalPanen = tgl.Format("2006-01-02")
		result = append(result, p)
	}
	return result, nil
}

type CreatePendapatanInput struct {
	IDLahan         string
	TanggalPanen    string
	TotalJanjang    int
	TotalBeratKg    float64
	PendapatanKotor float64
	BiayaTotal      float64
	Catatan         string
}

func (s *FarmFinanceIncomeService) Insert(ctx context.Context, userID string, in CreatePendapatanInput) (int64, error) {
	result, err := s.db.ExecContext(ctx,
		`INSERT INTO t_sawit_hub_pendapatan
		 (user_id, id_lahan, tanggal_panen, total_janjang,
		  total_berat_kg, pendapatan_kotor, biaya_total, catatan)
		 VALUES (?,?,?,?,?,?,?,?)`,
		userID, in.IDLahan, in.TanggalPanen, in.TotalJanjang,
		in.TotalBeratKg, in.PendapatanKotor, in.BiayaTotal, in.Catatan)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

type UpdatePendapatanInput struct {
	IDLahan         string
	TanggalPanen    string
	TotalJanjang    int
	TotalBeratKg    float64
	PendapatanKotor float64
	BiayaTotal      float64
	Catatan         string
}

func (s *FarmFinanceIncomeService) Update(ctx context.Context, userID, idPendapatan string, in UpdatePendapatanInput) (rowsAffected int64, err error) {
	res, err := s.db.ExecContext(ctx,
		`UPDATE t_sawit_hub_pendapatan SET id_lahan=?, tanggal_panen=?, total_janjang=?,
		 total_berat_kg=?, pendapatan_kotor=?, biaya_total=?, catatan=?
		 WHERE id_pendapatan=? AND user_id=? AND deleted_at IS NULL`,
		in.IDLahan, in.TanggalPanen, in.TotalJanjang,
		in.TotalBeratKg, in.PendapatanKotor, in.BiayaTotal, in.Catatan,
		idPendapatan, userID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (s *FarmFinanceIncomeService) SoftDelete(ctx context.Context, userID, idPendapatan string) (rowsAffected int64, err error) {
	res, err := s.db.ExecContext(ctx,
		"UPDATE t_sawit_hub_pendapatan SET deleted_at=NOW() WHERE id_pendapatan=? AND user_id=? AND deleted_at IS NULL",
		idPendapatan, userID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
