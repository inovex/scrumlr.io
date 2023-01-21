package auth

import (
	"context"
	"net/http"

	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"scrumlr.io/server/internal/logger"
)

func AuthContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		_, claims, _ := jwtauth.FromContext(r.Context())
		userID := claims["id"].(string)
		user, err := uuid.Parse(userID)
		if err != nil {
			logger.FromRequest(r).Errorw("invalid user id", "user", userID, "err", err)
			http.Error(w, "invalid user id", http.StatusBadRequest)
			return
		}
		newContext := context.WithValue(r.Context(), "User", user)
		next.ServeHTTP(w, r.WithContext(newContext))
	})
}
