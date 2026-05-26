package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/suite"
)

type LoginTestSuite struct {
	suite.Suite
}

func TestLoginTestSuite(t *testing.T) {
	suite.Run(t, new(LoginTestSuite))
}

// TestAbsURL_RootBasePath verifies that absURL uses the configured baseURL and ignores
// any request-derived host when basePath is "/".
func (suite *LoginTestSuite) TestAbsURL_RootBasePath() {
	s := &Server{
		baseURL:  "https://scrumlr.io",
		basePath: "/",
	}

	suite.Equal("https://scrumlr.io/boards/123", s.absURL("/boards/123"))
	suite.Equal("https://scrumlr.io/", s.absURL("/"))
}

// TestAbsURL_SubBasePath verifies that absURL includes the basePath prefix when it is
// not "/".
func (suite *LoginTestSuite) TestAbsURL_SubBasePath() {
	s := &Server{
		baseURL:  "https://scrumlr.io",
		basePath: "/api",
	}

	suite.Equal("https://scrumlr.io/api/boards/123", s.absURL("/boards/123"))
	suite.Equal("https://scrumlr.io/api/", s.absURL("/"))
}

// TestAbsURL_TrailingSlashInBaseURL verifies that a trailing slash in baseURL is
// stripped to avoid double slashes.
func (suite *LoginTestSuite) TestAbsURL_TrailingSlashInBaseURL() {
	s := &Server{
		baseURL:  "https://scrumlr.io/",
		basePath: "/",
	}

	suite.Equal("https://scrumlr.io/boards/123", s.absURL("/boards/123"))
}

// TestAbsURL_LocalDev verifies typical local development configuration.
func (suite *LoginTestSuite) TestAbsURL_LocalDev() {
	s := &Server{
		baseURL:  "http://localhost:8080",
		basePath: "/",
	}

	suite.Equal("http://localhost:8080/boards/abc", s.absURL("/boards/abc"))
}

// TestAbsURL_DoesNotUseRequestHost verifies that the Location header set by a handler
// uses the configured baseURL and not r.Host to prevent Host Header Injection.
func (suite *LoginTestSuite) TestAbsURL_DoesNotUseRequestHost() {
	s := &Server{
		baseURL:  "https://scrumlr.io",
		basePath: "/",
	}

	// Simulate an attacker-controlled Host header
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Host = "evil.com"

	w := httptest.NewRecorder()
	w.Header().Set("Location", s.absURL("/"))
	w.WriteHeader(http.StatusSeeOther)

	location := w.Result().Header.Get("Location")
	suite.Equal("https://scrumlr.io/", location)
	suite.NotContains(location, "evil.com", "Location header must not contain attacker-controlled Host header value")
}
