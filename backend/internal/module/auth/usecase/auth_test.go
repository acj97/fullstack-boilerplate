package usecase

import (
	"strings"
	"testing"
	"time"

	"github.com/acj97/fullstack-boilerplate/internal/entity"
	"github.com/acj97/fullstack-boilerplate/internal/module/auth/repository"
	"golang.org/x/crypto/bcrypt"
)

// ── mock ─────────────────────────────────────────────────────────────────────

type mockUserRepo struct {
	user *entity.User
	err  error
}

var _ repository.UserRepository = (*mockUserRepo)(nil)

func (m *mockUserRepo) GetUserByEmail(_ string) (*entity.User, error) {
	return m.user, m.err
}

// ── helpers ───────────────────────────────────────────────────────────────────

func hashPassword(t *testing.T, pw string) string {
	t.Helper()
	h, err := bcrypt.GenerateFromPassword([]byte(pw), bcrypt.MinCost)
	if err != nil {
		t.Fatal(err)
	}
	return string(h)
}

func newAuthUsecase(repo repository.UserRepository) *Auth {
	return NewAuthUsecase(repo, []byte("test-secret"), time.Hour)
}

// ── tests ─────────────────────────────────────────────────────────────────────

func TestLogin_Success(t *testing.T) {
	user := &entity.User{ID: "u1", Email: "cs@test.com", Role: "cs", PasswordHash: hashPassword(t, "password")}
	uc := newAuthUsecase(&mockUserRepo{user: user})

	token, got, err := uc.Login("cs@test.com", "password")
	if err != nil {
		t.Fatalf("expected no error, got %v", err)
	}
	if token == "" {
		t.Error("expected a JWT token, got empty string")
	}
	if got.ID != user.ID || got.Email != user.Email {
		t.Errorf("returned user = %+v, want %+v", got, user)
	}
}

func TestLogin_WrongPassword(t *testing.T) {
	user := &entity.User{ID: "u1", Email: "cs@test.com", PasswordHash: hashPassword(t, "correct")}
	uc := newAuthUsecase(&mockUserRepo{user: user})

	_, _, err := uc.Login("cs@test.com", "wrong")
	if err == nil {
		t.Fatal("expected error for wrong password, got nil")
	}
	appErr, ok := err.(*entity.AppError)
	if !ok || appErr.Code != entity.ErrorCodeUnauthorized {
		t.Errorf("expected unauthorized AppError, got %v", err)
	}
}

func TestLogin_UserNotFound(t *testing.T) {
	uc := newAuthUsecase(&mockUserRepo{err: entity.ErrorNotFound("user not found")})

	_, _, err := uc.Login("nobody@test.com", "password")
	if err == nil {
		t.Fatal("expected error for missing user, got nil")
	}
	if !strings.Contains(err.Error(), "not found") {
		t.Errorf("expected not-found error, got %v", err)
	}
}
