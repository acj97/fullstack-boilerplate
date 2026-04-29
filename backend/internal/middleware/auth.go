package middleware

import (
	"context"
	"net/http"
	"strings"

	"github.com/acj97/fullstack-boilerplate/internal/entity"
	"github.com/acj97/fullstack-boilerplate/internal/transport"
	"github.com/golang-jwt/jwt/v5"
)

type contextKey string

const ClaimsKey contextKey = "claims"

func JWTAuth(secret []byte) func(http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
			authHeader := r.Header.Get("Authorization")
			if authHeader == "" || !strings.HasPrefix(authHeader, "Bearer ") {
				transport.WriteAppError(w, entity.WrapError(nil, entity.ErrorCodeUnauthorized, "missing or invalid authorization header"))
				return
			}

			tokenStr := strings.TrimPrefix(authHeader, "Bearer ")
			token, err := jwt.Parse(tokenStr, func(t *jwt.Token) (any, error) {
				if _, ok := t.Method.(*jwt.SigningMethodHMAC); !ok {
					return nil, entity.WrapError(nil, entity.ErrorCodeUnauthorized, "unexpected signing method")
				}
				return secret, nil
			})
			if err != nil || !token.Valid {
				transport.WriteAppError(w, entity.WrapError(err, entity.ErrorCodeUnauthorized, "invalid token"))
				return
			}

			claims, ok := token.Claims.(jwt.MapClaims)
			if !ok {
				transport.WriteAppError(w, entity.WrapError(nil, entity.ErrorCodeUnauthorized, "invalid token claims"))
				return
			}

			ctx := context.WithValue(r.Context(), ClaimsKey, claims)
			next.ServeHTTP(w, r.WithContext(ctx))
		})
	}
}
