package subscription

import "time"

type Status string

const (
	StatusTrialing       Status = "trialing"
	StatusActive         Status = "active"
	StatusExpired        Status = "expired"
	StatusFreeLimited    Status = "free_limited"
	StatusPendingPayment Status = "pending_payment"
	StatusCancelled      Status = "cancelled"
)

type Provider interface {
	Name() string
	CreateCheckout(req CheckoutRequest) (CheckoutResult, error)
}

type CheckoutRequest struct {
	UserID    string
	Email     string
	Username  string
	FullName  string
	PlanName  string
	PlanPrice float64
	Currency  string
	TrialDays int
	// ReturnURL is the Snap "finish" redirect (successful payment flow).
	ReturnURL string
	// ReturnURLUnfinish / ReturnURLError are optional; empty means omit from Snap callbacks (Midtrans may use dashboard defaults).
	ReturnURLUnfinish string
	ReturnURLError    string
}

// CheckoutURLs groups redirect targets sent from the client for Midtrans Snap callbacks.
type CheckoutURLs struct {
	Finish    string
	Unfinish  string
	Error     string
}

type CheckoutResult struct {
	Provider    string  `json:"provider"`
	OrderID     string  `json:"order_id"`
	SnapToken   string  `json:"snap_token,omitempty"`
	SnapURL     string  `json:"snap_url,omitempty"`
	PaymentURL  string  `json:"payment_url"`
	Status      string  `json:"status"`
	GrossAmount float64 `json:"gross_amount"`
	Currency    string  `json:"currency"`
	Description string  `json:"description,omitempty"`
}

type CallbackInput struct {
	Provider          string `json:"provider"`
	OrderID           string `json:"order_id"`
	TransactionID     string `json:"transaction_id"`
	TransactionStatus string `json:"transaction_status"`
	FraudStatus       string `json:"fraud_status"`
	StatusCode        string `json:"status_code"`
	GrossAmount       string `json:"gross_amount"`
	SignatureKey      string `json:"signature_key"`
	PaymentType       string `json:"payment_type"`
}

type State struct {
	UserID               string    `json:"user_id"`
	Status               string    `json:"subscription_status"`
	TrialStartsAt        time.Time `json:"-"`
	TrialEndsAt          time.Time `json:"-"`
	SubscriptionStartsAt time.Time `json:"-"`
	SubscriptionEndsAt   time.Time `json:"-"`
	LastPaymentStatus    string    `json:"last_payment_status"`
	MidtransOrderID      string    `json:"midtrans_order_id"`
	PlanName             string    `json:"plan_name"`
	PlanPrice            float64   `json:"plan_price"`
	BillingExempt        bool      `json:"billing_exempt"`
	ActiveFarmLimit      int       `json:"active_farm_limit"`
	CurrentActiveFarmID  string    `json:"current_active_farm_id"`
	AccessMode           string    `json:"access_mode"`
	CanCheckout          bool      `json:"can_checkout"`
	CanWrite             bool      `json:"can_write"`
	CanCreateFarm        bool      `json:"can_create_farm"`
	CanCreateHarvest     bool      `json:"can_create_harvest"`
	CanExportReport      bool      `json:"can_export_report"`
	CanManageUsers       bool      `json:"can_manage_users"`
	HarvestAccessMode    string    `json:"harvest_access_mode"`
	DaysRemaining        int       `json:"days_remaining"`
	TrialRemaining       int       `json:"trial_remaining"`
	PaymentProvider      string    `json:"payment_provider"`
	CreatedAt            time.Time `json:"created_at"`
	UpdatedAt            time.Time `json:"updated_at"`
}

func (s State) IsFullAccess() bool {
	return s.BillingExempt || s.Status == string(StatusActive)
}

func (s State) IsLimited() bool {
	return !s.IsFullAccess()
}
