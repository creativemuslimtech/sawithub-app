package reporting

import (
	"context"
	"database/sql"
	"net/http"
	"strconv"
	"time"
)

var bulanIndonesiaShort = []string{"Jan", "Feb", "Mar", "Apr", "Mei", "Jun", "Jul", "Agu", "Sep", "Okt", "Nov", "Des"}

type laporanBucket struct {
	Key   string
	Label string
	Start time.Time
	End   time.Time
}

type chartAccumulator struct {
	point      *LaporanChartPoint
	priceSum   float64
	priceCount int
}

type ReportingFarmFinanceService struct {
	dbRead *sql.DB
}

func NewReportingFarmFinanceService(dbRead *sql.DB) *ReportingFarmFinanceService {
	return &ReportingFarmFinanceService{dbRead: dbRead}
}

func ParseLaporanParams(r *http.Request) LaporanParams {
	period := r.URL.Query().Get("period")
	if period == "" {
		period = "month"
	}

	now := time.Now()
	year := now.Year()
	if raw := r.URL.Query().Get("year"); raw != "" {
		if parsed, _ := strconv.Atoi(raw); parsed > 0 {
			year = parsed
		}
	}

	month := int(now.Month())
	if raw := r.URL.Query().Get("month"); raw != "" {
		if parsed, _ := strconv.Atoi(raw); parsed >= 1 && parsed <= 12 {
			month = parsed
		}
	}

	week := 0
	if raw := r.URL.Query().Get("week"); raw != "" {
		if parsed, _ := strconv.Atoi(raw); parsed >= 0 {
			week = parsed
		}
	}

	loc := now.Location()
	var since, until time.Time

	switch period {
	case "year":
		since = time.Date(year, 1, 1, 0, 0, 0, 0, loc)
		until = time.Date(year, 12, 31, 23, 59, 59, 0, loc)
	case "week":
		dayStart := 1 + week*7
		since = time.Date(year, time.Month(month), dayStart, 0, 0, 0, 0, loc)
		until = since.AddDate(0, 0, 6)
		endOfMonth := time.Date(year, time.Month(month)+1, 0, 23, 59, 59, 0, loc)
		if until.After(endOfMonth) {
			until = endOfMonth
		}
	default:
		since = time.Date(year, time.Month(month), 1, 0, 0, 0, 0, loc)
		until = since.AddDate(0, 1, 0).Add(-time.Second)
	}

	return LaporanParams{
		Period:  period,
		LahanID: r.URL.Query().Get("lahan_id"),
		Year:    year,
		Month:   month,
		Week:    week,
		Since:   since,
		Until:   until,
	}
}

func (s *ReportingFarmFinanceService) BuildLaporanKeuanganResponse(ctx context.Context, params LaporanParams) *LaporanKeuanganResponse {
	resp := &LaporanKeuanganResponse{
		Summary: LaporanSummary{},
		Chart:   []LaporanChartPoint{},
		Ranking: []FarmRanking{},
		Detail:  []LaporanDetailRow{},
	}

	resp.Chart = s.buildLaporanChart(ctx, params)
	resp.Ranking = s.buildFarmRanking(ctx, params)
	resp.Detail = s.buildLaporanDetail(ctx, params)
	resp.Summary = s.buildLaporanSummary(ctx, params, resp.Ranking)

	return resp
}

