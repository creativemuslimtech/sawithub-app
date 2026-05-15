package billingdomain

type ProcessError struct {
	HTTPStatus int
	Message    string
}

func (e *ProcessError) Error() string {
	if e == nil {
		return ""
	}
	return e.Message
}
