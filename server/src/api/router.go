package api

import (
	"net/http"
	"os"
	"time"

	"scrumlr.io/server/websocket"

	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"

	"scrumlr.io/server/boards"

	"scrumlr.io/server/votings"

	"scrumlr.io/server/boardreactions"
	"scrumlr.io/server/boardtemplates"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/columntemplates"
	"scrumlr.io/server/notes"

	"github.com/go-chi/chi/v5"
	"github.com/go-chi/chi/v5/middleware"
	"github.com/markbates/goth/gothic"

	"github.com/go-chi/cors"
	"github.com/go-chi/httprate"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	gorillaSessions "github.com/gorilla/sessions"

	"go.opentelemetry.io/contrib/instrumentation/net/http/otelhttp"

	"scrumlr.io/server/auth"
	"scrumlr.io/server/feedback"
	"scrumlr.io/server/health"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessionrequests"
)

type Server struct {
	basePath string

	realtime  *realtime.Broker
	wsService websocket.WebSocketInterface
	auth      auth.Auth

	userRoutes    chi.Router
	sessionRoutes chi.Router

	boards          boards.BoardService
	columns         columns.ColumnService
	votings         votings.VotingService
	users           users.UserService
	notes           notes.NotesService
	reactions       reactions.ReactionService
	sessions        sessions.SessionService
	sessionRequests sessionrequests.SessionRequestService
	health          health.HealthService
	feedback        feedback.FeedbackService
	boardReactions  boardreactions.BoardReactionService
	boardTemplates  boardtemplates.BoardTemplateService
	columntemplates columntemplates.ColumnTemplateService

	checkOrigin bool

	// map of boardSubscriptions with maps of users with connections
	boardSubscriptions               map[uuid.UUID]*BoardSubscription
	boardSessionRequestSubscriptions map[uuid.UUID]*sessionrequests.BoardSessionRequestSubscription

	// note: if more options come with time, it might be sensible to wrap them into a struct
	anonymousLoginDisabled        bool
	allowAnonymousCustomTemplates bool
	allowAnonymousBoardCreation   bool
	experimentalFileSystemStore   bool
}

