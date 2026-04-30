package repository

import (
	"database/sql"
	"fmt"
	"testing"

	"github.com/acj97/fullstack-boilerplate/internal/entity"
	_ "github.com/mattn/go-sqlite3"
)

// ── helpers ──────────────────────────────────────────────────────────────────

func newTestDB(t *testing.T) *sql.DB {
	t.Helper()
	db, err := sql.Open("sqlite3", ":memory:?_loc=UTC")
	if err != nil {
		t.Fatal(err)
	}
	_, err = db.Exec(`CREATE TABLE payments (
		id            TEXT PRIMARY KEY,
		merchant_name TEXT    NOT NULL,
		created_at    DATETIME,
		amount        TEXT    NOT NULL,
		status        TEXT    NOT NULL
	)`)
	if err != nil {
		t.Fatal(err)
	}
	t.Cleanup(func() { db.Close() })
	return db
}

func insertPayment(t *testing.T, db *sql.DB, id, merchant, amount, status string) {
	t.Helper()
	_, err := db.Exec(
		`INSERT INTO payments (id, merchant_name, created_at, amount, status) VALUES (?, ?, datetime('now'), ?, ?)`,
		id, merchant, amount, status,
	)
	if err != nil {
		t.Fatalf("insertPayment: %v", err)
	}
}

// ── buildWhere ────────────────────────────────────────────────────────────────

func TestBuildWhere(t *testing.T) {
	tests := []struct {
		name         string
		filter       entity.PaymentFilter
		wantClause   string
		wantArgCount int
	}{
		{
			name:         "no filter",
			filter:       entity.PaymentFilter{},
			wantClause:   "",
			wantArgCount: 0,
		},
		{
			name:         "status only",
			filter:       entity.PaymentFilter{Status: entity.PaymentStatusCompleted},
			wantClause:   " WHERE status = ?",
			wantArgCount: 1,
		},
		{
			name:         "search only",
			filter:       entity.PaymentFilter{Search: "Tokopedia"},
			wantClause:   " WHERE merchant_name LIKE ?",
			wantArgCount: 1,
		},
		{
			name:         "status and search",
			filter:       entity.PaymentFilter{Status: entity.PaymentStatusFailed, Search: "Shopee"},
			wantClause:   " WHERE status = ? AND merchant_name LIKE ?",
			wantArgCount: 2,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			clause, args := buildWhere(tt.filter)
			if clause != tt.wantClause {
				t.Errorf("clause = %q, want %q", clause, tt.wantClause)
			}
			if len(args) != tt.wantArgCount {
				t.Errorf("len(args) = %d, want %d", len(args), tt.wantArgCount)
			}
		})
	}
}

// ── buildOrderBy ──────────────────────────────────────────────────────────────

func TestBuildOrderBy(t *testing.T) {
	tests := []struct {
		name string
		sort *entity.PaymentSort
		want string
	}{
		{"nil", nil, ""},
		{"created_at asc", &entity.PaymentSort{Field: "created_at", Desc: false}, " ORDER BY created_at ASC"},
		{"created_at desc", &entity.PaymentSort{Field: "created_at", Desc: true}, " ORDER BY created_at DESC"},
		{"amount asc uses CAST", &entity.PaymentSort{Field: "amount", Desc: false}, " ORDER BY CAST(amount AS INTEGER) ASC"},
		{"amount desc uses CAST", &entity.PaymentSort{Field: "amount", Desc: true}, " ORDER BY CAST(amount AS INTEGER) DESC"},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			got := buildOrderBy(tt.sort)
			if got != tt.want {
				t.Errorf("buildOrderBy() = %q, want %q", got, tt.want)
			}
		})
	}
}

// ── GetPayments ───────────────────────────────────────────────────────────────

