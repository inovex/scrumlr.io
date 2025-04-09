// Code generated by mockery v2.52.3. DO NOT EDIT.

package sessions

import (
	context "context"
	url "net/url"

	mock "github.com/stretchr/testify/mock"

	uuid "github.com/google/uuid"
)

// MockSessionService is an autogenerated mock type for the SessionService type
type MockSessionService struct {
	mock.Mock
}

type MockSessionService_Expecter struct {
	mock *mock.Mock
}

func (_m *MockSessionService) EXPECT() *MockSessionService_Expecter {
	return &MockSessionService_Expecter{mock: &_m.Mock}
}

// BoardSessionFilterTypeFromQueryString provides a mock function with given fields: query
func (_m *MockSessionService) BoardSessionFilterTypeFromQueryString(query url.Values) BoardSessionFilter {
	ret := _m.Called(query)

	if len(ret) == 0 {
		panic("no return value specified for BoardSessionFilterTypeFromQueryString")
	}

	var r0 BoardSessionFilter
	if rf, ok := ret.Get(0).(func(url.Values) BoardSessionFilter); ok {
		r0 = rf(query)
	} else {
		r0 = ret.Get(0).(BoardSessionFilter)
	}

	return r0
}

// MockSessionService_BoardSessionFilterTypeFromQueryString_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'BoardSessionFilterTypeFromQueryString'
type MockSessionService_BoardSessionFilterTypeFromQueryString_Call struct {
	*mock.Call
}

// BoardSessionFilterTypeFromQueryString is a helper method to define mock.On call
//   - query url.Values
func (_e *MockSessionService_Expecter) BoardSessionFilterTypeFromQueryString(query interface{}) *MockSessionService_BoardSessionFilterTypeFromQueryString_Call {
	return &MockSessionService_BoardSessionFilterTypeFromQueryString_Call{Call: _e.mock.On("BoardSessionFilterTypeFromQueryString", query)}
}

func (_c *MockSessionService_BoardSessionFilterTypeFromQueryString_Call) Run(run func(query url.Values)) *MockSessionService_BoardSessionFilterTypeFromQueryString_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(url.Values))
	})
	return _c
}

func (_c *MockSessionService_BoardSessionFilterTypeFromQueryString_Call) Return(_a0 BoardSessionFilter) *MockSessionService_BoardSessionFilterTypeFromQueryString_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockSessionService_BoardSessionFilterTypeFromQueryString_Call) RunAndReturn(run func(url.Values) BoardSessionFilter) *MockSessionService_BoardSessionFilterTypeFromQueryString_Call {
	_c.Call.Return(run)
	return _c
}

// Connect provides a mock function with given fields: ctx, boardID, userID
func (_m *MockSessionService) Connect(ctx context.Context, boardID uuid.UUID, userID uuid.UUID) error {
	ret := _m.Called(ctx, boardID, userID)

	if len(ret) == 0 {
		panic("no return value specified for Connect")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) error); ok {
		r0 = rf(ctx, boardID, userID)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockSessionService_Connect_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Connect'
type MockSessionService_Connect_Call struct {
	*mock.Call
}

// Connect is a helper method to define mock.On call
//   - ctx context.Context
//   - boardID uuid.UUID
//   - userID uuid.UUID
func (_e *MockSessionService_Expecter) Connect(ctx interface{}, boardID interface{}, userID interface{}) *MockSessionService_Connect_Call {
	return &MockSessionService_Connect_Call{Call: _e.mock.On("Connect", ctx, boardID, userID)}
}

func (_c *MockSessionService_Connect_Call) Run(run func(ctx context.Context, boardID uuid.UUID, userID uuid.UUID)) *MockSessionService_Connect_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *MockSessionService_Connect_Call) Return(_a0 error) *MockSessionService_Connect_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockSessionService_Connect_Call) RunAndReturn(run func(context.Context, uuid.UUID, uuid.UUID) error) *MockSessionService_Connect_Call {
	_c.Call.Return(run)
	return _c
}

