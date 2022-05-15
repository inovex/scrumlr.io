package common

import (
  "net/http"
  "strings"
)

func GetProtocol(r *http.Request) string {
  if strings.HasPrefix(r.Header.Get("Origin"), "https") {
    return "https"
  }
  return "http"
}
