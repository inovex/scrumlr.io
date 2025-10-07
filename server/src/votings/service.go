package votings

import (
	"context"
	"database/sql"
	"errors"
	"sort"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/metric"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/common"

	"scrumlr.io/server/logger"
	"scrumlr.io/server/realtime"
)

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/votings")
var meter metric.Meter = otel.Meter("scrumlr.io/server/votings")

type VotingDatabase interface {
	Create(ctx context.Context, insert DatabaseVotingInsert) (DatabaseVoting, error)
	Close(ctx context.Context, update DatabaseVotingUpdate) (DatabaseVoting, error)
	Get(ctx context.Context, board, id uuid.UUID) (DatabaseVoting, error)
	GetAll(ctx context.Context, board uuid.UUID) ([]DatabaseVoting, error)
	GetVotes(ctx context.Context, board uuid.UUID, f VoteFilter) ([]DatabaseVote, error)
	AddVote(ctx context.Context, board, user, note uuid.UUID) (DatabaseVote, error)
	RemoveVote(ctx context.Context, board, user, note uuid.UUID) error
	GetOpenVoting(ctx context.Context, board uuid.UUID) (DatabaseVoting, error)
}

type Service struct {
	database VotingDatabase
	realtime *realtime.Broker
}

func NewVotingService(db VotingDatabase, rt *realtime.Broker) VotingService {
	service := new(Service)
	service.database = db
	service.realtime = rt

	return service
}

func (s *Service) AddVote(ctx context.Context, body VoteRequest) (*Vote, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votes.service.add")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votes.service.add.board", body.Board.String()),
		attribute.String("scrumlr.votes.service.add.note", body.Note.String()),
	)

	vote, err := s.database.AddVote(ctx, body.Board, body.User, body.Note)
	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "No rows returned")
			span.RecordError(err)
			return nil, common.ForbiddenError(errors.New("voting limit reached or no active voting session found"))
		}

		span.SetStatus(codes.Error, "failed to add vote")
		span.RecordError(err)
		log.Warnw("unable to add vote", "board", body.Board, "user", body.User, "note", body.Note, "err", err)
		return nil, err
	}

	voteCreatedCounter.Add(ctx, 1)
	return new(Vote).From(vote), err
}

func (s *Service) RemoveVote(ctx context.Context, body VoteRequest) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votes.service.remove")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votes.service.remove.board", body.Board.String()),
		attribute.String("scrumlr.votes.service.remove.note", body.Note.String()),
		attribute.String("scrumlr.votes.service.remove.user", body.User.String()),
	)

	err := s.database.RemoveVote(ctx, body.Board, body.User, body.Note)
	if err != nil {
		span.SetStatus(codes.Error, "failed to remove vote")
		span.RecordError(err)
		log.Errorw("unable to remove vote", "board", body.Board, "user", body.User)
	}

	voteDeletedCounter.Add(ctx, 1)
	return err
}

func (s *Service) GetVotes(ctx context.Context, board uuid.UUID, f VoteFilter) ([]*Vote, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votes.service.get.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votes.service.get.all.filter_board", board.String()),
	)

	votes, err := s.database.GetVotes(ctx, board, f)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get votes")
		span.RecordError(err)
		log.Errorw("unable to get votes", "err", err)
		return nil, err
	}

	return Votes(votes), err
}

func (s *Service) Create(ctx context.Context, body VotingCreateRequest) (*Voting, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.create")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.create.board", body.Board.String()),
		attribute.Int("scrumlr.votings.service.create.limit", body.VoteLimit),
		attribute.Bool("scrumlr.votings.service.create.multiple_votes", body.AllowMultipleVotes),
		attribute.Bool("scrumlr.votings.service.create.anonymous", body.IsAnonymous),
		attribute.Bool("scrumlr.votings.service.create.show_votes", body.ShowVotesOfOthers),
	)

	if body.VoteLimit < 0 {
		err := errors.New("vote limit cannot be smaller than 0")
		span.SetStatus(codes.Error, "Vote limit cannot be smaller than 0")
		span.RecordError(err)
		return nil, common.BadRequestError(err)
	}

	if body.VoteLimit >= 100 {
		err := errors.New("vote limit cannot be greater than 100")
		span.SetStatus(codes.Error, "Vote limit cannot be greater than 100")
		span.RecordError(err)
		return nil, common.BadRequestError(err)
	}

	voting, err := s.database.Create(ctx, DatabaseVotingInsert{
		Board:              body.Board,
		VoteLimit:          body.VoteLimit,
		AllowMultipleVotes: body.AllowMultipleVotes,
		ShowVotesOfOthers:  body.ShowVotesOfOthers,
		IsAnonymous:        body.IsAnonymous,
		Status:             Open,
	})

	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "failed to create voting")
			span.RecordError(err)
			return nil, common.BadRequestError(errors.New("only one open voting session is allowed"))
		}

		span.SetStatus(codes.Error, "failed to create voting")
		span.RecordError(err)
		log.Errorw("unable to create voting", "board", body.Board, "error", err)
		return nil, common.InternalServerError
	}

	s.createdVoting(ctx, body.Board, voting)

	votingCreatedCounter.Add(ctx, 1)
	return new(Voting).From(voting, nil), err
}

