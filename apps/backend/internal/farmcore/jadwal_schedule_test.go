package farmcore

import (
	"testing"
	"time"
)

func mustJakartaDate(t *testing.T, raw string) time.Time {
	t.Helper()

	loc := time.FixedZone("UTC+7", 7*60*60)
	parsed, err := time.ParseInLocation("2006-01-02", raw, loc)
	if err != nil {
		t.Fatalf("parse date %q: %v", raw, err)
	}
	return parsed
}

func TestCalculateNextDateThreeTimesYearly(t *testing.T) {
	start := mustJakartaDate(t, "2026-04-11")
	fromDate := mustJakartaDate(t, "2026-04-25")

	next := CalculateNextDate(start, "tiga_kali_tahunan", 0, fromDate)

	if got := next.Format("2006-01-02"); got != "2026-07-11" {
		t.Fatalf("expected next date 2026-07-11, got %s", got)
	}
}

func TestCalculateUpcomingDatesThreeTimesYearly(t *testing.T) {
	start := mustJakartaDate(t, "2026-04-11")
	fromDate := mustJakartaDate(t, "2026-04-25")
	untilDate := mustJakartaDate(t, "2026-12-31")

	upcoming := CalculateUpcomingDates(start, "tiga_kali_tahunan", 0, fromDate, untilDate, 12)

	if len(upcoming) != 2 {
		t.Fatalf("expected 2 upcoming dates, got %d", len(upcoming))
	}

	expected := []string{"2026-07-11", "2026-10-11"}
	for index, date := range upcoming {
		if got := date.Format("2006-01-02"); got != expected[index] {
			t.Fatalf("expected date %s at index %d, got %s", expected[index], index, got)
		}
	}
}

func TestCalculateUpcomingDatesRespectYearWindow(t *testing.T) {
	start := mustJakartaDate(t, "2026-04-11")
	fromDate := mustJakartaDate(t, "2027-01-01")
	untilDate := mustJakartaDate(t, "2027-12-31")

	upcoming := CalculateUpcomingDates(start, "tiga_kali_tahunan", 0, fromDate, untilDate, 12)

	expected := []string{"2027-01-11", "2027-04-11", "2027-07-11", "2027-10-11"}
	if len(upcoming) != len(expected) {
		t.Fatalf("expected %d upcoming dates, got %d", len(expected), len(upcoming))
	}

	for index, date := range upcoming {
		if got := date.Format("2006-01-02"); got != expected[index] {
			t.Fatalf("expected date %s at index %d, got %s", expected[index], index, got)
		}
	}
}

func TestNormalizeFrequencyTypeAliases(t *testing.T) {
	testCases := map[string]string{
		"dua_kali_tahunan":  "enam_bulanan",
		"tiga_kali_tahunan": "tiga_bulanan",
		"enam_bulanan":      "enam_bulanan",
		"tiga_bulanan":      "tiga_bulanan",
	}

	for input, expected := range testCases {
		if got := NormalizeFrequencyType(input); got != expected {
			t.Fatalf("expected %s to normalize to %s, got %s", input, expected, got)
		}
	}
}
