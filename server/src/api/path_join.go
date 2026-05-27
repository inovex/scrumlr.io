package api

import (
	"strings"
)

func PathJoiner(redirects []string) string {
	cleanedRedirects := make([]string, 0, len(redirects))

	for _, redirect := range redirects {
		redirect = strings.Trim(redirect, "/")
		if redirect == "" {
			continue
		}

		cleanedRedirects = append(cleanedRedirects, redirect)
	}

	if len(cleanedRedirects) == 0 {
		return "/"
	}

	if strings.HasPrefix(cleanedRedirects[0], "http://") || strings.HasPrefix(cleanedRedirects[0], "https://") {
		if len(cleanedRedirects) == 1 {
			return cleanedRedirects[0]
		}

		return cleanedRedirects[0] + "/" + strings.Join(cleanedRedirects[1:], "/")
	}

	return "/" + strings.Join(cleanedRedirects, "/")
}