func (s *Service) Close(ctx context.Context, id uuid.UUID, board uuid.UUID, affectedNotes []Note) (*Voting, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.close")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.close.voting", id.String()),
		attribute.String("scrumlr.votings.service.close.board", board.String()),
	)

	voting, err := s.database.Close(ctx, DatabaseVotingUpdate{
		ID:     id,
		Board:  board,
		Status: Closed,
	})

	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "No voting found to update")
			span.RecordError(err)
			return nil, common.NotFoundError
		}

		span.SetStatus(codes.Error, "failed to close voting")
		span.RecordError(err)
		log.Errorw("unable to close voting", "err", err)
		return nil, common.InternalServerError
	}

	receivedVotes, err := s.database.GetVotes(ctx, board, VoteFilter{Voting: &id})
	if err != nil {
		span.SetStatus(codes.Error, "failed to get votes")
		span.RecordError(err)
		log.Errorw("unable to get votes", "err", err)
		return nil, err
	}

	s.updatedVoting(ctx, board, voting, receivedVotes, affectedNotes)
	return new(Voting).From(voting, receivedVotes), err
}

func (s *Service) Get(ctx context.Context, boardID, id uuid.UUID) (*Voting, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.get.board", boardID.String()),
	)

	voting, err := s.database.Get(ctx, boardID, id)
	if err != nil {
		if err == sql.ErrNoRows {
			span.SetStatus(codes.Error, "voting not found")
			span.RecordError(err)
			return nil, common.NotFoundError
		}

		span.SetStatus(codes.Error, "failed to get voting")
		span.RecordError(err)
		log.Errorw("unable to get voting session", "voting", id, "error", err)
		return nil, common.InternalServerError
	}

	if voting.Status == Open {
		return new(Voting).From(voting, []DatabaseVote{}), err
	}

	receivedVotes, err := s.database.GetVotes(ctx, boardID, VoteFilter{Voting: &id})
	if err != nil {
		span.SetStatus(codes.Error, "")
		span.RecordError(err)
		log.Errorw("unable to get votes", "voting", id, "error", err)
		return nil, err
	}

	return new(Voting).From(voting, receivedVotes), err

}

func (s *Service) GetAll(ctx context.Context, boardID uuid.UUID) ([]*Voting, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.get.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.get.all.board", boardID.String()),
	)

	votings, err := s.database.GetAll(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get votings")
		span.RecordError(err)
		log.Errorw("unable to get votings", "board", boardID, "error", err)
		return nil, err
	}

	votes, err := s.database.GetVotes(ctx, boardID, VoteFilter{})
	if err != nil {
		log.Errorw("unable to get votes", "board", boardID, "error", err)
		return nil, err
	}

	return Votings(votings, votes), err
}

func (s *Service) GetOpen(ctx context.Context, boardID uuid.UUID) (*Voting, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.get.open")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.get.open.baord", boardID.String()),
	)

	voting, err := s.database.GetOpenVoting(ctx, boardID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get voting")
		span.RecordError(err)
		log.Errorw("unable to get open votings", "board", boardID, "error", err)
		return nil, err
	}

	return new(Voting).From(voting, nil), err
}

func (s *Service) createdVoting(ctx context.Context, board uuid.UUID, voting DatabaseVoting) {
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.create")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.create.board", board.String()),
		attribute.String("scrumlr.votings.service.create.voting", voting.ID.String()),
	)

	err := s.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventVotingCreated,
		Data: new(Voting).From(voting, nil),
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to send voting created")
		span.RecordError(err)
		log.Errorw("unable to send voting created", "err", err)
	}
}

func (s *Service) updatedVoting(ctx context.Context, board uuid.UUID, voting DatabaseVoting, votes []DatabaseVote, affectedNotes []Note) {
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.update")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.update.board", board.String()),
		attribute.String("scrumlr.votings.service.update.voting", voting.ID.String()),
		attribute.Int("scrumlr.votings.service.update.vote_limit", voting.VoteLimit),
		attribute.Bool("scrumlr.votings.service.update.multiple", voting.AllowMultipleVotes),
		attribute.Bool("scrumlr.votings.service.update.anonymous", voting.IsAnonymous),
		attribute.Bool("scrumlr.votings.service.update.show_votes", voting.ShowVotesOfOthers),
	)

	currentVoting := new(Voting).From(voting, votes)
	if currentVoting.VotingResults != nil {
		//map notes for quick lookup
		noteMap := make(map[uuid.UUID]Note, len(affectedNotes))
		for _, note := range affectedNotes {
			noteMap[note.ID] = note
		}

		noteIDs := make([]uuid.UUID, 0, len(currentVoting.VotingResults.Votes))

		for key := range currentVoting.VotingResults.Votes {
			noteIDs = append(noteIDs, key)
		}
		// sort note IDs by votes
		sort.SliceStable(noteIDs, func(i, j int) bool {
			return currentVoting.VotingResults.Votes[noteIDs[i]].Total > currentVoting.VotingResults.Votes[noteIDs[j]].Total
		})
		// order notes by votes based on sorted note IDs
		affectedNotes = make([]Note, 0, len(noteIDs))
		for _, id := range noteIDs {
			if note, ok := noteMap[id]; ok {
				affectedNotes = append(affectedNotes, note)
			}
		}
	}

	err := s.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventVotingUpdated,
		Data: struct {
			Voting *Voting `json:"voting"`
			Notes  []Note  `json:"notes"`
		}{
			Voting: currentVoting,
			Notes:  affectedNotes,
		},
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to send voting update")
		span.RecordError(err)
		log.Errorw("unable to send voting update", "err", err)
	}
}
