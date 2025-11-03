package technical_helper

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
)

type TestRequestBuilder struct {
	Req *http.Request
}

func NewTestRequestBuilder(method string, target string, body io.Reader) *TestRequestBuilder {
	r := new(TestRequestBuilder)
	r.Req = httptest.NewRequest(method, target, body)
	r.Req.Header.Set("Accept", "application/json")
	r.Req.Header.Set("Content-Type", "application/json")
	return r
}

func (b *TestRequestBuilder) AddToContext(key, val interface{}) *TestRequestBuilder {
	ctx := context.WithValue(b.Req.Context(), key, val)
	b.Req = b.Req.WithContext(ctx)
	return b
}

func (b *TestRequestBuilder) Request() *http.Request {
	return b.Req.Clone(b.Req.Context())
}
