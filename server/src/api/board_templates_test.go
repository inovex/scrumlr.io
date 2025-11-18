package api

import (
  "bytes"
  "context"
  "encoding/json"
  "net/http"
  "net/http/httptest"
  "testing"

  "github.com/go-chi/jwtauth/v5"
  "github.com/google/uuid"
  "github.com/markbates/goth"
  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/mock"
  "scrumlr.io/server/auth"
  "scrumlr.io/server/boardtemplates"
  "scrumlr.io/server/columns"
  "scrumlr.io/server/columntemplates"
  "scrumlr.io/server/common"
  "scrumlr.io/server/identifiers"
  "scrumlr.io/server/serviceinitialize"
  "scrumlr.io/server/sessions"
  "scrumlr.io/server/users"
)

// createValidBoardTemplateRequest creates a valid board template request for testing
func createValidBoardTemplateRequest() boardtemplates.CreateBoardTemplateRequest {
  name := "Test Template"
  description := "Test Description"
  favourite := false
  visible := true
  index := 0

  return boardtemplates.CreateBoardTemplateRequest{
    Name:        &name,
    Description: &description,
    Favourite:   &favourite,
    Columns: []*columntemplates.ColumnTemplateRequest{
      {
        Name:        "To Do",
        Description: "Tasks to be done",
        Color:       columns.ColorBacklogBlue,
        Visible:     &visible,
        Index:       &index,
      },
    },
  }
}

// createValidBoardTemplateUpdateRequest creates a valid board template update request for testing
func createValidBoardTemplateUpdateRequest() boardtemplates.BoardTemplateUpdateRequest {
  name := "Updated Template"
  description := "Updated Description"
  favourite := true

  return boardtemplates.BoardTemplateUpdateRequest{
    Name:        &name,
    Description: &description,
    Favourite:   &favourite,
  }
}

// createTestAuth creates a minimal auth implementation for testing
// This allows requests to pass through without actual authentication
func createTestAuth() auth.Auth {
  return &testAuthService{}
}

// testAuthService implements auth.Auth interface for testing purposes
type testAuthService struct{}

func (t *testAuthService) Sign(_ map[string]interface{}) (string, error) {
  return "test-token", nil
}

func (t *testAuthService) Verifier() func(http.Handler) http.Handler {
  return func(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
      // Create proper JWT context using jwtauth library
      // Extract user ID from context if present, otherwise use test user ID
      userID := "test-user-id"
      if uid := r.Context().Value(identifiers.UserIdentifier); uid != nil {
        if userUUID, ok := uid.(uuid.UUID); ok {
          userID = userUUID.String()
        }
      }

      // Create JWT token and context using jwtauth
      tokenAuth := jwtauth.New("HS256", []byte("test-secret"), nil)
      claims := map[string]interface{}{"id": userID}
      token, _, _ := tokenAuth.Encode(claims)

      // Set the JWT context the way jwtauth expects it
      ctx := jwtauth.NewContext(r.Context(), token, nil)
      next.ServeHTTP(w, r.WithContext(ctx))
    })
  }
}

func (t *testAuthService) Authenticator() func(http.Handler) http.Handler {
  return func(next http.Handler) http.Handler {
    return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
      // Pass through without authentication for testing
      next.ServeHTTP(w, r)
    })
  }
}

func (t *testAuthService) Exists(_ common.AccountType) bool {
  return true
}

func (t *testAuthService) ExtractUserInformation(accountType common.AccountType, _ *goth.User) (*auth.UserInformation, error) {
  return &auth.UserInformation{
    Provider:  accountType,
    Ident:     "test-user",
    Name:      "Test User",
    AvatarURL: "",
  }, nil
}

