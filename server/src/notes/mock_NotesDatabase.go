// Code generated by mockery v2.52.3. DO NOT EDIT.

package notes

import (
	uuid "github.com/google/uuid"
	mock "github.com/stretchr/testify/mock"
)

// MockNotesDatabase is an autogenerated mock type for the NotesDatabase type
type MockNotesDatabase struct {
	mock.Mock
}

type MockNotesDatabase_Expecter struct {
	mock *mock.Mock
}

func (_m *MockNotesDatabase) EXPECT() *MockNotesDatabase_Expecter {
	return &MockNotesDatabase_Expecter{mock: &_m.Mock}
}

// CreateNote provides a mock function with given fields: insert
func (_m *MockNotesDatabase) CreateNote(insert NoteInsertDB) (NoteDB, error) {
	ret := _m.Called(insert)

	if len(ret) == 0 {
		panic("no return value specified for CreateNote")
	}

	var r0 NoteDB
	var r1 error
	if rf, ok := ret.Get(0).(func(NoteInsertDB) (NoteDB, error)); ok {
		return rf(insert)
	}
	if rf, ok := ret.Get(0).(func(NoteInsertDB) NoteDB); ok {
		r0 = rf(insert)
	} else {
		r0 = ret.Get(0).(NoteDB)
	}

	if rf, ok := ret.Get(1).(func(NoteInsertDB) error); ok {
		r1 = rf(insert)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotesDatabase_CreateNote_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'CreateNote'
type MockNotesDatabase_CreateNote_Call struct {
	*mock.Call
}

// CreateNote is a helper method to define mock.On call
//   - insert NoteInsertDB
func (_e *MockNotesDatabase_Expecter) CreateNote(insert interface{}) *MockNotesDatabase_CreateNote_Call {
	return &MockNotesDatabase_CreateNote_Call{Call: _e.mock.On("CreateNote", insert)}
}

func (_c *MockNotesDatabase_CreateNote_Call) Run(run func(insert NoteInsertDB)) *MockNotesDatabase_CreateNote_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(NoteInsertDB))
	})
	return _c
}

func (_c *MockNotesDatabase_CreateNote_Call) Return(_a0 NoteDB, _a1 error) *MockNotesDatabase_CreateNote_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotesDatabase_CreateNote_Call) RunAndReturn(run func(NoteInsertDB) (NoteDB, error)) *MockNotesDatabase_CreateNote_Call {
	_c.Call.Return(run)
	return _c
}

// DeleteNote provides a mock function with given fields: caller, board, id, deleteStack
func (_m *MockNotesDatabase) DeleteNote(caller uuid.UUID, board uuid.UUID, id uuid.UUID, deleteStack bool) error {
	ret := _m.Called(caller, board, id, deleteStack)

	if len(ret) == 0 {
		panic("no return value specified for DeleteNote")
	}

	var r0 error
	if rf, ok := ret.Get(0).(func(uuid.UUID, uuid.UUID, uuid.UUID, bool) error); ok {
		r0 = rf(caller, board, id, deleteStack)
	} else {
		r0 = ret.Error(0)
	}

	return r0
}

// MockNotesDatabase_DeleteNote_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'DeleteNote'
type MockNotesDatabase_DeleteNote_Call struct {
	*mock.Call
}

// DeleteNote is a helper method to define mock.On call
//   - caller uuid.UUID
//   - board uuid.UUID
//   - id uuid.UUID
//   - deleteStack bool
func (_e *MockNotesDatabase_Expecter) DeleteNote(caller interface{}, board interface{}, id interface{}, deleteStack interface{}) *MockNotesDatabase_DeleteNote_Call {
	return &MockNotesDatabase_DeleteNote_Call{Call: _e.mock.On("DeleteNote", caller, board, id, deleteStack)}
}

func (_c *MockNotesDatabase_DeleteNote_Call) Run(run func(caller uuid.UUID, board uuid.UUID, id uuid.UUID, deleteStack bool)) *MockNotesDatabase_DeleteNote_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(uuid.UUID), args[1].(uuid.UUID), args[2].(uuid.UUID), args[3].(bool))
	})
	return _c
}

func (_c *MockNotesDatabase_DeleteNote_Call) Return(_a0 error) *MockNotesDatabase_DeleteNote_Call {
	_c.Call.Return(_a0)
	return _c
}

