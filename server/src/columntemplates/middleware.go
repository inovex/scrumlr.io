package columntemplates

import (
	"context"
	"errors"
	"net/http"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

func (api *API) ColumnTemplateContext(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		columnTemplateParam := chi.URLParam(r, "columnTemplate")
		if columnTemplateParam == "" {
			columnTemplateParam = chi.URLParam(r, "id")
		}
		columnTemplate, err := uuid.Parse(columnTemplateParam)
		if err != nil {
			common.Throw(w, r, common.BadRequestError(errors.New("invalid column id")))
			return
		}

		columnTemplateContext := context.WithValue(r.Context(), identifiers.ColumnTemplateIdentifier, columnTemplate)
		next.ServeHTTP(w, r.WithContext(columnTemplateContext))
	})
}