// Create provides a mock function with given fields: ctx, boardID, userID
func (_m *MockSessionService) Create(ctx context.Context, boardID uuid.UUID, userID uuid.UUID) (*BoardSession, error) {
	ret := _m.Called(ctx, boardID, userID)

	if len(ret) == 0 {
		panic("no return value specified for Create")
	}

	var r0 *BoardSession
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) (*BoardSession, error)); ok {
		return rf(ctx, boardID, userID)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) *BoardSession); ok {
		r0 = rf(ctx, boardID, userID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*BoardSession)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID, uuid.UUID) error); ok {
		r1 = rf(ctx, boardID, userID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockSessionService_Create_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Create'
type MockSessionService_Create_Call struct {
	*mock.Call
}

// Create is a helper method to define mock.On call
//   - ctx context.Context
//   - boardID uuid.UUID
//   - userID uuid.UUID
func (_e *MockSessionService_Expecter) Create(ctx interface{}, boardID interface{}, userID interface{}) *MockSessionService_Create_Call {
	return &MockSessionService_Create_Call{Call: _e.mock.On("Create", ctx, boardID, userID)}
}

func (_c *MockSessionService_Create_Call) Run(run func(ctx context.Context, boardID uuid.UUID, userID uuid.UUID)) *MockSessionService_Create_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *MockSessionService_Create_Call) Return(_a0 *BoardSession, _a1 error) *MockSessionService_Create_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockSessionService_Create_Call) RunAndReturn(run func(context.Context, uuid.UUID, uuid.UUID) (*BoardSession, error)) *MockSessionService_Create_Call {
	_c.Call.Return(run)
	return _c
}

// Disconnect provides a mock function with given fields: ctx, boardID, userID
func (_m *MockSessionService) Disconnect(ctx context.Context, boardID uuid.UUID, userID uuid.UUID) error {
	ret := _m.Called(ctx, boardID, userID)

	if len(ret) == 0 {
		panic("no return value specified for Disconnect")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) error); ok {
		r0 = rf(ctx, boardID, userID)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockSessionService_Disconnect_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Disconnect'
type MockSessionService_Disconnect_Call struct {
	*mock.Call
}

// Disconnect is a helper method to define mock.On call
//   - ctx context.Context
//   - boardID uuid.UUID
//   - userID uuid.UUID
func (_e *MockSessionService_Expecter) Disconnect(ctx interface{}, boardID interface{}, userID interface{}) *MockSessionService_Disconnect_Call {
	return &MockSessionService_Disconnect_Call{Call: _e.mock.On("Disconnect", ctx, boardID, userID)}
}

func (_c *MockSessionService_Disconnect_Call) Run(run func(ctx context.Context, boardID uuid.UUID, userID uuid.UUID)) *MockSessionService_Disconnect_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *MockSessionService_Disconnect_Call) Return(_a0 error) *MockSessionService_Disconnect_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockSessionService_Disconnect_Call) RunAndReturn(run func(context.Context, uuid.UUID, uuid.UUID) error) *MockSessionService_Disconnect_Call {
	_c.Call.Return(run)
	return _c
}

