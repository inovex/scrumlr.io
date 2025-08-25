package api

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/go-chi/chi/v5"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
	"scrumlr.io/server/sessions"
)

// Test suite for AnonymousCustomTemplateCreationContext middleware
func TestAnonymousCustomTemplateCreationContext(t *testing.T) {
	userID := uuid.New()
	
	tests := []struct {
		name                            string
		allowAnonymousCustomTemplates   bool
		userAccountType                 common.AccountType
		expectedStatus                  int
		expectedToCallNext              bool
	}{
		{
			name:                            "authenticated user can create templates when flag is disabled",
			allowAnonymousCustomTemplates:   false,
			userAccountType:                 common.Google,
			expectedStatus:                  http.StatusOK,
			expectedToCallNext:              true,
		},
		{
			name:                            "authenticated user can create templates when flag is enabled",
			allowAnonymousCustomTemplates:   true,
			userAccountType:                 common.Google,
			expectedStatus:                  http.StatusOK,
			expectedToCallNext:              true,
		},
		{
			name:                            "anonymous user can create templates when flag is enabled",
			allowAnonymousCustomTemplates:   true,
			userAccountType:                 common.Anonymous,
			expectedStatus:                  http.StatusOK,
			expectedToCallNext:              true,
		},
		{
			name:                            "anonymous user receives 403 forbidden when allowAnonymousCustomTemplates is false",
			allowAnonymousCustomTemplates:   false,
			userAccountType:                 common.Anonymous,
			expectedStatus:                  http.StatusForbidden,
			expectedToCallNext:              false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create mock user service with test user
			mockUsers := sessions.NewMockUserService(t)
			mockUsers.EXPECT().Get(mock.Anything, userID).Return(&sessions.User{
				ID:          userID,
				Name:        "Test User",
				AccountType: tt.userAccountType,
			}, nil)

			// Create server with test configuration
			server := &Server{
				users:                         mockUsers,
				allowAnonymousCustomTemplates: tt.allowAnonymousCustomTemplates,
			}

			// Create test request with user context
			req := httptest.NewRequest("POST", "/templates", nil)
			ctx := context.WithValue(req.Context(), identifiers.UserIdentifier, userID)
			req = req.WithContext(ctx)

			// Create response recorder
			rr := httptest.NewRecorder()

			// Track if next handler was called
			nextCalled := false
			next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
				nextCalled = true
				w.WriteHeader(http.StatusOK)
			})

			// Call the middleware
			handler := server.AnonymousCustomTemplateCreationContext(next)
			handler.ServeHTTP(rr, req)

			// Verify results
			assert.Equal(t, tt.expectedStatus, rr.Code, "Expected status code %d, got %d", tt.expectedStatus, rr.Code)
			assert.Equal(t, tt.expectedToCallNext, nextCalled, "Expected next handler called: %v, got: %v", tt.expectedToCallNext, nextCalled)

			if tt.expectedStatus == http.StatusForbidden {
				assert.Contains(t, rr.Body.String(), "not authorized to create custom templates anonymously")
			}
		})
	}
}

func TestAnonymousCustomTemplateCreationContext_UserNotFound(t *testing.T) {
	userID := uuid.New()

	// Create mock user service that returns error when user not found
	mockUsers := sessions.NewMockUserService(t)
	mockUsers.EXPECT().Get(mock.Anything, userID).Return(nil, assert.AnError)

	server := &Server{
		users:                         mockUsers,
		allowAnonymousCustomTemplates: true,
	}

	req := httptest.NewRequest("POST", "/templates", nil)
	ctx := context.WithValue(req.Context(), identifiers.UserIdentifier, userID)
	req = req.WithContext(ctx)

	rr := httptest.NewRecorder()

	nextCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
	})

	handler := server.AnonymousCustomTemplateCreationContext(next)
	handler.ServeHTTP(rr, req)

	// Should return internal server error when user is not found
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
	assert.False(t, nextCalled)
}

func TestAnonymousCustomTemplateCreationContext_MissingUserContext(t *testing.T) {
	server := &Server{
		allowAnonymousCustomTemplates: true,
	}

	req := httptest.NewRequest("POST", "/templates", nil)
	// Note: Not adding user to context to test missing user scenario

	rr := httptest.NewRecorder()

	nextCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
	})

	handler := server.AnonymousCustomTemplateCreationContext(next)
	handler.ServeHTTP(rr, req)

	// Should return internal server error when user context is missing
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
	assert.False(t, nextCalled)
}

// Note: Individual endpoint tests would require proper mocking of the board template service.
// For now, we focus on middleware testing which is the core requirement.