func (_c *MockNotesDatabase_DeleteNote_Call) RunAndReturn(run func(uuid.UUID, uuid.UUID, uuid.UUID, bool) error) *MockNotesDatabase_DeleteNote_Call {
	_c.Call.Return(run)
	return _c
}

// GetChildNotes provides a mock function with given fields: parentNote
func (_m *MockNotesDatabase) GetChildNotes(parentNote uuid.UUID) ([]NoteDB, error) {
	ret := _m.Called(parentNote)

	if len(ret) == 0 {
		panic("no return value specified for GetChildNotes")
	}

	var r0 []NoteDB
	var r1 error
	if rf, ok := ret.Get(0).(func(uuid.UUID) ([]NoteDB, error)); ok {
		return rf(parentNote)
	}
	if rf, ok := ret.Get(0).(func(uuid.UUID) []NoteDB); ok {
		r0 = rf(parentNote)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]NoteDB)
		}
	}

	if rf, ok := ret.Get(1).(func(uuid.UUID) error); ok {
		r1 = rf(parentNote)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotesDatabase_GetChildNotes_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetChildNotes'
type MockNotesDatabase_GetChildNotes_Call struct {
	*mock.Call
}

// GetChildNotes is a helper method to define mock.On call
//   - parentNote uuid.UUID
func (_e *MockNotesDatabase_Expecter) GetChildNotes(parentNote interface{}) *MockNotesDatabase_GetChildNotes_Call {
	return &MockNotesDatabase_GetChildNotes_Call{Call: _e.mock.On("GetChildNotes", parentNote)}
}

func (_c *MockNotesDatabase_GetChildNotes_Call) Run(run func(parentNote uuid.UUID)) *MockNotesDatabase_GetChildNotes_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(uuid.UUID))
	})
	return _c
}

func (_c *MockNotesDatabase_GetChildNotes_Call) Return(_a0 []NoteDB, _a1 error) *MockNotesDatabase_GetChildNotes_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotesDatabase_GetChildNotes_Call) RunAndReturn(run func(uuid.UUID) ([]NoteDB, error)) *MockNotesDatabase_GetChildNotes_Call {
	_c.Call.Return(run)
	return _c
}

// GetNote provides a mock function with given fields: id
func (_m *MockNotesDatabase) GetNote(id uuid.UUID) (NoteDB, error) {
	ret := _m.Called(id)

	if len(ret) == 0 {
		panic("no return value specified for GetNote")
	}

	var r0 NoteDB
	var r1 error
	if rf, ok := ret.Get(0).(func(uuid.UUID) (NoteDB, error)); ok {
		return rf(id)
	}
	if rf, ok := ret.Get(0).(func(uuid.UUID) NoteDB); ok {
		r0 = rf(id)
	} else {
		r0 = ret.Get(0).(NoteDB)
	}

	if rf, ok := ret.Get(1).(func(uuid.UUID) error); ok {
		r1 = rf(id)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotesDatabase_GetNote_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetNote'
type MockNotesDatabase_GetNote_Call struct {
	*mock.Call
}

// GetNote is a helper method to define mock.On call
//   - id uuid.UUID
func (_e *MockNotesDatabase_Expecter) GetNote(id interface{}) *MockNotesDatabase_GetNote_Call {
	return &MockNotesDatabase_GetNote_Call{Call: _e.mock.On("GetNote", id)}
}

func (_c *MockNotesDatabase_GetNote_Call) Run(run func(id uuid.UUID)) *MockNotesDatabase_GetNote_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(uuid.UUID))
	})
	return _c
}

func (_c *MockNotesDatabase_GetNote_Call) Return(_a0 NoteDB, _a1 error) *MockNotesDatabase_GetNote_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotesDatabase_GetNote_Call) RunAndReturn(run func(uuid.UUID) (NoteDB, error)) *MockNotesDatabase_GetNote_Call {
	_c.Call.Return(run)
	return _c
}

