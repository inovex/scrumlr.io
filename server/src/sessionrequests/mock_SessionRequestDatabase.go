// Code generated by mockery; DO NOT EDIT.
// github.com/vektra/mockery
// template: testify

package sessionrequests

import (
	"github.com/google/uuid"
	mock "github.com/stretchr/testify/mock"
)

// NewMockSessionRequestDatabase creates a new instance of MockSessionRequestDatabase. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockSessionRequestDatabase(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockSessionRequestDatabase {
	mock := &MockSessionRequestDatabase{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}

// MockSessionRequestDatabase is an autogenerated mock type for the SessionRequestDatabase type
type MockSessionRequestDatabase struct {
	mock.Mock
}

type MockSessionRequestDatabase_Expecter struct {
	mock *mock.Mock
}

func (_m *MockSessionRequestDatabase) EXPECT() *MockSessionRequestDatabase_Expecter {
	return &MockSessionRequestDatabase_Expecter{mock: &_m.Mock}
}

// Create provides a mock function for the type MockSessionRequestDatabase
func (_mock *MockSessionRequestDatabase) Create(request DatabaseBoardSessionRequestInsert) (DatabaseBoardSessionRequest, error) {
	ret := _mock.Called(request)

	if len(ret) == 0 {
		panic("no return value specified for Create")
	}

	var r0 DatabaseBoardSessionRequest
	var r1 error
	if returnFunc, ok := ret.Get(0).(func(DatabaseBoardSessionRequestInsert) (DatabaseBoardSessionRequest, error)); ok {
		return returnFunc(request)
	}
	if returnFunc, ok := ret.Get(0).(func(DatabaseBoardSessionRequestInsert) DatabaseBoardSessionRequest); ok {
		r0 = returnFunc(request)
	} else {
		r0 = ret.Get(0).(DatabaseBoardSessionRequest)
	}
	if returnFunc, ok := ret.Get(1).(func(DatabaseBoardSessionRequestInsert) error); ok {
		r1 = returnFunc(request)
	} else {
		r1 = ret.Error(1)
	}
	return r0, r1
}

// MockSessionRequestDatabase_Create_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Create'
type MockSessionRequestDatabase_Create_Call struct {
	*mock.Call
}

// Create is a helper method to define mock.On call
//   - request DatabaseBoardSessionRequestInsert
func (_e *MockSessionRequestDatabase_Expecter) Create(request interface{}) *MockSessionRequestDatabase_Create_Call {
	return &MockSessionRequestDatabase_Create_Call{Call: _e.mock.On("Create", request)}
}

func (_c *MockSessionRequestDatabase_Create_Call) Run(run func(request DatabaseBoardSessionRequestInsert)) *MockSessionRequestDatabase_Create_Call {
	_c.Call.Run(func(args mock.Arguments) {
		var arg0 DatabaseBoardSessionRequestInsert
		if args[0] != nil {
			arg0 = args[0].(DatabaseBoardSessionRequestInsert)
		}
		run(
			arg0,
		)
	})
	return _c
}

func (_c *MockSessionRequestDatabase_Create_Call) Return(databaseBoardSessionRequest DatabaseBoardSessionRequest, err error) *MockSessionRequestDatabase_Create_Call {
	_c.Call.Return(databaseBoardSessionRequest, err)
	return _c
}

func (_c *MockSessionRequestDatabase_Create_Call) RunAndReturn(run func(request DatabaseBoardSessionRequestInsert) (DatabaseBoardSessionRequest, error)) *MockSessionRequestDatabase_Create_Call {
	_c.Call.Return(run)
	return _c
}

// Exists provides a mock function for the type MockSessionRequestDatabase
func (_mock *MockSessionRequestDatabase) Exists(board uuid.UUID, user uuid.UUID) (bool, error) {
	ret := _mock.Called(board, user)

	if len(ret) == 0 {
		panic("no return value specified for Exists")
	}

	var r0 bool
	var r1 error
	if returnFunc, ok := ret.Get(0).(func(uuid.UUID, uuid.UUID) (bool, error)); ok {
		return returnFunc(board, user)
	}
	if returnFunc, ok := ret.Get(0).(func(uuid.UUID, uuid.UUID) bool); ok {
		r0 = returnFunc(board, user)
	} else {
		r0 = ret.Get(0).(bool)
	}
	if returnFunc, ok := ret.Get(1).(func(uuid.UUID, uuid.UUID) error); ok {
		r1 = returnFunc(board, user)
	} else {
		r1 = ret.Error(1)
	}
	return r0, r1
}

// MockSessionRequestDatabase_Exists_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Exists'
type MockSessionRequestDatabase_Exists_Call struct {
	*mock.Call
}

