// Code generated by mockery v2.53.0. DO NOT EDIT.

package reactions

import (
	context "context"

	uuid "github.com/google/uuid"
	mock "github.com/stretchr/testify/mock"
)

// MockReactionService is an autogenerated mock type for the ReactionService type
type MockReactionService struct {
	mock.Mock
}

type MockReactionService_Expecter struct {
	mock *mock.Mock
}

func (_m *MockReactionService) EXPECT() *MockReactionService_Expecter {
	return &MockReactionService_Expecter{mock: &_m.Mock}
}

// Create provides a mock function with given fields: ctx, board, body
func (_m *MockReactionService) Create(ctx context.Context, board uuid.UUID, body ReactionCreateRequest) (*Reaction, error) {
	ret := _m.Called(ctx, board, body)

	if len(ret) == 0 {
		panic("no return value specified for Create")
	}

	var r0 *Reaction
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, ReactionCreateRequest) (*Reaction, error)); ok {
		return rf(ctx, board, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, ReactionCreateRequest) *Reaction); ok {
		r0 = rf(ctx, board, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*Reaction)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID, ReactionCreateRequest) error); ok {
		r1 = rf(ctx, board, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockReactionService_Create_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Create'
type MockReactionService_Create_Call struct {
	*mock.Call
}

// Create is a helper method to define mock.On call
//   - ctx context.Context
//   - board uuid.UUID
//   - body ReactionCreateRequest
func (_e *MockReactionService_Expecter) Create(ctx interface{}, board interface{}, body interface{}) *MockReactionService_Create_Call {
	return &MockReactionService_Create_Call{Call: _e.mock.On("Create", ctx, board, body)}
}

func (_c *MockReactionService_Create_Call) Run(run func(ctx context.Context, board uuid.UUID, body ReactionCreateRequest)) *MockReactionService_Create_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(ReactionCreateRequest))
	})
	return _c
}

func (_c *MockReactionService_Create_Call) Return(_a0 *Reaction, _a1 error) *MockReactionService_Create_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockReactionService_Create_Call) RunAndReturn(run func(context.Context, uuid.UUID, ReactionCreateRequest) (*Reaction, error)) *MockReactionService_Create_Call {
	_c.Call.Return(run)
	return _c
}

// Delete provides a mock function with given fields: ctx, board, user, id
func (_m *MockReactionService) Delete(ctx context.Context, board uuid.UUID, user uuid.UUID, id uuid.UUID) error {
	ret := _m.Called(ctx, board, user, id)

	if len(ret) == 0 {
		panic("no return value specified for Delete")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID, uuid.UUID) error); ok {
		r0 = rf(ctx, board, user, id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockReactionService_Delete_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Delete'
type MockReactionService_Delete_Call struct {
	*mock.Call
}

// Delete is a helper method to define mock.On call
//   - ctx context.Context
//   - board uuid.UUID
//   - user uuid.UUID
//   - id uuid.UUID
func (_e *MockReactionService_Expecter) Delete(ctx interface{}, board interface{}, user interface{}, id interface{}) *MockReactionService_Delete_Call {
	return &MockReactionService_Delete_Call{Call: _e.mock.On("Delete", ctx, board, user, id)}
}

func (_c *MockReactionService_Delete_Call) Run(run func(ctx context.Context, board uuid.UUID, user uuid.UUID, id uuid.UUID)) *MockReactionService_Delete_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uuid.UUID), args[3].(uuid.UUID))
	})
	return _c
}

func (_c *MockReactionService_Delete_Call) Return(_a0 error) *MockReactionService_Delete_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockReactionService_Delete_Call) RunAndReturn(run func(context.Context, uuid.UUID, uuid.UUID, uuid.UUID) error) *MockReactionService_Delete_Call {
	_c.Call.Return(run)
	return _c
}

// Get provides a mock function with given fields: ctx, id
func (_m *MockReactionService) Get(ctx context.Context, id uuid.UUID) (*Reaction, error) {
	ret := _m.Called(ctx, id)

	if len(ret) == 0 {
		panic("no return value specified for Get")
	}

	var r0 *Reaction
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) (*Reaction, error)); ok {
		return rf(ctx, id)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) *Reaction); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*Reaction)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockReactionService_Get_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Get'
type MockReactionService_Get_Call struct {
	*mock.Call
}