func (s *ReportingFarmFinanceService) buildLaporanSummary(ctx context.Context, params LaporanParams, ranking []FarmRanking) LaporanSummary {
	sinceStr := params.Since.Format("2006-01-02")
	untilStr := params.Until.Format("2006-01-02")

	args := []interface{}{params.UserID, sinceStr, untilStr}
	lahanClause := ""
	if params.LahanID != "" {
		lahanClause = " AND id_lahan=?"
		args = append(args, params.LahanID)
	}

	var totalTon, totalPendapatan, totalBiayaPanen, avgHarga float64
	var jumlahPanen int
	_ = s.dbRead.QueryRowContext(ctx,
		`SELECT
			COALESCE(SUM(berat_ton), 0),
			COALESCE(SUM(total_pendapatan), 0),
			COALESCE(SUM(biaya_panen), 0),
			COALESCE(AVG(harga_per_kg), 0),
			COUNT(id_panen)
		FROM t_sawit_hub_panen
		WHERE user_id=? AND tanggal_panen BETWEEN ? AND ? AND deleted_at IS NULL`+lahanClause,
		args...,
	).Scan(&totalTon, &totalPendapatan, &totalBiayaPanen, &avgHarga, &jumlahPanen)

	if totalPendapatan == 0 {
		var pendapatanKotor float64
		_ = s.dbRead.QueryRowContext(ctx,
			`SELECT COALESCE(SUM(pendapatan_kotor), 0)
			FROM t_sawit_hub_pendapatan
			WHERE user_id=? AND tanggal_panen BETWEEN ? AND ? AND deleted_at IS NULL`+lahanClause,
			args...,
		).Scan(&pendapatanKotor)
		totalPendapatan = pendapatanKotor
	}

	var totalBiayaPerawatan float64
	_ = s.dbRead.QueryRowContext(ctx,
		`SELECT COALESCE(SUM(total_biaya_perawatan), 0)
		FROM t_sawit_hub_perawatan
		WHERE user_id=? AND tanggal_perawatan BETWEEN ? AND ? AND deleted_at IS NULL`+lahanClause,
		args...,
	).Scan(&totalBiayaPerawatan)

	if avgHarga == 0 {
		var avgHargaTBS float64
		_ = s.dbRead.QueryRowContext(ctx,
			`SELECT COALESCE(AVG(harga_per_kg), 0)
			FROM t_sawit_hub_harga_tbs h
			WHERE h.user_id=? AND h.tanggal BETWEEN ? AND ?`,
			params.UserID, sinceStr, untilStr,
		).Scan(&avgHargaTBS)
		avgHarga = avgHargaTBS
	}

	activeArea := 0.0
	for _, farm := range ranking {
		if farm.TotalTon > 0 {
			activeArea += farm.LuasHa
		}
	}
	if activeArea == 0 {
		for _, farm := range ranking {
			if farm.TotalTon > 0 || farm.HasilBersih != 0 || farm.JumlahPanen > 0 {
				activeArea += farm.LuasHa
			}
		}
	}

	rataProductivitas := 0.0
	if activeArea > 0 {
		rataProductivitas = totalTon / activeArea
	}

	hasilBersih := totalPendapatan - totalBiayaPanen - totalBiayaPerawatan

	return LaporanSummary{
		TotalTon:            roundFloat(totalTon, 2),
		TotalPendapatan:     roundFloat(totalPendapatan, 0),
		TotalBiayaPanen:     roundFloat(totalBiayaPanen, 0),
		TotalBiayaPerawatan: roundFloat(totalBiayaPerawatan, 0),
		HasilBersih:         roundFloat(hasilBersih, 0),
		AvgHargaPerKg:       roundFloat(avgHarga, 0),
		JumlahPanen:         jumlahPanen,
		RataProductivitas:   roundFloat(rataProductivitas, 4),
	}
}

