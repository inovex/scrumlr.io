package boardtemplates

import (
	"context"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

func (api *API) BoardTemplateContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		boardTemplateParam := chi.URLParam(r, "id")
		boardTemplate, err := uuid.Parse(boardTemplateParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid board template id")))
			return
		}
		boardTemplateContext := context.WithValue(r.Context(), identifiers.BoardTemplateIdentifier, boardTemplate)
		next.ServeHTTP(w, r.WithContext(boardTemplateContext))
	})
}
