package api

import (
	"context"
	"errors"
	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
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

		user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
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

		boardContext := context.WithValue(r.Context(), identifiers.BoardIdentifier, board)
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

		user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
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

		banned, err := s.sessions.ParticipantBanned(r.Context(), board, user)
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

func (s *Server) BoardModeratorContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)

		boardParam := chi.URLParam(r, "id")
		board, err := uuid.Parse(boardParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board id")))
			return
		}
		user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

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

		boardContext := context.WithValue(r.Context(), identifiers.BoardIdentifier, board)
		next.ServeHTTP(w, r.WithContext(boardContext))
	})
}

func (s *Server) BoardEditableContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		log := logger.FromRequest(r)

		board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
		user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
		isMod, err := s.sessions.ModeratorSessionExists(r.Context(), board, user)
		if err != nil {
			log.Errorw("unable to verify board session", "err", err)
			common.Throw(w, r, common.InternalServerError)
			return
		}

		settings, err := s.boards.Get(r.Context(), board)
		if err != nil {

			log.Errorw("unable to verify board settings", "err", err)
			common.Throw(w, r, common.BadRequestError(errors.New("unable to verify board settings")))
			return
		}

		if !isMod && !settings.IsLocked {
			log.Errorw("not allowed to edit board", "err", err)
			common.Throw(w, r, common.ForbiddenError(errors.New("not authorized to change board")))
			return
		}

		boardEditable := context.WithValue(r.Context(), identifiers.BoardEditableIdentifier, settings.IsLocked)
		next.ServeHTTP(w, r.WithContext(boardEditable))
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

		columnContext := context.WithValue(r.Context(), identifiers.ColumnIdentifier, column)
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

		columnContext := context.WithValue(r.Context(), identifiers.NoteIdentifier, note)
		next.ServeHTTP(w, r.WithContext(columnContext))
	})
}

func (s *Server) ReactionContext(next http.Handler) http.Handler {
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

func (s *Server) VotingContext(next http.Handler) http.Handler {
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