func (s *ReportingFarmFinanceService) buildLaporanChart(ctx context.Context, params LaporanParams) []LaporanChartPoint {
	buckets := buildLaporanBuckets(params)
	if len(buckets) == 0 {
		return []LaporanChartPoint{}
	}

	accumulatorByKey := make(map[string]*chartAccumulator, len(buckets))
	for _, bucket := range buckets {
		accumulatorByKey[bucket.Key] = &chartAccumulator{
			point: &LaporanChartPoint{
				Label:    bucket.Label,
				PerLahan: map[string]float64{},
			},
		}
	}

	sinceStr := params.Since.Format("2006-01-02")
	untilStr := params.Until.Format("2006-01-02")
	hasActivity := false

	panenArgs := []interface{}{params.UserID, sinceStr, untilStr}
	panenClause := ""
	if params.LahanID != "" {
		panenClause = " AND p.id_lahan=?"
		panenArgs = append(panenArgs, params.LahanID)
	}

	panenRows, err := s.dbRead.QueryContext(ctx,
		`SELECT
			p.tanggal_panen,
			p.id_lahan,
			COALESCE(l.nama_kebun, ''),
			COALESCE(SUM(p.berat_ton), 0),
			COALESCE(SUM(p.total_pendapatan), 0),
			COALESCE(SUM(p.biaya_panen), 0),
			COALESCE(AVG(p.harga_per_kg), 0)
		FROM t_sawit_hub_panen p
		LEFT JOIN t_sawit_hub_lahan l ON p.id_lahan = l.id_lahan AND l.deleted_at IS NULL
		WHERE p.user_id=? AND p.tanggal_panen BETWEEN ? AND ? AND p.deleted_at IS NULL`+panenClause+`
		GROUP BY p.tanggal_panen, p.id_lahan, l.nama_kebun
		ORDER BY p.tanggal_panen ASC, p.id_lahan ASC`,
		panenArgs...,
	)
	if err == nil {
		defer panenRows.Close()
		for panenRows.Next() {
			var activityDate time.Time
			var idLahan, namaKebun string
			var totalTon, pendapatan, biayaPanen, hargaAvg float64

			if scanErr := panenRows.Scan(&activityDate, &idLahan, &namaKebun, &totalTon, &pendapatan, &biayaPanen, &hargaAvg); scanErr != nil {
				continue
			}

			bucketKey := laporanBucketKey(params.Period, activityDate)
			acc := accumulatorByKey[bucketKey]
			if acc == nil {
				continue
			}

			hasActivity = true
			acc.point.TotalTon += totalTon
			acc.point.Pendapatan += pendapatan
			acc.point.BiayaPanen += biayaPanen
			if hargaAvg > 0 {
				acc.priceSum += hargaAvg
				acc.priceCount++
			}

			if namaKebun == "" {
				namaKebun = "Kebun " + idLahan
			}
			acc.point.PerLahan[namaKebun] += totalTon
		}
	}

	perawatanArgs := []interface{}{params.UserID, sinceStr, untilStr}
	perawatanClause := ""
	if params.LahanID != "" {
		perawatanClause = " AND pr.id_lahan=?"
		perawatanArgs = append(perawatanArgs, params.LahanID)
	}

	perawatanRows, err := s.dbRead.QueryContext(ctx,
		`SELECT
			pr.tanggal_perawatan,
			COALESCE(SUM(pr.total_biaya_perawatan), 0)
		FROM t_sawit_hub_perawatan pr
		WHERE pr.user_id=? AND pr.tanggal_perawatan BETWEEN ? AND ? AND pr.deleted_at IS NULL`+perawatanClause+`
		GROUP BY pr.tanggal_perawatan
		ORDER BY pr.tanggal_perawatan ASC`,
		perawatanArgs...,
	)
	if err == nil {
		defer perawatanRows.Close()
		for perawatanRows.Next() {
			var activityDate time.Time
			var biayaPerawatan float64
			if scanErr := perawatanRows.Scan(&activityDate, &biayaPerawatan); scanErr != nil {
				continue
			}

			bucketKey := laporanBucketKey(params.Period, activityDate)
			acc := accumulatorByKey[bucketKey]
			if acc == nil {
				continue
			}

			hasActivity = true
			acc.point.BiayaPerawatan += biayaPerawatan
		}
	}

	hargaRows, err := s.dbRead.QueryContext(ctx,
		`SELECT
			h.tanggal,
			COALESCE(AVG(h.harga_per_kg), 0)
		FROM t_sawit_hub_harga_tbs h
		WHERE h.user_id=? AND h.tanggal BETWEEN ? AND ?
		GROUP BY h.tanggal
		ORDER BY h.tanggal ASC`,
		params.UserID, sinceStr, untilStr,
	)
	if err == nil {
		defer hargaRows.Close()
		for hargaRows.Next() {
			var activityDate time.Time
			var hargaAvg float64
			if scanErr := hargaRows.Scan(&activityDate, &hargaAvg); scanErr != nil {
				continue
			}
			if hargaAvg <= 0 {
				continue
			}

			bucketKey := laporanBucketKey(params.Period, activityDate)
			acc := accumulatorByKey[bucketKey]
			if acc == nil {
				continue
			}

			hasActivity = true
			acc.priceSum += hargaAvg
			acc.priceCount++
		}
	}

	if !hasActivity {
		return []LaporanChartPoint{}
	}

	result := make([]LaporanChartPoint, 0, len(buckets))
	for _, bucket := range buckets {
		acc := accumulatorByKey[bucket.Key]
		if acc == nil || acc.point == nil {
			continue
		}
		if acc.priceCount > 0 {
			acc.point.HargaAvg = roundFloat(acc.priceSum/float64(acc.priceCount), 0)
		}
		acc.point.TotalTon = roundFloat(acc.point.TotalTon, 2)
		acc.point.Pendapatan = roundFloat(acc.point.Pendapatan, 0)
		acc.point.BiayaPanen = roundFloat(acc.point.BiayaPanen, 0)
		acc.point.BiayaPerawatan = roundFloat(acc.point.BiayaPerawatan, 0)
		acc.point.HasilBersih = roundFloat(acc.point.Pendapatan-acc.point.BiayaPanen-acc.point.BiayaPerawatan, 0)
		for name, total := range acc.point.PerLahan {
			acc.point.PerLahan[name] = roundFloat(total, 2)
		}
		result = append(result, *acc.point)
	}

	return result
}

