package farmfinance

import (
	"context"
	"database/sql"
	"time"
)

type FarmFinanceCommodityPriceService struct {
	dbRead *sql.DB
}

func NewFarmFinanceCommodityPriceService(dbRead *sql.DB) *FarmFinanceCommodityPriceService {
	return &FarmFinanceCommodityPriceService{dbRead: dbRead}
}

func (s *FarmFinanceCommodityPriceService) List(ctx context.Context, userID string) ([]HargaRow, error) {
	rows, err := s.dbRead.QueryContext(ctx,
		`SELECT id_harga, tanggal, harga_per_kg, COALESCE(sumber,''), created_at
		 FROM t_sawit_hub_harga_tbs WHERE user_id=?
		 ORDER BY tanggal DESC LIMIT 30`, userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var result []HargaRow
	for rows.Next() {
		var row HargaRow
		var tgl time.Time
		rows.Scan(&row.IDHarga, &tgl, &row.HargaPerKg, &row.Sumber, &row.CreatedAt)
		row.Tanggal = tgl.Format("2006-01-02")
		result = append(result, row)
	}
	return result, nil
}
