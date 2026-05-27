package api

import (
	"testing"

	"github.com/stretchr/testify/suite"
)

type PathJoinTestSuite struct {
	suite.Suite
}

func TestPathJoinTestSuite(t *testing.T) {
	suite.Run(t, new(PathJoinTestSuite))
}

type pathJoinCase struct {
	name      string
	redirects []string
	expected  string
}

func (suite *PathJoinTestSuite) TestPathJoin() {
	cases := []pathJoinCase{
		{
			name:      "empty redirects, return root",
			redirects: []string{},
			expected:  "/",
		},
		{
			name:      "all empty",
			redirects: []string{"", ""},
			expected:  "/",
		},
		{
			name:      "nil redirects, return root",
			redirects: nil,
			expected:  "/",
		},
		{
			name:      "one item",
			redirects: []string{"api"},
			expected:  "/api",
		},
		{
			name:      "trim leading and trailing slashes",
			redirects: []string{"/api/", "/v1/", "/users/"},
			expected:  "/api/v1/users",
		},
		{
			name:      "skip slash-only segments",
			redirects: []string{"/", "///", "api", "//users//"},
			expected:  "/api/users",
		},
		{
			name:      "several items",
			redirects: []string{"to", "stan", "and", "back"},
			expected:  "/to/stan/and/back",
		},
		{
			name:      "website",
			redirects: []string{"http://www.scrumlr.io", "stan", "and", "back"},
			expected:  "http://www.scrumlr.io/stan/and/back",
		},
		{
			name:      "secure website",
			redirects: []string{"https://www.scrumlr.io", "stan", "and", "back"},
			expected:  "https://www.scrumlr.io/stan/and/back",
		},
		{
			name:      "url only keeps host without trailing slash",
			redirects: []string{"https://www.scrumlr.io/"},
			expected:  "https://www.scrumlr.io",
		},
		{
			name:      "httpx is treated like regular path",
			redirects: []string{"httpx", "path"},
			expected:  "/httpx/path",
		},
	}
	for _, c := range cases {
		suite.Run(c.name, func() {
			actual := PathJoiner(c.redirects)
			suite.Equal(c.expected, actual)
		})
	}
}