// GetNotes provides a mock function with given fields: board, columns
func (_m *MockNotesDatabase) GetNotes(board uuid.UUID, columns ...uuid.UUID) ([]NoteDB, error) {
	_va := make([]interface{}, len(columns))
	for _i := range columns {
		_va[_i] = columns[_i]
	}
	var _ca []interface{}
	_ca = append(_ca, board)
	_ca = append(_ca, _va...)
	ret := _m.Called(_ca...)

	if len(ret) == 0 {
		panic("no return value specified for GetNotes")
	}

	var r0 []NoteDB
	var r1 error
	if rf, ok := ret.Get(0).(func(uuid.UUID, ...uuid.UUID) ([]NoteDB, error)); ok {
		return rf(board, columns...)
	}
	if rf, ok := ret.Get(0).(func(uuid.UUID, ...uuid.UUID) []NoteDB); ok {
		r0 = rf(board, columns...)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]NoteDB)
		}
	}

	if rf, ok := ret.Get(1).(func(uuid.UUID, ...uuid.UUID) error); ok {
		r1 = rf(board, columns...)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotesDatabase_GetNotes_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetNotes'
type MockNotesDatabase_GetNotes_Call struct {
	*mock.Call
}

// GetNotes is a helper method to define mock.On call
//   - board uuid.UUID
//   - columns ...uuid.UUID
func (_e *MockNotesDatabase_Expecter) GetNotes(board interface{}, columns ...interface{}) *MockNotesDatabase_GetNotes_Call {
	return &MockNotesDatabase_GetNotes_Call{Call: _e.mock.On("GetNotes",
		append([]interface{}{board}, columns...)...)}
}

func (_c *MockNotesDatabase_GetNotes_Call) Run(run func(board uuid.UUID, columns ...uuid.UUID)) *MockNotesDatabase_GetNotes_Call {
	_c.Call.Run(func(args mock.Arguments) {
		variadicArgs := make([]uuid.UUID, len(args)-1)
		for i, a := range args[1:] {
			if a != nil {
				variadicArgs[i] = a.(uuid.UUID)
			}
		}
		run(args[0].(uuid.UUID), variadicArgs...)
	})
	return _c
}

func (_c *MockNotesDatabase_GetNotes_Call) Return(_a0 []NoteDB, _a1 error) *MockNotesDatabase_GetNotes_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotesDatabase_GetNotes_Call) RunAndReturn(run func(uuid.UUID, ...uuid.UUID) ([]NoteDB, error)) *MockNotesDatabase_GetNotes_Call {
	_c.Call.Return(run)
	return _c
}

// GetStack provides a mock function with given fields: noteID
func (_m *MockNotesDatabase) GetStack(noteID uuid.UUID) ([]NoteDB, error) {
	ret := _m.Called(noteID)

	if len(ret) == 0 {
		panic("no return value specified for GetStack")
	}

	var r0 []NoteDB
	var r1 error
	if rf, ok := ret.Get(0).(func(uuid.UUID) ([]NoteDB, error)); ok {
		return rf(noteID)
	}
	if rf, ok := ret.Get(0).(func(uuid.UUID) []NoteDB); ok {
		r0 = rf(noteID)
	} else {
		if ret.Get(0) != nil {
			r0 = ret.Get(0).([]NoteDB)
		}
	}

	if rf, ok := ret.Get(1).(func(uuid.UUID) error); ok {
		r1 = rf(noteID)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotesDatabase_GetStack_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'GetStack'
type MockNotesDatabase_GetStack_Call struct {
	*mock.Call
}

// GetStack is a helper method to define mock.On call
//   - noteID uuid.UUID
func (_e *MockNotesDatabase_Expecter) GetStack(noteID interface{}) *MockNotesDatabase_GetStack_Call {
	return &MockNotesDatabase_GetStack_Call{Call: _e.mock.On("GetStack", noteID)}
}

func (_c *MockNotesDatabase_GetStack_Call) Run(run func(noteID uuid.UUID)) *MockNotesDatabase_GetStack_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(uuid.UUID))
	})
	return _c
}

func (_c *MockNotesDatabase_GetStack_Call) Return(_a0 []NoteDB, _a1 error) *MockNotesDatabase_GetStack_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotesDatabase_GetStack_Call) RunAndReturn(run func(uuid.UUID) ([]NoteDB, error)) *MockNotesDatabase_GetStack_Call {
	_c.Call.Return(run)
	return _c
}