func TestGetPayments(t *testing.T) {
	t.Run("returns all payments when no filter", func(t *testing.T) {
		db := newTestDB(t)
		insertPayment(t, db, "p1", "Tokopedia", "50000", "completed")
		insertPayment(t, db, "p2", "Shopee", "75000", "failed")
		insertPayment(t, db, "p3", "Gojek", "30000", "processing")

		repo := NewPaymentRepo(db)
		res, err := repo.GetPayments(entity.PaymentFilter{Page: 1, PageSize: 10})
		if err != nil {
			t.Fatal(err)
		}
		if res.Total != 3 {
			t.Errorf("Total = %d, want 3", res.Total)
		}
		if len(res.Payments) != 3 {
			t.Errorf("len(Payments) = %d, want 3", len(res.Payments))
		}
	})

	t.Run("filters by status", func(t *testing.T) {
		db := newTestDB(t)
		insertPayment(t, db, "p1", "Tokopedia", "50000", "completed")
		insertPayment(t, db, "p2", "Shopee", "75000", "failed")
		insertPayment(t, db, "p3", "Gojek", "30000", "completed")

		repo := NewPaymentRepo(db)
		res, err := repo.GetPayments(entity.PaymentFilter{
			Status:   entity.PaymentStatusCompleted,
			Page:     1,
			PageSize: 10,
		})
		if err != nil {
			t.Fatal(err)
		}
		if res.Total != 2 {
			t.Errorf("Total = %d, want 2", res.Total)
		}
		for _, p := range res.Payments {
			if p.Status != entity.PaymentStatusCompleted {
				t.Errorf("payment %s has status %q, want completed", p.Id, p.Status)
			}
		}
	})

	t.Run("filters by search (partial match)", func(t *testing.T) {
		db := newTestDB(t)
		insertPayment(t, db, "p1", "Tokopedia", "50000", "completed")
		insertPayment(t, db, "p2", "Shopee", "75000", "failed")
		insertPayment(t, db, "p3", "TokoBagus", "20000", "completed")

		repo := NewPaymentRepo(db)
		res, err := repo.GetPayments(entity.PaymentFilter{
			Search:   "toko",
			Page:     1,
			PageSize: 10,
		})
		if err != nil {
			t.Fatal(err)
		}
		if res.Total != 2 {
			t.Errorf("Total = %d, want 2 (case-insensitive partial match)", res.Total)
		}
	})

	t.Run("paginates correctly", func(t *testing.T) {
		db := newTestDB(t)
		for i := 1; i <= 5; i++ {
			insertPayment(t, db, fmt.Sprintf("p%d", i), "Merchant", "10000", "completed")
		}

		repo := NewPaymentRepo(db)
		page1, _ := repo.GetPayments(entity.PaymentFilter{Page: 1, PageSize: 3})
		page2, _ := repo.GetPayments(entity.PaymentFilter{Page: 2, PageSize: 3})

		if page1.Total != 5 {
			t.Errorf("Total = %d, want 5", page1.Total)
		}
		if len(page1.Payments) != 3 {
			t.Errorf("page 1 len = %d, want 3", len(page1.Payments))
		}
		if len(page2.Payments) != 2 {
			t.Errorf("page 2 len = %d, want 2", len(page2.Payments))
		}
	})

	t.Run("sorts by amount descending", func(t *testing.T) {
		db := newTestDB(t)
		insertPayment(t, db, "p1", "A", "10000", "completed")
		insertPayment(t, db, "p2", "B", "50000", "completed")
		insertPayment(t, db, "p3", "C", "30000", "completed")

		repo := NewPaymentRepo(db)
		res, err := repo.GetPayments(entity.PaymentFilter{
			Sort:     &entity.PaymentSort{Field: "amount", Desc: true},
			Page:     1,
			PageSize: 10,
		})
		if err != nil {
			t.Fatal(err)
		}
		amounts := []string{res.Payments[0].Amount, res.Payments[1].Amount, res.Payments[2].Amount}
		want := []string{"50000", "30000", "10000"}
		for i, a := range amounts {
			if a != want[i] {
				t.Errorf("amounts[%d] = %q, want %q", i, a, want[i])
			}
		}
	})
}
