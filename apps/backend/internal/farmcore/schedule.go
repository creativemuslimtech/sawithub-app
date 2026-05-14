package farmcore

import "time"

func CalculateNextDate(start time.Time, frequensiTipe string, frequensiCustom int, fromDate time.Time) time.Time {
	start = NormalizeDateOnly(start, start.Location())
	fromDate = NormalizeDateOnly(fromDate.In(start.Location()), start.Location())
	frequensiTipe = NormalizeFrequencyType(frequensiTipe)

	switch frequensiTipe {
	case "mingguan":
		return nextDateByDays(start, 7, fromDate)
	case "dua_mingguan":
		return nextDateByDays(start, 14, fromDate)
	case "bulanan":
		return nextMonthlyDate(start, 1, fromDate)
	case "dua_bulanan":
		return nextMonthlyDate(start, 2, fromDate)
	case "tiga_bulanan":
		return nextMonthlyDate(start, 3, fromDate)
	case "empat_bulanan":
		return nextMonthlyDate(start, 4, fromDate)
	case "enam_bulanan":
		return nextMonthlyDate(start, 6, fromDate)
	case "tahunan":
		return nextMonthlyDate(start, 12, fromDate)
	case "custom":
		if frequensiCustom <= 0 {
			frequensiCustom = 1
		}
		return nextDateByDays(start, frequensiCustom, fromDate)
	default:
		return nextMonthlyDate(start, 1, fromDate)
	}
}

func nextMonthlyDate(start time.Time, months int, fromDate time.Time) time.Time {
	next := start
	for !next.After(fromDate) {
		next = next.AddDate(0, months, 0)
	}
	return next
}

func nextDateByDays(start time.Time, days int, fromDate time.Time) time.Time {
	next := start
	for !next.After(fromDate) {
		next = next.AddDate(0, 0, days)
	}
	return next
}

func NormalizeDateOnly(t time.Time, loc *time.Location) time.Time {
	inLoc := t.In(loc)
	return time.Date(inLoc.Year(), inLoc.Month(), inLoc.Day(), 0, 0, 0, 0, loc)
}

func NormalizeFrequencyType(frequensiTipe string) string {
	switch frequensiTipe {
	case "dua_kali_tahunan":
		return "enam_bulanan"
	case "tiga_kali_tahunan":
		return "tiga_bulanan"
	default:
		return frequensiTipe
	}
}

func CalculateUpcomingDates(start time.Time, frequensiTipe string, frequensiCustom int, fromDate time.Time, untilDate time.Time, maxCount int) []time.Time {
	if maxCount <= 0 {
		return nil
	}

	start = NormalizeDateOnly(start, start.Location())
	cursor := NormalizeDateOnly(fromDate.In(start.Location()), start.Location()).AddDate(0, 0, -1)
	untilDate = NormalizeDateOnly(untilDate.In(start.Location()), start.Location())

	upcoming := make([]time.Time, 0, maxCount)
	for len(upcoming) < maxCount {
		next := CalculateNextDate(start, frequensiTipe, frequensiCustom, cursor)
		if next.After(untilDate) {
			break
		}
		upcoming = append(upcoming, next)
		cursor = next
	}

	return upcoming
}

func parseIntSchedule(s string) int {
	var n int
	for _, c := range s {
		if c >= '0' && c <= '9' {
			n = n*10 + int(c-'0')
		}
	}
	return n
}
