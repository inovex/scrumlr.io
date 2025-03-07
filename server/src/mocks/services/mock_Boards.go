// Code generated by mockery v2.52.3. DO NOT EDIT.

package services

import (
	context "context"

	columns "scrumlr.io/server/columns"

	dto "scrumlr.io/server/common/dto"

	mock "github.com/stretchr/testify/mock"

	uuid "github.com/google/uuid"
)

// MockBoards is an autogenerated mock type for the Boards type
type MockBoards struct {
	mock.Mock
}

type MockBoards_Expecter struct {
	mock *mock.Mock
}

func (_m *MockBoards) EXPECT() *MockBoards_Expecter {
	return &MockBoards_Expecter{mock: &_m.Mock}
}

// BoardOverview provides a mock function with given fields: ctx, boardIDs, user
func (_m *MockBoards) BoardOverview(ctx context.Context, boardIDs []uuid.UUID, user uuid.UUID) ([]*dto.BoardOverview, error) {
	ret := _m.Called(ctx, boardIDs, user)

	if len(ret) == 0 {
		panic("no return value specified for BoardOverview")
	}

	var r0 []*dto.BoardOverview
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, []uuid.UUID, uuid.UUID) ([]*dto.BoardOverview, error)); ok {
		return rf(ctx, boardIDs, user)
	}
	if rf, ok := ret.Get(0).(func(context.Context, []uuid.UUID, uuid.UUID) []*dto.BoardOverview); ok {
		r0 = rf(ctx, boardIDs, user)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*dto.BoardOverview)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, []uuid.UUID, uuid.UUID) error); ok {
		r1 = rf(ctx, boardIDs, user)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_BoardOverview_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'BoardOverview'
type MockBoards_BoardOverview_Call struct {
	*mock.Call
}

// BoardOverview is a helper method to define mock.On call
//   - ctx context.Context
//   - boardIDs []uuid.UUID
//   - user uuid.UUID
func (_e *MockBoards_Expecter) BoardOverview(ctx interface{}, boardIDs interface{}, user interface{}) *MockBoards_BoardOverview_Call {
	return &MockBoards_BoardOverview_Call{Call: _e.mock.On("BoardOverview", ctx, boardIDs, user)}
}

func (_c *MockBoards_BoardOverview_Call) Run(run func(ctx context.Context, boardIDs []uuid.UUID, user uuid.UUID)) *MockBoards_BoardOverview_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].([]uuid.UUID), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *MockBoards_BoardOverview_Call) Return(_a0 []*dto.BoardOverview, _a1 error) *MockBoards_BoardOverview_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_BoardOverview_Call) RunAndReturn(run func(context.Context, []uuid.UUID, uuid.UUID) ([]*dto.BoardOverview, error)) *MockBoards_BoardOverview_Call {
	_c.Call.Return(run)
	return _c
}

// Create provides a mock function with given fields: ctx, body
func (_m *MockBoards) Create(ctx context.Context, body dto.CreateBoardRequest) (*dto.Board, error) {
	ret := _m.Called(ctx, body)

	if len(ret) == 0 {
		panic("no return value specified for Create")
	}

	var r0 *dto.Board
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, dto.CreateBoardRequest) (*dto.Board, error)); ok {
		return rf(ctx, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, dto.CreateBoardRequest) *dto.Board); ok {
		r0 = rf(ctx, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*dto.Board)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, dto.CreateBoardRequest) error); ok {
		r1 = rf(ctx, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_Create_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Create'
type MockBoards_Create_Call struct {
	*mock.Call
}

// Create is a helper method to define mock.On call
//   - ctx context.Context
//   - body dto.CreateBoardRequest
func (_e *MockBoards_Expecter) Create(ctx interface{}, body interface{}) *MockBoards_Create_Call {
	return &MockBoards_Create_Call{Call: _e.mock.On("Create", ctx, body)}
}

func (_c *MockBoards_Create_Call) Run(run func(ctx context.Context, body dto.CreateBoardRequest)) *MockBoards_Create_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(dto.CreateBoardRequest))
	})
	return _c
}

