package auth

import (
	"context"
	"net/http"

	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

func AuthMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromContext(r.Context())

		_, claims, err := jwtauth.FromContext(r.Context())
		if err != nil {
			log.Errorw("failed to get claims from context", "err", err)
			http.Error(w, "failed to get claims from context", http.StatusBadRequest)
			return
		}

		id, ok := claims["id"].(string)
		if !ok {
			log.Error("failed to get user")
			http.Error(w, "failed to get user id", http.StatusBadRequest)
			return
		}

		userId, err := uuid.Parse(id)
		if err != nil {
			log.Errorw("invalid user id", "err", err)
			http.Error(w, "invalid user id", http.StatusBadRequest)
			return
		}

		ctx := context.WithValue(r.Context(), identifiers.UserIdentifier, userId)
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}
