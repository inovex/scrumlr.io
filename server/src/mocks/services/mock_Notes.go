// Code generated by mockery v2.52.2. DO NOT EDIT.

package services

import (
	context "context"

	mock "github.com/stretchr/testify/mock"

	notes "scrumlr.io/server/notes"

	uuid "github.com/google/uuid"
)

// MockNotes is an autogenerated mock type for the Notes type
type MockNotes struct {
	mock.Mock
}

type MockNotes_Expecter struct {
	mock *mock.Mock
}

func (_m *MockNotes) EXPECT() *MockNotes_Expecter {
	return &MockNotes_Expecter{mock: &_m.Mock}
}

// Create provides a mock function with given fields: ctx, body
func (_m *MockNotes) Create(ctx context.Context, body notes.NoteCreateRequest) (*notes.Note, error) {
	ret := _m.Called(ctx, body)

	if len(ret) == 0 {
		panic("no return value specified for Create")
	}

	var r0 *notes.Note
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, notes.NoteCreateRequest) (*notes.Note, error)); ok {
		return rf(ctx, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, notes.NoteCreateRequest) *notes.Note); ok {
		r0 = rf(ctx, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*notes.Note)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, notes.NoteCreateRequest) error); ok {
		r1 = rf(ctx, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotes_Create_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Create'
type MockNotes_Create_Call struct {
	*mock.Call
}

// Create is a helper method to define mock.On call
//   - ctx context.Context
//   - body dto.NoteCreateRequest
func (_e *MockNotes_Expecter) Create(ctx interface{}, body interface{}) *MockNotes_Create_Call {
	return &MockNotes_Create_Call{Call: _e.mock.On("Create", ctx, body)}
}

func (_c *MockNotes_Create_Call) Run(run func(ctx context.Context, body notes.NoteCreateRequest)) *MockNotes_Create_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(notes.NoteCreateRequest))
	})
	return _c
}

func (_c *MockNotes_Create_Call) Return(_a0 *notes.Note, _a1 error) *MockNotes_Create_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotes_Create_Call) RunAndReturn(run func(context.Context, notes.NoteCreateRequest) (*notes.Note, error)) *MockNotes_Create_Call {
	_c.Call.Return(run)
	return _c
}

// Delete provides a mock function with given fields: ctx, body, id
func (_m *MockNotes) Delete(ctx context.Context, body notes.NoteDeleteRequest, id uuid.UUID) error {
	ret := _m.Called(ctx, body, id)

	if len(ret) == 0 {
		panic("no return value specified for Delete")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(context.Context, notes.NoteDeleteRequest, uuid.UUID) error); ok {
		r0 = rf(ctx, body, id)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockNotes_Delete_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Delete'
type MockNotes_Delete_Call struct {
	*mock.Call
}

// Delete is a helper method to define mock.On call
//   - ctx context.Context
//   - body dto.NoteDeleteRequest
//   - id uuid.UUID
func (_e *MockNotes_Expecter) Delete(ctx interface{}, body interface{}, id interface{}) *MockNotes_Delete_Call {
	return &MockNotes_Delete_Call{Call: _e.mock.On("Delete", ctx, body, id)}
}

func (_c *MockNotes_Delete_Call) Run(run func(ctx context.Context, body notes.NoteDeleteRequest, id uuid.UUID)) *MockNotes_Delete_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(notes.NoteDeleteRequest), args[2].(uuid.UUID))
	})
	return _c
}

func (_c *MockNotes_Delete_Call) Return(_a0 error) *MockNotes_Delete_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockNotes_Delete_Call) RunAndReturn(run func(context.Context, notes.NoteDeleteRequest, uuid.UUID) error) *MockNotes_Delete_Call {
	_c.Call.Return(run)
	return _c
}

// Get provides a mock function with given fields: ctx, id
func (_m *MockNotes) Get(ctx context.Context, id uuid.UUID) (*notes.Note, error) {
	ret := _m.Called(ctx, id)

	if len(ret) == 0 {
		panic("no return value specified for Get")
	}

	var r0 *notes.Note
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) (*notes.Note, error)); ok {
		return rf(ctx, id)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) *notes.Note); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*notes.Note)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotes_Get_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Get'
type MockNotes_Get_Call struct {
	*mock.Call
}

// Get is a helper method to define mock.On call
//   - ctx context.Context
//   - id uuid.UUID
func (_e *MockNotes_Expecter) Get(ctx interface{}, id interface{}) *MockNotes_Get_Call {
	return &MockNotes_Get_Call{Call: _e.mock.On("Get", ctx, id)}
}

func (_c *MockNotes_Get_Call) Run(run func(ctx context.Context, id uuid.UUID)) *MockNotes_Get_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockNotes_Get_Call) Return(_a0 *notes.Note, _a1 error) *MockNotes_Get_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotes_Get_Call) RunAndReturn(run func(context.Context, uuid.UUID) (*notes.Note, error)) *MockNotes_Get_Call {
	_c.Call.Return(run)
	return _c
}

