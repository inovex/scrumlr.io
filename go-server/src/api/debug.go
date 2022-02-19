package api

import (
	"html/template"
	"net/http"

	"github.com/go-chi/chi/v5"
	"scrumlr.io/server/api/html"
)

func (s *Server) getDebugPage(w http.ResponseWriter, r *http.Request) {
	tmpl, _ := template.New("index").Parse(html.IndexTemplate)
	tmpl.Execute(w, struct{}{})
}

func (s *Server) getBoardDebugPage(w http.ResponseWriter, r *http.Request) {
	id := chi.URLParam(r, "id")
	tmpl, _ := template.New("index").Parse(html.BoardTemplate)

	tmpl.Execute(w, struct {
		ID template.JSStr
	}{
		ID: template.JSStr(id),
	})
}

func (s *Server) getRequestPage(w http.ResponseWriter, r *http.Request) {
	tmpl, _ := template.New("index").Parse(html.RequestTemplate)
	tmpl.Execute(w, struct{}{})
}
