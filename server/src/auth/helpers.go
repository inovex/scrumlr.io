package auth

import (
	"fmt"
	"net"
	"net/http"
	"strings"

	"scrumlr.io/server/logger"

	"github.com/golang-jwt/jwt/v5"
	"github.com/weppos/publicsuffix-go/publicsuffix"
)

func GetProtocol(r *http.Request) string {
	if strings.HasPrefix(r.Header.Get("Origin"), "https") {
		return "https"
	}
	return "http"
}

func SealCookie(r *http.Request, cookie *http.Cookie) {
	if GetProtocol(r) == "https" {
		cookie.Secure = true
	}
	cookie.Domain = GetTopLevelHost(r)
	cookie.HttpOnly = true
}

func GetTopLevelHost(r *http.Request) string {
	hostname := GetHostWithoutPort(r)
	domain, err := publicsuffix.Domain(hostname)
	if err != nil {
		logger.Get().Warnw("Error getting domain", "hostname", hostname, "err", err)
		return ""
	}
	return domain
}

func GetHostWithoutPort(r *http.Request) string {
	hostname := r.Host
	if strings.Contains(hostname, ":") {
		hostname, _, _ = net.SplitHostPort(hostname)
	}
	return hostname
}

func CreateCookie(name, value, path string, maxAge int, override *http.SameSite) *http.Cookie {
	cookie := &http.Cookie{
		Name:     name,
		Value:    value,
		Path:     path,
		MaxAge:   maxAge,
		SameSite: http.SameSiteStrictMode,
	}
	if override != nil {
		cookie.SameSite = *override
	}
	return cookie
}

func GetClaim(claim string, allClaims jwt.MapClaims) string {
	if claim == "" {
		return ""
	}
	val, ok := allClaims[claim]
	if !ok || val == nil {
		return ""
	}
	return fmt.Sprint(val)
}