// Import provides a mock function with given fields: ctx, body
func (_m *MockNotes) Import(ctx context.Context, body notes.NoteImportRequest) (*notes.Note, error) {
	ret := _m.Called(ctx, body)

	if len(ret) == 0 {
		panic("no return value specified for Import")
	}

	var r0 *notes.Note
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, notes.NoteImportRequest) (*notes.Note, error)); ok {
		return rf(ctx, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, notes.NoteImportRequest) *notes.Note); ok {
		r0 = rf(ctx, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*notes.Note)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, notes.NoteImportRequest) error); ok {
		r1 = rf(ctx, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotes_Import_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Import'
type MockNotes_Import_Call struct {
	*mock.Call
}

// Import is a helper method to define mock.On call
//   - ctx context.Context
//   - body dto.NoteImportRequest
func (_e *MockNotes_Expecter) Import(ctx interface{}, body interface{}) *MockNotes_Import_Call {
	return &MockNotes_Import_Call{Call: _e.mock.On("Import", ctx, body)}
}

func (_c *MockNotes_Import_Call) Run(run func(ctx context.Context, body notes.NoteImportRequest)) *MockNotes_Import_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(notes.NoteImportRequest))
	})
	return _c
}

func (_c *MockNotes_Import_Call) Return(_a0 *notes.Note, _a1 error) *MockNotes_Import_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotes_Import_Call) RunAndReturn(run func(context.Context, notes.NoteImportRequest) (*notes.Note, error)) *MockNotes_Import_Call {
	_c.Call.Return(run)
	return _c
}

// List provides a mock function with given fields: ctx, id
func (_m *MockNotes) List(ctx context.Context, id uuid.UUID) ([]*notes.Note, error) {
	ret := _m.Called(ctx, id)

	if len(ret) == 0 {
		panic("no return value specified for List")
	}

	var r0 []*notes.Note
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) ([]*notes.Note, error)); ok {
		return rf(ctx, id)
	}
	if rf, ok := ret.Get(0).(func(context.Context, uuid.UUID) []*notes.Note); ok {
		r0 = rf(ctx, id)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]*notes.Note)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, uuid.UUID) error); ok {
		r1 = rf(ctx, id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotes_List_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'List'
type MockNotes_List_Call struct {
	*mock.Call
}

// List is a helper method to define mock.On call
//   - ctx context.Context
//   - id uuid.UUID
func (_e *MockNotes_Expecter) List(ctx interface{}, id interface{}) *MockNotes_List_Call {
	return &MockNotes_List_Call{Call: _e.mock.On("List", ctx, id)}
}

func (_c *MockNotes_List_Call) Run(run func(ctx context.Context, id uuid.UUID)) *MockNotes_List_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(uuid.UUID))
	})
	return _c
}

func (_c *MockNotes_List_Call) Return(_a0 []*notes.Note, _a1 error) *MockNotes_List_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotes_List_Call) RunAndReturn(run func(context.Context, uuid.UUID) ([]*notes.Note, error)) *MockNotes_List_Call {
	_c.Call.Return(run)
	return _c
}

// Update provides a mock function with given fields: ctx, body
func (_m *MockNotes) Update(ctx context.Context, body notes.NoteUpdateRequest) (*notes.Note, error) {
	ret := _m.Called(ctx, body)

	if len(ret) == 0 {
		panic("no return value specified for Update")
	}

	var r0 *notes.Note
	var r1 error
	if rf, ok := ret.Get(0).(func(context.Context, notes.NoteUpdateRequest) (*notes.Note, error)); ok {
		return rf(ctx, body)
	}
	if rf, ok := ret.Get(0).(func(context.Context, notes.NoteUpdateRequest) *notes.Note); ok {
		r0 = rf(ctx, body)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).(*notes.Note)
		}
	}

	if rf, ok := ret.Get(1).(func(context.Context, notes.NoteUpdateRequest) error); ok {
		r1 = rf(ctx, body)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotes_Update_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'Update'
type MockNotes_Update_Call struct {
	*mock.Call
}

// Update is a helper method to define mock.On call
//   - ctx context.Context
//   - body dto.NoteUpdateRequest
func (_e *MockNotes_Expecter) Update(ctx interface{}, body interface{}) *MockNotes_Update_Call {
	return &MockNotes_Update_Call{Call: _e.mock.On("Update", ctx, body)}
}

func (_c *MockNotes_Update_Call) Run(run func(ctx context.Context, body notes.NoteUpdateRequest)) *MockNotes_Update_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(context.Context), args[1].(notes.NoteUpdateRequest))
	})
	return _c
}

func (_c *MockNotes_Update_Call) Return(_a0 *notes.Note, _a1 error) *MockNotes_Update_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotes_Update_Call) RunAndReturn(run func(context.Context, notes.NoteUpdateRequest) (*notes.Note, error)) *MockNotes_Update_Call {
	_c.Call.Return(run)
	return _c
}

// NewMockNotes creates a new instance of MockNotes. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockNotes(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockNotes {
	mock := &MockNotes{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
