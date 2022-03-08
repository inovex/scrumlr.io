package api

import (
  "github.com/go-chi/render"
  "net/http"
  "scrumlr.io/server/database/types"
)

type Info struct {
  AuthProvider []types.AccountType `json:"authProvider"`
}

func (s *Server) getServerInfo(w http.ResponseWriter, r *http.Request) {
  info := Info{}
  info.AuthProvider = []types.AccountType{}

  if s.auth.Exists(types.AccountTypeGoogle) {
    info.AuthProvider = append(info.AuthProvider, types.AccountTypeGoogle)
  }
  if s.auth.Exists(types.AccountTypeGitHub) {
    info.AuthProvider = append(info.AuthProvider, types.AccountTypeGitHub)
  }
  if s.auth.Exists(types.AccountTypeMicrosoft) {
    info.AuthProvider = append(info.AuthProvider, types.AccountTypeMicrosoft)
  }
  if s.auth.Exists(types.AccountTypeApple) {
    info.AuthProvider = append(info.AuthProvider, types.AccountTypeApple)
  }

  render.Status(r, http.StatusOK)
  render.Respond(w, r, info)
}
