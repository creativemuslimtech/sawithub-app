package farmcore

import (
	"context"
	"database/sql"
)

type FarmCorePlotService struct {
	db     *sql.DB
	dbRead *sql.DB
}

func NewFarmCorePlotService(db, dbRead *sql.DB) *FarmCorePlotService {
	if dbRead == nil {
		dbRead = db
	}
	return &FarmCorePlotService{db: db, dbRead: dbRead}
}

func (s *FarmCorePlotService) List(ctx context.Context, userID string) ([]LahanRow, error) {
	rows, err := s.dbRead.QueryContext(ctx,
		`SELECT id_lahan, user_id, nama_kebun, COALESCE(jenis_bibit,''),
		        COALESCE(lokasi,''), COALESCE(luas_ha,0),
		        COALESCE(jumlah_pohon,0), COALESCE(tahun_tanam,0)
		 FROM t_sawit_hub_lahan WHERE user_id=? AND deleted_at IS NULL ORDER BY nama_kebun`,
		userID)
	if err != nil {
		return nil, err
	}
	defer rows.Close()
	var out []LahanRow
	for rows.Next() {
		var l LahanRow
		rows.Scan(&l.IDLahan, &l.UserID, &l.NamaKebun, &l.JenisBibit,
			&l.Lokasi, &l.LuasHa, &l.JumlahPohon, &l.TahunTanam)
		out = append(out, l)
	}
	return out, nil
}

type CreateLahanInput struct {
	NamaKebun   string
	JenisBibit  string
	Lokasi      string
	LuasHa      float64
	JumlahPohon int
	TahunTanam  int
}

func (s *FarmCorePlotService) Insert(ctx context.Context, userID string, in CreateLahanInput) (int64, error) {
	result, err := s.db.ExecContext(ctx,
		`INSERT INTO t_sawit_hub_lahan
		 (user_id, nama_kebun, jenis_bibit, lokasi, luas_ha, jumlah_pohon, tahun_tanam)
		 VALUES (?,?,?,?,?,?,?)`,
		userID, in.NamaKebun, in.JenisBibit, in.Lokasi,
		in.LuasHa, in.JumlahPohon, in.TahunTanam)
	if err != nil {
		return 0, err
	}
	return result.LastInsertId()
}

type UpdateLahanInput struct {
	NamaKebun   string
	JenisBibit  string
	Lokasi      string
	LuasHa      float64
	JumlahPohon int
	TahunTanam  int
}

func (s *FarmCorePlotService) Update(ctx context.Context, userID, idLahan string, in UpdateLahanInput) (rowsAffected int64, err error) {
	res, err := s.db.ExecContext(ctx,
		`UPDATE t_sawit_hub_lahan SET nama_kebun=?, jenis_bibit=?, lokasi=?,
		 luas_ha=?, jumlah_pohon=?, tahun_tanam=?
		 WHERE id_lahan=? AND user_id=? AND deleted_at IS NULL`,
		in.NamaKebun, in.JenisBibit, in.Lokasi,
		in.LuasHa, in.JumlahPohon, in.TahunTanam, idLahan, userID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}

func (s *FarmCorePlotService) SoftDelete(ctx context.Context, userID, idLahan string) (rowsAffected int64, err error) {
	res, err := s.db.ExecContext(ctx,
		"UPDATE t_sawit_hub_lahan SET deleted_at=NOW() WHERE id_lahan=? AND user_id=? AND deleted_at IS NULL",
		idLahan, userID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
