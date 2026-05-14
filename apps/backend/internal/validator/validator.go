package validator

import (
	"fmt"
	"strings"
	"time"
)

type ValidationError struct {
	Field   string
	Message string
}

type Validator struct {
	errors []ValidationError
}

func New() *Validator {
	return &Validator{
		errors: []ValidationError{},
	}
}

func (v *Validator) RequiredString(field, value string) *Validator {
	if strings.TrimSpace(value) == "" {
		v.errors = append(v.errors, ValidationError{Field: field, Message: fmt.Sprintf("%s is required", field)})
	}
	return v
}

func (v *Validator) RequiredInt(field string, value *int) *Validator {
	if value == nil || *value == 0 {
		v.errors = append(v.errors, ValidationError{Field: field, Message: fmt.Sprintf("%s is required", field)})
	}
	return v
}

func (v *Validator) PositiveFloat(field string, value float64) *Validator {
	if value <= 0 {
		v.errors = append(v.errors, ValidationError{Field: field, Message: fmt.Sprintf("%s must be positive (greater than 0)", field)})
	}
	return v
}

func (v *Validator) PositiveInt(field string, value int) *Validator {
	if value <= 0 {
		v.errors = append(v.errors, ValidationError{Field: field, Message: fmt.Sprintf("%s must be positive (greater than 0)", field)})
	}
	return v
}

func (v *Validator) NonNegativeFloat(field string, value float64) *Validator {
	if value < 0 {
		v.errors = append(v.errors, ValidationError{Field: field, Message: fmt.Sprintf("%s cannot be negative", field)})
	}
	return v
}

func (v *Validator) NonNegativeInt(field string, value int) *Validator {
	if value < 0 {
		v.errors = append(v.errors, ValidationError{Field: field, Message: fmt.Sprintf("%s cannot be negative", field)})
	}
	return v
}

func (v *Validator) DateRange(field string, dateStr string) *Validator {
	if dateStr == "" {
		return v
	}
	_, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		v.errors = append(v.errors, ValidationError{Field: field, Message: "Invalid date format (use YYYY-MM-DD)"})
	}
	return v
}

func (v *Validator) DateNotInFuture(field string, dateStr string) *Validator {
	if dateStr == "" {
		return v
	}
	date, err := time.Parse("2006-01-02", dateStr)
	if err != nil {
		return v
	}
	if date.After(time.Now()) {
		v.errors = append(v.errors, ValidationError{Field: field, Message: fmt.Sprintf("%s cannot be in the future", field)})
	}
	return v
}

func (v *Validator) DateStartBeforeEnd(startField, endField, start, end string) *Validator {
	if start == "" || end == "" {
		return v
	}
	startDate, errStart := time.Parse("2006-01-02", start)
	endDate, errEnd := time.Parse("2006-01-02", end)
	if errStart != nil || errEnd != nil {
		return v
	}
	if startDate.After(endDate) {
		v.errors = append(v.errors, ValidationError{
			Field:   startField,
			Message: fmt.Sprintf("%s must be before %s", startField, endField),
		})
	}
	return v
}

func (v *Validator) MaxLength(field string, value string, maxLen int) *Validator {
	if len(value) > maxLen {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: fmt.Sprintf("%s must not exceed %d characters", field, maxLen),
		})
	}
	return v
}

func (v *Validator) IntRange(field string, value, min, max int) *Validator {
	if value < min || value > max {
		v.errors = append(v.errors, ValidationError{
			Field:   field,
			Message: fmt.Sprintf("%s must be between %d and %d", field, min, max),
		})
	}
	return v
}

func (v *Validator) IsValid() bool {
	return len(v.errors) == 0
}

func (v *Validator) Errors() []ValidationError {
	return v.errors
}

func (v *Validator) ErrorString() string {
	if v.IsValid() {
		return ""
	}
	var msgs []string
	for _, err := range v.errors {
		msgs = append(msgs, err.Message)
	}
	return strings.Join(msgs, "; ")
}
