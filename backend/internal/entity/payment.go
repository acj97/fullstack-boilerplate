package entity

import (
	"strings"
	"time"
)

type PaymentStatus string

const (
	PaymentStatusCompleted  PaymentStatus = "completed"
	PaymentStatusProcessing PaymentStatus = "processing"
	PaymentStatusFailed     PaymentStatus = "failed"
)

type PaymentSort struct {
	Field string
	Desc  bool
}

// ParsePaymentSort parses a sort string like "-created_at" or "amount".
// Valid fields: created_at, amount. Returns nil for invalid input.
func ParsePaymentSort(s string) *PaymentSort {
	desc := strings.HasPrefix(s, "-")
	field := strings.TrimPrefix(s, "-")
	switch field {
	case "created_at", "amount":
		return &PaymentSort{Field: field, Desc: desc}
	}
	return nil
}

type Payment struct {
	Id           string        `json:"id"`
	MerchantName string        `json:"merchant_name"`
	CreatedAt    *time.Time    `json:"date"`
	Amount       string        `json:"amount"`
	Status       PaymentStatus `json:"status"`
}
