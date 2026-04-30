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
	filter := entity.PaymentFilter{}

	if params.Status != nil {
		filter.Status = entity.PaymentStatus(*params.Status)
	}
	if params.Sort != nil {
		filter.Sort = entity.ParsePaymentSort(*params.Sort)
	}
	if params.Search != nil {
		filter.Search = *params.Search
	}
	if params.Page != nil {
		filter.Page = *params.Page
	}
	if params.PageSize != nil {
		filter.PageSize = *params.PageSize
	}

	res, err := a.paymentUC.Payment(filter)
	if err != nil {
		transport.WriteError(w, err)
		return
	}

	result := make([]openapigen.Payment, len(res.Payments))
	for i, p := range res.Payments {
		ps := openapigen.PaymentStatus(p.Status)
		result[i] = openapigen.Payment{
			Id:           &p.Id,
			MerchantName: &p.MerchantName,
			CreatedAt:    p.CreatedAt,
			Amount:       &p.Amount,
			Status:       &ps,
		}
	}

	page := filter.Page
	if page < 1 {
		page = 1
	}
	pageSize := filter.PageSize
	if pageSize < 1 {
		pageSize = 10
	}

	err = json.NewEncoder(w).Encode(openapigen.PaymentListResponse{
		Payments: &result,
		Total:    &res.Total,
		Page:     &page,
		PageSize: &pageSize,
	})
	if err != nil {
		transport.WriteAppError(w, entity.ErrorInternal("internal server error"))
	}
}