func (_c *MockBoards_Create_Call) Return(_a0 *dto.Board, _a1 error) *MockBoards_Create_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_Create_Call) RunAndReturn(run func(context.Context, dto.CreateBoardRequest) (*dto.Board, error)) *MockBoards_Create_Call {
	_c.Call.Return(run)
	return _c
}

// CreateColumn provides a mock function with given fields: ctx, body
func (_m *MockBoards) CreateColumn(ctx context.Context, body dto.ColumnRequest) (*columns.Column, error) {
	ret := _m.Called(ctx, body)

	if len(ret) == 0 {
		panic("no return value specified for CreateColumn")
	}

	var r0 *columns.Column
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, dto.ColumnRequest) (*columns.Column, error)); ok {
		return rf(ctx, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, dto.ColumnRequest) *columns.Column); ok {
		r0 = rf(ctx, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*columns.Column)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, dto.ColumnRequest) error); ok {
		r1 = rf(ctx, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_CreateColumn_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'CreateColumn'
type MockBoards_CreateColumn_Call struct {
	*mock.Call
}

// CreateColumn is a helper method to define mock.On call
//   - ctx context.Context
//   - body dto.ColumnRequest
func (_e *MockBoards_Expecter) CreateColumn(ctx interface{}, body interface{}) *MockBoards_CreateColumn_Call {
	return &MockBoards_CreateColumn_Call{Call: _e.mock.On("CreateColumn", ctx, body)}
}

func (_c *MockBoards_CreateColumn_Call) Run(run func(ctx context.Context, body dto.ColumnRequest)) *MockBoards_CreateColumn_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(dto.ColumnRequest))
	})
	return _c
}

func (_c *MockBoards_CreateColumn_Call) Return(_a0 *columns.Column, _a1 error) *MockBoards_CreateColumn_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_CreateColumn_Call) RunAndReturn(run func(context.Context, dto.ColumnRequest) (*columns.Column, error)) *MockBoards_CreateColumn_Call {
	_c.Call.Return(run)
	return _c
}

// Delete provides a mock function with given fields: ctx, id
func (_m *MockBoards) Delete(ctx context.Context, id uuid.UUID) error {
	ret := _m.Called(ctx, id)

	if len(ret) == 0 {
		panic("no return value specified for Delete")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) error); ok {
		r0 = rf(ctx, id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockBoards_Delete_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Delete'
type MockBoards_Delete_Call struct {
	*mock.Call
}

// Delete is a helper method to define mock.On call
//   - ctx context.Context
//   - id uuid.UUID
func (_e *MockBoards_Expecter) Delete(ctx interface{}, id interface{}) *MockBoards_Delete_Call {
	return &MockBoards_Delete_Call{Call: _e.mock.On("Delete", ctx, id)}
}

func (_c *MockBoards_Delete_Call) Run(run func(ctx context.Context, id uuid.UUID)) *MockBoards_Delete_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockBoards_Delete_Call) Return(_a0 error) *MockBoards_Delete_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockBoards_Delete_Call) RunAndReturn(run func(context.Context, uuid.UUID) error) *MockBoards_Delete_Call {
	_c.Call.Return(run)
	return _c
}

// DeleteColumn provides a mock function with given fields: ctx, board, column, user
func (_m *MockBoards) DeleteColumn(ctx context.Context, board uuid.UUID, column uuid.UUID, user uuid.UUID) error {
	ret := _m.Called(ctx, board, column, user)

	if len(ret) == 0 {
		panic("no return value specified for DeleteColumn")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID, uuid.UUID) error); ok {
		r0 = rf(ctx, board, column, user)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockBoards_DeleteColumn_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'DeleteColumn'
type MockBoards_DeleteColumn_Call struct {
	*mock.Call
}

// DeleteColumn is a helper method to define mock.On call
//   - ctx context.Context
//   - board uuid.UUID
//   - column uuid.UUID
//   - user uuid.UUID
func (_e *MockBoards_Expecter) DeleteColumn(ctx interface{}, board interface{}, column interface{}, user interface{}) *MockBoards_DeleteColumn_Call {
	return &MockBoards_DeleteColumn_Call{Call: _e.mock.On("DeleteColumn", ctx, board, column, user)}
}

func (_c *MockBoards_DeleteColumn_Call) Run(run func(ctx context.Context, board uuid.UUID, column uuid.UUID, user uuid.UUID)) *MockBoards_DeleteColumn_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uuid.UUID), args[3].(uuid.UUID))
	})
	return _c
}

