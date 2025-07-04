package notes

import (
	"context"
	"fmt"
	"github.com/go-chi/render"
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/logger"
)

type NotesService interface {
	Create(ctx context.Context, body NoteCreateRequest) (*Note, error)
	Import(ctx context.Context, body NoteImportRequest) (*Note, error)
	Get(ctx context.Context, id uuid.UUID) (*Note, error)
	Update(ctx context.Context, body NoteUpdateRequest) (*Note, error)
	GetAll(ctx context.Context, id uuid.UUID, columns ...uuid.UUID) ([]*Note, error)
	Delete(ctx context.Context, body NoteDeleteRequest, id uuid.UUID) error
	GetStack(ctx context.Context, note uuid.UUID) ([]*Note, error)
}
type API struct {
	service  NotesService
	basePath string
}

func (a API) Create(w http.ResponseWriter, r *http.Request) {
	log := logger.FromRequest(r)
	board := r.Context().Value(identifiers.BoardIdentifier).(uuid.UUID)
	user := r.Context().Value(identifiers.UserIdentifier).(uuid.UUID)
	fmt.Println("WOOOOOOOOOOOOOOOOOOOOOOOOOOOORKS")
	var body NoteCreateRequest
	if err := render.Decode(r, &body); err != nil {
		log.Errorw("unable to decode body", "err", err)
		common.Throw(w, r, common.BadRequestError(err))
		return
	}

	body.Board = board
	body.User = user

	note, err := a.service.Create(r.Context(), body)
	if err != nil {
		common.Throw(w, r, err)
		return
	}
	if a.basePath == "/" {
		w.Header().Set("Location", fmt.Sprintf("%s://%s/boards/%s/notes/%s", common.GetProtocol(r), r.Host, board, note.ID))
	} else {
		w.Header().Set("Location", fmt.Sprintf("%s://%s%s/boards/%s/notes/%s", common.GetProtocol(r), r.Host, a.basePath, board, note.ID))
	}
	render.Status(r, http.StatusCreated)
	render.Respond(w, r, note)
}

func (a API) Get(w http.ResponseWriter, r *http.Request) {
	//id := r.Context().Value(identifiers.NoteIdentifier).(uuid.UUID)

	//note, err := a.service.Get(r.Context(), id)
	//if err != nil {
	//	common.Throw(w, r, err)
	//	return
	//}

	render.Status(r, http.StatusOK)
	render.Respond(w, r, "note")

}

func (a API) GetAll(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (a API) Update(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func (a API) Delete(w http.ResponseWriter, r *http.Request) {
	//TODO implement me
	panic("implement me")
}

func NewNotesAPI(service NotesService, basePath string) NotesAPI {
	api := &API{service: service, basePath: basePath}
	return api
}
