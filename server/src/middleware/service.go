package middleware

import (
	"context"
	"errors"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/httprate"
	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/sessions")
var meter metric.Meter = otel.Meter("scrumlr.io/server/sessions")

type ContextService struct {
	anonymousLoginDisabled bool
}

func NewContextService(anonymousLoginDisabled bool) ContextService {
	service := new(ContextService)
	service.anonymousLoginDisabled = anonymousLoginDisabled

	return *service
}

func (service *ContextService) AnonymousLoginDisabledContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)

		if service.anonymousLoginDisabled {
			log.Errorw("not allowed to login anonymously")
			common.Throw(w, r, common.ForbiddenError(errors.New("not authorized to login anonymously")))
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (service *ContextService) ColumnContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		columnParam := chi.URLParam(r, "column")
		column, err := uuid.Parse(columnParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid column id")))
			return
		}

		columnContext := context.WithValue(r.Context(), identifiers.ColumnIdentifier, column)
		next.ServeHTTP(w, r.WithContext(columnContext))
	})
}

func (service *ContextService) NoteContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		noteParam := chi.URLParam(r, "note")
		note, err := uuid.Parse(noteParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid note id")))
			return
		}

		columnContext := context.WithValue(r.Context(), identifiers.NoteIdentifier, note)
		next.ServeHTTP(w, r.WithContext(columnContext))
	})
}

func (service *ContextService) ReactionContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		reactionParam := chi.URLParam(r, "reaction")
		reaction, err := uuid.Parse(reactionParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid reaction id")))
			return
		}

		reactionContext := context.WithValue(r.Context(), identifiers.ReactionIdentifier, reaction)
		next.ServeHTTP(w, r.WithContext(reactionContext))
	})
}

func (service *ContextService) VotingContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		votingParam := chi.URLParam(r, "voting")
		voting, err := uuid.Parse(votingParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid voting id")))
			return
		}
		votingContext := context.WithValue(r.Context(), identifiers.VotingIdentifier, voting)
		next.ServeHTTP(w, r.WithContext(votingContext))
	})
}

func (service *ContextService) BoardTemplateContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		boardTemplateParam := chi.URLParam(r, "id")
		boardTemplate, err := uuid.Parse(boardTemplateParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board template id")))
		}
		boardTemplateContext := context.WithValue(r.Context(), identifiers.BoardTemplateIdentifier, boardTemplate)
		next.ServeHTTP(w, r.WithContext(boardTemplateContext))
	})
}

func (service *ContextService) BoardTemplateRateLimiter(next http.Handler) http.Handler {
	// Initialize the rate limiter
	limiter := httprate.Limit(
		20,
		1*time.Second,
		httprate.WithKeyFuncs(httprate.KeyByIP),
		httprate.WithLimitHandler(func(w http.ResponseWriter, r *http.Request) {
			w.Header().Set("Content-Type", "application/json")
			w.WriteHeader(http.StatusTooManyRequests)
			_, err := w.Write([]byte(`{"error": "Too many requests"}`))
			if err != nil {
				log := logger.FromRequest(r)
				log.Errorw("could not write error", "error", err)
			}
		}),
	)

	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		// Apply the rate limiter to the next handler
		limiter(next).ServeHTTP(w, r)
	})
}

func (service *ContextService) ColumnTemplateContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		columnTemplateParam := chi.URLParam(r, "columnTemplate")
		columnTemplate, err := uuid.Parse(columnTemplateParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid column id")))
			return
		}

		columnTemplateContext := context.WithValue(r.Context(), identifiers.ColumnTemplateIdentifier, columnTemplate)
		next.ServeHTTP(w, r.WithContext(columnTemplateContext))
	})
}
