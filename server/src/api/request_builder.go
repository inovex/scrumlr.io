package api

import (
	"context"
	"io"
	"net/http"
	"net/http/httptest"
)

type TestRequestBuilder struct {
	req *http.Request
}

func NewTestRequestBuilder(method string, target string, body io.Reader) *TestRequestBuilder {
	r := new(TestRequestBuilder)
	r.req = httptest.NewRequest(method, target, body)
	r.req.Header.Set("Accept", "application/json")
	r.req.Header.Set("Content-Type", "application/json")
	return r
}

func (b *TestRequestBuilder) AddToContext(key, val interface{}) *TestRequestBuilder {
	ctx := context.WithValue(b.req.Context(), key, val)
	b.req = b.req.WithContext(ctx)
	return b
}

func (b *TestRequestBuilder) Request() *http.Request {
	return b.req.Clone(b.req.Context())
}
