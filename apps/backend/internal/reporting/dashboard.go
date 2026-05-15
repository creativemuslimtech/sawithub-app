package reporting

import (
	"context"
	"database/sql"
	"net/http"
	"sort"
	"strconv"
	"time"

	"sawithub/backend/internal/farmcore"
	"sawithub/backend/internal/farmfinance"
)

type ReportingDashboardService struct {
	dbRead *sql.DB
}

func NewReportingDashboardService(dbRead *sql.DB) *ReportingDashboardService {
	return &ReportingDashboardService{dbRead: dbRead}
}

// Build aggregates dashboard payload from query params (period, lahan_id, year, month, week).
func (s *ReportingDashboardService) Build(ctx context.Context, userID string, r *http.Request, now time.Time) DashboardResponse {
	period := r.URL.Query().Get("period")
	if period != "week" && period != "month" && period != "year" {
		period = "year"
	}
	lahanID := r.URL.Query().Get("lahan_id")

	yearParam := now.Year()
	if v := r.URL.Query().Get("year"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed > 0 {
			yearParam = parsed
		}
	}
	monthParam := int(now.Month())
	if v := r.URL.Query().Get("month"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed >= 1 && parsed <= 12 {
			monthParam = parsed
		}
	}
	weekParam := 0
	if v := r.URL.Query().Get("week"); v != "" {
		if parsed, err := strconv.Atoi(v); err == nil && parsed >= 0 {
			weekParam = parsed
		}
	}

	loc := now.Location()
	var since, until time.Time
	switch period {
	case "year":
		since = time.Date(yearParam, 1, 1, 0, 0, 0, 0, loc)
		until = time.Date(yearParam, 12, 31, 23, 59, 59, 0, loc)
	case "month":
		since = time.Date(yearParam, time.Month(monthParam), 1, 0, 0, 0, 0, loc)
		until = since.AddDate(0, 1, 0).Add(-time.Second)
	default: // week
		if weekParam < 0 {
			weekParam = 0
		}
		dayStart := 1 + weekParam*7
		since = time.Date(yearParam, time.Month(monthParam), dayStart, 0, 0, 0, 0, loc)
		until = since.AddDate(0, 0, 6)
		endOfMonth := time.Date(yearParam, time.Month(monthParam)+1, 0, 23, 59, 59, 0, loc)
		if until.After(endOfMonth) {
			until = endOfMonth
		}
	}

	resp := DashboardResponse{Period: period, SelectedLahan: lahanID}
	sinceStr := since.Format("2006-01-02")
	untilStr := until.Format("2006-01-02")

	lRows, err := s.dbRead.QueryContext(ctx,
		`SELECT id_lahan, nama_kebun, COALESCE(jenis_bibit,''), COALESCE(lokasi,''),
		        COALESCE(luas_ha,0), COALESCE(jumlah_pohon,0), COALESCE(tahun_tanam,0)
		 FROM t_sawit_hub_lahan WHERE user_id=? AND deleted_at IS NULL ORDER BY nama_kebun ASC`, userID)
	lahanMap := map[string]string{}
	if err == nil {
		defer lRows.Close()
		for lRows.Next() {
			var l DashboardLahanInfo
			lRows.Scan(&l.IDLahan, &l.NamaKebun, &l.JenisBibit, &l.Lokasi, &l.LuasHa, &l.JumlahPohon, &l.TahunTanam)
			resp.LahanList = append(resp.LahanList, l)
			lahanMap[l.IDLahan] = l.NamaKebun
		}
	}
	if resp.LahanList == nil {
		resp.LahanList = []DashboardLahanInfo{}
	}

	panenArgs := []interface{}{userID, sinceStr, untilStr}
	panenClause := ""
	if lahanID != "" {
		panenClause = " AND id_lahan=?"
		panenArgs = append(panenArgs, lahanID)
	}

	s.dbRead.QueryRowContext(ctx,
		"SELECT COALESCE(SUM(berat_ton),0), COALESCE(SUM(total_pendapatan),0), COALESCE(SUM(biaya_panen),0) "+
			"FROM t_sawit_hub_panen WHERE user_id=? AND tanggal_panen BETWEEN ? AND ? AND deleted_at IS NULL"+panenClause,
		panenArgs...).Scan(&resp.TotalBeratTon, &resp.TotalPendapatan, &resp.TotalBiaya)

	pArgs := []interface{}{userID, sinceStr, untilStr}
	pClause := ""
	if lahanID != "" {
		pClause = " AND id_lahan=?"
		pArgs = append(pArgs, lahanID)
	}
	var perawatanBiaya float64
	s.dbRead.QueryRowContext(ctx,
		"SELECT COALESCE(SUM(total_biaya_perawatan),0) FROM t_sawit_hub_perawatan WHERE user_id=? AND tanggal_perawatan BETWEEN ? AND ? AND deleted_at IS NULL"+pClause,
		pArgs...).Scan(&perawatanBiaya)
	resp.TotalBiaya += perawatanBiaya
	resp.NetIncome = resp.TotalPendapatan - resp.TotalBiaya

	resp.ChartData = s.buildChart(ctx, userID, lahanID, lahanMap, period, since, until, yearParam, monthParam, weekParam)
	if len(resp.ChartData) > 0 {
		resp.AvgTonPerPeriod = resp.TotalBeratTon / float64(len(resp.ChartData))
	}

	bArgs := []interface{}{userID, sinceStr, untilStr}
	bClause := ""
	if lahanID != "" {
		bClause = " AND id_lahan=?"
		bArgs = append(bArgs, lahanID)
	}
	bRows, err := s.dbRead.QueryContext(ctx,
		`SELECT jenis_perawatan, COALESCE(SUM(total_biaya_perawatan),0)
		 FROM t_sawit_hub_perawatan WHERE user_id=? AND tanggal_perawatan BETWEEN ? AND ? AND deleted_at IS NULL`+bClause+
			` GROUP BY jenis_perawatan ORDER BY 2 DESC`, bArgs...)
	if err == nil {
		defer bRows.Close()
		for bRows.Next() {
			var item DashboardBiayaItem
			bRows.Scan(&item.Jenis, &item.Total)
			resp.BiayaBreakdown = append(resp.BiayaBreakdown, item)
		}
	}
	if resp.BiayaBreakdown == nil {
		resp.BiayaBreakdown = []DashboardBiayaItem{}
	}

	maxUpcoming := 12
	switch period {
	case "month":
		maxUpcoming = 8
	case "week":
		maxUpcoming = 5
	}

	upArgs := []interface{}{userID}
	upClause := ""
	if lahanID != "" {
		upClause = " AND j.id_lahan=?"
		upArgs = append(upArgs, lahanID)
	}
	upRows, err := s.dbRead.QueryContext(ctx,
		`SELECT j.id_jadwal_perawatan, j.jenis_perawatan, j.tanggal_mulai,
		        COALESCE(l.nama_kebun,''), j.frequensi_tipe, COALESCE(j.frequensi_custom_hari,0),
		        j.tanggal_akhir
		 FROM t_sawit_hub_jadwal_perawatan j
		 LEFT JOIN t_sawit_hub_lahan l ON l.id_lahan=j.id_lahan AND l.deleted_at IS NULL
		 WHERE j.user_id=? AND j.is_active=1 AND j.deleted_at IS NULL`+upClause, upArgs...)

	type upcomingWithDate struct {
		item     DashboardUpcomingItem
		nextDate time.Time
	}
	var upcomingCollected []upcomingWithDate

	if err == nil {
		defer upRows.Close()
		for upRows.Next() {
			var jadwalID string
			var jenis, nmaBlok, freqType string
			var mulai time.Time
			var akhir sql.NullTime
			var freqCustom int
			upRows.Scan(&jadwalID, &jenis, &mulai, &nmaBlok, &freqType, &freqCustom, &akhir)
			_ = jadwalID
			today := farmcore.NormalizeDateOnly(now.In(mulai.Location()), mulai.Location())
			scheduleStart := farmcore.NormalizeDateOnly(since.In(mulai.Location()), mulai.Location())
			if today.After(scheduleStart) {
				scheduleStart = today
			}
			scheduleHorizon := farmcore.NormalizeDateOnly(until.In(mulai.Location()), mulai.Location())
			if akhir.Valid {
				akhirDate := farmcore.NormalizeDateOnly(akhir.Time, mulai.Location())
				if akhirDate.Before(scheduleHorizon) {
					scheduleHorizon = akhirDate
				}
			}
			if scheduleHorizon.Before(scheduleStart) {
				continue
			}

			for _, nextDate := range farmcore.CalculateUpcomingDates(mulai, freqType, freqCustom, scheduleStart, scheduleHorizon, maxUpcoming) {
				upcomingCollected = append(upcomingCollected, upcomingWithDate{
					item: DashboardUpcomingItem{
						Tanggal:        nextDate.Format("2006-01-02"),
						JenisPerawatan: jenis,
						NamaBlok:       nmaBlok,
						Keterangan:     "",
					},
					nextDate: nextDate,
				})
			}
		}
	}

	sort.Slice(upcomingCollected, func(i, j int) bool {
		return upcomingCollected[i].nextDate.Before(upcomingCollected[j].nextDate)
	})
	for i, u := range upcomingCollected {
		if i >= maxUpcoming {
			break
		}
		resp.UpcomingPerawatan = append(resp.UpcomingPerawatan, u.item)
	}
	if resp.UpcomingPerawatan == nil {
		resp.UpcomingPerawatan = []DashboardUpcomingItem{}
	}

	hArgs := []interface{}{userID}
	hClause := ""
	if lahanID != "" {
		hClause = " AND id_lahan=?"
		hArgs = append(hArgs, lahanID)
	}
	s.dbRead.QueryRowContext(ctx,
		"SELECT COALESCE(harga_per_kg,0) FROM t_sawit_hub_panen WHERE user_id=? AND deleted_at IS NULL"+hClause+
			" ORDER BY tanggal_panen DESC LIMIT 1", hArgs...).Scan(&resp.LastHargaPerKg)

	rArgs := []interface{}{userID, sinceStr, untilStr}
	rClause := ""
	if lahanID != "" {
		rClause = " AND id_lahan=?"
		rArgs = append(rArgs, lahanID)
	}
	panenRows, err := s.dbRead.QueryContext(ctx,
		`SELECT id_panen, id_lahan, tanggal_panen, luas_panen_ha, jumlah_janjang,
		        berat_kg, berat_ton, harga_per_kg, total_pendapatan, biaya_panen, hasil_bersih
		 FROM t_sawit_hub_panen WHERE user_id=? AND tanggal_panen BETWEEN ? AND ? AND deleted_at IS NULL`+rClause+
			` ORDER BY tanggal_panen DESC LIMIT 8`, rArgs...)
	if err == nil {
		defer panenRows.Close()
		for panenRows.Next() {
			var p farmcore.PanenRow
			var tgl time.Time
			panenRows.Scan(&p.IDPanen, &p.IDLahan, &tgl, &p.LuasPanenHa, &p.JumlahJanjang,
				&p.BeratKg, &p.BeratTon, &p.HargaPerKg, &p.TotalPendapatan, &p.BiayaPanen, &p.HasilBersih)
			p.TanggalPanen = tgl.Format("2006-01-02")
			resp.RecentPanen = append(resp.RecentPanen, p)
		}
	}
	if resp.RecentPanen == nil {
		resp.RecentPanen = []farmcore.PanenRow{}
	}

	prArgs := []interface{}{userID, sinceStr, untilStr}
	prClause := ""
	if lahanID != "" {
		prClause = " AND id_lahan=?"
		prArgs = append(prArgs, lahanID)
	}
	pRows, err := s.dbRead.QueryContext(ctx,
		`SELECT id_perawatan, id_lahan, tanggal_perawatan, jenis_perawatan,
		        COALESCE(bahan,''), COALESCE(jumlah,0), COALESCE(satuan,''),
		        COALESCE(harga_satuan,0), COALESCE(total_harga_material,0), COALESCE(biaya_pekerja,0),
		        COALESCE(total_biaya_perawatan,0), COALESCE(keterangan,'')
		 FROM t_sawit_hub_perawatan WHERE user_id=? AND tanggal_perawatan BETWEEN ? AND ? AND deleted_at IS NULL`+prClause+
			` ORDER BY tanggal_perawatan DESC LIMIT 8`, prArgs...)
	if err == nil {
		defer pRows.Close()
		for pRows.Next() {
			var p farmcore.PerawatanRow
			var tgl time.Time
			pRows.Scan(&p.IDPerawatan, &p.IDLahan, &tgl, &p.JenisPerawatan,
				&p.Bahan, &p.Jumlah, &p.Satuan, &p.HargaSatuan, &p.TotalHargaMaterial, &p.BiayaPekerja,
				&p.Biaya, &p.Keterangan)
			p.TanggalPerawatan = tgl.Format("2006-01-02")
			resp.RecentPerawatan = append(resp.RecentPerawatan, p)
		}
	}
	if resp.RecentPerawatan == nil {
		resp.RecentPerawatan = []farmcore.PerawatanRow{}
	}

	pdArgs := []interface{}{userID, sinceStr, untilStr}
	pdClause := ""
	if lahanID != "" {
		pdClause = " AND id_lahan=?"
		pdArgs = append(pdArgs, lahanID)
	}
	pdRows, err := s.dbRead.QueryContext(ctx,
		`SELECT id_pendapatan, id_lahan, tanggal_panen, total_janjang,
		        total_berat_kg, pendapatan_kotor, biaya_total, pendapatan_bersih,
		        COALESCE(catatan,'')
		 FROM t_sawit_hub_pendapatan WHERE user_id=? AND tanggal_panen BETWEEN ? AND ? AND deleted_at IS NULL`+pdClause+
			` ORDER BY tanggal_panen DESC LIMIT 8`, pdArgs...)
	if err == nil {
		defer pdRows.Close()
		for pdRows.Next() {
			var p farmfinance.PendapatanRow
			var tgl time.Time
			pdRows.Scan(&p.IDPendapatan, &p.IDLahan, &tgl, &p.TotalJanjang,
				&p.TotalBeratKg, &p.PendapatanKotor, &p.BiayaTotal, &p.PendapatanBersih, &p.Catatan)
			p.TanggalPanen = tgl.Format("2006-01-02")
			resp.RecentPendapatan = append(resp.RecentPendapatan, p)
		}
	}
	if resp.RecentPendapatan == nil {
		resp.RecentPendapatan = []farmfinance.PendapatanRow{}
	}

	return resp
}

