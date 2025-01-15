// Code generated by mockery v2.51.0. DO NOT EDIT.

package services

import (
	context "context"

	mock "github.com/stretchr/testify/mock"
	dto "scrumlr.io/server/common/dto"

	uuid "github.com/google/uuid"
)

// MockBoardReactions is an autogenerated mock type for the BoardReactions type
type MockBoardReactions struct {
	mock.Mock
}

type MockBoardReactions_Expecter struct {
	mock *mock.Mock
}

func (_m *MockBoardReactions) EXPECT() *MockBoardReactions_Expecter {
	return &MockBoardReactions_Expecter{mock: &_m.Mock}
}

// Create provides a mock function with given fields: ctx, board, body
func (_m *MockBoardReactions) Create(ctx context.Context, board uuid.UUID, body dto.BoardReactionCreateRequest) {
	_m.Called(ctx, board, body)
}

// MockBoardReactions_Create_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Create'
type MockBoardReactions_Create_Call struct {
	*mock.Call
}

// Create is a helper method to define mock.On call
//   - ctx context.Context
//   - board uuid.UUID
//   - body dto.BoardReactionCreateRequest
func (_e *MockBoardReactions_Expecter) Create(ctx interface{}, board interface{}, body interface{}) *MockBoardReactions_Create_Call {
	return &MockBoardReactions_Create_Call{Call: _e.mock.On("Create", ctx, board, body)}
}

func (_c *MockBoardReactions_Create_Call) Run(run func(ctx context.Context, board uuid.UUID, body dto.BoardReactionCreateRequest)) *MockBoardReactions_Create_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(dto.BoardReactionCreateRequest))
	})
	return _c
}

func (_c *MockBoardReactions_Create_Call) Return() *MockBoardReactions_Create_Call {
	_c.Call.Return()
	return _c
}

func (_c *MockBoardReactions_Create_Call) RunAndReturn(run func(context.Context, uuid.UUID, dto.BoardReactionCreateRequest)) *MockBoardReactions_Create_Call {
	_c.Run(run)
	return _c
}

// NewMockBoardReactions creates a new instance of MockBoardReactions. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockBoardReactions(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockBoardReactions {
	mock := &MockBoardReactions{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