func (_c *MockBoards_DeleteColumn_Call) Return(_a0 error) *MockBoards_DeleteColumn_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockBoards_DeleteColumn_Call) RunAndReturn(run func(context.Context, uuid.UUID, uuid.UUID, uuid.UUID) error) *MockBoards_DeleteColumn_Call {
	_c.Call.Return(run)
	return _c
}

// DeleteTimer provides a mock function with given fields: ctx, id
func (_m *MockBoards) DeleteTimer(ctx context.Context, id uuid.UUID) (*dto.Board, error) {
	ret := _m.Called(ctx, id)

	if len(ret) == 0 {
		panic("no return value specified for DeleteTimer")
	}

	var r0 *dto.Board
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) (*dto.Board, error)); ok {
		return rf(ctx, id)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) *dto.Board); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*dto.Board)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_DeleteTimer_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'DeleteTimer'
type MockBoards_DeleteTimer_Call struct {
	*mock.Call
}

// DeleteTimer is a helper method to define mock.On call
//   - ctx context.Context
//   - id uuid.UUID
func (_e *MockBoards_Expecter) DeleteTimer(ctx interface{}, id interface{}) *MockBoards_DeleteTimer_Call {
	return &MockBoards_DeleteTimer_Call{Call: _e.mock.On("DeleteTimer", ctx, id)}
}

func (_c *MockBoards_DeleteTimer_Call) Run(run func(ctx context.Context, id uuid.UUID)) *MockBoards_DeleteTimer_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockBoards_DeleteTimer_Call) Return(_a0 *dto.Board, _a1 error) *MockBoards_DeleteTimer_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_DeleteTimer_Call) RunAndReturn(run func(context.Context, uuid.UUID) (*dto.Board, error)) *MockBoards_DeleteTimer_Call {
	_c.Call.Return(run)
	return _c
}

// FullBoard provides a mock function with given fields: ctx, boardID
func (_m *MockBoards) FullBoard(ctx context.Context, boardID uuid.UUID) (*dto.FullBoard, error) {
	ret := _m.Called(ctx, boardID)

	if len(ret) == 0 {
		panic("no return value specified for FullBoard")
	}

	var r0 *dto.FullBoard
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) (*dto.FullBoard, error)); ok {
		return rf(ctx, boardID)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) *dto.FullBoard); ok {
		r0 = rf(ctx, boardID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*dto.FullBoard)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, boardID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_FullBoard_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'FullBoard'
type MockBoards_FullBoard_Call struct {
	*mock.Call
}

// FullBoard is a helper method to define mock.On call
//   - ctx context.Context
//   - boardID uuid.UUID
func (_e *MockBoards_Expecter) FullBoard(ctx interface{}, boardID interface{}) *MockBoards_FullBoard_Call {
	return &MockBoards_FullBoard_Call{Call: _e.mock.On("FullBoard", ctx, boardID)}
}

func (_c *MockBoards_FullBoard_Call) Run(run func(ctx context.Context, boardID uuid.UUID)) *MockBoards_FullBoard_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockBoards_FullBoard_Call) Return(_a0 *dto.FullBoard, _a1 error) *MockBoards_FullBoard_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_FullBoard_Call) RunAndReturn(run func(context.Context, uuid.UUID) (*dto.FullBoard, error)) *MockBoards_FullBoard_Call {
	_c.Call.Return(run)
	return _c
}

// Get provides a mock function with given fields: ctx, id
func (_m *MockBoards) Get(ctx context.Context, id uuid.UUID) (*dto.Board, error) {
	ret := _m.Called(ctx, id)

	if len(ret) == 0 {
		panic("no return value specified for Get")
	}

	var r0 *dto.Board
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) (*dto.Board, error)); ok {
		return rf(ctx, id)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) *dto.Board); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*dto.Board)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_Get_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Get'
