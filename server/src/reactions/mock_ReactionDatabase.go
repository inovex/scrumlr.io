// Code generated by mockery v2.53.0. DO NOT EDIT.

package reactions

import (
	uuid "github.com/google/uuid"
	mock "github.com/stretchr/testify/mock"
)

// MockReactionDatabase is an autogenerated mock type for the ReactionDatabase type
type MockReactionDatabase struct {
	mock.Mock
}

type MockReactionDatabase_Expecter struct {
	mock *mock.Mock
}

func (_m *MockReactionDatabase) EXPECT() *MockReactionDatabase_Expecter {
	return &MockReactionDatabase_Expecter{mock: &_m.Mock}
}

// CreateReaction provides a mock function with given fields: board, insert
func (_m *MockReactionDatabase) CreateReaction(board uuid.UUID, insert DatabaseReactionInsert) (DatabaseReaction, error) {
	ret := _m.Called(board, insert)

	if len(ret) == 0 {
		panic("no return value specified for CreateReaction")
	}

	var r0 DatabaseReaction
	var r1 error
	if rf, ok := ret.Get(0).(func(uuid.UUID, DatabaseReactionInsert) (DatabaseReaction, error)); ok {
		return rf(board, insert)
	}
	if rf, ok := ret.Get(0).(func(uuid.UUID, DatabaseReactionInsert) DatabaseReaction); ok {
		r0 = rf(board, insert)
	} else {
		r0 = ret.Get(0).(DatabaseReaction)
	}

	if rf, ok := ret.Get(1).(func(uuid.UUID, DatabaseReactionInsert) error); ok {
		r1 = rf(board, insert)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockReactionDatabase_CreateReaction_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'CreateReaction'
type MockReactionDatabase_CreateReaction_Call struct {
	*mock.Call
}

// CreateReaction is a helper method to define mock.On call
//   - board uuid.UUID
//   - insert DatabaseReactionInsert
func (_e *MockReactionDatabase_Expecter) CreateReaction(board interface{}, insert interface{}) *MockReactionDatabase_CreateReaction_Call {
	return &MockReactionDatabase_CreateReaction_Call{Call: _e.mock.On("CreateReaction", board, insert)}
}

func (_c *MockReactionDatabase_CreateReaction_Call) Run(run func(board uuid.UUID, insert DatabaseReactionInsert)) *MockReactionDatabase_CreateReaction_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(uuid.UUID), args[1].(DatabaseReactionInsert))
	})
	return _c
}

func (_c *MockReactionDatabase_CreateReaction_Call) Return(_a0 DatabaseReaction, _a1 error) *MockReactionDatabase_CreateReaction_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockReactionDatabase_CreateReaction_Call) RunAndReturn(run func(uuid.UUID, DatabaseReactionInsert) (DatabaseReaction, error)) *MockReactionDatabase_CreateReaction_Call {
	_c.Call.Return(run)
	return _c
}

// GetReaction provides a mock function with given fields: id
func (_m *MockReactionDatabase) GetReaction(id uuid.UUID) (DatabaseReaction, error) {
	ret := _m.Called(id)

	if len(ret) == 0 {
		panic("no return value specified for GetReaction")
	}

	var r0 DatabaseReaction
	var r1 error
	if rf, ok := ret.Get(0).(func(uuid.UUID) (DatabaseReaction, error)); ok {
		return rf(id)
	}
	if rf, ok := ret.Get(0).(func(uuid.UUID) DatabaseReaction); ok {
		r0 = rf(id)
	} else {
		r0 = ret.Get(0).(DatabaseReaction)
	}

	if rf, ok := ret.Get(1).(func(uuid.UUID) error); ok {
		r1 = rf(id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockReactionDatabase_GetReaction_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetReaction'
type MockReactionDatabase_GetReaction_Call struct {
	*mock.Call
}

// GetReaction is a helper method to define mock.On call
//   - id uuid.UUID
func (_e *MockReactionDatabase_Expecter) GetReaction(id interface{}) *MockReactionDatabase_GetReaction_Call {
	return &MockReactionDatabase_GetReaction_Call{Call: _e.mock.On("GetReaction", id)}
}

func (_c *MockReactionDatabase_GetReaction_Call) Run(run func(id uuid.UUID)) *MockReactionDatabase_GetReaction_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(uuid.UUID))
	})
	return _c
}