// Exists provides a mock function with given fields: ctx, boardID, userID
func (_m *MockSessionService) Exists(ctx context.Context, boardID uuid.UUID, userID uuid.UUID) (bool, error) {
	ret := _m.Called(ctx, boardID, userID)

	if len(ret) == 0 {
		panic("no return value specified for Exists")
	}

	var r0 bool
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) (bool, error)); ok {
		return rf(ctx, boardID, userID)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) bool); ok {
		r0 = rf(ctx, boardID, userID)
	} else {
		r0 = ret.Get(0).(bool)
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID, uuid.UUID) error); ok {
		r1 = rf(ctx, boardID, userID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockSessionService_Exists_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Exists'
type MockSessionService_Exists_Call struct {
	*mock.Call
}

// Exists is a helper method to define mock.On call
//   - ctx context.Context
//   - boardID uuid.UUID
//   - userID uuid.UUID
func (_e *MockSessionService_Expecter) Exists(ctx interface{}, boardID interface{}, userID interface{}) *MockSessionService_Exists_Call {
	return &MockSessionService_Exists_Call{Call: _e.mock.On("Exists", ctx, boardID, userID)}
}

func (_c *MockSessionService_Exists_Call) Run(run func(ctx context.Context, boardID uuid.UUID, userID uuid.UUID)) *MockSessionService_Exists_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *MockSessionService_Exists_Call) Return(_a0 bool, _a1 error) *MockSessionService_Exists_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockSessionService_Exists_Call) RunAndReturn(run func(context.Context, uuid.UUID, uuid.UUID) (bool, error)) *MockSessionService_Exists_Call {
	_c.Call.Return(run)
	return _c
}

// Get provides a mock function with given fields: ctx, boardID, userID
func (_m *MockSessionService) Get(ctx context.Context, boardID uuid.UUID, userID uuid.UUID) (*BoardSession, error) {
	ret := _m.Called(ctx, boardID, userID)

	if len(ret) == 0 {
		panic("no return value specified for Get")
	}

	var r0 *BoardSession
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) (*BoardSession, error)); ok {
		return rf(ctx, boardID, userID)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) *BoardSession); ok {
		r0 = rf(ctx, boardID, userID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*BoardSession)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID, uuid.UUID) error); ok {
		r1 = rf(ctx, boardID, userID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockSessionService_Get_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Get'
type MockSessionService_Get_Call struct {
	*mock.Call
}

// Get is a helper method to define mock.On call
//   - ctx context.Context
//   - boardID uuid.UUID
//   - userID uuid.UUID
func (_e *MockSessionService_Expecter) Get(ctx interface{}, boardID interface{}, userID interface{}) *MockSessionService_Get_Call {
	return &MockSessionService_Get_Call{Call: _e.mock.On("Get", ctx, boardID, userID)}
}

func (_c *MockSessionService_Get_Call) Run(run func(ctx context.Context, boardID uuid.UUID, userID uuid.UUID)) *MockSessionService_Get_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *MockSessionService_Get_Call) Return(_a0 *BoardSession, _a1 error) *MockSessionService_Get_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockSessionService_Get_Call) RunAndReturn(run func(context.Context, uuid.UUID, uuid.UUID) (*BoardSession, error)) *MockSessionService_Get_Call {
	_c.Call.Return(run)
	return _c
}

// GetAll provides a mock function with given fields: ctx, boardID, filter
func (_m *MockSessionService) GetAll(ctx context.Context, boardID uuid.UUID, filter BoardSessionFilter) ([]*BoardSession, error) {
	ret := _m.Called(ctx, boardID, filter)

	if len(ret) == 0 {
		panic("no return value specified for GetAll")
	}

	var r0 []*BoardSession
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, BoardSessionFilter) ([]*BoardSession, error)); ok {
		return rf(ctx, boardID, filter)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, BoardSessionFilter) []*BoardSession); ok {
		r0 = rf(ctx, boardID, filter)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*BoardSession)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID, BoardSessionFilter) error); ok {
		r1 = rf(ctx, boardID, filter)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockSessionService_GetAll_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetAll'
type MockSessionService_GetAll_Call struct {
	*mock.Call
}

// GetAll is a helper method to define mock.On call
//   - ctx context.Context
//   - boardID uuid.UUID
//   - filter BoardSessionFilter
func (_e *MockSessionService_Expecter) GetAll(ctx interface{}, boardID interface{}, filter interface{}) *MockSessionService_GetAll_Call {
	return &MockSessionService_GetAll_Call{Call: _e.mock.On("GetAll", ctx, boardID, filter)}
}

func (_c *MockSessionService_GetAll_Call) Run(run func(ctx context.Context, boardID uuid.UUID, filter BoardSessionFilter)) *MockSessionService_GetAll_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(BoardSessionFilter))
	})
	return _c
}

