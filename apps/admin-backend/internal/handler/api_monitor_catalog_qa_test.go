package handler_test

import (
	"os"
	"path/filepath"
	"runtime"
	"strings"
	"testing"
)

// QA-03 alignment: ops catalog must keep the user-app ReportingFarmFinance path for monitoring and support.
func TestMonitorCatalogIncludesReportingFarmFinanceService(t *testing.T) {
	t.Parallel()
	_, file, _, ok := runtime.Caller(0)
	if !ok {
		t.Fatal("runtime.Caller failed")
	}
	dir := filepath.Dir(file)
	monitorGo := filepath.Join(dir, "api_monitor.go")
	b, err := os.ReadFile(monitorGo)
	if err != nil {
		t.Fatalf("read api_monitor.go: %v", err)
	}
	if !strings.Contains(string(b), "/api/ReportingFarmFinanceService") {
		t.Fatal("api_monitor.go must register /api/ReportingFarmFinanceService (user app laporan contract anchor)")
	}
}