func (_c *MockReactionDatabase_GetReaction_Call) Return(_a0 DatabaseReaction, _a1 error) *MockReactionDatabase_GetReaction_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockReactionDatabase_GetReaction_Call) RunAndReturn(run func(uuid.UUID) (DatabaseReaction, error)) *MockReactionDatabase_GetReaction_Call {
	_c.Call.Return(run)
	return _c
}

// GetReactions provides a mock function with given fields: board
func (_m *MockReactionDatabase) GetReactions(board uuid.UUID) ([]DatabaseReaction, error) {
	ret := _m.Called(board)

	if len(ret) == 0 {
		panic("no return value specified for GetReactions")
	}

	var r0 []DatabaseReaction
	var r1 error
	if rf, ok := ret.Get(0).(func(uuid.UUID) ([]DatabaseReaction, error)); ok {
		return rf(board)
	}
	if rf, ok := ret.Get(0).(func(uuid.UUID) []DatabaseReaction); ok {
		r0 = rf(board)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]DatabaseReaction)
		}
	}

	if rf, ok := ret.Get(1).(func(uuid.UUID) error); ok {
		r1 = rf(board)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockReactionDatabase_GetReactions_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetReactions'
type MockReactionDatabase_GetReactions_Call struct {
	*mock.Call
}

// GetReactions is a helper method to define mock.On call
//   - board uuid.UUID
func (_e *MockReactionDatabase_Expecter) GetReactions(board interface{}) *MockReactionDatabase_GetReactions_Call {
	return &MockReactionDatabase_GetReactions_Call{Call: _e.mock.On("GetReactions", board)}
}

func (_c *MockReactionDatabase_GetReactions_Call) Run(run func(board uuid.UUID)) *MockReactionDatabase_GetReactions_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(uuid.UUID))
	})
	return _c
}

func (_c *MockReactionDatabase_GetReactions_Call) Return(_a0 []DatabaseReaction, _a1 error) *MockReactionDatabase_GetReactions_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockReactionDatabase_GetReactions_Call) RunAndReturn(run func(uuid.UUID) ([]DatabaseReaction, error)) *MockReactionDatabase_GetReactions_Call {
	_c.Call.Return(run)
	return _c
}

// GetReactionsForNote provides a mock function with given fields: note
func (_m *MockReactionDatabase) GetReactionsForNote(note uuid.UUID) ([]DatabaseReaction, error) {
	ret := _m.Called(note)

	if len(ret) == 0 {
		panic("no return value specified for GetReactionsForNote")
	}

	var r0 []DatabaseReaction
	var r1 error
	if rf, ok := ret.Get(0).(func(uuid.UUID) ([]DatabaseReaction, error)); ok {
		return rf(note)
	}
	if rf, ok := ret.Get(0).(func(uuid.UUID) []DatabaseReaction); ok {
		r0 = rf(note)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]DatabaseReaction)
		}
	}

	if rf, ok := ret.Get(1).(func(uuid.UUID) error); ok {
		r1 = rf(note)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockReactionDatabase_GetReactionsForNote_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetReactionsForNote'
type MockReactionDatabase_GetReactionsForNote_Call struct {
	*mock.Call
}

// GetReactionsForNote is a helper method to define mock.On call
//   - note uuid.UUID
func (_e *MockReactionDatabase_Expecter) GetReactionsForNote(note interface{}) *MockReactionDatabase_GetReactionsForNote_Call {
	return &MockReactionDatabase_GetReactionsForNote_Call{Call: _e.mock.On("GetReactionsForNote", note)}
}

func (_c *MockReactionDatabase_GetReactionsForNote_Call) Run(run func(note uuid.UUID)) *MockReactionDatabase_GetReactionsForNote_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(uuid.UUID))
	})
	return _c
}

func (_c *MockReactionDatabase_GetReactionsForNote_Call) Return(_a0 []DatabaseReaction, _a1 error) *MockReactionDatabase_GetReactionsForNote_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockReactionDatabase_GetReactionsForNote_Call) RunAndReturn(run func(uuid.UUID) ([]DatabaseReaction, error)) *MockReactionDatabase_GetReactionsForNote_Call {
	_c.Call.Return(run)
	return _c
}

