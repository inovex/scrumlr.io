package common

import (
	"net/http"
	"testing"

	"github.com/stretchr/testify/assert"
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
func TestGetTopLevelHostnameWithPublicSuffix(t *testing.T) {
	r := http.Request{Host: "example.stackit.rocks"}
	assert.Equal(t, "example.stackit.rocks", GetTopLevelHost(&r))
}

func TestGetTopLevelHostnameWithPublicSuffixWithoutSubdomain(t *testing.T) {
	r := http.Request{Host: "stackit.rocks"}
	assert.Equal(t, "", GetTopLevelHost(&r))
}

func TestDomainOfSealedCookieWithPublicSuffix(t *testing.T) {
	r := http.Request{Host: "example.stackit.rocks"}
	c := http.Cookie{}

	SealCookie(&r, &c)

	assert.Equal(t, "example.stackit.rocks", c.Domain)
}

func TestDomainOfSealedCookieWithPublicSuffixWithoutSubdomain(t *testing.T) {
	r := http.Request{Host: "stackit.rocks"}
	c := http.Cookie{}

	SealCookie(&r, &c)

	assert.Equal(t, "", c.Domain)
}
