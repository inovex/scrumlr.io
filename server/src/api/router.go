package api

import (
	"fmt"
	"github.com/go-chi/cors"
	"github.com/go-chi/render"
	"github.com/gorilla/websocket"
	"net/http"
	"net/url"
	"scrumlr.io/server/services"
	"strings"

	"github.com/go-chi/jwtauth/v5"
	"github.com/google/uuid"
	"scrumlr.io/server/auth"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
)

type Server struct {
	baseURL string

	realtime *realtime.Realtime
	auth     auth.Auth

	boards   services.Boards
	votings  services.Votings
	users    services.Users
	notes    services.Notes
	sessions services.BoardSessions
	health   services.Health

	upgrader websocket.Upgrader

	// map of boardSubscriptions with maps of users with connections
	boardSubscriptions               map[uuid.UUID]*BoardSubscription
	boardSessionRequestSubscriptions map[uuid.UUID]*BoardSessionRequestSubscription
}

func New(
	baseURL string,
	rt *realtime.Realtime,
	auth auth.Auth,
	boards services.Boards,
	votings services.Votings,
	users services.Users,
	notes services.Notes,
	sessions services.BoardSessions,
	health services.Health,
	verbose bool,
	checkOrigin bool,
) chi.Router {
	r := chi.NewRouter()

	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(logger.RequestIDMiddleware)
	r.Use(render.SetContentType(render.ContentTypeJSON))

	if !checkOrigin {
		r.Use(cors.Handler(cors.Options{
			AllowedOrigins: []string{"https://*", "http://*"},

			// AllowOriginFunc:  func(r *http.Request, origin string) bool { return true },
			AllowedMethods:   []string{"GET", "POST", "PUT", "DELETE", "OPTIONS"},
			AllowedHeaders:   []string{"Accept", "Authorization", "Content-Type", "X-CSRF-Token"},
			ExposedHeaders:   []string{"Link", "Set-Cookie"},
			AllowCredentials: true,
			MaxAge:           300,
		}))
	}

	if verbose {
		r.Use(logger.ChiZapLogger())
	}

	s := Server{
		baseURL:                          baseURL,
		realtime:                         rt,
		boardSubscriptions:               make(map[uuid.UUID]*BoardSubscription),
		boardSessionRequestSubscriptions: make(map[uuid.UUID]*BoardSessionRequestSubscription),
		auth:                             auth,
		boards:                           boards,
		votings:                          votings,
		users:                            users,
		notes:                            notes,
		sessions:                         sessions,
		health:                           health,
	}

	// initialize websocket upgrader with origin check depending on options
	s.upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}
	if checkOrigin && baseURL != "" {
		base, _ := url.Parse(s.baseURL)
		s.upgrader.CheckOrigin = func(r *http.Request) bool {
			return strings.HasPrefix(r.Header.Get("origin"), fmt.Sprintf("%s://%s", base.Scheme, base.Host))
		}
	} else if checkOrigin {
		s.upgrader.CheckOrigin = nil
	} else {
		s.upgrader.CheckOrigin = func(r *http.Request) bool {
			return true
		}
	}

	s.publicRoutes(r)
	s.protectedRoutes(r)

	return r
}

func (s *Server) publicRoutes(r *chi.Mux) chi.Router {
	return r.Group(func(r chi.Router) {
		r.Get("/", s.getDebugPage)
		r.Get("/info", s.getServerInfo)
		r.Get("/health", s.healthCheck)

		r.Route("/login", func(r chi.Router) {
			r.Delete("/", s.logout)
			r.Post("/anonymous", s.signInAnonymously)

			r.Get("/{provider}", s.beginAuthProviderVerification)
			r.Get("/{provider}/callback", s.verifyAuthProviderCallback)
		})
	})
}