func (s *ReportingFarmFinanceService) buildFarmRanking(ctx context.Context, params LaporanParams) []FarmRanking {
	result := []FarmRanking{}

	sinceStr := params.Since.Format("2006-01-02")
	untilStr := params.Until.Format("2006-01-02")
	args := []interface{}{
		params.UserID, sinceStr, untilStr,
		params.UserID, sinceStr, untilStr,
		params.UserID,
	}

	lahanClause := ""
	if params.LahanID != "" {
		lahanClause = " AND l.id_lahan=?"
		args = append(args, params.LahanID)
	}

	rows, err := s.dbRead.QueryContext(ctx,
		`SELECT
			l.id_lahan,
			l.nama_kebun,
			l.luas_ha,
			COALESCE(p.total_ton, 0),
			COALESCE(p.total_pendapatan, 0),
			COALESCE(p.biaya_panen, 0),
			COALESCE(p.jumlah_panen, 0),
			COALESCE(pr.total_biaya_perawatan, 0)
		FROM t_sawit_hub_lahan l
		LEFT JOIN (
			SELECT
				id_lahan,
				COALESCE(SUM(berat_ton), 0) AS total_ton,
				COALESCE(SUM(total_pendapatan), 0) AS total_pendapatan,
				COALESCE(SUM(biaya_panen), 0) AS biaya_panen,
				COUNT(id_panen) AS jumlah_panen
			FROM t_sawit_hub_panen
			WHERE user_id=? AND tanggal_panen BETWEEN ? AND ? AND deleted_at IS NULL
			GROUP BY id_lahan
		) p ON p.id_lahan = l.id_lahan
		LEFT JOIN (
			SELECT
				id_lahan,
				COALESCE(SUM(total_biaya_perawatan), 0) AS total_biaya_perawatan
			FROM t_sawit_hub_perawatan
			WHERE user_id=? AND tanggal_perawatan BETWEEN ? AND ? AND deleted_at IS NULL
			GROUP BY id_lahan
		) pr ON pr.id_lahan = l.id_lahan
		WHERE l.user_id=? AND l.deleted_at IS NULL`+lahanClause+`
		  AND (
			COALESCE(p.jumlah_panen, 0) > 0 OR
			COALESCE(pr.total_biaya_perawatan, 0) > 0
		  )
		ORDER BY
			CASE
				WHEN COALESCE(l.luas_ha, 0) > 0 THEN COALESCE(p.total_ton, 0) / l.luas_ha
				ELSE 0
			END DESC,
			COALESCE(p.total_pendapatan, 0) DESC,
			l.nama_kebun ASC`,
		args...,
	)
	if err != nil {
		return result
	}
	defer rows.Close()

	for rows.Next() {
		var farm FarmRanking
		var luasHa, totalTon, totalPendapatan, biayaPanen, biayaPerawatan float64
		var jumlahPanen int

		if scanErr := rows.Scan(
			&farm.IDLahan,
			&farm.NamaKebun,
			&luasHa,
			&totalTon,
			&totalPendapatan,
			&biayaPanen,
			&jumlahPanen,
			&biayaPerawatan,
		); scanErr != nil {
			continue
		}

		produktivitas := 0.0
		if luasHa > 0 {
			produktivitas = totalTon / luasHa
		}
		hasilBersih := totalPendapatan - biayaPanen - biayaPerawatan

		farm.TotalTon = roundFloat(totalTon, 2)
		farm.LuasHa = roundFloat(luasHa, 2)
		farm.Produktivitas = roundFloat(produktivitas, 4)
		farm.TotalPendapatan = roundFloat(totalPendapatan, 0)
		farm.HasilBersih = roundFloat(hasilBersih, 0)
		farm.JumlahPanen = jumlahPanen

		result = append(result, farm)
	}

	return result
}

