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
			basePath: "/",
			input:    "/boards/123",
			expected: "/boards/123",
		},
		{
			name:     "root base path with root path",
			basePath: "/",
			input:    "/",
			expected: "/",
		},
		{
			name:     "sub base path with sub-path",
			basePath: "/api",
			input:    "/boards/123",
			expected: "/api/boards/123",
		},
		{
			name:     "sub base path with root path",
			basePath: "/api",
			input:    "/",
			expected: "/api/",
		},
		{
			name:     "local development configuration",
			basePath: "/",
			input:    "/boards/abc",
			expected: "/boards/abc",
		},
	}

	for _, tt := range tests {
		suite.Run(tt.name, func() {
			s := &Server{
				basePath: tt.basePath,
			}
			suite.Equal(tt.expected, s.buildRelativeURL(tt.input))
		})
	}
}

// TestAbsURL_DoesNotUseRequestHost verifies that the Location header set by a handler
// uses the configured baseURL and not r.Host to prevent Host Header Injection.
func (suite *RouterTestSuite) TestAbsURL_DoesNotUseRequestHost() {
	s := &Server{
		basePath: "/api",
	}

	// Simulate an attacker-controlled Host header
	req := httptest.NewRequest(http.MethodGet, "/", nil)
	req.Host = "evil.com"

	w := httptest.NewRecorder()
	w.Header().Set("Location", s.buildRelativeURL("/"))
	w.WriteHeader(http.StatusSeeOther)

	location := w.Result().Header.Get("Location")
	suite.Equal("/api/", location)
	suite.NotContains(location, "evil.com", "Location header must not contain attacker-controlled Host header value")
}
