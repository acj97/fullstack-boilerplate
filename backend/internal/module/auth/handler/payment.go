package handler

import (
	"encoding/json"
	"net/http"

	"github.com/acj97/fullstack-boilerplate/internal/entity"
	paymentUsecase "github.com/acj97/fullstack-boilerplate/internal/module/auth/usecase"
	"github.com/acj97/fullstack-boilerplate/internal/openapigen"
	"github.com/acj97/fullstack-boilerplate/internal/transport"
)

type PaymentHandler struct {
	paymentUC paymentUsecase.PaymentUsecase
}

func NewPaymentHandler(paymentUC paymentUsecase.PaymentUsecase) *PaymentHandler {
	return &PaymentHandler{paymentUC: paymentUC}
}

func (a *PaymentHandler) GetDashboardV1Payments(w http.ResponseWriter, r *http.Request, params openapigen.GetDashboardV1PaymentsParams) {
	var status entity.PaymentStatus
	if params.Status != nil {
		status = entity.PaymentStatus(*params.Status)
	}

	var sort *entity.PaymentSort
	if params.Sort != nil {
		sort = entity.ParsePaymentSort(*params.Sort)
	}

	payments, err := a.paymentUC.Payment(status, sort)
	if err != nil {
		transport.WriteError(w, err)
		return
	}

	result := make([]openapigen.Payment, len(payments))
	for i, p := range payments {
		ps := openapigen.PaymentStatus(p.Status)
		result[i] = openapigen.Payment{
			Id:           &p.Id,
			MerchantName: &p.MerchantName,
			CreatedAt:    p.CreatedAt,
			Amount:       &p.Amount,
			Status:       &ps,
		}
	}

	err = json.NewEncoder(w).Encode(openapigen.PaymentListResponse{Payments: &result})
	if err != nil {
		transport.WriteAppError(w, entity.ErrorInternal("internal server error"))
		return
	}
}
