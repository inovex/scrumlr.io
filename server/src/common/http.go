package common

import (
	"fmt"
	"net"
	"net/http"
	"strings"
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
	hostWithSubdomain := strings.Split(hostname, ".")
	if len(hostWithSubdomain) >= 2 {
		return fmt.Sprintf("%s.%s", hostWithSubdomain[len(hostWithSubdomain)-2], hostWithSubdomain[len(hostWithSubdomain)-1])
	}

	return hostname
}

func GetHostWithoutPort(r *http.Request) string {
	hostname := r.Host
	if strings.Contains(hostname, ":") {
		hostname, _, _ = net.SplitHostPort(hostname)
	}
	return hostname
}