// RemoveReaction provides a mock function with given fields: board, user, id
func (_m *MockReactionDatabase) RemoveReaction(board uuid.UUID, user uuid.UUID, id uuid.UUID) error {
	ret := _m.Called(board, user, id)

	if len(ret) == 0 {
		panic("no return value specified for RemoveReaction")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(uuid.UUID, uuid.UUID, uuid.UUID) error); ok {
		r0 = rf(board, user, id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockReactionDatabase_RemoveReaction_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'RemoveReaction'
type MockReactionDatabase_RemoveReaction_Call struct {
	*mock.Call
}

// RemoveReaction is a helper method to define mock.On call
//   - board uuid.UUID
//   - user uuid.UUID
//   - id uuid.UUID
func (_e *MockReactionDatabase_Expecter) RemoveReaction(board interface{}, user interface{}, id interface{}) *MockReactionDatabase_RemoveReaction_Call {
	return &MockReactionDatabase_RemoveReaction_Call{Call: _e.mock.On("RemoveReaction", board, user, id)}
}

func (_c *MockReactionDatabase_RemoveReaction_Call) Run(run func(board uuid.UUID, user uuid.UUID, id uuid.UUID)) *MockReactionDatabase_RemoveReaction_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(uuid.UUID), args[1].(uuid.UUID), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *MockReactionDatabase_RemoveReaction_Call) Return(_a0 error) *MockReactionDatabase_RemoveReaction_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockReactionDatabase_RemoveReaction_Call) RunAndReturn(run func(uuid.UUID, uuid.UUID, uuid.UUID) error) *MockReactionDatabase_RemoveReaction_Call {
	_c.Call.Return(run)
	return _c
}

// UpdateReaction provides a mock function with given fields: board, user, id, update
func (_m *MockReactionDatabase) UpdateReaction(board uuid.UUID, user uuid.UUID, id uuid.UUID, update DatabaseReactionUpdate) (DatabaseReaction, error) {
	ret := _m.Called(board, user, id, update)

	if len(ret) == 0 {
		panic("no return value specified for UpdateReaction")
	}

	var r0 DatabaseReaction
	var r1 error
	if rf, ok := ret.Get(0).(func(uuid.UUID, uuid.UUID, uuid.UUID, DatabaseReactionUpdate) (DatabaseReaction, error)); ok {
		return rf(board, user, id, update)
	}
	if rf, ok := ret.Get(0).(func(uuid.UUID, uuid.UUID, uuid.UUID, DatabaseReactionUpdate) DatabaseReaction); ok {
		r0 = rf(board, user, id, update)
	} else {
		r0 = ret.Get(0).(DatabaseReaction)
	}

	if rf, ok := ret.Get(1).(func(uuid.UUID, uuid.UUID, uuid.UUID, DatabaseReactionUpdate) error); ok {
		r1 = rf(board, user, id, update)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockReactionDatabase_UpdateReaction_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'UpdateReaction'
type MockReactionDatabase_UpdateReaction_Call struct {
	*mock.Call
}

// UpdateReaction is a helper method to define mock.On call
//   - board uuid.UUID
//   - user uuid.UUID
//   - id uuid.UUID
//   - update DatabaseReactionUpdate
func (_e *MockReactionDatabase_Expecter) UpdateReaction(board interface{}, user interface{}, id interface{}, update interface{}) *MockReactionDatabase_UpdateReaction_Call {
	return &MockReactionDatabase_UpdateReaction_Call{Call: _e.mock.On("UpdateReaction", board, user, id, update)}
}

func (_c *MockReactionDatabase_UpdateReaction_Call) Run(run func(board uuid.UUID, user uuid.UUID, id uuid.UUID, update DatabaseReactionUpdate)) *MockReactionDatabase_UpdateReaction_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(uuid.UUID), args[1].(uuid.UUID), args[2].(uuid.UUID), args[3].(DatabaseReactionUpdate))
	})
	return _c
}

func (_c *MockReactionDatabase_UpdateReaction_Call) Return(_a0 DatabaseReaction, _a1 error) *MockReactionDatabase_UpdateReaction_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockReactionDatabase_UpdateReaction_Call) RunAndReturn(run func(uuid.UUID, uuid.UUID, uuid.UUID, DatabaseReactionUpdate) (DatabaseReaction, error)) *MockReactionDatabase_UpdateReaction_Call {
	_c.Call.Return(run)
	return _c
}

// NewMockReactionDatabase creates a new instance of MockReactionDatabase. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockReactionDatabase(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockReactionDatabase {
	mock := &MockReactionDatabase{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
