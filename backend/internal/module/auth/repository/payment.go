package repository

import (
	"database/sql"
	"fmt"
	"strings"

	"github.com/acj97/fullstack-boilerplate/internal/entity"
)

const dbError = "db error"

type PaymentRepository interface {
	GetPayments(filter entity.PaymentFilter) (*entity.GetPaymentsResult, error)
}

type Payment struct {
	db *sql.DB
}

func NewPaymentRepo(db *sql.DB) *Payment {
	return &Payment{db: db}
}

func buildWhere(filter entity.PaymentFilter) (string, []any) {
	var clauses []string
	var args []any

	if filter.Status != "" {
		clauses = append(clauses, "status = ?")
		args = append(args, filter.Status)
	}
	if filter.Search != "" {
		clauses = append(clauses, "merchant_name LIKE ?")
		args = append(args, "%"+filter.Search+"%")
	}

	if len(clauses) == 0 {
		return "", args
	}
	return " WHERE " + strings.Join(clauses, " AND "), args
}

func buildOrderBy(sort *entity.PaymentSort) string {
	if sort == nil {
		return ""
	}
	dir := "ASC"
	if sort.Desc {
		dir = "DESC"
	}
	col := sort.Field
	if col == "amount" {
		col = "CAST(amount AS INTEGER)"
	}
	return fmt.Sprintf(" ORDER BY %s %s", col, dir)
}

func (r *Payment) GetPayments(filter entity.PaymentFilter) (*entity.GetPaymentsResult, error) {
	where, args := buildWhere(filter)

	var total int
	if err := r.db.QueryRow("SELECT COUNT(*) FROM payments"+where, args...).Scan(&total); err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeInternal, dbError)
	}

	page := filter.Page
	if page < 1 {
		page = 1
	}
	pageSize := filter.PageSize
	if pageSize < 1 {
		pageSize = 10
	}

	query := "SELECT id, merchant_name, created_at, amount, status FROM payments" +
		where +
		buildOrderBy(filter.Sort) +
		fmt.Sprintf(" LIMIT %d OFFSET %d", pageSize, (page-1)*pageSize)

	rows, err := r.db.Query(query, args...)
	if err != nil {
		return nil, entity.WrapError(err, entity.ErrorCodeInternal, dbError)
	}
	defer rows.Close()

	var payments []*entity.Payment
	for rows.Next() {
		var p entity.Payment
		if err := rows.Scan(&p.Id, &p.MerchantName, &p.CreatedAt, &p.Amount, &p.Status); err != nil {
			return nil, entity.WrapError(err, entity.ErrorCodeInternal, dbError)
		}
		payments = append(payments, &p)
	}

	return &entity.GetPaymentsResult{Payments: payments, Total: total}, nil
}
