package common

import "net/http"

func GetProtocol(r *http.Request) string {
	if r.TLS == nil {
		return "http"
	}
	return "https"
}
