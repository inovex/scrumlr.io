package api

import (
	"context"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/logger"
)

func (s *Server) BoardCandidateContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}

		user := r.Context().Value("User").(uuid.UUID)

		exists, err := s.sessions.SessionRequestExists(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to check board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			common.Throw(w, r, common.NotFoundError)
			return
		}

		boardContext := context.WithValue(r.Context(), "Board", board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (s *Server) BoardParticipantContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}

		user := r.Context().Value("User").(uuid.UUID)

		exists, err := s.sessions.SessionExists(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to check board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			common.Throw(w, r, common.ForbiddenError(errors.New("user board session not found")))
			return
		}

		boardContext := context.WithValue(r.Context(), "Board", board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (s *Server) BoardModeratorContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}
		user := r.Context().Value("User").(uuid.UUID)

		exists, err := s.sessions.ModeratorSessionExists(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to verify board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		if !exists {
			common.Throw(w, r, common.NotFoundError)
			return
		}

		boardContext := context.WithValue(r.Context(), "Board", board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (s *Server) ColumnContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		columnParam := chi.URLParam(r, "column")
		column, err := uuid.Parse(columnParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid column id")))
			return
		}

		columnContext := context.WithValue(r.Context(), "Column", column)
		next.ServeHTTP(w, r.WithContext(columnContext))
	})
}

func (s *Server) NoteContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		noteParam := chi.URLParam(r, "note")
		note, err := uuid.Parse(noteParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid note id")))
			return
		}

		columnContext := context.WithValue(r.Context(), "Note", note)
		next.ServeHTTP(w, r.WithContext(columnContext))
	})
}

func (s *Server) VotingContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		votingParam := chi.URLParam(r, "voting")
		voting, err := uuid.Parse(votingParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid voting id")))
			return
		}
		votingContext := context.WithValue(r.Context(), "Voting", voting)
		next.ServeHTTP(w, r.WithContext(votingContext))
	})
}
