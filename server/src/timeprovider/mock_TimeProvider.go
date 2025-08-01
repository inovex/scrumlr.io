// Code generated by mockery; DO NOT EDIT.
// github.com/vektra/mockery
// template: testify

package timeprovider

import (
	"time"

	mock "github.com/stretchr/testify/mock"
)

// NewMockTimeProvider creates a new instance of MockTimeProvider. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockTimeProvider(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockTimeProvider {
	mock := &MockTimeProvider{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}

// MockTimeProvider is an autogenerated mock type for the TimeProvider type
type MockTimeProvider struct {
	mock.Mock
}

type MockTimeProvider_Expecter struct {
	mock *mock.Mock
}

func (_m *MockTimeProvider) EXPECT() *MockTimeProvider_Expecter {
	return &MockTimeProvider_Expecter{mock: &_m.Mock}
}

// Now provides a mock function for the type MockTimeProvider
func (_mock *MockTimeProvider) Now() time.Time {
	ret := _mock.Called()

	if len(ret) == 0 {
		panic("no return value specified for Now")
	}

	var r0 time.Time
	if returnFunc, ok := ret.Get(0).(func() time.Time); ok {
		r0 = returnFunc()
	} else {
		r0 = ret.Get(0).(time.Time)
	}
	return r0
}

// MockTimeProvider_Now_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Now'
type MockTimeProvider_Now_Call struct {
	*mock.Call
}

// Now is a helper method to define mock.On call
func (_e *MockTimeProvider_Expecter) Now() *MockTimeProvider_Now_Call {
	return &MockTimeProvider_Now_Call{Call: _e.mock.On("Now")}
}

func (_c *MockTimeProvider_Now_Call) Run(run func()) *MockTimeProvider_Now_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run()
	})
	return _c
}

func (_c *MockTimeProvider_Now_Call) Return(time1 time.Time) *MockTimeProvider_Now_Call {
	_c.Call.Return(time1)
	return _c
}

func (_c *MockTimeProvider_Now_Call) RunAndReturn(run func() time.Time) *MockTimeProvider_Now_Call {
	_c.Call.Return(run)
	return _c
}