// Integration test for the middleware applied to all /templates routes
func TestTemplateRoutesMiddlewareIntegration(t *testing.T) {
	tests := []struct {
		name                            string
		method                          string
		path                            string
		allowAnonymousCustomTemplates   bool
		userAccountType                 common.AccountType
		expectedStatus                  int
	}{
		// POST /templates
		{
			name:                            "POST /templates - anonymous user blocked when flag disabled",
			method:                          "POST",
			path:                            "/templates",
			allowAnonymousCustomTemplates:   false,
			userAccountType:                 common.Anonymous,
			expectedStatus:                  http.StatusForbidden,
		},
		{
			name:                            "POST /templates - anonymous user allowed when flag enabled",
			method:                          "POST",
			path:                            "/templates",
			allowAnonymousCustomTemplates:   true,
			userAccountType:                 common.Anonymous,
			expectedStatus:                  http.StatusOK,
		},
		// GET /templates
		{
			name:                            "GET /templates - anonymous user blocked when flag disabled",
			method:                          "GET",
			path:                            "/templates",
			allowAnonymousCustomTemplates:   false,
			userAccountType:                 common.Anonymous,
			expectedStatus:                  http.StatusForbidden,
		},
		// GET /templates/{id}
		{
			name:                            "GET /templates/id - anonymous user blocked when flag disabled",
			method:                          "GET",
			path:                            "/templates/" + uuid.New().String(),
			allowAnonymousCustomTemplates:   false,
			userAccountType:                 common.Anonymous,
			expectedStatus:                  http.StatusForbidden,
		},
		// PUT /templates/{id}
		{
			name:                            "PUT /templates/id - anonymous user blocked when flag disabled",
			method:                          "PUT",
			path:                            "/templates/" + uuid.New().String(),
			allowAnonymousCustomTemplates:   false,
			userAccountType:                 common.Anonymous,
			expectedStatus:                  http.StatusForbidden,
		},
		// DELETE /templates/{id}
		{
			name:                            "DELETE /templates/id - anonymous user blocked when flag disabled",
			method:                          "DELETE",
			path:                            "/templates/" + uuid.New().String(),
			allowAnonymousCustomTemplates:   false,
			userAccountType:                 common.Anonymous,
			expectedStatus:                  http.StatusForbidden,
		},
		// Authenticated users should always pass
		{
			name:                            "Authenticated user always allowed",
			method:                          "POST",
			path:                            "/templates",
			allowAnonymousCustomTemplates:   false,
			userAccountType:                 common.Google,
			expectedStatus:                  http.StatusOK,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			userID := uuid.New()

			// Create mock user service
			mockUsers := sessions.NewMockUserService(t)
			mockUsers.EXPECT().Get(mock.Anything, userID).Return(&sessions.User{
				ID:          userID,
				Name:        "Test User",
				AccountType: tt.userAccountType,
			}, nil)

			// Create server with middleware
			server := &Server{
				users:                         mockUsers,
				allowAnonymousCustomTemplates: tt.allowAnonymousCustomTemplates,
			}

			// Create router with the same structure as the actual router
			r := chi.NewRouter()
			r.Route("/templates", func(r chi.Router) {
				r.Use(server.AnonymousCustomTemplateCreationContext)
				
				// Simple handlers that return 200 OK to test middleware behavior
				r.Post("/", func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(http.StatusOK)
				})
				r.Get("/", func(w http.ResponseWriter, r *http.Request) {
					w.WriteHeader(http.StatusOK)
				})
				r.Route("/{id}", func(r chi.Router) {
					r.Get("/", func(w http.ResponseWriter, r *http.Request) {
						w.WriteHeader(http.StatusOK)
					})
					r.Put("/", func(w http.ResponseWriter, r *http.Request) {
						w.WriteHeader(http.StatusOK)
					})
					r.Delete("/", func(w http.ResponseWriter, r *http.Request) {
						w.WriteHeader(http.StatusOK)
					})
				})
			})

			// Create request
			req := httptest.NewRequest(tt.method, tt.path, nil)
			ctx := context.WithValue(req.Context(), identifiers.UserIdentifier, userID)
			req = req.WithContext(ctx)

			// Create response recorder
			rr := httptest.NewRecorder()

			// Execute request
			r.ServeHTTP(rr, req)

			// Verify status
			assert.Equal(t, tt.expectedStatus, rr.Code, "Expected status %d for %s %s, got %d", tt.expectedStatus, tt.method, tt.path, rr.Code)

			if tt.expectedStatus == http.StatusForbidden {
				assert.Contains(t, rr.Body.String(), "not authorized to create custom templates anonymously")
			}
		})
	}
}