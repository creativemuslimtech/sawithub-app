package reporting

import (
	"encoding/json"
	"net/http"
	"os"
	"path/filepath"
	"runtime"
	"testing"
	"time"
)

func TestLaporanKeuanganGoldenJSONUnmarshal(t *testing.T) {
	t.Parallel()
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	p := filepath.Join(filepath.Dir(file), "testdata", "laporan_keuangan_contract_golden.json")
	raw, err := os.ReadFile(p)
	if err != nil {
		t.Fatalf("read golden: %v", err)
	}
	var got LaporanKeuanganResponse
	if err := json.Unmarshal(raw, &got); err != nil {
		t.Fatalf("unmarshal: %v", err)
	}
	if got.Summary.JumlahPanen != 2 {
		t.Fatalf("summary.jumlah_panen: got %d", got.Summary.JumlahPanen)
	}
	if got.Summary.RevenueSource != "panen" {
		t.Fatalf("summary.revenue_source: got %q", got.Summary.RevenueSource)
	}
	if len(got.Chart) != 0 || len(got.Ranking) != 0 || len(got.Detail) != 0 {
		t.Fatalf("expected empty chart/ranking/detail slices in golden fixture")
	}
}

func TestParseLaporanParamsWeekRangeClampedToMonthEnd(t *testing.T) {
	t.Parallel()
	loc, err := time.LoadLocation("Asia/Jakarta")
	if err != nil {
		t.Fatalf("load location: %v", err)
	}
	r, err := http.NewRequest(http.MethodGet, "/api/ReportingFarmFinanceService?period=week&year=2024&month=1&week=4", nil)
	if err != nil {
		t.Fatal(err)
	}
	p := ParseLaporanParams(r)
	if p.Week != 4 {
		t.Fatalf("week: %d", p.Week)
	}
	endJan := time.Date(2024, 1, 31, 23, 59, 59, 0, loc)
	if p.Until.After(endJan) {
		t.Fatalf("until %v exceeds January end %v", p.Until, endJan)
	}
}
