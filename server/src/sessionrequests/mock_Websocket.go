// Code generated by mockery; DO NOT EDIT.
// github.com/vektra/mockery
// template: testify

package sessionrequests

import (
	"net/http"

	"github.com/google/uuid"
	"github.com/gorilla/websocket"
	mock "github.com/stretchr/testify/mock"
)

// NewMockWebsocket creates a new instance of MockWebsocket. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockWebsocket(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockWebsocket {
	mock := &MockWebsocket{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}

// MockWebsocket is an autogenerated mock type for the Websocket type
type MockWebsocket struct {
	mock.Mock
}

type MockWebsocket_Expecter struct {
	mock *mock.Mock
}

func (_m *MockWebsocket) EXPECT() *MockWebsocket_Expecter {
	return &MockWebsocket_Expecter{mock: &_m.Mock}
}

// OpenSocket provides a mock function for the type MockWebsocket
func (_mock *MockWebsocket) OpenSocket(w http.ResponseWriter, r *http.Request) {
	_mock.Called(w, r)
	return
}

// MockWebsocket_OpenSocket_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'OpenSocket'
type MockWebsocket_OpenSocket_Call struct {
	*mock.Call
}

// OpenSocket is a helper method to define mock.On call
//   - w http.ResponseWriter
//   - r *http.Request
func (_e *MockWebsocket_Expecter) OpenSocket(w interface{}, r interface{}) *MockWebsocket_OpenSocket_Call {
	return &MockWebsocket_OpenSocket_Call{Call: _e.mock.On("OpenSocket", w, r)}
}

func (_c *MockWebsocket_OpenSocket_Call) Run(run func(w http.ResponseWriter, r *http.Request)) *MockWebsocket_OpenSocket_Call {
	_c.Call.Run(func(args mock.Arguments) {
		var arg0 http.ResponseWriter
		if args[0] != nil {
			arg0 = args[0].(http.ResponseWriter)
		}
		var arg1 *http.Request
		if args[1] != nil {
			arg1 = args[1].(*http.Request)
		}
		run(
			arg0,
			arg1,
		)
	})
	return _c
}

func (_c *MockWebsocket_OpenSocket_Call) Return() *MockWebsocket_OpenSocket_Call {
	_c.Call.Return()
	return _c
}

func (_c *MockWebsocket_OpenSocket_Call) RunAndReturn(run func(w http.ResponseWriter, r *http.Request)) *MockWebsocket_OpenSocket_Call {
	_c.Run(run)
	return _c
}

// closeSocket provides a mock function for the type MockWebsocket
func (_mock *MockWebsocket) closeSocket(conn *websocket.Conn) {
	_mock.Called(conn)
	return
}

// MockWebsocket_closeSocket_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'closeSocket'
type MockWebsocket_closeSocket_Call struct {
	*mock.Call
}

// closeSocket is a helper method to define mock.On call
//   - conn *websocket.Conn
func (_e *MockWebsocket_Expecter) closeSocket(conn interface{}) *MockWebsocket_closeSocket_Call {
	return &MockWebsocket_closeSocket_Call{Call: _e.mock.On("closeSocket", conn)}
}

func (_c *MockWebsocket_closeSocket_Call) Run(run func(conn *websocket.Conn)) *MockWebsocket_closeSocket_Call {
	_c.Call.Run(func(args mock.Arguments) {
		var arg0 *websocket.Conn
		if args[0] != nil {
			arg0 = args[0].(*websocket.Conn)
		}
		run(
			arg0,
		)
	})
	return _c
}

func (_c *MockWebsocket_closeSocket_Call) Return() *MockWebsocket_closeSocket_Call {
	_c.Call.Return()
	return _c
}

func (_c *MockWebsocket_closeSocket_Call) RunAndReturn(run func(conn *websocket.Conn)) *MockWebsocket_closeSocket_Call {
	_c.Run(run)
	return _c
}

// listenOnBoardSessionRequest provides a mock function for the type MockWebsocket
func (_mock *MockWebsocket) listenOnBoardSessionRequest(boardID uuid.UUID, userID uuid.UUID, conn *websocket.Conn) {
	_mock.Called(boardID, userID, conn)
	return
}

// MockWebsocket_listenOnBoardSessionRequest_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'listenOnBoardSessionRequest'
type MockWebsocket_listenOnBoardSessionRequest_Call struct {
	*mock.Call
}

// listenOnBoardSessionRequest is a helper method to define mock.On call
//   - boardID uuid.UUID
//   - userID uuid.UUID
//   - conn *websocket.Conn
func (_e *MockWebsocket_Expecter) listenOnBoardSessionRequest(boardID interface{}, userID interface{}, conn interface{}) *MockWebsocket_listenOnBoardSessionRequest_Call {
	return &MockWebsocket_listenOnBoardSessionRequest_Call{Call: _e.mock.On("listenOnBoardSessionRequest", boardID, userID, conn)}
}

func (_c *MockWebsocket_listenOnBoardSessionRequest_Call) Run(run func(boardID uuid.UUID, userID uuid.UUID, conn *websocket.Conn)) *MockWebsocket_listenOnBoardSessionRequest_Call {
	_c.Call.Run(func(args mock.Arguments) {
		var arg0 uuid.UUID
		if args[0] != nil {
			arg0 = args[0].(uuid.UUID)
		}
		var arg1 uuid.UUID
		if args[1] != nil {
			arg1 = args[1].(uuid.UUID)
		}
		var arg2 *websocket.Conn
		if args[2] != nil {
			arg2 = args[2].(*websocket.Conn)
		}
		run(
			arg0,
			arg1,
			arg2,
		)
	})
	return _c
}

func (_c *MockWebsocket_listenOnBoardSessionRequest_Call) Return() *MockWebsocket_listenOnBoardSessionRequest_Call {
	_c.Call.Return()
	return _c
}

func (_c *MockWebsocket_listenOnBoardSessionRequest_Call) RunAndReturn(run func(boardID uuid.UUID, userID uuid.UUID, conn *websocket.Conn)) *MockWebsocket_listenOnBoardSessionRequest_Call {
	_c.Run(run)
	return _c
}
