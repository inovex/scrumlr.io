package auth

import (
	"context"
	"crypto/rand"
	"crypto/rsa"
	"encoding/base64"
	"encoding/json"
	"math/big"
	"net/http"
	"net/http/httptest"
	"net/url"
	"strconv"
	"testing"
	"time"

	"github.com/coreos/go-oidc/v3/oidc"
	"github.com/golang-jwt/jwt/v5"
	"github.com/stretchr/testify/require"
	"golang.org/x/oauth2"
)

type mockOidcServer struct {
	server     *httptest.Server
	privateKey *rsa.PrivateKey
	keyId      string
	issuer     string

	userId      string
	userName    string
	userPicture string
}

func mockOidcContext(t *testing.T, serverUrl string) context.Context {
	t.Helper()

	u, err := url.Parse(serverUrl)
	require.NoError(t, err)

	client := &http.Client{
		Transport: &mockTransport{
			targetURL: u,
			transport: http.DefaultTransport,
		},
	}

	ctx := oidc.ClientContext(t.Context(), client)
	ctx = context.WithValue(ctx, oauth2.HTTPClient, client)

	return ctx
}

func newMockOidcServer(t *testing.T, basePath string, issuer string, userId string, userName string, userPicture string) *mockOidcServer {
	t.Helper()

	privateKey, err := rsa.GenerateKey(rand.Reader, 2048)
	require.NoError(t, err)
	keyId := "dev-key"

	mockServer := mockOidcServer{
		privateKey:  privateKey,
		keyId:       keyId,
		issuer:      issuer,
		userId:      userId,
		userName:    userName,
		userPicture: userPicture,
	}

	mux := http.NewServeMux()

	mux.HandleFunc(basePath+"/.well-known/openid-configuration", mockServer.wellKnown)
	mux.HandleFunc("/jwks", mockServer.jwks)
	mux.HandleFunc("/token", mockServer.token)
	mux.HandleFunc("/login/oauth/access_token", mockServer.accessToken)
	mux.HandleFunc("/user", mockServer.userInfo)

	mockServer.server = httptest.NewServer(mux)

	t.Cleanup(mockServer.server.Close)

	return &mockServer
}

func (server *mockOidcServer) wellKnown(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]string{
		"issuer":                 server.issuer,
		"authorization_endpoint": server.server.URL + "/auth",
		"token_endpoint":         server.server.URL + "/token",
		"jwks_uri":               server.server.URL + "/jwks",
		"userinfo_endpint":       server.server.URL + "/userinfo",
	})
}

func (server *mockOidcServer) jwks(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"keys": []map[string]string{
			{
				"kty": "RSA",
				"alg": "RS256",
				"use": "sig",
				"kid": server.keyId,
				"n":   base64.RawURLEncoding.EncodeToString(server.privateKey.N.Bytes()),
				"e":   base64.RawURLEncoding.EncodeToString(big.NewInt(int64(server.privateKey.E)).Bytes()),
			},
		},
	})
}

func (server *mockOidcServer) token(w http.ResponseWriter, r *http.Request) {
	claims := jwt.MapClaims{
		"iss":     server.issuer,
		"sub":     server.userId,
		"oid":     server.userId,
		"aud":     "test-client-id",
		"exp":     time.Now().Add(time.Hour).Unix(),
		"iat":     time.Now().Unix(),
		"name":    server.userName,
		"picture": server.userPicture,
	}

	token := jwt.NewWithClaims(jwt.SigningMethodRS256, claims)
	token.Header["kid"] = server.keyId
	signedToken, err := token.SignedString(server.privateKey)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"access_token": "mock-access-token",
		"token_type":   "Bearer",
		"expires_in":   3600,
		"id_token":     signedToken,
	})
}

func (server *mockOidcServer) accessToken(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")
	_ = json.NewEncoder(w).Encode(map[string]any{
		"access_token": "mock-access-token",
		"token_type":   "Bearer",
		"expires_in":   3600,
	})
}

func (server *mockOidcServer) userInfo(w http.ResponseWriter, r *http.Request) {
	w.Header().Set("Content-Type", "application/json")

	userId, err := strconv.Atoi(server.userId)
	if err != nil {
		http.Error(w, err.Error(), http.StatusInternalServerError)
		return
	}

	_ = json.NewEncoder(w).Encode(map[string]any{
		"id":         userId,
		"name":       server.userName,
		"avatar_url": server.userPicture,
	})
}

type mockTransport struct {
	targetURL *url.URL
	transport http.RoundTripper
}

func (t *mockTransport) RoundTrip(req *http.Request) (*http.Response, error) {
	request := req.Clone(req.Context())

	request.URL.Scheme = t.targetURL.Scheme
	request.URL.Host = t.targetURL.Host

	return t.transport.RoundTrip(request)
}