func (s *ReportingFarmFinanceService) buildLaporanDetail(ctx context.Context, params LaporanParams) []LaporanDetailRow {
	result := []LaporanDetailRow{}

	sinceStr := params.Since.Format("2006-01-02")
	untilStr := params.Until.Format("2006-01-02")
	args := []interface{}{params.UserID, sinceStr, untilStr}
	lahanClause := ""
	if params.LahanID != "" {
		lahanClause = " AND p.id_lahan=?"
		args = append(args, params.LahanID)
	}

	rows, err := s.dbRead.QueryContext(ctx,
		`SELECT
			p.id_panen,
			p.tanggal_panen,
			l.nama_kebun,
			p.luas_panen_ha,
			p.jumlah_janjang,
			p.berat_kg,
			p.berat_ton,
			p.berat_rata_janjang,
			p.harga_per_kg,
			p.total_pendapatan,
			p.biaya_panen,
			p.hasil_bersih,
			COALESCE(p.catatan, '')
		FROM t_sawit_hub_panen p
		JOIN t_sawit_hub_lahan l ON p.id_lahan = l.id_lahan AND l.deleted_at IS NULL
		WHERE p.user_id=? AND p.tanggal_panen BETWEEN ? AND ? AND p.deleted_at IS NULL`+lahanClause+`
		ORDER BY p.tanggal_panen DESC`,
		args...,
	)
	if err != nil {
		return result
	}
	defer rows.Close()

	for rows.Next() {
		var row LaporanDetailRow
		var tanggalPanen time.Time

		if scanErr := rows.Scan(
			&row.IDPanen,
			&tanggalPanen,
			&row.NamaKebun,
			&row.LuasPanenHa,
			&row.JumlahJanjang,
			&row.BeratKg,
			&row.BeratTon,
			&row.BeratRataJanjang,
			&row.HargaPerKg,
			&row.TotalPendapatan,
			&row.BiayaPanen,
			&row.HasilBersih,
			&row.Catatan,
		); scanErr != nil {
			continue
		}

		row.TanggalPanen = tanggalPanen.Format("2006-01-02")
		if row.LuasPanenHa > 0 {
			row.Produktivitas = row.BeratTon / row.LuasPanenHa
		}

		row.LuasPanenHa = roundFloat(row.LuasPanenHa, 2)
		row.BeratKg = roundFloat(row.BeratKg, 2)
		row.BeratTon = roundFloat(row.BeratTon, 4)
		row.BeratRataJanjang = roundFloat(row.BeratRataJanjang, 3)
		row.HargaPerKg = roundFloat(row.HargaPerKg, 0)
		row.TotalPendapatan = roundFloat(row.TotalPendapatan, 0)
		row.BiayaPanen = roundFloat(row.BiayaPanen, 0)
		row.HasilBersih = roundFloat(row.HasilBersih, 0)
		row.Produktivitas = roundFloat(row.Produktivitas, 4)

		result = append(result, row)
	}

	return result
}

func buildLaporanBuckets(params LaporanParams) []laporanBucket {
	loc := params.Since.Location()
	switch params.Period {
	case "week":
		return buildDailyBuckets(params.Since, params.Until)
	case "year":
		result := make([]laporanBucket, 0, 12)
		for month := 1; month <= 12; month++ {
			start := time.Date(params.Year, time.Month(month), 1, 0, 0, 0, 0, loc)
			end := start.AddDate(0, 1, 0).Add(-time.Second)
			result = append(result, laporanBucket{
				Key:   start.Format("2006-01"),
				Label: bulanIndonesiaShort[month-1],
				Start: start,
				End:   end,
			})
		}
		return result
	default:
		firstDay := time.Date(params.Year, time.Month(params.Month), 1, 0, 0, 0, 0, loc)
		lastDay := firstDay.AddDate(0, 1, 0).Add(-time.Second)
		weekday := int(firstDay.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		monday := firstDay.AddDate(0, 0, -(weekday - 1))
		result := []laporanBucket{}
		seen := map[string]bool{}
		for current := monday; !current.After(lastDay); current = current.AddDate(0, 0, 7) {
			key := current.Format("2006-01-02")
			if seen[key] {
				continue
			}
			seen[key] = true
			result = append(result, laporanBucket{
				Key:   key,
				Label: "Mg " + current.Format("02/01"),
				Start: current,
				End:   current.AddDate(0, 0, 6),
			})
		}
		return result
	}
}

func buildDailyBuckets(since, until time.Time) []laporanBucket {
	result := []laporanBucket{}
	for current := since; !current.After(until); current = current.AddDate(0, 0, 1) {
		result = append(result, laporanBucket{
			Key:   current.Format("2006-01-02"),
			Label: current.Format("02 Jan"),
			Start: current,
			End:   current,
		})
	}
	return result
}

func laporanBucketKey(period string, date time.Time) string {
	switch period {
	case "week":
		return date.Format("2006-01-02")
	case "year":
		return date.Format("2006-01")
	default:
		weekday := int(date.Weekday())
		if weekday == 0 {
			weekday = 7
		}
		monday := date.AddDate(0, 0, -(weekday - 1))
		return monday.Format("2006-01-02")
	}
}

func roundFloat(value float64, decimals int) float64 {
	multiplier := 1.0
	for i := 0; i < decimals; i++ {
		multiplier *= 10
	}
	return float64(int64(value*multiplier)) / multiplier
}
