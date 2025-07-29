package sessions

import (
  "context"
  "github.com/go-chi/chi/v5"
  "github.com/go-chi/render"
  "net/http"
  "net/url"
  "scrumlr.io/server/common"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/logger"

  "github.com/google/uuid"
)

type API struct {
  sessionService SessionService
  userService    UserService
  basePath       string
}

type SessionService interface {
  Create(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error)
  Update(ctx context.Context, body BoardSessionUpdateRequest) (*BoardSession, error)
  UpdateAll(ctx context.Context, body BoardSessionsUpdateRequest) ([]*BoardSession, error)
  UpdateUserBoards(ctx context.Context, body BoardSessionUpdateRequest) ([]*BoardSession, error)
  Get(ctx context.Context, boardID, userID uuid.UUID) (*BoardSession, error)
  GetAll(ctx context.Context, boardID uuid.UUID, filter BoardSessionFilter) ([]*BoardSession, error)
  GetUserConnectedBoards(ctx context.Context, user uuid.UUID) ([]*BoardSession, error)

  Connect(ctx context.Context, boardID, userID uuid.UUID) error
  Disconnect(ctx context.Context, boardID, userID uuid.UUID) error

  Exists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
  ModeratorSessionExists(ctx context.Context, boardID, userID uuid.UUID) (bool, error)
  IsParticipantBanned(ctx context.Context, boardID, userID uuid.UUID) (bool, error)

  BoardSessionFilterTypeFromQueryString(query url.Values) BoardSessionFilter
}

func (a API) getUser(w http.ResponseWriter, r *http.Request) {
  userId := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

  user, err := a.userService.Get(r.Context(), userId)
  if err != nil {
    common.Throw(w, r, err)
    return
  }

  render.Status(r, http.StatusOK)
  render.Respond(w, r, user)
}

func (a API) updateUser(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)
  user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)

  var body UserUpdateRequest
  if err := render.Decode(r, &body); err != nil {
    log.Errorw("unable to decode body", "err", err)
    common.Throw(w, r, common.BadRequestError(err))
    return
  }

  body.ID = user

  updatedUser, err := a.userService.Update(r.Context(), body)
  if err != nil {
    common.Throw(w, r, common.InternalServerError)
    return
  }

  // because of a import cycle the boards are updated through the session service
  // after a user update.
  updateBoards := BoardSessionUpdateRequest{
    User: user,
  }
  _, err = a.sessionService.UpdateUserBoards(r.Context(), updateBoards)
  if err != nil {
    log.Errorw("Unable to update user boards")
  }

  render.Status(r, http.StatusOK)
  render.Respond(w, r, updatedUser)
}

func (a API) getBoardSession(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)
  board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
  userParam := chi.URLParam(r, "session")
  userId, err := uuid.Parse(userParam)
  if err != nil {
    log.Errorw("Invalid user id", "err", err)
    common.Throw(w, r, err)
    return
  }

  session, err := a.sessionService.Get(r.Context(), board, userId)
  if err != nil {
    common.Throw(w, r, err)
    return
  }

  render.Status(r, http.StatusOK)
  render.Respond(w, r, session)
}

func (a API) getBoardSessions(w http.ResponseWriter, r *http.Request) {
  board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

  filter := a.sessionService.BoardSessionFilterTypeFromQueryString(r.URL.Query())
  sessions, err := a.sessionService.GetAll(r.Context(), board, filter)
  if err != nil {
    common.Throw(w, r, common.InternalServerError)
    return
  }

  render.Status(r, http.StatusOK)
  render.Respond(w, r, sessions)
}

func (a API) updateBoardSession(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)
  board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
  caller := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
  userParam := chi.URLParam(r, "session")
  userId, err := uuid.Parse(userParam)
  if err != nil {
    log.Errorw("Invalid user session id", "err", err)
    http.Error(w, "invalid user session id", http.StatusBadRequest)
    return
  }

  var body BoardSessionUpdateRequest
  if err := render.Decode(r, &body); err != nil {
    log.Errorw("Unable to decode body", "err", err)
    http.Error(w, "unable to parse request body", http.StatusBadRequest)
    return
  }

  body.Board = board
  body.Caller = caller
  body.User = userId

  session, err := a.sessionService.Update(r.Context(), body)
  if err != nil {
    common.Throw(w, r, err)
    return
  }

  render.Status(r, http.StatusOK)
  render.Respond(w, r, session)
}

func (a API) updateBoardSessions(w http.ResponseWriter, r *http.Request) {
  log := logger.FromRequest(r)
  board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)

  var body BoardSessionsUpdateRequest
  if err := render.Decode(r, &body); err != nil {
    log.Errorw("Unable to decode body", "err", err)
    http.Error(w, "unable to parse request body", http.StatusBadRequest)
    return
  }

  body.Board = board
  updatedSessions, err := a.sessionService.UpdateAll(r.Context(), body)
  if err != nil {
    http.Error(w, "unable to update board sessions", http.StatusInternalServerError)
    return
  }

  render.Status(r, http.StatusOK)
  render.Respond(w, r, updatedSessions)
}

func NewSessionAPI(sessionService SessionService, userService UserService, basePath string) SessionAPI {
  api := &API{sessionService: sessionService, userService: userService, basePath: basePath}
  return api
}
