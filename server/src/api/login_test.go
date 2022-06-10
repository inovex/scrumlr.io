package api

import (
	"github.com/stretchr/testify/assert"
	"net/http"
	"testing"
)

func TestDomainOfSealedCookieWithPort(t *testing.T) {
	s := new(Server)
	r := http.Request{Host: "beta.scrumlr.io:3000"}
	c := http.Cookie{}

	s.sealCookie(&r, &c)

	assert.Equal(t, "scrumlr.io", c.Domain)
}

func TestDomainOfSealedCookieWithoutPort(t *testing.T) {
	s := new(Server)
	r := http.Request{Host: "beta.scrumlr.io"}
	c := http.Cookie{}

	s.sealCookie(&r, &c)

	assert.Equal(t, "scrumlr.io", c.Domain)
}
