package entity

import (
	"testing"
)

func TestParsePaymentSort(t *testing.T) {
	tests := []struct {
		input string
		want  *PaymentSort
	}{
		{"created_at", &PaymentSort{Field: "created_at", Desc: false}},
		{"-created_at", &PaymentSort{Field: "created_at", Desc: true}},
		{"amount", &PaymentSort{Field: "amount", Desc: false}},
		{"-amount", &PaymentSort{Field: "amount", Desc: true}},
		{"invalid", nil},
		{"", nil},
		{"-invalid", nil},
	}

	for _, tt := range tests {
		t.Run(tt.input, func(t *testing.T) {
			got := ParsePaymentSort(tt.input)
			if tt.want == nil {
				if got != nil {
					t.Errorf("ParsePaymentSort(%q) = %+v, want nil", tt.input, got)
				}
				return
			}
			if got == nil {
				t.Fatalf("ParsePaymentSort(%q) = nil, want %+v", tt.input, tt.want)
			}
			if got.Field != tt.want.Field || got.Desc != tt.want.Desc {
				t.Errorf("ParsePaymentSort(%q) = %+v, want %+v", tt.input, got, tt.want)
			}
		})
	}
}