func (s *Server) protectedRoutes(r *chi.Mux) {
	r.Group(func(r chi.Router) {
		r.Use(s.auth.Verifier())
		r.Use(jwtauth.Authenticator)
		r.Use(auth.AuthContext)

		r.Get("/debug/{id}", s.getBoardDebugPage)
		r.Get("/debug/request", s.getRequestPage)

		r.Post("/boards", s.createBoard)

		r.Route("/boards/{id}", func(r chi.Router) {
			r.With(s.BoardParticipantContext).Get("/", s.getBoard)
			r.With(s.BoardParticipantContext).Get("/export", s.exportBoard)
			r.With(s.BoardParticipantContext).Post("/timer", s.setTimer)
			r.With(s.BoardParticipantContext).Delete("/timer", s.deleteTimer)

			r.With(s.BoardModeratorContext).Put("/", s.updateBoard)
			r.With(s.BoardModeratorContext).Delete("/", s.deleteBoard)

			s.initBoardSessionRequestResources(r)
			s.initBoardSessionResources(r)
			s.initColumnResources(r)
			s.initNoteResources(r)
			s.initVotingResources(r)
			s.initVoteResources(r)
		})

		r.Route("/user", func(r chi.Router) {
			r.Get("/", s.getUser)
			r.Put("/", s.updateUser)
		})
	})
}

func (s *Server) initVoteResources(r chi.Router) {
	r.Route("/votes", func(r chi.Router) {
		r.Use(s.BoardParticipantContext)
		r.Post("/", s.addVote)
		r.Delete("/", s.removeVote)
		r.Get("/", s.getVotes)
	})
}

func (s *Server) initVotingResources(r chi.Router) {
	r.Route("/votings", func(r chi.Router) {
		r.With(s.BoardParticipantContext).Get("/", s.getVotings)

		r.With(s.BoardModeratorContext).Post("/", s.createVoting)
		r.With(s.BoardModeratorContext).Put("/", s.updateVoting)

		r.Route("/{voting}", func(r chi.Router) {
			r.Use(s.VotingContext)
			r.With(s.BoardParticipantContext).Get("/", s.getVoting)
			r.With(s.BoardModeratorContext).Put("/", s.updateVoting)
		})
	})
}

func (s *Server) initBoardSessionResources(r chi.Router) {
	r.Route("/participants", func(r chi.Router) {
		r.Post("/", s.joinBoard)

		r.With(s.BoardParticipantContext).Get("/", s.getBoardSessions)

		r.With(s.BoardModeratorContext).Put("/", s.updateBoardSessions)

		r.Route("/{session}", func(r chi.Router) {
			r.Use(s.BoardParticipantContext)
			r.Get("/", s.getBoardSession)
			r.Put("/", s.updateBoardSession)
		})
	})
}

func (s *Server) initBoardSessionRequestResources(r chi.Router) {
	r.Route("/requests", func(r chi.Router) {
		r.With(s.BoardModeratorContext).Get("/", s.getBoardSessionRequests)
		r.With(s.BoardCandidateContext).Get("/{user}", s.getBoardSessionRequest)
		r.With(s.BoardModeratorContext).Put("/{user}", s.updateBoardSessionRequest)
	})
}

func (s *Server) initColumnResources(r chi.Router) {
	r.Route("/columns", func(r chi.Router) {
		r.With(s.BoardParticipantContext).Get("/", s.getColumns)

		r.With(s.BoardModeratorContext).Post("/", s.createColumn)

		r.Route("/{column}", func(r chi.Router) {
			r.Use(s.ColumnContext)

			r.With(s.BoardParticipantContext).Get("/", s.getColumn)

			r.With(s.BoardModeratorContext).Put("/", s.updateColumn)

			// TODO delete showNote if column with note is deleted
			r.With(s.BoardModeratorContext).Delete("/", s.deleteColumn)
		})
	})
}

func (s *Server) initNoteResources(r chi.Router) {
	r.Route("/notes", func(r chi.Router) {
		r.Use(s.BoardParticipantContext)

		r.Get("/", s.getNotes)
		r.Post("/", s.createNote)

		r.Route("/{note}", func(r chi.Router) {
			r.Use(s.NoteContext)

			r.Get("/", s.getNote)
			r.Put("/", s.updateNote)

			// TODO delete showNote if note is deleted
			r.Delete("/", s.deleteNote)
		})
	})
}
