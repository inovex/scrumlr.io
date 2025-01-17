package api

import "scrumlr.io/server/common/dto"

type TestParameterBundle struct {
	name                 string
	expectedCode         int
	err                  error
	sessionExists        bool
	sessionRequestExists bool
	board                *dto.Board
}

type TestParameterBundleBuilder struct {
	name                 string
	expectedCode         int
	err                  error
	sessionExists        bool
	sessionRequestExists bool
	board                *dto.Board
}

type TestParameterBundles []TestParameterBundle

func (testElements TestParameterBundles) Append(name string, expectedCode int, err error, sessionExists bool, sessionRequestExists bool, board *dto.Board) *TestParameterBundles {
	t := append(testElements,
		newTestParameterBundleBuilder().
			setName(name).
			setExpectedCode(expectedCode).
			setError(err).
			setSessionExists(sessionExists).
			setSessionRequestExists(sessionRequestExists).
			setBoard(board).
			build())
	return &t
}

func newTestParameterBundleBuilder() *TestParameterBundleBuilder {
	return &TestParameterBundleBuilder{}
}

func (t *TestParameterBundleBuilder) setName(name string) *TestParameterBundleBuilder {
	t.name = name
	return t
}

func (t *TestParameterBundleBuilder) setExpectedCode(code int) *TestParameterBundleBuilder {
	t.expectedCode = code
	return t
}

func (t *TestParameterBundleBuilder) setError(err error) *TestParameterBundleBuilder {
	t.err = err
	return t
}

func (t *TestParameterBundleBuilder) setSessionExists(sessionExists bool) *TestParameterBundleBuilder {
	t.sessionExists = sessionExists
	return t
}

func (t *TestParameterBundleBuilder) setSessionRequestExists(sessionRequestExists bool) *TestParameterBundleBuilder {
	t.sessionRequestExists = sessionRequestExists
	return t
}

func (t *TestParameterBundleBuilder) setBoard(board *dto.Board) *TestParameterBundleBuilder {
	t.board = board
	return t
}

func (t *TestParameterBundleBuilder) build() TestParameterBundle {
	return TestParameterBundle{
		name:                 t.name,
		expectedCode:         t.expectedCode,
		err:                  t.err,
		sessionRequestExists: t.sessionRequestExists,
		sessionExists:        t.sessionExists,
		board:                t.board,
	}
}
