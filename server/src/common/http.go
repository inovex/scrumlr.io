package common

import (
	"net"
	"net/http"
	"scrumlr.io/server/logger"
	"strings"

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
		cookie.SameSite = http.SameSiteStrictMode
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
