package api

import (
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/suite"
)

type RouterTestSuite struct {
	suite.Suite
}

func TestRouterTestSuite(t *testing.T) {
	suite.Run(t, new(RouterTestSuite))
}

// TestAbsURL verifies that absURL correctly constructs absolute URLs from various
// server configurations and input paths.
func (suite *RouterTestSuite) TestAbsURL() {
	tests := []struct {
		name     string
		baseURL  string
		basePath string
		input    string
		expected string
	}{
		{
			name:     "root base path with sub-path",
			baseURL:  "https://scrumlr.io",
			basePath: "/",
			input:    "/boards/123",
			expected: "https://scrumlr.io/boards/123",
		},
		{
			name:     "root base path with root path",
			baseURL:  "https://scrumlr.io",
			basePath: "/",
			input:    "/",
			expected: "https://scrumlr.io/",
		},
		{
			name:     "sub base path with sub-path",
			baseURL:  "https://scrumlr.io",
			basePath: "/api",
			input:    "/boards/123",
			expected: "https://scrumlr.io/api/boards/123",
		},
		{
			name:     "sub base path with root path",
			baseURL:  "https://scrumlr.io",
			basePath: "/api",
			input:    "/",
			expected: "https://scrumlr.io/api/",
		},
		{
			name:     "trailing slash in baseURL is stripped",
			baseURL:  "https://scrumlr.io/",
			basePath: "/",
			input:    "/boards/123",
			expected: "https://scrumlr.io/boards/123",
		},
		{
			name:     "local development configuration",
			baseURL:  "http://localhost:8080",
			basePath: "/",
			input:    "/boards/abc",
			expected: "http://localhost:8080/boards/abc",
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := &Server{
				baseURL:  tt.baseURL,
				basePath: tt.basePath,
			}
			suite.Equal(tt.expected, s.absURL(tt.input))
		})
	}
}

// TestAbsURL_DoesNotUseRequestHost verifies that the Location header set by a handler
// uses the configured baseURL and not r.Host to prevent Host Header Injection.
func (suite *RouterTestSuite) TestAbsURL_DoesNotUseRequestHost() {
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