// ImportNote provides a mock function with given fields: insert
func (_m *MockNotesDatabase) ImportNote(insert NoteImportDB) (NoteDB, error) {
	ret := _m.Called(insert)

	if len(ret) == 0 {
		panic("no return value specified for ImportNote")
	}

	var r0 NoteDB
	var r1 error
	if rf, ok := ret.Get(0).(func(NoteImportDB) (NoteDB, error)); ok {
		return rf(insert)
	}
	if rf, ok := ret.Get(0).(func(NoteImportDB) NoteDB); ok {
		r0 = rf(insert)
	} else {
		r0 = ret.Get(0).(NoteDB)
	}

	if rf, ok := ret.Get(1).(func(NoteImportDB) error); ok {
		r1 = rf(insert)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotesDatabase_ImportNote_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'ImportNote'
type MockNotesDatabase_ImportNote_Call struct {
	*mock.Call
}

// ImportNote is a helper method to define mock.On call
//   - insert NoteImportDB
func (_e *MockNotesDatabase_Expecter) ImportNote(insert interface{}) *MockNotesDatabase_ImportNote_Call {
	return &MockNotesDatabase_ImportNote_Call{Call: _e.mock.On("ImportNote", insert)}
}

func (_c *MockNotesDatabase_ImportNote_Call) Run(run func(insert NoteImportDB)) *MockNotesDatabase_ImportNote_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(NoteImportDB))
	})
	return _c
}

func (_c *MockNotesDatabase_ImportNote_Call) Return(_a0 NoteDB, _a1 error) *MockNotesDatabase_ImportNote_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotesDatabase_ImportNote_Call) RunAndReturn(run func(NoteImportDB) (NoteDB, error)) *MockNotesDatabase_ImportNote_Call {
	_c.Call.Return(run)
	return _c
}

// UpdateNote provides a mock function with given fields: caller, update
func (_m *MockNotesDatabase) UpdateNote(caller uuid.UUID, update NoteUpdateDB) (NoteDB, error) {
	ret := _m.Called(caller, update)

	if len(ret) == 0 {
		panic("no return value specified for UpdateNote")
	}

	var r0 NoteDB
	var r1 error
	if rf, ok := ret.Get(0).(func(uuid.UUID, NoteUpdateDB) (NoteDB, error)); ok {
		return rf(caller, update)
	}
	if rf, ok := ret.Get(0).(func(uuid.UUID, NoteUpdateDB) NoteDB); ok {
		r0 = rf(caller, update)
	} else {
		r0 = ret.Get(0).(NoteDB)
	}

	if rf, ok := ret.Get(1).(func(uuid.UUID, NoteUpdateDB) error); ok {
		r1 = rf(caller, update)
	} else {
		r1 = ret.Error(1)
	}

	return r0, r1
}

// MockNotesDatabase_UpdateNote_Call is a *mock.Call that shadows Run/Return methods with type explicit version for method 'UpdateNote'
type MockNotesDatabase_UpdateNote_Call struct {
	*mock.Call
}

// UpdateNote is a helper method to define mock.On call
//   - caller uuid.UUID
//   - update NoteUpdateDB
func (_e *MockNotesDatabase_Expecter) UpdateNote(caller interface{}, update interface{}) *MockNotesDatabase_UpdateNote_Call {
	return &MockNotesDatabase_UpdateNote_Call{Call: _e.mock.On("UpdateNote", caller, update)}
}

func (_c *MockNotesDatabase_UpdateNote_Call) Run(run func(caller uuid.UUID, update NoteUpdateDB)) *MockNotesDatabase_UpdateNote_Call {
	_c.Call.Run(func(args mock.Arguments) {
		run(args[0].(uuid.UUID), args[1].(NoteUpdateDB))
	})
	return _c
}

func (_c *MockNotesDatabase_UpdateNote_Call) Return(_a0 NoteDB, _a1 error) *MockNotesDatabase_UpdateNote_Call {
	_c.Call.Return(_a0, _a1)
	return _c
}

func (_c *MockNotesDatabase_UpdateNote_Call) RunAndReturn(run func(uuid.UUID, NoteUpdateDB) (NoteDB, error)) *MockNotesDatabase_UpdateNote_Call {
	_c.Call.Return(run)
	return _c
}

// NewMockNotesDatabase creates a new instance of MockNotesDatabase. It also registers a testing interface on the mock and a cleanup function to assert the mocks expectations.
// The first argument is typically a *testing.T value.
func NewMockNotesDatabase(t interface {
	mock.TestingT
	Cleanup(func())
}) *MockNotesDatabase {
	mock := &MockNotesDatabase{}
	mock.Mock.Test(t)

	t.Cleanup(func() { mock.AssertExpectations(t) })

	return mock
}
