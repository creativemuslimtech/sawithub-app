package subscription

import (
	"context"
	"database/sql"
	"errors"
	"fmt"
	"log"
	"strconv"
	"strings"
	"time"

	"SawitHub/internal/config"
)

var errSubscriptionNotFound = errors.New("subscription not found")

func ErrSubscriptionNotFound() error { return errSubscriptionNotFound }

type BillingSubscriptionDataService struct {
	db       *sql.DB
	dbRead   *sql.DB
	cfg      *config.Config
	provider Provider
}

type UserIdentity struct {
	UserID, Email, Username, FullName string
}

func NewBillingSubscriptionDataService(db, dbRead *sql.DB, cfg *config.Config) *BillingSubscriptionDataService {
	if dbRead == nil {
		dbRead = db
	}
	var provider Provider = NewMockProvider()
	if strings.EqualFold(cfg.SubscriptionProvider, "midtrans") {
		provider = NewMidtransProvider(cfg.MidtransServerKey, cfg.MidtransClientKey, cfg.MidtransIsProduction)
	}
	return &BillingSubscriptionDataService{db: db, dbRead: dbRead, cfg: cfg, provider: provider}
}

func (s *BillingSubscriptionDataService) ProviderName() string {
	if s.provider == nil {
		return "mock"
	}
	return s.provider.Name()
}

func (s *BillingSubscriptionDataService) GetStatus(ctx context.Context, userID string) (State, error) {
	var st State
	var trialStart, trialEnd, subStart, subEnd sql.NullTime
	var billingExempt sql.NullBool
	var activeFarmLimit sql.NullInt64
	err := s.dbRead.QueryRowContext(ctx, `SELECT user_id, COALESCE(subscription_status,''), trial_starts_at, trial_ends_at, subscription_starts_at, subscription_ends_at,
		COALESCE(last_payment_status,''), COALESCE(midtrans_order_id,''), COALESCE(plan_name,''), COALESCE(plan_price,0), billing_exempt, COALESCE(active_farm_limit,1), COALESCE(current_active_farm_id,'')
		FROM t_sawit_hub_users WHERE user_id=? AND deleted_at IS NULL`, userID).
		Scan(&st.UserID, &st.Status, &trialStart, &trialEnd, &subStart, &subEnd, &st.LastPaymentStatus, &st.MidtransOrderID, &st.PlanName, &st.PlanPrice, &billingExempt, &activeFarmLimit, &st.CurrentActiveFarmID)
	if err == sql.ErrNoRows {
		return State{UserID: userID, Status: string(StatusFreeLimited), AccessMode: "limited", CanCheckout: true, ActiveFarmLimit: 1, PaymentProvider: s.ProviderName()}, nil
	}
	if err != nil {
		return State{}, err
	}
	if trialStart.Valid {
		st.TrialStartsAt = trialStart.Time
	}
	if trialEnd.Valid {
		st.TrialEndsAt = trialEnd.Time
	}
	if subStart.Valid {
		st.SubscriptionStartsAt = subStart.Time
	}
	if subEnd.Valid {
		st.SubscriptionEndsAt = subEnd.Time
	}
	st.BillingExempt = billingExempt.Valid && billingExempt.Bool
	st.ActiveFarmLimit = int(activeFarmLimit.Int64)
	st.PaymentProvider = s.ProviderName()
	if st.ActiveFarmLimit <= 0 {
		st.ActiveFarmLimit = 1
	}
	return s.normalize(st), nil
}

func (s *BillingSubscriptionDataService) normalize(st State) State {
	now := time.Now()
	st.AccessMode = "limited"
	st.CanCheckout = true
	if st.BillingExempt || st.Status == string(StatusActive) {
		st.AccessMode = "full"
		st.CanWrite, st.CanCreateFarm, st.CanCreateHarvest, st.CanExportReport, st.CanManageUsers = true, true, true, true, true
		st.HarvestAccessMode = "full"
		return st
	}
	if st.Status == string(StatusTrialing) {
		st.CanCreateFarm = true
		st.CanCreateHarvest = true
		st.CanExportReport = true
		st.HarvestAccessMode = "full"
	} else {
		st.CanCreateHarvest = st.Status != string(StatusPendingPayment)
		st.HarvestAccessMode = "current_month_only"
	}
	if !st.TrialEndsAt.IsZero() && now.Before(st.TrialEndsAt) {
		st.TrialRemaining = int(time.Until(st.TrialEndsAt).Hours() / 24)
		st.DaysRemaining = st.TrialRemaining
	}
	if !st.SubscriptionEndsAt.IsZero() && now.Before(st.SubscriptionEndsAt) {
		st.DaysRemaining = int(time.Until(st.SubscriptionEndsAt).Hours() / 24)
	}
	return st
}

