package e2e

import (
	"crypto/tls"
	"net/http"
)

func insecureHTTPClient(base *http.Client) *http.Client {
	transport := http.DefaultTransport.(*http.Transport).Clone()
	transport.TLSClientConfig = &tls.Config{InsecureSkipVerify: true}
	base.Transport = transport
	return base
}
