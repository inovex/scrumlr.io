package voting

import (
	"context"
	"errors"
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"github.com/stretchr/testify/require"
	"github.com/stretchr/testify/suite"
	"math/rand/v2"
	"scrumlr.io/server/common"
	"scrumlr.io/server/common/filter"
	"scrumlr.io/server/logger"
	brokerMock "scrumlr.io/server/mocks/realtime"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"testing"
	"time"
)

type VotingServiceTestSuite struct {
	suite.Suite
}

func TestVotingServiceTestSuite(t *testing.T) {
	suite.Run(t, new(VotingServiceTestSuite))
}

func (suite *VotingServiceTestSuite) TestCreateVoting() {
	mockDb := NewMockVotingDatabase(suite.T())

	mockBroker := brokerMock.NewMockClient(suite.T())
	broker := new(realtime.Broker)
	broker.Con = mockBroker

	service := NewVotingService(mockDb, broker)

	var votingId uuid.UUID
	var boardId uuid.UUID
	votingRequest := VotingCreateRequest{
		Board:              boardId, // boardId is nulled
		VoteLimit:          0,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
	}

	// Mocks for realtime
	publishSubject := "board." + boardId.String()
	publishEvent := realtime.BoardEvent{
		Type: realtime.BoardEventVotingCreated,
		Data: &Voting{},
	}

	mockDb.EXPECT().Create(VotingInsert{
		Status: Open,
	}).Return(VotingDB{}, nil)

	mockDb.EXPECT().Get(boardId, votingId).Return(VotingDB{}, []VoteDB{}, nil)
	mockBroker.EXPECT().Publish(publishSubject, publishEvent).Return(nil)
	create, err := service.Create(logger.InitTestLogger(context.Background()), votingRequest)

	assert.NotNil(suite.T(), create)
	assert.NoError(suite.T(), err)
	mockDb.AssertExpectations(suite.T())
	mockBroker.AssertExpectations(suite.T())
}

func (suite *VotingServiceTestSuite) TestUpdateVoting() {
	boardId := uuid.New()
	votingID := uuid.New()
	voteLimit := rand.IntN(10)
	voting := VotingDB{
		ID:                 votingID,
		Board:              boardId,
		CreatedAt:          time.Now(),
		VoteLimit:          voteLimit,
		AllowMultipleVotes: false,
		ShowVotesOfOthers:  false,
		Status:             Closed,
	}
	tests := []struct {
		name         string
		err          error
		votingStatus VotingStatus
		voting       VotingDB
		update       *Voting
	}{
		{
			name:         "Voting status open",
			err:          common.BadRequestError(errors.New("not allowed ot change to open state")),
			votingStatus: Open,
			voting:       VotingDB{},
			update:       nil,
		},
		{
			name:         "Voting status closed",
			err:          nil,
			votingStatus: Closed,
			voting:       voting,
			update:       new(Voting).From(voting, nil),
		},
	}

	for _, tt := range tests {

		suite.Run(tt.name, func() {
			mockDb := NewMockVotingDatabase(suite.T())

			mockBroker := brokerMock.NewMockClient(suite.T())
			broker := new(realtime.Broker)
			broker.Con = mockBroker

			service := NewVotingService(mockDb, broker)

			updateVotingRequest := VotingUpdateRequest{
				ID:     votingID,
				Board:  boardId,
				Status: tt.votingStatus,
			}

			// Mocks for realtime
			publishSubject := "board." + boardId.String()
			publishEvent := realtime.BoardEvent{
				Type: realtime.BoardEventVotingUpdated,
				Data: struct {
					Voting *Voting       `json:"voting"`
					Notes  []*notes.Note `json:"notes"`
				}{
					Voting: &Voting{},
					Notes:  nil,
				},
			}

			if tt.votingStatus == Closed {
				mockDb.EXPECT().Update(VotingUpdateRequest{
					ID:     votingID,
					Board:  boardId,
					Status: tt.votingStatus,
				}).Return(tt.voting, tt.err)

				mockDb.EXPECT().GetVotes(filter.VoteFilter{
					Board:  boardId,
					Voting: &votingID,
				}).Return([]VoteDB{}, nil)

				mockDb.EXPECT().Get(boardId, votingID).Return(VotingDB{}, []VoteDB{}, nil)

				mockBroker.On("Publish", publishSubject, publishEvent).Return(nil)
			}
			update, err := service.Update(logger.InitTestLogger(context.Background()), updateVotingRequest, nil)

			assert.Equal(suite.T(), tt.err, err)
			assert.Equal(suite.T(), update, tt.update)
			mockDb.AssertExpectations(suite.T())
			mockBroker.AssertExpectations(suite.T())

		})
	}
}

func (suite *VotingServiceTestSuite) TestAddVotes() {
	mockDb := NewMockVotingDatabase(suite.T())
	mockBroker := brokerMock.NewMockClient(suite.T())

	service := NewVotingService(mockDb, &realtime.Broker{Con: mockBroker})

	boardID := uuid.New()
	userID := uuid.New()
	noteID := uuid.New()
	votingID := uuid.New()

	voteRequest := VoteRequest{
		Board: boardID,
		User:  userID,
		Note:  noteID,
	}

	expectedVote := VoteDB{
		Board:  boardID,
		Voting: votingID,
		User:   userID,
		Note:   noteID,
	}

	mockDb.EXPECT().
		AddVote(boardID, userID, noteID).
		Return(expectedVote, nil)

	result, err := service.AddVote(context.Background(), voteRequest)

	require.NoError(suite.T(), err)
	require.NotNil(suite.T(), result)
	assert.Equal(suite.T(), &Vote{
		Voting: votingID,
		Note:   noteID,
		User:   userID,
	}, result)
}
