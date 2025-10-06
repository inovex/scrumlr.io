package api

import (
	"context"
	"net/http"
	"net/http/httptest"
	"scrumlr.io/server/users"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/mock"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

func TestAnonymousBoardCreationContext(t *testing.T) {
	userID := uuid.New()

	tests := []struct {
		name                        string
		allowAnonymousBoardCreation bool
		userAccountType             common.AccountType
		expectedStatus              int
		expectedToCallNext          bool
	}{
		{
			name:                        "authenticated user can create boards when flag is disabled",
			allowAnonymousBoardCreation: false,
			userAccountType:             common.Google,
			expectedStatus:              http.StatusOK,
			expectedToCallNext:          true,
		},
		{
			name:                        "authenticated user can create boards when flag is enabled",
			allowAnonymousBoardCreation: true,
			userAccountType:             common.Google,
			expectedStatus:              http.StatusOK,
			expectedToCallNext:          true,
		},
		{
			name:                        "anonymous user can create boards when flag is enabled",
			allowAnonymousBoardCreation: true,
			userAccountType:             common.Anonymous,
			expectedStatus:              http.StatusOK,
			expectedToCallNext:          true,
		},
		{
			name:                        "anonymous user receives 403 forbidden when allowAnonymousBoardCreation is false",
			allowAnonymousBoardCreation: false,
			userAccountType:             common.Anonymous,
			expectedStatus:              http.StatusForbidden,
			expectedToCallNext:          false,
		},
	}

	for _, tt := range tests {
		t.Run(tt.name, func(t *testing.T) {
			// Create mock user service with test user
			mockUsers := users.NewMockUserService(t)
			mockUsers.EXPECT().Get(mock.Anything, userID).Return(&users.User{
				ID:          userID,
				Name:        "Test User",
				AccountType: tt.userAccountType,
			}, nil)

			// Create server with test configuration
			server := &Server{
				users:                       mockUsers,
				allowAnonymousBoardCreation: tt.allowAnonymousBoardCreation,
			}

			// Create test request with user context
			req := httptest.NewRequest("POST", "/boards", nil)
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
			handler := server.AnonymousBoardCreationContext(next)
			handler.ServeHTTP(rr, req)

			// Verify results
			assert.Equal(t, tt.expectedStatus, rr.Code, "Expected status code %d, got %d", tt.expectedStatus, rr.Code)
			assert.Equal(t, tt.expectedToCallNext, nextCalled, "Expected next handler called: %v, got: %v", tt.expectedToCallNext, nextCalled)

			if tt.expectedStatus == http.StatusForbidden {
				assert.Contains(t, rr.Body.String(), "not authorized to create boards anonymously")
			}
		})
	}
}

func TestAnonymousBoardCreationContext_UserNotFound(t *testing.T) {
	userID := uuid.New()

	// Create mock user service that returns error when user not found
	mockUsers := users.NewMockUserService(t)
	mockUsers.EXPECT().Get(mock.Anything, userID).Return(nil, assert.AnError)

	server := &Server{
		users:                       mockUsers,
		allowAnonymousBoardCreation: true,
	}

	req := httptest.NewRequest("POST", "/boards", nil)
	ctx := context.WithValue(req.Context(), identifiers.UserIdentifier, userID)
	req = req.WithContext(ctx)

	rr := httptest.NewRecorder()

	nextCalled := false
	next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		nextCalled = true
	})

	handler := server.AnonymousBoardCreationContext(next)
	handler.ServeHTTP(rr, req)

	// Should return internal server error when user is not found
	assert.Equal(t, http.StatusInternalServerError, rr.Code)
	assert.False(t, nextCalled)
}