type MockBoards_Get_Call struct {
	*mock.Call
}

// Get is a helper method to define mock.On call
//   - ctx context.Context
//   - id uuid.UUID
func (_e *MockBoards_Expecter) Get(ctx interface{}, id interface{}) *MockBoards_Get_Call {
	return &MockBoards_Get_Call{Call: _e.mock.On("Get", ctx, id)}
}

func (_c *MockBoards_Get_Call) Run(run func(ctx context.Context, id uuid.UUID)) *MockBoards_Get_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockBoards_Get_Call) Return(_a0 *dto.Board, _a1 error) *MockBoards_Get_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_Get_Call) RunAndReturn(run func(context.Context, uuid.UUID) (*dto.Board, error)) *MockBoards_Get_Call {
	_c.Call.Return(run)
	return _c
}

// GetBoards provides a mock function with given fields: ctx, userID
func (_m *MockBoards) GetBoards(ctx context.Context, userID uuid.UUID) ([]uuid.UUID, error) {
	ret := _m.Called(ctx, userID)

	if len(ret) == 0 {
		panic("no return value specified for GetBoards")
	}

	var r0 []uuid.UUID
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) ([]uuid.UUID, error)); ok {
		return rf(ctx, userID)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) []uuid.UUID); ok {
		r0 = rf(ctx, userID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]uuid.UUID)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, userID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_GetBoards_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetBoards'
type MockBoards_GetBoards_Call struct {
	*mock.Call
}

// GetBoards is a helper method to define mock.On call
//   - ctx context.Context
//   - userID uuid.UUID
func (_e *MockBoards_Expecter) GetBoards(ctx interface{}, userID interface{}) *MockBoards_GetBoards_Call {
	return &MockBoards_GetBoards_Call{Call: _e.mock.On("GetBoards", ctx, userID)}
}

func (_c *MockBoards_GetBoards_Call) Run(run func(ctx context.Context, userID uuid.UUID)) *MockBoards_GetBoards_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockBoards_GetBoards_Call) Return(_a0 []uuid.UUID, _a1 error) *MockBoards_GetBoards_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_GetBoards_Call) RunAndReturn(run func(context.Context, uuid.UUID) ([]uuid.UUID, error)) *MockBoards_GetBoards_Call {
	_c.Call.Return(run)
	return _c
}

// GetColumn provides a mock function with given fields: ctx, boardID, columnID
func (_m *MockBoards) GetColumn(ctx context.Context, boardID uuid.UUID, columnID uuid.UUID) (*columns.Column, error) {
	ret := _m.Called(ctx, boardID, columnID)

	if len(ret) == 0 {
		panic("no return value specified for GetColumn")
	}

	var r0 *columns.Column
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) (*columns.Column, error)); ok {
		return rf(ctx, boardID, columnID)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) *columns.Column); ok {
		r0 = rf(ctx, boardID, columnID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*columns.Column)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID, uuid.UUID) error); ok {
		r1 = rf(ctx, boardID, columnID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_GetColumn_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetColumn'
type MockBoards_GetColumn_Call struct {
	*mock.Call
}

// GetColumn is a helper method to define mock.On call
//   - ctx context.Context
//   - boardID uuid.UUID
//   - columnID uuid.UUID
func (_e *MockBoards_Expecter) GetColumn(ctx interface{}, boardID interface{}, columnID interface{}) *MockBoards_GetColumn_Call {
	return &MockBoards_GetColumn_Call{Call: _e.mock.On("GetColumn", ctx, boardID, columnID)}
}

func (_c *MockBoards_GetColumn_Call) Run(run func(ctx context.Context, boardID uuid.UUID, columnID uuid.UUID)) *MockBoards_GetColumn_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *MockBoards_GetColumn_Call) Return(_a0 *columns.Column, _a1 error) *MockBoards_GetColumn_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_GetColumn_Call) RunAndReturn(run func(context.Context, uuid.UUID, uuid.UUID) (*columns.Column, error)) *MockBoards_GetColumn_Call {
	_c.Call.Return(run)
	return _c
}