func (_c *MockSessionService_GetAll_Call) Return(_a0 []*BoardSession, _a1 error) *MockSessionService_GetAll_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockSessionService_GetAll_Call) RunAndReturn(run func(context.Context, uuid.UUID, BoardSessionFilter) ([]*BoardSession, error)) *MockSessionService_GetAll_Call {
	_c.Call.Return(run)
	return _c
}

// GetUserConnectedBoards provides a mock function with given fields: ctx, user
func (_m *MockSessionService) GetUserConnectedBoards(ctx context.Context, user uuid.UUID) ([]*BoardSession, error) {
	ret := _m.Called(ctx, user)

	if len(ret) == 0 {
		panic("no return value specified for GetUserConnectedBoards")
	}

	var r0 []*BoardSession
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) ([]*BoardSession, error)); ok {
		return rf(ctx, user)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) []*BoardSession); ok {
		r0 = rf(ctx, user)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*BoardSession)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, user)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockSessionService_GetUserConnectedBoards_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetUserConnectedBoards'
type MockSessionService_GetUserConnectedBoards_Call struct {
	*mock.Call
}

// GetUserConnectedBoards is a helper method to define mock.On call
//   - ctx context.Context
//   - user uuid.UUID
func (_e *MockSessionService_Expecter) GetUserConnectedBoards(ctx interface{}, user interface{}) *MockSessionService_GetUserConnectedBoards_Call {
	return &MockSessionService_GetUserConnectedBoards_Call{Call: _e.mock.On("GetUserConnectedBoards", ctx, user)}
}

func (_c *MockSessionService_GetUserConnectedBoards_Call) Run(run func(ctx context.Context, user uuid.UUID)) *MockSessionService_GetUserConnectedBoards_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockSessionService_GetUserConnectedBoards_Call) Return(_a0 []*BoardSession, _a1 error) *MockSessionService_GetUserConnectedBoards_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockSessionService_GetUserConnectedBoards_Call) RunAndReturn(run func(context.Context, uuid.UUID) ([]*BoardSession, error)) *MockSessionService_GetUserConnectedBoards_Call {
	_c.Call.Return(run)
	return _c
}

// IsParticipantBanned provides a mock function with given fields: ctx, boardID, userID
func (_m *MockSessionService) IsParticipantBanned(ctx context.Context, boardID uuid.UUID, userID uuid.UUID) (bool, error) {
	ret := _m.Called(ctx, boardID, userID)

	if len(ret) == 0 {
		panic("no return value specified for IsParticipantBanned")
	}

	var r0 bool
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) (bool, error)); ok {
		return rf(ctx, boardID, userID)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) bool); ok {
		r0 = rf(ctx, boardID, userID)
	} else {
		r0 = ret.Get(0).(bool)
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID, uuid.UUID) error); ok {
		r1 = rf(ctx, boardID, userID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockSessionService_IsParticipantBanned_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'IsParticipantBanned'
type MockSessionService_IsParticipantBanned_Call struct {
	*mock.Call
}

// IsParticipantBanned is a helper method to define mock.On call
//   - ctx context.Context
//   - boardID uuid.UUID
//   - userID uuid.UUID
func (_e *MockSessionService_Expecter) IsParticipantBanned(ctx interface{}, boardID interface{}, userID interface{}) *MockSessionService_IsParticipantBanned_Call {
	return &MockSessionService_IsParticipantBanned_Call{Call: _e.mock.On("IsParticipantBanned", ctx, boardID, userID)}
}

func (_c *MockSessionService_IsParticipantBanned_Call) Run(run func(ctx context.Context, boardID uuid.UUID, userID uuid.UUID)) *MockSessionService_IsParticipantBanned_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *MockSessionService_IsParticipantBanned_Call) Return(_a0 bool, _a1 error) *MockSessionService_IsParticipantBanned_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockSessionService_IsParticipantBanned_Call) RunAndReturn(run func(context.Context, uuid.UUID, uuid.UUID) (bool, error)) *MockSessionService_IsParticipantBanned_Call {
	_c.Call.Return(run)
	return _c
}