// Exists is a helper method to define mock.On call
//   - board uuid.UUID
//   - user uuid.UUID
func (_e *MockSessionRequestDatabase_Expecter) Exists(board interface{}, user interface{}) *MockSessionRequestDatabase_Exists_Call {
	return &MockSessionRequestDatabase_Exists_Call{Call: _e.mock.On("Exists", board, user)}
}

func (_c *MockSessionRequestDatabase_Exists_Call) Run(run func(board uuid.UUID, user uuid.UUID)) *MockSessionRequestDatabase_Exists_Call {
	_c.Call.Run(func(args mock.Arguments) {
		var arg0 uuid.UUID
		if args[0] != nil {
			arg0 = args[0].(uuid.UUID)
		}
		var arg1 uuid.UUID
		if args[1] != nil {
			arg1 = args[1].(uuid.UUID)
		}
		run(
			arg0,
			arg1,
		)
	})
	return _c
}

func (_c *MockSessionRequestDatabase_Exists_Call) Return(b bool, err error) *MockSessionRequestDatabase_Exists_Call {
	_c.Call.Return(b, err)
	return _c
}

func (_c *MockSessionRequestDatabase_Exists_Call) RunAndReturn(run func(board uuid.UUID, user uuid.UUID) (bool, error)) *MockSessionRequestDatabase_Exists_Call {
	_c.Call.Return(run)
	return _c
}

// Get provides a mock function for the type MockSessionRequestDatabase
func (_mock *MockSessionRequestDatabase) Get(board uuid.UUID, user uuid.UUID) (DatabaseBoardSessionRequest, error) {
	ret := _mock.Called(board, user)

	if len(ret) == 0 {
		panic("no return value specified for Get")
	}

	var r0 DatabaseBoardSessionRequest
	var r1 error
	if returnFunc, ok := ret.Get(0).(func(uuid.UUID, uuid.UUID) (DatabaseBoardSessionRequest, error)); ok {
		return returnFunc(board, user)
	}
	if returnFunc, ok := ret.Get(0).(func(uuid.UUID, uuid.UUID) DatabaseBoardSessionRequest); ok {
		r0 = returnFunc(board, user)
	} else {
		r0 = ret.Get(0).(DatabaseBoardSessionRequest)
	}
	if returnFunc, ok := ret.Get(1).(func(uuid.UUID, uuid.UUID) error); ok {
		r1 = returnFunc(board, user)
	} else {
		r1 = ret.Error(1)
	}
	return r0, r1
}

// MockSessionRequestDatabase_Get_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Get'
type MockSessionRequestDatabase_Get_Call struct {
	*mock.Call
}

// Get is a helper method to define mock.On call
//   - board uuid.UUID
//   - user uuid.UUID
func (_e *MockSessionRequestDatabase_Expecter) Get(board interface{}, user interface{}) *MockSessionRequestDatabase_Get_Call {
	return &MockSessionRequestDatabase_Get_Call{Call: _e.mock.On("Get", board, user)}
}

func (_c *MockSessionRequestDatabase_Get_Call) Run(run func(board uuid.UUID, user uuid.UUID)) *MockSessionRequestDatabase_Get_Call {
	_c.Call.Run(func(args mock.Arguments) {
		var arg0 uuid.UUID
		if args[0] != nil {
			arg0 = args[0].(uuid.UUID)
		}
		var arg1 uuid.UUID
		if args[1] != nil {
			arg1 = args[1].(uuid.UUID)
		}
		run(
			arg0,
			arg1,
		)
	})
	return _c
}

func (_c *MockSessionRequestDatabase_Get_Call) Return(databaseBoardSessionRequest DatabaseBoardSessionRequest, err error) *MockSessionRequestDatabase_Get_Call {
	_c.Call.Return(databaseBoardSessionRequest, err)
	return _c
}

func (_c *MockSessionRequestDatabase_Get_Call) RunAndReturn(run func(board uuid.UUID, user uuid.UUID) (DatabaseBoardSessionRequest, error)) *MockSessionRequestDatabase_Get_Call {
	_c.Call.Return(run)
	return _c
}

// GetAll provides a mock function for the type MockSessionRequestDatabase
func (_mock *MockSessionRequestDatabase) GetAll(board uuid.UUID, status ...RequestStatus) ([]DatabaseBoardSessionRequest, error) {
	var tmpRet mock.Arguments
	if len(status) > 0 {
		tmpRet = _mock.Called(board, status)
	} else {
		tmpRet = _mock.Called(board)
	}
	ret := tmpRet

	if len(ret) == 0 {
		panic("no return value specified for GetAll")
	}

	var r0 []DatabaseBoardSessionRequest
	var r1 error
	if returnFunc, ok := ret.Get(0).(func(uuid.UUID, ...RequestStatus) ([]DatabaseBoardSessionRequest, error)); ok {
		return returnFunc(board, status...)
	}
	if returnFunc, ok := ret.Get(0).(func(uuid.UUID, ...RequestStatus) []DatabaseBoardSessionRequest); ok {
		r0 = returnFunc(board, status...)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]DatabaseBoardSessionRequest)
		}
	}
	if returnFunc, ok := ret.Get(1).(func(uuid.UUID, ...RequestStatus) error); ok {
		r1 = returnFunc(board, status...)
	} else {
		r1 = ret.Error(1)
	}
	return r0, r1
}

