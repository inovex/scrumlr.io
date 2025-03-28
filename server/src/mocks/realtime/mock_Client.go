// Code generated by mockery v2.52.3. DO NOT EDIT.

package realtime

import (
	mock "github.com/stretchr/testify/mock"
	realtime "scrumlr.io/server/realtime"
)

// MockClient is an autogenerated mock type for the Client type
type MockClient struct {
	mock.Mock
}

type MockClient_Expecter struct {
	mock *mock.Mock
}

func (_m *MockClient) EXPECT() *MockClient_Expecter {
	return &MockClient_Expecter{mock: &_m.Mock}
}

// Publish provides a mock function with given fields: subject, event
func (_m *MockClient) Publish(subject string, event interface{}) error {
	ret := _m.Called(subject, event)

	if len(ret) == 0 {
		panic("no return value specified for Publish")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(string, interface{}) error); ok {
		r0 = rf(subject, event)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockClient_Publish_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Publish'
type MockClient_Publish_Call struct {
	*mock.Call
}

// Publish is a helper method to define mock.On call
//   - subject string
//   - event interface{}
func (_e *MockClient_Expecter) Publish(subject interface{}, event interface{}) *MockClient_Publish_Call {
	return &MockClient_Publish_Call{Call: _e.mock.On("Publish", subject, event)}
}

func (_c *MockClient_Publish_Call) Run(run func(subject string, event interface{})) *MockClient_Publish_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(string), args[1].(interface{}))
	})
	return _c
}

func (_c *MockClient_Publish_Call) Return(_a0 error) *MockClient_Publish_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockClient_Publish_Call) RunAndReturn(run func(string, interface{}) error) *MockClient_Publish_Call {
	_c.Call.Return(run)
	return _c
}

// SubscribeToBoardEvents provides a mock function with given fields: subject
func (_m *MockClient) SubscribeToBoardEvents(subject string) (chan *realtime.BoardEvent, error) {
	ret := _m.Called(subject)

	if len(ret) == 0 {
		panic("no return value specified for SubscribeToBoardEvents")
	}

	var r0 chan *realtime.BoardEvent
	var r1 error
	if rf, ok := ret.Get(0).(func(string) (chan *realtime.BoardEvent, error)); ok {
		return rf(subject)
	}
	if rf, ok := ret.Get(0).(func(string) chan *realtime.BoardEvent); ok {
		r0 = rf(subject)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(chan *realtime.BoardEvent)
		}
	}

	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(subject)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockClient_SubscribeToBoardEvents_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'SubscribeToBoardEvents'
type MockClient_SubscribeToBoardEvents_Call struct {
	*mock.Call
}

// SubscribeToBoardEvents is a helper method to define mock.On call
//   - subject string
func (_e *MockClient_Expecter) SubscribeToBoardEvents(subject interface{}) *MockClient_SubscribeToBoardEvents_Call {
	return &MockClient_SubscribeToBoardEvents_Call{Call: _e.mock.On("SubscribeToBoardEvents", subject)}
}

func (_c *MockClient_SubscribeToBoardEvents_Call) Run(run func(subject string)) *MockClient_SubscribeToBoardEvents_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(string))
	})
	return _c
}

func (_c *MockClient_SubscribeToBoardEvents_Call) Return(_a0 chan *realtime.BoardEvent, _a1 error) *MockClient_SubscribeToBoardEvents_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockClient_SubscribeToBoardEvents_Call) RunAndReturn(run func(string) (chan *realtime.BoardEvent, error)) *MockClient_SubscribeToBoardEvents_Call {
	_c.Call.Return(run)
	return _c
}

// SubscribeToBoardSessionEvents provides a mock function with given fields: subject
func (_m *MockClient) SubscribeToBoardSessionEvents(subject string) (chan *realtime.BoardSessionRequestEventType, error) {
	ret := _m.Called(subject)

	if len(ret) == 0 {
		panic("no return value specified for SubscribeToBoardSessionEvents")
	}

	var r0 chan *realtime.BoardSessionRequestEventType
	var r1 error
	if rf, ok := ret.Get(0).(func(string) (chan *realtime.BoardSessionRequestEventType, error)); ok {
		return rf(subject)
	}
	if rf, ok := ret.Get(0).(func(string) chan *realtime.BoardSessionRequestEventType); ok {
		r0 = rf(subject)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(chan *realtime.BoardSessionRequestEventType)
		}
	}

	if rf, ok := ret.Get(1).(func(string) error); ok {
		r1 = rf(subject)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockClient_SubscribeToBoardSessionEvents_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'SubscribeToBoardSessionEvents'
type MockClient_SubscribeToBoardSessionEvents_Call struct {
	*mock.Call
}

// SubscribeToBoardSessionEvents is a helper method to define mock.On call
//   - subject string
func (_e *MockClient_Expecter) SubscribeToBoardSessionEvents(subject interface{}) *MockClient_SubscribeToBoardSessionEvents_Call {
	return &MockClient_SubscribeToBoardSessionEvents_Call{Call: _e.mock.On("SubscribeToBoardSessionEvents", subject)}
}

func (_c *MockClient_SubscribeToBoardSessionEvents_Call) Run(run func(subject string)) *MockClient_SubscribeToBoardSessionEvents_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(string))
	})
	return _c
}

func (_c *MockClient_SubscribeToBoardSessionEvents_Call) Return(_a0 chan *realtime.BoardSessionRequestEventType, _a1 error) *MockClient_SubscribeToBoardSessionEvents_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockClient_SubscribeToBoardSessionEvents_Call) RunAndReturn(run func(string) (chan *realtime.BoardSessionRequestEventType, error)) *MockClient_SubscribeToBoardSessionEvents_Call {
	_c.Call.Return(run)
	return _c
}

// NewMockClient creates a new instance of MockClient. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockClient(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockClient {
	mock := &MockClient{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