// IncrementTimer provides a mock function with given fields: ctx, id
func (_m *MockBoards) IncrementTimer(ctx context.Context, id uuid.UUID) (*dto.Board, error) {
	ret := _m.Called(ctx, id)

	if len(ret) == 0 {
		panic("no return value specified for IncrementTimer")
	}

	var r0 *dto.Board
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) (*dto.Board, error)); ok {
		return rf(ctx, id)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) *dto.Board); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*dto.Board)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_IncrementTimer_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'IncrementTimer'
type MockBoards_IncrementTimer_Call struct {
	*mock.Call
}

// IncrementTimer is a helper method to define mock.On call
//   - ctx context.Context
//   - id uuid.UUID
func (_e *MockBoards_Expecter) IncrementTimer(ctx interface{}, id interface{}) *MockBoards_IncrementTimer_Call {
	return &MockBoards_IncrementTimer_Call{Call: _e.mock.On("IncrementTimer", ctx, id)}
}

func (_c *MockBoards_IncrementTimer_Call) Run(run func(ctx context.Context, id uuid.UUID)) *MockBoards_IncrementTimer_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockBoards_IncrementTimer_Call) Return(_a0 *dto.Board, _a1 error) *MockBoards_IncrementTimer_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_IncrementTimer_Call) RunAndReturn(run func(context.Context, uuid.UUID) (*dto.Board, error)) *MockBoards_IncrementTimer_Call {
	_c.Call.Return(run)
	return _c
}

// ListColumns provides a mock function with given fields: ctx, boardID
func (_m *MockBoards) ListColumns(ctx context.Context, boardID uuid.UUID) ([]*columns.Column, error) {
	ret := _m.Called(ctx, boardID)

	if len(ret) == 0 {
		panic("no return value specified for ListColumns")
	}

	var r0 []*columns.Column
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) ([]*columns.Column, error)); ok {
		return rf(ctx, boardID)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) []*columns.Column); ok {
		r0 = rf(ctx, boardID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*columns.Column)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, boardID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_ListColumns_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'ListColumns'
type MockBoards_ListColumns_Call struct {
	*mock.Call
}

// ListColumns is a helper method to define mock.On call
//   - ctx context.Context
//   - boardID uuid.UUID
func (_e *MockBoards_Expecter) ListColumns(ctx interface{}, boardID interface{}) *MockBoards_ListColumns_Call {
	return &MockBoards_ListColumns_Call{Call: _e.mock.On("ListColumns", ctx, boardID)}
}

func (_c *MockBoards_ListColumns_Call) Run(run func(ctx context.Context, boardID uuid.UUID)) *MockBoards_ListColumns_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockBoards_ListColumns_Call) Return(_a0 []*columns.Column, _a1 error) *MockBoards_ListColumns_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_ListColumns_Call) RunAndReturn(run func(context.Context, uuid.UUID) ([]*columns.Column, error)) *MockBoards_ListColumns_Call {
	_c.Call.Return(run)
	return _c
}

// SetTimer provides a mock function with given fields: ctx, id, minutes
func (_m *MockBoards) SetTimer(ctx context.Context, id uuid.UUID, minutes uint8) (*dto.Board, error) {
	ret := _m.Called(ctx, id, minutes)

	if len(ret) == 0 {
		panic("no return value specified for SetTimer")
	}

	var r0 *dto.Board
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uint8) (*dto.Board, error)); ok {
		return rf(ctx, id, minutes)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uint8) *dto.Board); ok {
		r0 = rf(ctx, id, minutes)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*dto.Board)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID, uint8) error); ok {
		r1 = rf(ctx, id, minutes)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_SetTimer_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'SetTimer'
type MockBoards_SetTimer_Call struct {
	*mock.Call
}

// SetTimer is a helper method to define mock.On call
//   - ctx context.Context
//   - id uuid.UUID
//   - minutes uint8
func (_e *MockBoards_Expecter) SetTimer(ctx interface{}, id interface{}, minutes interface{}) *MockBoards_SetTimer_Call {
	return &MockBoards_SetTimer_Call{Call: _e.mock.On("SetTimer", ctx, id, minutes)}
}

func (_c *MockBoards_SetTimer_Call) Run(run func(ctx context.Context, id uuid.UUID, minutes uint8)) *MockBoards_SetTimer_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uint8))
	})
	return _c
}

