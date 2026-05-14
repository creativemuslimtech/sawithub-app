package farmcore

import (
	"context"
	"database/sql"
	"strconv"
	"time"
)

type FarmCoreChecklistService struct {
	db     *sql.DB
	dbRead *sql.DB
}

func NewFarmCoreChecklistService(db, dbRead *sql.DB) *FarmCoreChecklistService {
	if dbRead == nil {
		dbRead = db
	}
	return &FarmCoreChecklistService{db: db, dbRead: dbRead}
}

func (s *FarmCoreChecklistService) ListRuns(ctx context.Context, userID string) (ChecklistListResponse, error) {
	now := time.Now()
	rows, err := s.dbRead.QueryContext(ctx, `SELECT r.id_run, r.title, r.status, r.task_date, CAST(r.id_lahan AS CHAR), COALESCE(l.nama_kebun,'')
		FROM t_sawit_hub_field_checklist_runs r LEFT JOIN t_sawit_hub_lahan l ON l.id_lahan=r.id_lahan WHERE r.user_id=? AND r.deleted_at IS NULL ORDER BY r.task_date DESC, r.created_at DESC LIMIT 15`, userID)
	if err != nil {
		return ChecklistListResponse{GeneratedAt: now.Format(time.RFC3339), Runs: []ChecklistRun{}}, nil
	}
	defer rows.Close()
	out := []ChecklistRun{}
	for rows.Next() {
		var run ChecklistRun
		var due time.Time
		if err := rows.Scan(&run.ID, &run.Title, &run.Status, &due, &run.IDLahan, &run.NamaKebun); err != nil {
			return ChecklistListResponse{}, err
		}
		run.DueDate = due.Format("2006-01-02")
		out = append(out, run)
	}
	return ChecklistListResponse{GeneratedAt: now.Format(time.RFC3339), Runs: out}, nil
}

type CreateChecklistRunInput struct {
	IDLahan  string
	Title    string
	TaskDate string
}

func (s *FarmCoreChecklistService) CreateRun(ctx context.Context, userID string, in CreateChecklistRunInput) (runID string, err error) {
	res, err := s.db.ExecContext(ctx, `INSERT INTO t_sawit_hub_field_checklist_runs (user_id,id_lahan,title,status,task_date) VALUES (?, ?, ?, 'pending', ?)`, userID, in.IDLahan, in.Title, in.TaskDate)
	if err != nil {
		return "", err
	}
	id, _ := res.LastInsertId()
	_, _ = s.db.ExecContext(ctx, `INSERT INTO t_sawit_hub_field_checklist_run_items (id_run,item_label,item_order,is_required,status) VALUES (?, 'Briefing tim lapangan', 1, 1, 'pending'), (?, 'Verifikasi alat dan APD', 2, 1, 'pending'), (?, 'Dokumentasi hasil kerja', 3, 0, 'pending')`, id, id, id)
	return strconv.FormatInt(id, 10), nil
}

func (s *FarmCoreChecklistService) UpdateRunStatus(ctx context.Context, userID, runID, status string) (rowsAffected int64, err error) {
	res, err := s.db.ExecContext(ctx, `UPDATE t_sawit_hub_field_checklist_runs SET status=?, completed_at=CASE WHEN ?='done' THEN NOW() ELSE NULL END WHERE id_run=? AND user_id=?`, status, status, runID, userID)
	if err != nil {
		return 0, err
	}
	return res.RowsAffected()
}
