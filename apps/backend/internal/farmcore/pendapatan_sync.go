package farmcore

import (
	"context"
	"database/sql"
)

func SyncPendapatan(ctx context.Context, db *sql.DB, dbRead *sql.DB, userID, idLahan, tanggalPanen string) {
	if dbRead == nil {
		dbRead = db
	}
	var beratKg, hargaPerKg, biayaPanen float64
	var totalJanjang int
	err := dbRead.QueryRowContext(ctx,
		`SELECT COALESCE(berat_kg,0), COALESCE(jumlah_janjang,0), COALESCE(harga_per_kg,0), COALESCE(biaya_panen,0)
		 FROM t_sawit_hub_panen
		 WHERE user_id=? AND id_lahan=? AND tanggal_panen=? AND deleted_at IS NULL`,
		userID, idLahan, tanggalPanen).
		Scan(&beratKg, &totalJanjang, &hargaPerKg, &biayaPanen)

	if err != nil {
		return
	}

	pendapatanKotor := beratKg * hargaPerKg

	var biayaPerawatan float64
	dbRead.QueryRowContext(ctx,
		`SELECT COALESCE(SUM(COALESCE(total_biaya_perawatan,0)),0)
		 FROM t_sawit_hub_perawatan
		 WHERE user_id=? AND id_lahan=? AND tanggal_perawatan<=? AND deleted_at IS NULL`,
		userID, idLahan, tanggalPanen).
		Scan(&biayaPerawatan)

	biayaTotal := biayaPanen + biayaPerawatan

	var existsID int64
	err = dbRead.QueryRowContext(ctx,
		`SELECT id_pendapatan FROM t_sawit_hub_pendapatan
		 WHERE user_id=? AND id_lahan=? AND tanggal_panen=? AND deleted_at IS NULL`,
		userID, idLahan, tanggalPanen).
		Scan(&existsID)

	if err == nil {
		db.ExecContext(ctx,
			`UPDATE t_sawit_hub_pendapatan
			 SET total_janjang=?, total_berat_kg=?, pendapatan_kotor=?, biaya_total=?
			 WHERE id_pendapatan=?`,
			totalJanjang, beratKg, pendapatanKotor, biayaTotal, existsID)
	} else {
		db.ExecContext(ctx,
			`INSERT INTO t_sawit_hub_pendapatan
			 (user_id, id_lahan, tanggal_panen, total_janjang, total_berat_kg, pendapatan_kotor, biaya_total)
			 VALUES (?,?,?,?,?,?,?)`,
			userID, idLahan, tanggalPanen, totalJanjang, beratKg, pendapatanKotor, biayaTotal)
	}
}

func SyncPendapatanForLahan(ctx context.Context, db *sql.DB, dbRead *sql.DB, userID, idLahan string) {
	if dbRead == nil {
		dbRead = db
	}
	rows, err := dbRead.QueryContext(ctx,
		`SELECT tanggal_panen FROM t_sawit_hub_panen
		 WHERE user_id=? AND id_lahan=? AND deleted_at IS NULL`,
		userID, idLahan)
	if err != nil {
		return
	}
	defer rows.Close()

	var tanggalList []string
	for rows.Next() {
		var tgl string
		rows.Scan(&tgl)
		tanggalList = append(tanggalList, tgl)
	}

	for _, tgl := range tanggalList {
		SyncPendapatan(ctx, db, dbRead, userID, idLahan, tgl)
	}
}