func (_c *MockBoards_SetTimer_Call) Return(_a0 *dto.Board, _a1 error) *MockBoards_SetTimer_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_SetTimer_Call) RunAndReturn(run func(context.Context, uuid.UUID, uint8) (*dto.Board, error)) *MockBoards_SetTimer_Call {
	_c.Call.Return(run)
	return _c
}

// Update provides a mock function with given fields: ctx, body
func (_m *MockBoards) Update(ctx context.Context, body dto.BoardUpdateRequest) (*dto.Board, error) {
	ret := _m.Called(ctx, body)

	if len(ret) == 0 {
		panic("no return value specified for Update")
	}

	var r0 *dto.Board
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, dto.BoardUpdateRequest) (*dto.Board, error)); ok {
		return rf(ctx, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, dto.BoardUpdateRequest) *dto.Board); ok {
		r0 = rf(ctx, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*dto.Board)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, dto.BoardUpdateRequest) error); ok {
		r1 = rf(ctx, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_Update_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Update'
type MockBoards_Update_Call struct {
	*mock.Call
}

// Update is a helper method to define mock.On call
//   - ctx context.Context
//   - body dto.BoardUpdateRequest
func (_e *MockBoards_Expecter) Update(ctx interface{}, body interface{}) *MockBoards_Update_Call {
	return &MockBoards_Update_Call{Call: _e.mock.On("Update", ctx, body)}
}

func (_c *MockBoards_Update_Call) Run(run func(ctx context.Context, body dto.BoardUpdateRequest)) *MockBoards_Update_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(dto.BoardUpdateRequest))
	})
	return _c
}

func (_c *MockBoards_Update_Call) Return(_a0 *dto.Board, _a1 error) *MockBoards_Update_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_Update_Call) RunAndReturn(run func(context.Context, dto.BoardUpdateRequest) (*dto.Board, error)) *MockBoards_Update_Call {
	_c.Call.Return(run)
	return _c
}

// UpdateColumn provides a mock function with given fields: ctx, body
func (_m *MockBoards) UpdateColumn(ctx context.Context, body dto.ColumnUpdateRequest) (*columns.Column, error) {
	ret := _m.Called(ctx, body)

	if len(ret) == 0 {
		panic("no return value specified for UpdateColumn")
	}

	var r0 *columns.Column
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, dto.ColumnUpdateRequest) (*columns.Column, error)); ok {
		return rf(ctx, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, dto.ColumnUpdateRequest) *columns.Column); ok {
		r0 = rf(ctx, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*columns.Column)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, dto.ColumnUpdateRequest) error); ok {
		r1 = rf(ctx, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockBoards_UpdateColumn_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'UpdateColumn'
type MockBoards_UpdateColumn_Call struct {
	*mock.Call
}

// UpdateColumn is a helper method to define mock.On call
//   - ctx context.Context
//   - body dto.ColumnUpdateRequest
func (_e *MockBoards_Expecter) UpdateColumn(ctx interface{}, body interface{}) *MockBoards_UpdateColumn_Call {
	return &MockBoards_UpdateColumn_Call{Call: _e.mock.On("UpdateColumn", ctx, body)}
}

func (_c *MockBoards_UpdateColumn_Call) Run(run func(ctx context.Context, body dto.ColumnUpdateRequest)) *MockBoards_UpdateColumn_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(dto.ColumnUpdateRequest))
	})
	return _c
}

func (_c *MockBoards_UpdateColumn_Call) Return(_a0 *columns.Column, _a1 error) *MockBoards_UpdateColumn_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockBoards_UpdateColumn_Call) RunAndReturn(run func(context.Context, dto.ColumnUpdateRequest) (*columns.Column, error)) *MockBoards_UpdateColumn_Call {
	_c.Call.Return(run)
	return _c
}

// NewMockBoards creates a new instance of MockBoards. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockBoards(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockBoards {
	mock := &MockBoards{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
