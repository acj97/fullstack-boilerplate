package repository

import (
	"database/sql"
	"fmt"

	"github.com/acj97/fullstack-boilerplate/internal/entity"
)

type PaymentRepository interface {
	GetPayments(status entity.PaymentStatus, sort *entity.PaymentSort) ([]*entity.Payment, error)
}

type Payment struct {
	db *sql.DB
}

func NewPaymentRepo(db *sql.DB) *Payment {
	return &Payment{db: db}
}

func (r *Payment) GetPayments(status entity.PaymentStatus, sort *entity.PaymentSort) ([]*entity.Payment, error) {
	query := `SELECT id, merchant_name, created_at, amount, status FROM payments`
	var args []any

	if status != "" {
		query += ` WHERE status = ?`
		args = append(args, status)
	}

	if sort != nil {
		dir := "ASC"
		if sort.Desc {
			dir = "DESC"
		}
		col := sort.Field
		if col == "amount" {
			col = "CAST(amount AS INTEGER)"
		}
		query += fmt.Sprintf(` ORDER BY %s %s`, col, dir)
	}

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
	}
	defer rows.Close()

	var payments []*entity.Payment
	for rows.Next() {
		var p entity.Payment
		if err := rows.Scan(&p.Id, &p.MerchantName, &p.CreatedAt, &p.Amount, &p.Status); err != nil {
			return nil, entity.WrapError(err, entity.ErrorCodeInternal, "db error")
		}
		payments = append(payments, &p)
	}
	return payments, nil
}
