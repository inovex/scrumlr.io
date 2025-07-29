package router

import (
	"context"
	"errors"
	"github.com/go-chi/chi/v5"
	"github.com/go-chi/httprate"
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/sessionrequests"
	"scrumlr.io/server/sessions"
	"time"
)

type MiddlewareService struct {
	sessionRequestService  sessionrequests.SessionRequestService
	sessionService         sessions.SessionService
	userService            sessions.UserService
	boardService           boards.BoardService
	anonymousLoginDisabled bool
}

func (s *MiddlewareService) BoardCandidateContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)
		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}

		user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
		exists, err := s.sessionRequestService.Exists(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to check board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			common.Throw(w, r, common.NotFoundError)
			return
		}

		boardContext := context.WithValue(r.Context(), identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (s *MiddlewareService) BoardParticipantContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)
		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}

		user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
		exists, err := s.sessionService.Exists(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to check board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			common.Throw(w, r, common.ForbiddenError(errors.New("user board session not found")))
			return
		}

		banned, err := s.sessionService.IsParticipantBanned(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to check if participant is banned", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if banned {
			common.Throw(w, r, common.ForbiddenError(errors.New("participant is currently banned from this session")))
			return
		}

		boardContext := context.WithValue(r.Context(), identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (s *MiddlewareService) BoardModeratorContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}
		user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

		exists, err := s.sessionService.ModeratorSessionExists(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to verify board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			common.Throw(w, r, common.NotFoundError)
			return
		}

		boardContext := context.WithValue(r.Context(), identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (s *MiddlewareService) BoardEditableContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)

		board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
		user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
		isMod, err := s.sessionService.ModeratorSessionExists(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to verify board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		settings, err := s.boardService.Get(r.Context(), board)
		if err != nil {

			log.Errorw("unable to verify board settings", "err", err)
			common.Throw(w, r, common.BadRequestError(errors.New("unable to verify board settings")))
			return
		}

		if !isMod && settings.IsLocked {
			log.Errorw("not allowed to edit board", "err", err)
			common.Throw(w, r, common.ForbiddenError(errors.New("not authorized to change board")))
			return
		}

		boardEditable := context.WithValue(r.Context(), identifiers.BoardEditableIdentifier, settings.IsLocked)
		next.ServeHTTP(w, r.WithContext(boardEditable))
	})
}

func (s *MiddlewareService) BoardAuthenticatedContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}
		userID := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

		user, err := s.userService.Get(r.Context(), userID)

		if err != nil {
			log.Errorw("Could not fetch user", "error", err)
			common.Throw(w, r, errors.New("could not fetch user"))
			return
		}

		if user.AccountType == common.Anonymous {
			log.Errorw("Not authorized to perform this action", "accountType", user.AccountType)
			common.Throw(w, r, common.ForbiddenError(errors.New("not authorized")))
			return
		}

		boardContext := context.WithValue(r.Context(), identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (s *MiddlewareService) AnonymousLoginDisabledContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)

		if s.anonymousLoginDisabled {
			log.Errorw("not allowed to login anonymously")
			common.Throw(w, r, common.ForbiddenError(errors.New("not authorized to login anonymously")))
			return
		}

		next.ServeHTTP(w, r)
	})
}

func (s *MiddlewareService) ColumnContext(next http.Handler) http.Handler {
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

func (s *MiddlewareService) NoteContext(next http.Handler) http.Handler {
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

func (s *MiddlewareService) ReactionContext(next http.Handler) http.Handler {
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

func (s *MiddlewareService) VotingContext(next http.Handler) http.Handler {
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

func (s *MiddlewareService) BoardTemplateContext(next http.Handler) http.Handler {
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

func (s *MiddlewareService) BoardTemplateRateLimiter(next http.Handler) http.Handler {
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

func (s *MiddlewareService) ColumnTemplateContext(next http.Handler) http.Handler {
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