// Get is a helper method to define mock.On call
//   - ctx context.Context
//   - id uuid.UUID
func (_e *MockReactionService_Expecter) Get(ctx interface{}, id interface{}) *MockReactionService_Get_Call {
	return &MockReactionService_Get_Call{Call: _e.mock.On("Get", ctx, id)}
}

func (_c *MockReactionService_Get_Call) Run(run func(ctx context.Context, id uuid.UUID)) *MockReactionService_Get_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockReactionService_Get_Call) Return(_a0 *Reaction, _a1 error) *MockReactionService_Get_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockReactionService_Get_Call) RunAndReturn(run func(context.Context, uuid.UUID) (*Reaction, error)) *MockReactionService_Get_Call {
	_c.Call.Return(run)
	return _c
}

// List provides a mock function with given fields: ctx, boardId
func (_m *MockReactionService) List(ctx context.Context, boardId uuid.UUID) ([]*Reaction, error) {
	ret := _m.Called(ctx, boardId)

	if len(ret) == 0 {
		panic("no return value specified for List")
	}

	var r0 []*Reaction
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) ([]*Reaction, error)); ok {
		return rf(ctx, boardId)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) []*Reaction); ok {
		r0 = rf(ctx, boardId)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*Reaction)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, boardId)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockReactionService_List_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'List'
type MockReactionService_List_Call struct {
	*mock.Call
}

// List is a helper method to define mock.On call
//   - ctx context.Context
//   - boardId uuid.UUID
func (_e *MockReactionService_Expecter) List(ctx interface{}, boardId interface{}) *MockReactionService_List_Call {
	return &MockReactionService_List_Call{Call: _e.mock.On("List", ctx, boardId)}
}

func (_c *MockReactionService_List_Call) Run(run func(ctx context.Context, boardId uuid.UUID)) *MockReactionService_List_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockReactionService_List_Call) Return(_a0 []*Reaction, _a1 error) *MockReactionService_List_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockReactionService_List_Call) RunAndReturn(run func(context.Context, uuid.UUID) ([]*Reaction, error)) *MockReactionService_List_Call {
	_c.Call.Return(run)
	return _c
}

// Update provides a mock function with given fields: ctx, board, user, id, body
func (_m *MockReactionService) Update(ctx context.Context, board uuid.UUID, user uuid.UUID, id uuid.UUID, body ReactionUpdateTypeRequest) (*Reaction, error) {
	ret := _m.Called(ctx, board, user, id, body)

	if len(ret) == 0 {
		panic("no return value specified for Update")
	}

	var r0 *Reaction
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID, uuid.UUID, ReactionUpdateTypeRequest) (*Reaction, error)); ok {
		return rf(ctx, board, user, id, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID, uuid.UUID, ReactionUpdateTypeRequest) *Reaction); ok {
		r0 = rf(ctx, board, user, id, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*Reaction)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID, uuid.UUID, uuid.UUID, ReactionUpdateTypeRequest) error); ok {
		r1 = rf(ctx, board, user, id, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockReactionService_Update_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Update'
type MockReactionService_Update_Call struct {
	*mock.Call
}

// Update is a helper method to define mock.On call
//   - ctx context.Context
//   - board uuid.UUID
//   - user uuid.UUID
//   - id uuid.UUID
//   - body ReactionUpdateTypeRequest
func (_e *MockReactionService_Expecter) Update(ctx interface{}, board interface{}, user interface{}, id interface{}, body interface{}) *MockReactionService_Update_Call {
	return &MockReactionService_Update_Call{Call: _e.mock.On("Update", ctx, board, user, id, body)}
}

func (_c *MockReactionService_Update_Call) Run(run func(ctx context.Context, board uuid.UUID, user uuid.UUID, id uuid.UUID, body ReactionUpdateTypeRequest)) *MockReactionService_Update_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uuid.UUID), args[3].(uuid.UUID), args[4].(ReactionUpdateTypeRequest))
	})
	return _c
}

func (_c *MockReactionService_Update_Call) Return(_a0 *Reaction, _a1 error) *MockReactionService_Update_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockReactionService_Update_Call) RunAndReturn(run func(context.Context, uuid.UUID, uuid.UUID, uuid.UUID, ReactionUpdateTypeRequest) (*Reaction, error)) *MockReactionService_Update_Call {
	_c.Call.Return(run)
	return _c
}

// NewMockReactionService creates a new instance of MockReactionService. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockReactionService(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockReactionService {
	mock := &MockReactionService{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