// MockSessionRequestDatabase_GetAll_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetAll'
type MockSessionRequestDatabase_GetAll_Call struct {
	*mock.Call
}

// GetAll is a helper method to define mock.On call
//   - board uuid.UUID
//   - status ...RequestStatus
func (_e *MockSessionRequestDatabase_Expecter) GetAll(board interface{}, status ...interface{}) *MockSessionRequestDatabase_GetAll_Call {
	return &MockSessionRequestDatabase_GetAll_Call{Call: _e.mock.On("GetAll",
		append([]interface{}{board}, status...)...)}
}

func (_c *MockSessionRequestDatabase_GetAll_Call) Run(run func(board uuid.UUID, status ...RequestStatus)) *MockSessionRequestDatabase_GetAll_Call {
	_c.Call.Run(func(args mock.Arguments) {
		var arg0 uuid.UUID
		if args[0] != nil {
			arg0 = args[0].(uuid.UUID)
		}
		var arg1 []RequestStatus
		var variadicArgs []RequestStatus
		if len(args) > 1 {
			variadicArgs = args[1].([]RequestStatus)
		}
		arg1 = variadicArgs
		run(
			arg0,
			arg1...,
		)
	})
	return _c
}

func (_c *MockSessionRequestDatabase_GetAll_Call) Return(databaseBoardSessionRequests []DatabaseBoardSessionRequest, err error) *MockSessionRequestDatabase_GetAll_Call {
	_c.Call.Return(databaseBoardSessionRequests, err)
	return _c
}

func (_c *MockSessionRequestDatabase_GetAll_Call) RunAndReturn(run func(board uuid.UUID, status ...RequestStatus) ([]DatabaseBoardSessionRequest, error)) *MockSessionRequestDatabase_GetAll_Call {
	_c.Call.Return(run)
	return _c
}

// Update provides a mock function for the type MockSessionRequestDatabase
func (_mock *MockSessionRequestDatabase) Update(update DatabaseBoardSessionRequestUpdate) (DatabaseBoardSessionRequest, error) {
	ret := _mock.Called(update)

	if len(ret) == 0 {
		panic("no return value specified for Update")
	}

	var r0 DatabaseBoardSessionRequest
	var r1 error
	if returnFunc, ok := ret.Get(0).(func(DatabaseBoardSessionRequestUpdate) (DatabaseBoardSessionRequest, error)); ok {
		return returnFunc(update)
	}
	if returnFunc, ok := ret.Get(0).(func(DatabaseBoardSessionRequestUpdate) DatabaseBoardSessionRequest); ok {
		r0 = returnFunc(update)
	} else {
		r0 = ret.Get(0).(DatabaseBoardSessionRequest)
	}
	if returnFunc, ok := ret.Get(1).(func(DatabaseBoardSessionRequestUpdate) error); ok {
		r1 = returnFunc(update)
	} else {
		r1 = ret.Error(1)
	}
	return r0, r1
}

// MockSessionRequestDatabase_Update_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Update'
type MockSessionRequestDatabase_Update_Call struct {
	*mock.Call
}

// Update is a helper method to define mock.On call
//   - update DatabaseBoardSessionRequestUpdate
func (_e *MockSessionRequestDatabase_Expecter) Update(update interface{}) *MockSessionRequestDatabase_Update_Call {
	return &MockSessionRequestDatabase_Update_Call{Call: _e.mock.On("Update", update)}
}

func (_c *MockSessionRequestDatabase_Update_Call) Run(run func(update DatabaseBoardSessionRequestUpdate)) *MockSessionRequestDatabase_Update_Call {
	_c.Call.Run(func(args mock.Arguments) {
		var arg0 DatabaseBoardSessionRequestUpdate
		if args[0] != nil {
			arg0 = args[0].(DatabaseBoardSessionRequestUpdate)
		}
		run(
			arg0,
		)
	})
	return _c
}

func (_c *MockSessionRequestDatabase_Update_Call) Return(databaseBoardSessionRequest DatabaseBoardSessionRequest, err error) *MockSessionRequestDatabase_Update_Call {
	_c.Call.Return(databaseBoardSessionRequest, err)
	return _c
}

func (_c *MockSessionRequestDatabase_Update_Call) RunAndReturn(run func(update DatabaseBoardSessionRequestUpdate) (DatabaseBoardSessionRequest, error)) *MockSessionRequestDatabase_Update_Call {
	_c.Call.Return(run)
	return _c
}