func New(
	basePath string,

	rt *realtime.Broker,
	wsService websocket.WebSocketInterface,
	auth auth.Auth,

	userRoutes chi.Router,
	sessionRoutes chi.Router,

	boards boards.BoardService,
	columns columns.ColumnService,
	votings votings.VotingService,
	users users.UserService,
	notes notes.NotesService,
	reactions reactions.ReactionService,
	sessions sessions.SessionService,
	sessionRequests sessionrequests.SessionRequestService,
	health health.HealthService,
	feedback feedback.FeedbackService,
	boardReactions boardreactions.BoardReactionService,
	boardTemplates boardtemplates.BoardTemplateService,
	columntemplates columntemplates.ColumnTemplateService,

	verbose bool,
	checkOrigin bool,
	anonymousLoginDisabled bool,
	allowAnonymousCustomTemplates bool,
	allowAnonymousBoardCreation bool,
	experimentalFileSystemStore bool,
) chi.Router {
	r := chi.NewRouter()
	r.Use(middleware.Recoverer)
	r.Use(middleware.RequestID)
	r.Use(logger.RequestIDMiddleware)
	r.Use(render.SetContentType(render.ContentTypeJSON))
	r.Use(otelhttp.NewMiddleware("scrumlr"))

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
		wsService:                        wsService,
		userRoutes:                       userRoutes,
		sessionRoutes:                    sessionRoutes,
		boardSubscriptions:               make(map[uuid.UUID]*BoardSubscription),
		boardSessionRequestSubscriptions: make(map[uuid.UUID]*sessionrequests.BoardSessionRequestSubscription),
		auth:                             auth,
		boards:                           boards,
		columns:                          columns,
		votings:                          votings,
		users:                            users,
		notes:                            notes,
		reactions:                        reactions,
		sessions:                         sessions,
		sessionRequests:                  sessionRequests,
		health:                           health,
		feedback:                         feedback,
		boardReactions:                   boardReactions,
		boardTemplates:                   boardTemplates,
		columntemplates:                  columntemplates,

		anonymousLoginDisabled:        anonymousLoginDisabled,
		allowAnonymousCustomTemplates: allowAnonymousCustomTemplates,
		allowAnonymousBoardCreation:   allowAnonymousBoardCreation,
		experimentalFileSystemStore:   experimentalFileSystemStore,
		checkOrigin:                   checkOrigin,
	}

	// if enabled, this experimental feature allows for larger session cookies *during OAuth authentication* by storing them in a file store.
	// this might be required when using some OIDC providers which exceed the 4KB limit.
	// see https://github.com/markbates/goth/pull/141
	if s.experimentalFileSystemStore {
		logger.Get().Infow("using experimental file system store")
		store := gorillaSessions.NewFilesystemStore(os.TempDir(), []byte("scrumlr.io"))
		store.MaxLength(0x8000) // 32KB should be plenty of space
		gothic.Store = store
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
			r.With(s.AnonymousLoginDisabledContext).Post("/anonymous", s.signInAnonymously)

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
		r.Use(s.auth.Authenticator())
		r.Use(auth.AuthContext)

		r.Route("/templates", func(r chi.Router) {
			r.Use(s.BoardTemplateRateLimiter)
			r.Use(s.AnonymousCustomTemplateCreationContext)

			r.Post("/", s.createBoardTemplate)
			r.Get("/", s.getBoardTemplates)

			r.Route("/{id}", func(r chi.Router) {
				r.Use(s.BoardTemplateContext)

				r.Get("/", s.getBoardTemplate)
				r.Put("/", s.updateBoardTemplate)
				r.Delete("/", s.deleteBoardTemplate)

				r.Route("/columns", func(r chi.Router) {
					r.Post("/", s.createColumnTemplate)
					r.Get("/", s.getColumnTemplates)

					r.Route("/{columnTemplate}", func(r chi.Router) {
						r.Use(s.ColumnTemplateContext)

						r.Get("/", s.getColumnTemplate)
						r.Put("/", s.updateColumnTemplate)
						r.Delete("/", s.deleteColumnTemplate)
					})
				})
			})
		})

		r.With(s.AnonymousBoardCreationContext).Post("/boards", s.createBoard)
		r.With(s.AnonymousBoardCreationContext).Post("/import", s.importBoard)
		r.Get("/boards", s.getBoards)
		r.Route("/boards/{id}", func(r chi.Router) {
			r.With(s.BoardParticipantContext).Get("/", s.getBoard)
			r.With(s.BoardParticipantContext).Get("/export", s.exportBoard)
			r.With(s.BoardModeratorContext).Post("/timer", s.setTimer)
			r.With(s.BoardModeratorContext).Delete("/timer", s.deleteTimer)
			r.With(s.BoardModeratorContext).Post("/timer/increment", s.incrementTimer)
			r.With(s.BoardModeratorContext).Put("/", s.updateBoard)
			r.With(s.BoardModeratorContext).Delete("/", s.deleteBoard)

			s.initBoardSessionRequestResources(r)
			s.initBoardSessionResources(r)
			s.initColumnResources(r)
			s.initNoteResources(r)
			s.initReactionResources(r)
			s.initVotingResources(r)
			s.initVoteResources(r)
			s.initBoardReactionResources(r)
		})

		r.Mount("/", s.userRoutes)
	})
}

func (s *Server) initVoteResources(r chi.Router) {
	r.Route("/votes", func(r chi.Router) {
		r.Use(s.BoardParticipantContext)
		r.Get("/", s.getVotes)

		r.Group(func(r chi.Router) {
			r.Use(s.BoardEditableContext)
			r.Post("/", s.addVote)
			r.Delete("/", s.removeVote)
		})
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
					_, err := w.Write([]byte(`{"error": "Too many requests"}`))
					if err != nil {
						log := logger.FromRequest(r)
						log.Errorw("Could not write error", "error", err)
						return
					}
				}),
			))

			r.Post("/", s.joinBoard) //board
		})
		r.Mount("/", s.sessionRoutes)
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
		r.With(s.BoardEditableContext).Post("/", s.createNote)

		r.Route("/{note}", func(r chi.Router) {
			r.Use(s.NoteContext)

			r.Get("/", s.getNote)
			r.With(s.BoardEditableContext).Put("/", s.updateNote)
			r.With(s.BoardEditableContext).Delete("/", s.deleteNote)
			r.With(s.BoardEditableContext).Post("/drag-start", s.noteDragStart)
			r.With(s.BoardEditableContext).Post("/drag-end", s.noteDragEnd)
		})
	})
}

func (s *Server) initReactionResources(r chi.Router) {
	r.Route("/reactions", func(r chi.Router) {
		r.Use(s.BoardParticipantContext)

		r.Get("/", s.getReactions)
		r.With(s.BoardEditableContext).Post("/", s.createReaction)

		r.Route("/{reaction}", func(r chi.Router) {
			r.Use(s.ReactionContext)

			r.Get("/", s.getReaction)
			r.With(s.BoardEditableContext).Delete("/", s.removeReaction)
			r.With(s.BoardEditableContext).Put("/", s.updateReaction)
		})
	})
}

func (s *Server) initBoardReactionResources(r chi.Router) {
	r.Route("/board-reactions", func(r chi.Router) {
		r.Use(s.BoardParticipantContext)

		r.Post("/", s.createBoardReaction)
	})
}