func (s *BillingSubscriptionDataService) BuildStatusView(state State) map[string]interface{} {
	return map[string]interface{}{
		"subscription_status": state.Status, "access_mode": state.AccessMode, "can_checkout": state.CanCheckout, "can_write": state.CanWrite,
		"can_create_farm": state.CanCreateFarm, "can_create_harvest": state.CanCreateHarvest, "can_export_report": state.CanExportReport,
		"can_manage_users": state.CanManageUsers, "harvest_access_mode": state.HarvestAccessMode, "days_remaining": state.DaysRemaining,
		"trial_remaining": state.TrialRemaining, "payment_provider": s.ProviderName(), "midtrans_order_id": state.MidtransOrderID,
		"plan_name": state.PlanName, "plan_price": state.PlanPrice, "last_payment_status": state.LastPaymentStatus,
		"billing_exempt": state.BillingExempt,
		"active_farm_limit": state.ActiveFarmLimit, "current_active_farm_id": strings.TrimSpace(state.CurrentActiveFarmID),
	}
}

func (s *BillingSubscriptionDataService) Checkout(ctx context.Context, user UserIdentity, urls CheckoutURLs) (CheckoutResult, State, error) {
	result, err := s.provider.CreateCheckout(CheckoutRequest{
		UserID: user.UserID, Email: user.Email, Username: user.Username, FullName: user.FullName, PlanName: s.cfg.SubscriptionPlanName,
		PlanPrice: s.cfg.SubscriptionPlanPrice, Currency: strings.ToUpper(strings.TrimSpace(s.cfg.SubscriptionCurrency)), TrialDays: s.cfg.SubscriptionTrialDays,
		ReturnURL: urls.Finish, ReturnURLUnfinish: urls.Unfinish, ReturnURLError: urls.Error,
	})
	if err != nil {
		return CheckoutResult{}, State{}, err
	}
	_, err = s.db.ExecContext(ctx, `UPDATE t_sawit_hub_users SET subscription_status=?, last_payment_status=?, midtrans_order_id=?, plan_name=?, plan_price=?, updated_at=NOW() WHERE user_id=? AND deleted_at IS NULL`,
		string(StatusPendingPayment), string(StatusPendingPayment), result.OrderID, s.cfg.SubscriptionPlanName, s.cfg.SubscriptionPlanPrice, user.UserID)
	if err != nil {
		return CheckoutResult{}, State{}, err
	}
	st, _ := s.GetStatus(ctx, user.UserID)
	return result, st, nil
}

func (s *BillingSubscriptionDataService) LookupTransactionStatus(orderID string) (CallbackInput, error) {
	type statusLookup interface {
		GetTransactionStatus(string) (CallbackInput, error)
	}
	if checker, ok := s.provider.(statusLookup); ok {
		return checker.GetTransactionStatus(orderID)
	}
	return CallbackInput{}, fmt.Errorf("provider does not support status lookup")
}

func paymentCallbackProvider(input CallbackInput, fallback string) string {
	p := strings.ToLower(strings.TrimSpace(input.Provider))
	if p != "" {
		return p
	}
	return strings.ToLower(strings.TrimSpace(fallback))
}

// paymentCallbackEventKey returns a deduplication key per DE-12: Midtrans transaction_id plus status,
// so a later settlement for the same transaction_id is not mistaken for a webhook replay.
func paymentCallbackEventKey(input CallbackInput) string {
	st := strings.ToLower(strings.TrimSpace(input.TransactionStatus))
	if tid := strings.TrimSpace(input.TransactionID); tid != "" {
		return tid + "|" + st
	}
	return fmt.Sprintf("%s|%s|%s", strings.TrimSpace(input.OrderID), st, strings.TrimSpace(input.StatusCode))
}

func parseGrossAmountIDR(raw string) float64 {
	s := strings.TrimSpace(raw)
	s = strings.ReplaceAll(s, ",", "")
	v, err := strconv.ParseFloat(s, 64)
	if err != nil {
		return 0
	}
	return v
}