// ModeratorSessionExists provides a mock function with given fields: ctx, boardID, userID
func (_m *MockSessionService) ModeratorSessionExists(ctx context.Context, boardID uuid.UUID, userID uuid.UUID) (bool, error) {
	ret := _m.Called(ctx, boardID, userID)

	if len(ret) == 0 {
		panic("no return value specified for ModeratorSessionExists")
	}

	var r0 bool
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) (bool, error)); ok {
		return rf(ctx, boardID, userID)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID, uuid.UUID) bool); ok {
		r0 = rf(ctx, boardID, userID)
	} else {
		r0 = ret.Get(0).(bool)
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID, uuid.UUID) error); ok {
		r1 = rf(ctx, boardID, userID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockSessionService_ModeratorSessionExists_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'ModeratorSessionExists'
type MockSessionService_ModeratorSessionExists_Call struct {
	*mock.Call
}

// ModeratorSessionExists is a helper method to define mock.On call
//   - ctx context.Context
//   - boardID uuid.UUID
//   - userID uuid.UUID
func (_e *MockSessionService_Expecter) ModeratorSessionExists(ctx interface{}, boardID interface{}, userID interface{}) *MockSessionService_ModeratorSessionExists_Call {
	return &MockSessionService_ModeratorSessionExists_Call{Call: _e.mock.On("ModeratorSessionExists", ctx, boardID, userID)}
}

func (_c *MockSessionService_ModeratorSessionExists_Call) Run(run func(ctx context.Context, boardID uuid.UUID, userID uuid.UUID)) *MockSessionService_ModeratorSessionExists_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *MockSessionService_ModeratorSessionExists_Call) Return(_a0 bool, _a1 error) *MockSessionService_ModeratorSessionExists_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockSessionService_ModeratorSessionExists_Call) RunAndReturn(run func(context.Context, uuid.UUID, uuid.UUID) (bool, error)) *MockSessionService_ModeratorSessionExists_Call {
	_c.Call.Return(run)
	return _c
}

// Update provides a mock function with given fields: ctx, body
func (_m *MockSessionService) Update(ctx context.Context, body BoardSessionUpdateRequest) (*BoardSession, error) {
	ret := _m.Called(ctx, body)

	if len(ret) == 0 {
		panic("no return value specified for Update")
	}

	var r0 *BoardSession
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, BoardSessionUpdateRequest) (*BoardSession, error)); ok {
		return rf(ctx, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, BoardSessionUpdateRequest) *BoardSession); ok {
		r0 = rf(ctx, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*BoardSession)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, BoardSessionUpdateRequest) error); ok {
		r1 = rf(ctx, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockSessionService_Update_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Update'
type MockSessionService_Update_Call struct {
	*mock.Call
}

// Update is a helper method to define mock.On call
//   - ctx context.Context
//   - body BoardSessionUpdateRequest
func (_e *MockSessionService_Expecter) Update(ctx interface{}, body interface{}) *MockSessionService_Update_Call {
	return &MockSessionService_Update_Call{Call: _e.mock.On("Update", ctx, body)}
}

func (_c *MockSessionService_Update_Call) Run(run func(ctx context.Context, body BoardSessionUpdateRequest)) *MockSessionService_Update_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(BoardSessionUpdateRequest))
	})
	return _c
}

func (_c *MockSessionService_Update_Call) Return(_a0 *BoardSession, _a1 error) *MockSessionService_Update_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockSessionService_Update_Call) RunAndReturn(run func(context.Context, BoardSessionUpdateRequest) (*BoardSession, error)) *MockSessionService_Update_Call {
	_c.Call.Return(run)
	return _c
}