// Test suite for AnonymousCustomTemplateCreationContext middleware
func TestAnonymousCustomTemplateCreationContext(t *testing.T) {
  userID := uuid.New()

  tests := []struct {
    name                          string
    allowAnonymousCustomTemplates bool
    userAccountType               common.AccountType
    expectedStatus                int
    expectedToCallNext            bool
  }{
    {
      name:                          "authenticated user can create templates when flag is disabled",
      allowAnonymousCustomTemplates: false,
      userAccountType:               common.Google,
      expectedStatus:                http.StatusOK,
      expectedToCallNext:            true,
    },
    {
      name:                          "authenticated user can create templates when flag is enabled",
      allowAnonymousCustomTemplates: true,
      userAccountType:               common.Google,
      expectedStatus:                http.StatusOK,
      expectedToCallNext:            true,
    },
    {
      name:                          "anonymous user can create templates when flag is enabled",
      allowAnonymousCustomTemplates: true,
      userAccountType:               common.Anonymous,
      expectedStatus:                http.StatusOK,
      expectedToCallNext:            true,
    },
    {
      name:                          "anonymous user receives 403 forbidden when allowAnonymousCustomTemplates is false",
      allowAnonymousCustomTemplates: false,
      userAccountType:               common.Anonymous,
      expectedStatus:                http.StatusForbidden,
      expectedToCallNext:            false,
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
  mockUsers := users.NewMockUserService(t)
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
    name                          string
    method                        string
    path                          string
    allowAnonymousCustomTemplates bool
    userAccountType               common.AccountType
    expectedStatus                int
    needsRequestBody              bool
    requestBodyType               string // "create" or "update"
  }{
    // POST /templates
    {
      name:                          "POST /templates - anonymous user blocked when flag disabled",
      method:                        "POST",
      path:                          "/templates",
      allowAnonymousCustomTemplates: false,
      userAccountType:               common.Anonymous,
      expectedStatus:                http.StatusForbidden,
    },
    {
      name:                          "POST /templates - anonymous user allowed when flag enabled",
      method:                        "POST",
      path:                          "/templates",
      allowAnonymousCustomTemplates: true,
      userAccountType:               common.Anonymous,
      expectedStatus:                http.StatusCreated,
      needsRequestBody:              true,
      requestBodyType:               "create",
    },
    // GET /templates
    {
      name:                          "GET /templates - anonymous user blocked when flag disabled",
      method:                        "GET",
      path:                          "/templates",
      allowAnonymousCustomTemplates: false,
      userAccountType:               common.Anonymous,
      expectedStatus:                http.StatusForbidden,
    },
    // GET /templates/{id}
    {
      name:                          "GET /templates/id - anonymous user blocked when flag disabled",
      method:                        "GET",
      path:                          "/templates/" + uuid.New().String(),
      allowAnonymousCustomTemplates: false,
      userAccountType:               common.Anonymous,
      expectedStatus:                http.StatusForbidden,
    },
    // PUT /templates/{id}
    {
      name:                          "PUT /templates/id - anonymous user blocked when flag disabled",
      method:                        "PUT",
      path:                          "/templates/" + uuid.New().String(),
      allowAnonymousCustomTemplates: false,
      userAccountType:               common.Anonymous,
      expectedStatus:                http.StatusForbidden,
    },
    // DELETE /templates/{id}
    {
      name:                          "DELETE /templates/id - anonymous user blocked when flag disabled",
      method:                        "DELETE",
      path:                          "/templates/" + uuid.New().String(),
      allowAnonymousCustomTemplates: false,
      userAccountType:               common.Anonymous,
      expectedStatus:                http.StatusForbidden,
    },
    // Authenticated users should always pass
    {
      name:                          "Authenticated user always allowed",
      method:                        "POST",
      path:                          "/templates",
      allowAnonymousCustomTemplates: false,
      userAccountType:               common.Google,
      expectedStatus:                http.StatusCreated,
      needsRequestBody:              true,
      requestBodyType:               "create",
    },
  }

  for _, tt := range tests {
    t.Run(tt.name, func(t *testing.T) {
      userID := uuid.New()

      // Create mock user service
      mockUsers := users.NewMockUserService(t)
      mockUsers.EXPECT().Get(mock.Anything, userID).Return(&users.User{
        ID:          userID,
        Name:        "Test User",
        AccountType: tt.userAccountType,
      }, nil)

      // Create mock services for dependencies required by the actual router
      mockBoardTemplates := boardtemplates.NewMockBoardTemplateService(t)
      mockColumnTemplates := columntemplates.NewMockColumnTemplateService(t)

      // Create a simple auth mock that allows all requests to pass
      mockAuth := createTestAuth()

      // Create mock handlers that return proper template objects
      templateID := uuid.New()
      templateName := "Test Template"
      templateDescription := "Test Description"
      favourite := false

      // Mock template response
      mockTemplate := &boardtemplates.BoardTemplate{
        ID:          templateID,
        Creator:     userID,
        Name:        &templateName,
        Description: &templateDescription,
        Favourite:   &favourite,
      }

      // Mock template full response for GetAll
      mockTemplateFull := &boardtemplates.BoardTemplateFull{
        Template:        mockTemplate,
        ColumnTemplates: []*columntemplates.ColumnTemplate{},
      }

      mockBoardTemplates.EXPECT().Create(mock.Anything, mock.Anything).Return(mockTemplate, nil).Maybe()
      mockBoardTemplates.EXPECT().GetAll(mock.Anything, mock.Anything).Return([]*boardtemplates.BoardTemplateFull{mockTemplateFull}, nil).Maybe()
      mockBoardTemplates.EXPECT().Get(mock.Anything, mock.Anything).Return(mockTemplate, nil).Maybe()
      mockBoardTemplates.EXPECT().Update(mock.Anything, mock.Anything).Return(mockTemplate, nil).Maybe()
      mockBoardTemplates.EXPECT().Delete(mock.Anything, mock.Anything).Return(nil).Maybe()

      sessionApiMock := sessions.NewMockSessionApi(t)
      next := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
        w.WriteHeader(http.StatusOK)
      })

      sessionApiMock.EXPECT().BoardParticipantContext(mock.Anything).Return(next)
      sessionApiMock.EXPECT().BoardModeratorContext(mock.Anything).Return(next)
      sessionServiceMock := sessions.NewMockSessionService(t)

      apiInitializer := serviceinitialize.NewApiInitializer("/")
      userApi := apiInitializer.InitializeUserApi(mockUsers, sessionServiceMock, false, false)
      routesInitializer := serviceinitialize.NewRoutesInitializer()
      userRoutes := routesInitializer.InitializeUserRoutes(userApi, sessionApiMock)
      sessionRoutes := routesInitializer.InitializeSessionRoutes(sessionApiMock)

      // Use the actual router from router.go with minimal mocked dependencies
      s := New(
        "/",      // basePath
        nil,      // realtime (not needed for templates)
        mockAuth, // auth
        userRoutes,
        sessionRoutes,
        nil,                              // boards
        nil,                              // columns
        nil,                              // votings
        mockUsers,                        // users
        nil,                              // notes
        nil,                              // reactions
        nil,                              // sessions
        nil,                              // sessionRequests
        nil,                              // health
        nil,                              // feedback
        nil,                              // boardReactions
        mockBoardTemplates,               // boardTemplates
        mockColumnTemplates,              // columntemplates
        false,                            // verbose
        true,                             // checkOrigin
        false,                            // anonymousLoginDisabled
        tt.allowAnonymousCustomTemplates, // allowAnonymousCustomTemplates
        false,                            // allowAnonymousBoardCreation
        false,                            // experimentalFileSystemStore
      )

      // Create request with body if needed
      var req *http.Request
      if tt.needsRequestBody {
        var body interface{}
        switch tt.requestBodyType {
        case "create":
          body = createValidBoardTemplateRequest()
        case "update":
          body = createValidBoardTemplateUpdateRequest()
        }

        bodyBytes, _ := json.Marshal(body)
        req = httptest.NewRequest(tt.method, tt.path, bytes.NewReader(bodyBytes))
        req.Header.Set("Content-Type", "application/json")
      } else {
        req = httptest.NewRequest(tt.method, tt.path, nil)
      }

      ctx := context.WithValue(req.Context(), identifiers.UserIdentifier, userID)
      req = req.WithContext(ctx)

      // Create response recorder
      rr := httptest.NewRecorder()

      // Execute request
      s.ServeHTTP(rr, req)

      // Verify status
      assert.Equal(t, tt.expectedStatus, rr.Code, "Expected status %d for %s %s, got %d", tt.expectedStatus, tt.method, tt.path, rr.Code)

      if tt.expectedStatus == http.StatusForbidden {
        assert.Contains(t, rr.Body.String(), "not authorized to create custom templates anonymously")
      }
    })
  }
}
