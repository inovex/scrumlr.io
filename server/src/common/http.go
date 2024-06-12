package common

import (
	"log"
	"net"
	"net/http"
	"strings"

	"golang.org/x/net/publicsuffix"
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
	eTLDPlusOne, err := publicsuffix.EffectiveTLDPlusOne(hostname)
	if err == nil {
		return eTLDPlusOne
	}
	log.Printf("Error getting top level domain for %s: %v", hostname, err)
	return hostname
}

func GetHostWithoutPort(r *http.Request) string {
	hostname := r.Host
	if strings.Contains(hostname, ":") {
		hostname, _, _ = net.SplitHostPort(hostname)
	}
	return hostname
}