// UpdateAll provides a mock function with given fields: ctx, body
func (_m *MockSessionService) UpdateAll(ctx context.Context, body BoardSessionsUpdateRequest) ([]*BoardSession, error) {
	ret := _m.Called(ctx, body)

	if len(ret) == 0 {
		panic("no return value specified for UpdateAll")
	}

	var r0 []*BoardSession
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, BoardSessionsUpdateRequest) ([]*BoardSession, error)); ok {
		return rf(ctx, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, BoardSessionsUpdateRequest) []*BoardSession); ok {
		r0 = rf(ctx, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*BoardSession)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, BoardSessionsUpdateRequest) error); ok {
		r1 = rf(ctx, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockSessionService_UpdateAll_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'UpdateAll'
type MockSessionService_UpdateAll_Call struct {
	*mock.Call
}

// UpdateAll is a helper method to define mock.On call
//   - ctx context.Context
//   - body BoardSessionsUpdateRequest
func (_e *MockSessionService_Expecter) UpdateAll(ctx interface{}, body interface{}) *MockSessionService_UpdateAll_Call {
	return &MockSessionService_UpdateAll_Call{Call: _e.mock.On("UpdateAll", ctx, body)}
}

func (_c *MockSessionService_UpdateAll_Call) Run(run func(ctx context.Context, body BoardSessionsUpdateRequest)) *MockSessionService_UpdateAll_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(BoardSessionsUpdateRequest))
	})
	return _c
}

func (_c *MockSessionService_UpdateAll_Call) Return(_a0 []*BoardSession, _a1 error) *MockSessionService_UpdateAll_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockSessionService_UpdateAll_Call) RunAndReturn(run func(context.Context, BoardSessionsUpdateRequest) ([]*BoardSession, error)) *MockSessionService_UpdateAll_Call {
	_c.Call.Return(run)
	return _c
}

// UpdateUserBoards provides a mock function with given fields: ctx, body
func (_m *MockSessionService) UpdateUserBoards(ctx context.Context, body BoardSessionUpdateRequest) ([]*BoardSession, error) {
	ret := _m.Called(ctx, body)

	if len(ret) == 0 {
		panic("no return value specified for UpdateUserBoards")
	}

	var r0 []*BoardSession
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, BoardSessionUpdateRequest) ([]*BoardSession, error)); ok {
		return rf(ctx, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, BoardSessionUpdateRequest) []*BoardSession); ok {
		r0 = rf(ctx, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*BoardSession)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, BoardSessionUpdateRequest) error); ok {
		r1 = rf(ctx, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockSessionService_UpdateUserBoards_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'UpdateUserBoards'
type MockSessionService_UpdateUserBoards_Call struct {
	*mock.Call
}

// UpdateUserBoards is a helper method to define mock.On call
//   - ctx context.Context
//   - body BoardSessionUpdateRequest
func (_e *MockSessionService_Expecter) UpdateUserBoards(ctx interface{}, body interface{}) *MockSessionService_UpdateUserBoards_Call {
	return &MockSessionService_UpdateUserBoards_Call{Call: _e.mock.On("UpdateUserBoards", ctx, body)}
}

func (_c *MockSessionService_UpdateUserBoards_Call) Run(run func(ctx context.Context, body BoardSessionUpdateRequest)) *MockSessionService_UpdateUserBoards_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(BoardSessionUpdateRequest))
	})
	return _c
}

func (_c *MockSessionService_UpdateUserBoards_Call) Return(_a0 []*BoardSession, _a1 error) *MockSessionService_UpdateUserBoards_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockSessionService_UpdateUserBoards_Call) RunAndReturn(run func(context.Context, BoardSessionUpdateRequest) ([]*BoardSession, error)) *MockSessionService_UpdateUserBoards_Call {
	_c.Call.Return(run)
	return _c
}

// NewMockSessionService creates a new instance of MockSessionService. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockSessionService(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockSessionService {
	mock := &MockSessionService{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
