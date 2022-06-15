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

func TestGetTopLevelHostnameWithSubdomain(t *testing.T) {
	r := http.Request{Host: "beta.scrumlr.io"}
	assert.Equal(t, "scrumlr.io", getTopLevelHostname(&r))
}

func TestGetTopLevelHostnameWithoutSubdomain(t *testing.T) {
	r := http.Request{Host: "scrumlr.io"}
	assert.Equal(t, "scrumlr.io", getTopLevelHostname(&r))
}

func TestGetTopLevelHostnameWithSubdomainAndPort(t *testing.T) {
	r := http.Request{Host: "beta.scrumlr.io:3000"}
	assert.Equal(t, "scrumlr.io", getTopLevelHostname(&r))
}

func TestGetHostnameWithoutPortWithPort(t *testing.T) {
	r := http.Request{Host: "beta.scrumlr.io:3000"}
	assert.Equal(t, "beta.scrumlr.io", getHostnameWithoutPort(&r))
}

func TestGetHostnameWithoutPortWithoutPort(t *testing.T) {
	r := http.Request{Host: "beta.scrumlr.io"}
	assert.Equal(t, "beta.scrumlr.io", getHostnameWithoutPort(&r))
}
