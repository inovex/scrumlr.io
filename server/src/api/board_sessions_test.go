package api

import (
	"context"
	"io/ioutil"
	"net/http/httptest"
	"testing"

	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/services"
)

type BoardSessionsMock struct {
	services.BoardSessions
	receivedBody dto.BoardSessionsUpdateRequest
	err          error
}

func (b *BoardSessionsMock) UpdateAll(ctx context.Context, body dto.BoardSessionsUpdateRequest) ([]*dto.BoardSession, error) {
	b.receivedBody = body
	return nil, b.err
}

func TestServer_testUpdateAll(t *testing.T) {

	s := new(Server)
	mock := new(BoardSessionsMock)
	s.sessions = mock

	res := httptest.NewRecorder()
	req := httptest.NewRequest("PUT", "/", nil)
	boardID, _ := uuid.NewUUID()
	req = req.WithContext(context.WithValue(req.Context(), "Board", boardID))
	s.testUpdateAll(res, req)

	if res.Code != 200 {
		t.Errorf("expected code %d, but received %d", 200, res.Code)
	}

	assert.Equal(t, boardID, mock.receivedBody.Board)
	assert.Equal(t, true, *mock.receivedBody.RaisedHand)
	assert.Equal(t, true, *mock.receivedBody.Ready)

}

func TestServer_testUpdateAll_errored(t *testing.T) {

	s := new(Server)
	mock := new(BoardSessionsMock)
	mock.err = common.InternalServerError
	s.sessions = mock

	res := httptest.NewRecorder()
	req := httptest.NewRequest("PUT", "/", nil)
	boardID, _ := uuid.NewUUID()
	req = req.WithContext(context.WithValue(req.Context(), "Board", boardID))
	s.testUpdateAll(res, req)

	assert.Equal(t, 500, res.Code)
	body, _ := ioutil.ReadAll(res.Body)
	assert.Contains(t, string(body), "Internal server error.")

}