func (s *BillingSubscriptionDataService) ApplyCallback(ctx context.Context, input CallbackInput) (State, bool, error) {
	var userID string
	if err := s.dbRead.QueryRowContext(ctx, `SELECT user_id FROM t_sawit_hub_users WHERE midtrans_order_id=? AND deleted_at IS NULL LIMIT 1`, input.OrderID).Scan(&userID); err != nil {
		if err == sql.ErrNoRows {
			return State{}, false, errSubscriptionNotFound
		}
		return State{}, false, err
	}
	provider := paymentCallbackProvider(input, s.ProviderName())
	eventKey := paymentCallbackEventKey(input)

	tx, err := s.db.BeginTx(ctx, nil)
	if err != nil {
		return State{}, false, err
	}
	defer func() { _ = tx.Rollback() }()

	_, err = tx.ExecContext(ctx, `INSERT INTO t_sawit_hub_payment_events (provider, event_key, order_id, status, payload) VALUES (?,?,?,?,NULL)`,
		provider, eventKey, strings.TrimSpace(input.OrderID), strings.TrimSpace(input.TransactionStatus))
	if err != nil {
		if isMySQLDuplicateKey(err) {
			log.Printf("billing: midtrans callback idempotent duplicate event_key=%s order_id=%s", eventKey, strings.TrimSpace(input.OrderID))
			st, gErr := s.GetStatus(ctx, userID)
			if gErr != nil {
				return State{}, false, gErr
			}
			return st, true, nil
		}
		return State{}, false, err
	}

	status := string(StatusPendingPayment)
	switch strings.ToLower(strings.TrimSpace(input.TransactionStatus)) {
	case "settlement", "capture":
		status = string(StatusActive)
	case "pending":
		status = string(StatusPendingPayment)
	case "expire", "cancel", "deny":
		status = string(StatusFreeLimited)
	}
	_, err = tx.ExecContext(ctx, `UPDATE t_sawit_hub_users SET subscription_status=?, last_payment_status=?, updated_at=NOW() WHERE user_id=? AND deleted_at IS NULL`,
		status, input.TransactionStatus, userID)
	if err != nil {
		return State{}, false, err
	}

	gross := parseGrossAmountIDR(input.GrossAmount)
	txStatus := strings.TrimSpace(input.TransactionStatus)
	payType := strings.TrimSpace(input.PaymentType)
	tid := strings.TrimSpace(input.TransactionID)
	var paidAt interface{}
	switch strings.ToLower(txStatus) {
	case "settlement", "capture":
		paidAt = time.Now()
	default:
		paidAt = nil
	}
	_, err = tx.ExecContext(ctx, `INSERT INTO t_sawit_hub_payments (user_id, provider, order_id, transaction_id, payment_status, gross_amount, currency, payment_type, paid_at)
VALUES (?,?,?,?,?,?, 'IDR', ?, ?)
ON DUPLICATE KEY UPDATE transaction_id = VALUES(transaction_id), payment_status = VALUES(payment_status), gross_amount = VALUES(gross_amount),
payment_type = VALUES(payment_type), paid_at = COALESCE(VALUES(paid_at), paid_at), updated_at = CURRENT_TIMESTAMP`,
		userID, provider, strings.TrimSpace(input.OrderID), nullIfEmpty(tid), strings.ToLower(txStatus), gross, nullIfEmpty(payType), paidAt)
	if err != nil {
		return State{}, false, err
	}

	if err := tx.Commit(); err != nil {
		return State{}, false, err
	}
	st, err := s.GetStatus(ctx, userID)
	return st, false, err
}

func nullIfEmpty(s string) interface{} {
	if strings.TrimSpace(s) == "" {
		return nil
	}
	return s
}

func (s *BillingSubscriptionDataService) EnsureLahanCreationAllowed(ctx context.Context, userID string) error {
	st, err := s.GetStatus(ctx, userID)
	if err != nil {
		return err
	}
	if st.IsFullAccess() {
		return nil
	}
	var count int64
	if err := s.dbRead.QueryRowContext(ctx, `SELECT COUNT(*) FROM t_sawit_hub_lahan WHERE user_id=? AND deleted_at IS NULL`, userID).Scan(&count); err != nil {
		return err
	}
	if count >= int64(st.ActiveFarmLimit) {
		return fmt.Errorf("batas kebun aktif telah tercapai")
	}
	return nil
}

func (s *BillingSubscriptionDataService) EnsureHarvestCreationAllowed(ctx context.Context, userID, lahanID, tanggalPanen string) (State, error) {
	st, err := s.GetStatus(ctx, userID)
	if err != nil {
		return State{}, err
	}
	if st.Status == string(StatusPendingPayment) {
		return State{}, fmt.Errorf("subscription sedang menunggu pembayaran")
	}
	return st, nil
}

func (s *BillingSubscriptionDataService) EnsureTrialUsageAllowed(ctx context.Context, userID, column string, limit int, deniedMessage string) error {
	st, err := s.GetStatus(ctx, userID)
	if err != nil || st.Status != string(StatusTrialing) {
		return err
	}
	var used int64
	if err := s.dbRead.QueryRowContext(ctx, `SELECT COALESCE(`+column+`,0) FROM t_sawit_hub_users WHERE user_id=? AND deleted_at IS NULL`, userID).Scan(&used); err != nil {
		return err
	}
	if used >= int64(limit) {
		return fmt.Errorf("%s", deniedMessage)
	}
	return nil
}

func (s *BillingSubscriptionDataService) IncrementTrialUsage(ctx context.Context, userID, column string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE t_sawit_hub_users SET `+column+`=COALESCE(`+column+`,0)+1, updated_at=NOW() WHERE user_id=? AND deleted_at IS NULL`, userID)
	return err
}
func (s *BillingSubscriptionDataService) SetCurrentActiveFarmID(ctx context.Context, userID, farmID string) error {
	_, err := s.db.ExecContext(ctx, `UPDATE t_sawit_hub_users SET current_active_farm_id=?, updated_at=NOW() WHERE user_id=? AND deleted_at IS NULL`, farmID, userID)
	return err
}
func (s *BillingSubscriptionDataService) ReconcileDeletedFarm(ctx context.Context, userID, deletedFarmID string) error {
	return nil
}
