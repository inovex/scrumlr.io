// Code generated by mockery v2.51.0. DO NOT EDIT.

package services

import (
	context "context"

	mock "github.com/stretchr/testify/mock"
)

// MockFeedback is an autogenerated mock type for the Feedback type
type MockFeedback struct {
	mock.Mock
}

type MockFeedback_Expecter struct {
	mock *mock.Mock
}

func (_m *MockFeedback) EXPECT() *MockFeedback_Expecter {
	return &MockFeedback_Expecter{mock: &_m.Mock}
}

// Create provides a mock function with given fields: ctx, feedbackType, contact, text
func (_m *MockFeedback) Create(ctx context.Context, feedbackType string, contact string, text string) error {
	ret := _m.Called(ctx, feedbackType, contact, text)

	if len(ret) == 0 {
		panic("no return value specified for Create")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, string, string, string) error); ok {
		r0 = rf(ctx, feedbackType, contact, text)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockFeedback_Create_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Create'
type MockFeedback_Create_Call struct {
	*mock.Call
}

// Create is a helper method to define mock.On call
//   - ctx context.Context
//   - feedbackType string
//   - contact string
//   - text string
func (_e *MockFeedback_Expecter) Create(ctx interface{}, feedbackType interface{}, contact interface{}, text interface{}) *MockFeedback_Create_Call {
	return &MockFeedback_Create_Call{Call: _e.mock.On("Create", ctx, feedbackType, contact, text)}
}

func (_c *MockFeedback_Create_Call) Run(run func(ctx context.Context, feedbackType string, contact string, text string)) *MockFeedback_Create_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(string), args[2].(string), args[3].(string))
	})
	return _c
}

func (_c *MockFeedback_Create_Call) Return(_a0 error) *MockFeedback_Create_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockFeedback_Create_Call) RunAndReturn(run func(context.Context, string, string, string) error) *MockFeedback_Create_Call {
	_c.Call.Return(run)
	return _c
}

// Enabled provides a mock function with no fields
func (_m *MockFeedback) Enabled() bool {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for Enabled")
	}

	var r0 bool
	if rf, ok := ret.Get(0).(func() bool); ok {
		r0 = rf()
	} else {
		r0 = ret.Get(0).(bool)
	}

	return r0
}

// MockFeedback_Enabled_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Enabled'
type MockFeedback_Enabled_Call struct {
	*mock.Call
}

// Enabled is a helper method to define mock.On call
func (_e *MockFeedback_Expecter) Enabled() *MockFeedback_Enabled_Call {
	return &MockFeedback_Enabled_Call{Call: _e.mock.On("Enabled")}
}

func (_c *MockFeedback_Enabled_Call) Run(run func()) *MockFeedback_Enabled_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run()
	})
	return _c
}

func (_c *MockFeedback_Enabled_Call) Return(_a0 bool) *MockFeedback_Enabled_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockFeedback_Enabled_Call) RunAndReturn(run func() bool) *MockFeedback_Enabled_Call {
	_c.Call.Return(run)
	return _c
}

// NewMockFeedback creates a new instance of MockFeedback. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockFeedback(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockFeedback {
	mock := &MockFeedback{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
