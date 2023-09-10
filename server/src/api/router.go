package api

import (
	"net/http"
	"time"

	"github.com/go-chi/cors"
	"github.com/go-chi/jwtauth/v5"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"github.com/gorilla/websocket"

	"scrumlr.io/server/auth"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/services"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/go-chi/httprate"
)

type Server struct {
	basePath string

	realtime *realtime.Broker
	auth     auth.Auth

	boards      services.Boards
	votings     services.Votings
	users       services.Users
	notes       services.Notes
	sessions    services.BoardSessions
	health      services.Health
	feedback    services.Feedback
	assignments services.Assignments

	upgrader websocket.Upgrader

	// map of boardSubscriptions with maps of users with connections
	boardSubscriptions               map[uuid.UUID]*BoardSubscription
	boardSessionRequestSubscriptions map[uuid.UUID]*BoardSessionRequestSubscription
}

func New(
	basePath string,
	rt *realtime.Broker,
	auth auth.Auth,
	boards services.Boards,
	votings services.Votings,
	users services.Users,
	notes services.Notes,
	sessions services.BoardSessions,
	health services.Health,
	feedback services.Feedback,
	assignments services.Assignments,
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
		basePath:                         basePath,
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
		feedback:                         feedback,
		assignments:                      assignments,
	}

	// initialize websocket upgrader with origin check depending on options
	s.upgrader = websocket.Upgrader{
		ReadBufferSize:  1024,
		WriteBufferSize: 1024,
	}

	if checkOrigin {
		s.upgrader.CheckOrigin = nil
	} else {
		s.upgrader.CheckOrigin = func(r *http.Request) bool {
			return true
		}
	}

	if s.basePath == "/" {
		s.publicRoutes(r)
		s.protectedRoutes(r)
	} else {
		r.Route(s.basePath, func(router chi.Router) {
			s.publicRoutes(router)
			s.protectedRoutes(router)
		})
	}

	return r
}

func (s *Server) publicRoutes(r chi.Router) chi.Router {
	return r.Group(func(r chi.Router) {
		r.Get("/info", s.getServerInfo)
		r.Get("/health", s.healthCheck)
		r.Post("/feedback", s.createFeedback)
		r.Route("/login", func(r chi.Router) {
			r.Delete("/", s.logout)
			r.Post("/anonymous", s.signInAnonymously)

			r.Route("/{provider}", func(r chi.Router) {
				r.Get("/", s.beginAuthProviderVerification)
				r.Get("/callback", s.verifyAuthProviderCallback)
			})
		})
	})
}

func (s *Server) protectedRoutes(r chi.Router) {
	r.Group(func(r chi.Router) {
		r.Use(s.auth.Verifier())
		r.Use(jwtauth.Authenticator)
		r.Use(auth.AuthContext)

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
			s.initAssignmentResources(r)
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
		r.Group(func(r chi.Router) {

			r.Use(httprate.Limit(
				3,
				5*time.Second,
				httprate.WithKeyFuncs(httprate.KeyByIP),
				httprate.WithLimitHandler(func(w http.ResponseWriter, r *http.Request) {
					w.Header().Set("Content-Type", "application/json")
					w.WriteHeader(http.StatusTooManyRequests)
					w.Write([]byte(`{"error": "Too many requests"}`))
				}),
			))

			r.Post("/", s.joinBoard)
		})

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

			r.With(s.BoardModeratorContext).Delete("/", s.deleteColumn)
		})
	})
}

func (s *Server) initNoteResources(r chi.Router) {
	r.Route("/notes", func(r chi.Router) {
		r.Use(s.BoardParticipantContext)

		r.Get("/", s.getNotes)
		r.Post("/", s.createNote)

		r.Route("/resent", func(r chi.Router) {
			r.Get("/", s.getNoteBySeqNum)
		})

		r.Route("/{note}", func(r chi.Router) {
			r.Use(s.NoteContext)

			r.Get("/", s.getNote)
			r.Put("/", s.updateNote)

			r.Delete("/", s.deleteNote)
		})
	})
}

func (s *Server) initAssignmentResources(r chi.Router) {
	r.Route("/assignments", func(r chi.Router) {
		r.Use(s.BoardParticipantContext)

		r.Post("/", s.createAssignment)
		r.Route("/{assignment}", func(r chi.Router) {
			r.Use(s.AssignmentContext)
			r.Delete("/", s.deleteAssignment)
		})
	})
}
