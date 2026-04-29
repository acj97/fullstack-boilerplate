package usecase

import (
	"time"

	"github.com/acj97/fullstack-boilerplate/internal/entity"
	"github.com/acj97/fullstack-boilerplate/internal/module/auth/repository"
)

type PaymentUsecase interface {
	Payment(status entity.PaymentStatus, sort *entity.PaymentSort) ([]*entity.Payment, error)
}

type Payment struct {
	repo      repository.PaymentRepository
	jwtSecret []byte
	ttl       time.Duration
}

func NewPaymentUsecase(repo repository.PaymentRepository, jwtSecret []byte, ttl time.Duration) *Payment {
	return &Payment{repo: repo, jwtSecret: jwtSecret, ttl: ttl}
}

func (a *Payment) Payment(status entity.PaymentStatus, sort *entity.PaymentSort) ([]*entity.Payment, error) {
	return a.repo.GetPayments(status, sort)
}
