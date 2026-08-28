package info

import (
	"context"
	"net/http"

	"github.com/go-chi/render"
)

type InfoService interface {
	Get(ctx context.Context) *Info
}

type Api struct {
	service InfoService
}

func NewInfoApi(infoService InfoService) InfoApi {
	api := new(Api)
	api.service = infoService

	return api
}

// Get server info
//
//	@Summary		Show server info
//	@Description	Get the server info with the configured options
//	@Tags			info
//	@Produce		json
//	@Success		200	{object}	api.Info
//	@Router			/info [get]
func (api *Api) GetInfo(w http.ResponseWriter, r *http.Request) {
	info := api.service.Get(r.Context())

	render.Status(r, http.StatusOK)
	render.Respond(w, r, info)
}