func (s *ReportingDashboardService) buildChart(ctx context.Context,
	userID, lahanID string, lahanMap map[string]string,
	period string, since, until time.Time,
	yearParam, monthParam, weekParam int) []DashboardChartPoint {

	var query string
	args := []interface{}{userID, since.Format("2006-01-02"), until.Format("2006-01-02")}
	switch period {
	case "week":
		query = `SELECT id_lahan, DATE(tanggal_panen) AS d,
		                COALESCE(SUM(berat_ton),0), COALESCE(SUM(total_pendapatan),0),
		                COALESCE(SUM(hasil_bersih),0), COALESCE(SUM(jumlah_janjang),0),
		                COALESCE(AVG(harga_per_kg),0)
		         FROM t_sawit_hub_panen
		         WHERE user_id=? AND tanggal_panen BETWEEN ? AND ? AND deleted_at IS NULL`
		if lahanID != "" {
			query += " AND id_lahan=?"
			args = append(args, lahanID)
		}
		query += " GROUP BY id_lahan, d ORDER BY d ASC"
	case "month":
		query = `SELECT id_lahan,
		                DATE(DATE_SUB(tanggal_panen, INTERVAL WEEKDAY(tanggal_panen) DAY)) AS wk,
		                COALESCE(SUM(berat_ton),0), COALESCE(SUM(total_pendapatan),0),
		                COALESCE(SUM(hasil_bersih),0), COALESCE(SUM(jumlah_janjang),0),
		                COALESCE(AVG(harga_per_kg),0)
		         FROM t_sawit_hub_panen
		         WHERE user_id=? AND tanggal_panen BETWEEN ? AND ? AND deleted_at IS NULL`
		if lahanID != "" {
			query += " AND id_lahan=?"
			args = append(args, lahanID)
		}
		query += " GROUP BY id_lahan, wk ORDER BY wk ASC"
	default: // year
		query = `SELECT id_lahan,
		                YEAR(tanggal_panen) AS yr,
		                MONTH(tanggal_panen) AS mo,
		                COALESCE(SUM(berat_ton),0), COALESCE(SUM(total_pendapatan),0),
		                COALESCE(SUM(hasil_bersih),0), COALESCE(SUM(jumlah_janjang),0),
		                COALESCE(AVG(harga_per_kg),0)
		         FROM t_sawit_hub_panen
		         WHERE user_id=? AND tanggal_panen BETWEEN ? AND ? AND deleted_at IS NULL`
		if lahanID != "" {
			query += " AND id_lahan=?"
			args = append(args, lahanID)
		}
		query += " GROUP BY id_lahan, yr, mo ORDER BY yr ASC, mo ASC"
	}

	rows, _ := s.dbRead.QueryContext(ctx, query, args...)

	type bucket struct {
		total, pendapatan, netIncome, hargaSum float64
		janjang                                int64
		hargaCount                             int
		perLahan                               map[string]float64
	}
	buckets := map[string]*bucket{}
	seen := map[string]bool{}
	var orderedLabels []string

	if rows != nil {
		defer rows.Close()
		for rows.Next() {
			var lid string
			var berat, pend, net, harga float64
			var janjang int64
			var label string

			switch period {
			case "week":
				var d time.Time
				rows.Scan(&lid, &d, &berat, &pend, &net, &janjang, &harga)
				label = d.Format("02 Jan")
			case "month":
				var wk time.Time
				rows.Scan(&lid, &wk, &berat, &pend, &net, &janjang, &harga)
				label = "Mg " + wk.Format("02/01")
			default:
				var yr, mo int
				rows.Scan(&lid, &yr, &mo, &berat, &pend, &net, &janjang, &harga)
				label = bulanIndonesiaShort[mo-1]
			}

			if !seen[label] {
				seen[label] = true
				orderedLabels = append(orderedLabels, label)
			}
			if buckets[label] == nil {
				buckets[label] = &bucket{perLahan: map[string]float64{}}
			}
			b := buckets[label]
			b.total += berat
			b.pendapatan += pend
			b.netIncome += net
			b.janjang += janjang
			if harga > 0 {
				b.hargaSum += harga
				b.hargaCount++
			}
			nama := lahanMap[lid]
			if nama == "" {
				nama = "Lahan " + lid[:8]
			}
			b.perLahan[nama] += berat
		}
	}

	loc := since.Location()
	switch period {
	case "week":
		orderedLabels = nil
		for d := since; !d.After(until); d = d.AddDate(0, 0, 1) {
			orderedLabels = append(orderedLabels, d.Format("02 Jan"))
		}
	case "month":
		orderedLabels = nil
		firstDay := time.Date(yearParam, time.Month(monthParam), 1, 0, 0, 0, 0, loc)
		lastDay := firstDay.AddDate(0, 1, 0).Add(-time.Second)
		wd := int(firstDay.Weekday())
		if wd == 0 {
			wd = 7
		}
		monday := firstDay.AddDate(0, 0, -(wd - 1))
		seen2 := map[string]bool{}
		for wk := monday; !wk.After(lastDay); wk = wk.AddDate(0, 0, 7) {
			lbl := "Mg " + wk.Format("02/01")
			if !seen2[lbl] {
				seen2[lbl] = true
				orderedLabels = append(orderedLabels, lbl)
			}
		}
	default:
		orderedLabels = nil
		for mo := 1; mo <= 12; mo++ {
			orderedLabels = append(orderedLabels, bulanIndonesiaShort[mo-1])
		}
	}
	_ = weekParam

	var result []DashboardChartPoint
	for _, lbl := range orderedLabels {
		pt := DashboardChartPoint{Label: lbl, PerLahan: map[string]float64{}}
		if b, ok := buckets[lbl]; ok {
			pt.Total = b.total
			pt.Pendapatan = b.pendapatan
			pt.NetIncome = b.netIncome
			pt.Janjang = b.janjang
			if b.hargaCount > 0 {
				pt.HargaAvg = b.hargaSum / float64(b.hargaCount)
			}
			for k, v := range b.perLahan {
				pt.PerLahan[k] = v
			}
		}
		result = append(result, pt)
	}
	return result
}
