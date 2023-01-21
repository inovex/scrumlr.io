package common

import (
	"github.com/stretchr/testify/assert"
	"net/http"
	"testing"
)

func TestDomainOfSealedCookieWithPort(t *testing.T) {
	r := http.Request{Host: "beta.scrumlr.io:3000"}
	c := http.Cookie{}

	SealCookie(&r, &c)

	assert.Equal(t, "scrumlr.io", c.Domain)
}

func TestDomainOfSealedCookieWithoutPort(t *testing.T) {
	r := http.Request{Host: "beta.scrumlr.io"}
	c := http.Cookie{}

	SealCookie(&r, &c)

	assert.Equal(t, "scrumlr.io", c.Domain)
}

func TestGetTopLevelHostnameWithSubdomain(t *testing.T) {
	r := http.Request{Host: "beta.scrumlr.io"}
	assert.Equal(t, "scrumlr.io", GetTopLevelHost(&r))
}

func TestGetTopLevelHostnameWithoutSubdomain(t *testing.T) {
	r := http.Request{Host: "scrumlr.io"}
	assert.Equal(t, "scrumlr.io", GetTopLevelHost(&r))
}

func TestGetTopLevelHostnameWithSubdomainAndPort(t *testing.T) {
	r := http.Request{Host: "beta.scrumlr.io:3000"}
	assert.Equal(t, "scrumlr.io", GetTopLevelHost(&r))
}

func TestGetHostnameWithoutPortWithPort(t *testing.T) {
	r := http.Request{Host: "beta.scrumlr.io:3000"}
	assert.Equal(t, "beta.scrumlr.io", GetHostWithoutPort(&r))
}

func TestGetHostnameWithoutPortWithoutPort(t *testing.T) {
	r := http.Request{Host: "beta.scrumlr.io"}
	assert.Equal(t, "beta.scrumlr.io", GetHostWithoutPort(&r))
}
