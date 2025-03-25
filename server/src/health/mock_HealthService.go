// Code generated by mockery v2.52.3. DO NOT EDIT.

package health

import mock "github.com/stretchr/testify/mock"

// MockHealthService is an autogenerated mock type for the HealthService type
type MockHealthService struct {
	mock.Mock
}

type MockHealthService_Expecter struct {
	mock *mock.Mock
}

func (_m *MockHealthService) EXPECT() *MockHealthService_Expecter {
	return &MockHealthService_Expecter{mock: &_m.Mock}
}

// IsDatabaseHealthy provides a mock function with no fields
func (_m *MockHealthService) IsDatabaseHealthy() bool {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for IsDatabaseHealthy")
	}

	var r0 bool
	if rf, ok := ret.Get(0).(func() bool); ok {
		r0 = rf()
	} else {
		r0 = ret.Get(0).(bool)
	}

	return r0
}

// MockHealthService_IsDatabaseHealthy_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'IsDatabaseHealthy'
type MockHealthService_IsDatabaseHealthy_Call struct {
	*mock.Call
}

// IsDatabaseHealthy is a helper method to define mock.On call
func (_e *MockHealthService_Expecter) IsDatabaseHealthy() *MockHealthService_IsDatabaseHealthy_Call {
	return &MockHealthService_IsDatabaseHealthy_Call{Call: _e.mock.On("IsDatabaseHealthy")}
}

func (_c *MockHealthService_IsDatabaseHealthy_Call) Run(run func()) *MockHealthService_IsDatabaseHealthy_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run()
	})
	return _c
}

func (_c *MockHealthService_IsDatabaseHealthy_Call) Return(_a0 bool) *MockHealthService_IsDatabaseHealthy_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockHealthService_IsDatabaseHealthy_Call) RunAndReturn(run func() bool) *MockHealthService_IsDatabaseHealthy_Call {
	_c.Call.Return(run)
	return _c
}

// IsRealtimeHealthy provides a mock function with no fields
func (_m *MockHealthService) IsRealtimeHealthy() bool {
	ret := _m.Called()

	if len(ret) == 0 {
		panic("no return value specified for IsRealtimeHealthy")
	}

	var r0 bool
	if rf, ok := ret.Get(0).(func() bool); ok {
		r0 = rf()
	} else {
		r0 = ret.Get(0).(bool)
	}

	return r0
}

// MockHealthService_IsRealtimeHealthy_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'IsRealtimeHealthy'
type MockHealthService_IsRealtimeHealthy_Call struct {
	*mock.Call
}

// IsRealtimeHealthy is a helper method to define mock.On call
func (_e *MockHealthService_Expecter) IsRealtimeHealthy() *MockHealthService_IsRealtimeHealthy_Call {
	return &MockHealthService_IsRealtimeHealthy_Call{Call: _e.mock.On("IsRealtimeHealthy")}
}

func (_c *MockHealthService_IsRealtimeHealthy_Call) Run(run func()) *MockHealthService_IsRealtimeHealthy_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run()
	})
	return _c
}

func (_c *MockHealthService_IsRealtimeHealthy_Call) Return(_a0 bool) *MockHealthService_IsRealtimeHealthy_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockHealthService_IsRealtimeHealthy_Call) RunAndReturn(run func() bool) *MockHealthService_IsRealtimeHealthy_Call {
	_c.Call.Return(run)
	return _c
}

// NewMockHealthService creates a new instance of MockHealthService. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockHealthService(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockHealthService {
	mock := &MockHealthService{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
