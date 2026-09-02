package votings

import (
	"context"
	"database/sql"
	"errors"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel/attribute"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/otel"
	"scrumlr.io/server/realtime"
)

type VotingDatabase interface {
	Create(ctx context.Context, insert DatabaseVotingInsert) (DatabaseVoting, error)
	Update(ctx context.Context, update DatabaseVotingUpdate) (DatabaseVoting, error)
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

func (service *Service) Create(ctx context.Context, body VotingCreateRequest) (*Voting, error) {
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
		err := errors.New("Vote limit cannot be smaller than 0")
		otel.RecordErrorSpan(span, err, nil)
		return nil, CreateVotingError(BadRequest, "vote limit cannot be smaller than 0", err)
	}

	if body.VoteLimit >= 100 {
		err := errors.New("Vote limit cannot be greater than 100")
		otel.RecordErrorSpan(span, err, nil)
		return nil, CreateVotingError(BadRequest, "vote limit cannot be greater than 100", err)
	}

	openVoting, err := service.GetOpen(ctx, body.Board)
	if openVoting != nil || (err != nil && !errors.Is(err, sql.ErrNoRows)) {
		if openVoting != nil {
			otel.RecordErrorSpan(span, err, new("only one open voting per session is allowed"))
			return nil, CreateVotingError(BadRequest, "only one open voting per session is allowed", err)
		}

		return nil, err
	}

	voting, err := service.database.Create(ctx, DatabaseVotingInsert{
		Board:              body.Board,
		VoteLimit:          body.VoteLimit,
		AllowMultipleVotes: body.AllowMultipleVotes,
		ShowVotesOfOthers:  body.ShowVotesOfOthers,
		IsAnonymous:        body.IsAnonymous,
		Status:             Open,
	})

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to create voting"))
		log.Errorw("unable to create voting", "board", body.Board, "error", err)
		return nil, CreateVotingError(Internal, "failed to create voting", err)
	}

	service.createdVoting(ctx, body.Board, voting)

	votingCreatedCounter.Add(ctx, 1)
	return new(Voting).From(voting, nil), err
}

func (service *Service) Get(ctx context.Context, boardID, id uuid.UUID) (*Voting, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.get")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.get.board", boardID.String()),
	)

	voting, err := service.database.Get(ctx, boardID, id)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			otel.RecordErrorSpan(span, err, new("voting not found"))
			return nil, CreateVotingError(NotFound, "no active voting session found", err)
		}

		otel.RecordErrorSpan(span, err, new("failed to get voting"))
		log.Errorw("unable to get voting session", "voting", id, "error", err)
		return nil, CreateVotingError(Internal, "failed to get voting", err)
	}

	if voting.Status == Open {
		return new(Voting).From(voting, []DatabaseVote{}), err
	}

	receivedVotes, err := service.database.GetVotes(ctx, boardID, VoteFilter{Voting: &id})
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get votes"))
		log.Errorw("unable to get votes", "voting", id, "error", err)
		return nil, CreateVotingError(Internal, "unable to get votes", err)
	}

	return new(Voting).From(voting, receivedVotes), err

}

func (service *Service) GetAll(ctx context.Context, boardID uuid.UUID) ([]*Voting, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.get.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.get.all.board", boardID.String()),
	)

	votings, err := service.database.GetAll(ctx, boardID)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get votings"))
		log.Errorw("unable to get votings", "board", boardID, "error", err)
		return nil, CreateVotingError(Internal, "failed to get votings", err)
	}

	votes, err := service.database.GetVotes(ctx, boardID, VoteFilter{})
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get votes"))
		log.Errorw("unable to get votes", "board", boardID, "error", err)
		return nil, CreateVotingError(Internal, "unable to get votes", err)
	}

	return Votings(votings, votes), err
}

func (service *Service) GetOpen(ctx context.Context, boardID uuid.UUID) (*Voting, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.get.open")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.get.open.baord", boardID.String()),
	)

	voting, err := service.database.GetOpenVoting(ctx, boardID)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			return nil, nil
		}

		otel.RecordErrorSpan(span, err, new("failed to get voting"))
		log.Errorw("unable to get open votings", "board", boardID, "error", err)
		return nil, CreateVotingError(Internal, "unable to get open votings", err)
	}

	return new(Voting).From(voting, nil), err
}

func (service *Service) GetVotes(ctx context.Context, board uuid.UUID, f VoteFilter) ([]*Vote, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votes.service.get.all")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votes.service.get.all.filter_board", board.String()),
	)

	votes, err := service.database.GetVotes(ctx, board, f)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to get votes"))
		log.Errorw("unable to get votes", "err", err)
		return nil, CreateVotingError(Internal, "unable to get votes", err)
	}

	return Votes(votes), err
}

func (service *Service) AddVote(ctx context.Context, body VoteRequest) (*Vote, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votes.service.add")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votes.service.add.board", body.Board.String()),
		attribute.String("scrumlr.votes.service.add.note", body.Note.String()),
	)

	vote, err := service.database.AddVote(ctx, body.Board, body.User, body.Note)
	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			otel.RecordErrorSpan(span, err, new("no active voting session"))
			return nil, CreateVotingError(NotFound, "no active voting session found", err)
		}

		otel.RecordErrorSpan(span, err, new("failed to add vote"))
		log.Warnw("unable to add vote", "board", body.Board, "user", body.User, "note", body.Note, "err", err)
		return nil, CreateVotingError(Internal, "unable to add vote", err)
	}

	voteCreatedCounter.Add(ctx, 1)
	return new(Vote).From(vote), err
}

func (service *Service) RemoveVote(ctx context.Context, body VoteRequest) error {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votes.service.remove")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votes.service.remove.board", body.Board.String()),
		attribute.String("scrumlr.votes.service.remove.note", body.Note.String()),
		attribute.String("scrumlr.votes.service.remove.user", body.User.String()),
	)

	err := service.database.RemoveVote(ctx, body.Board, body.User, body.Note)
	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to remove vote"))
		log.Errorw("unable to remove vote", "board", body.Board, "user", body.User)
		return CreateVotingError(Internal, "unable to remove vote", err)
	}

	voteDeletedCounter.Add(ctx, 1)
	return nil
}

func (service *Service) Update(ctx context.Context, id uuid.UUID, board uuid.UUID, votingStatus VotingStatus, affectedNotes []Note) (*Voting, error) {
	log := logger.FromContext(ctx)
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.update")
	defer span.End()

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.update.voting", id.String()),
		attribute.String("scrumlr.votings.service.update.board", board.String()),
	)

	voting, err := service.database.Update(ctx, DatabaseVotingUpdate{
		ID:     id,
		Board:  board,
		Status: votingStatus,
	})

	if err != nil {
		if errors.Is(err, sql.ErrNoRows) {
			otel.RecordErrorSpan(span, err, new("no voting found to update"))
			return nil, CreateVotingError(NotFound, "no active voting session found", err)
		}

		otel.RecordErrorSpan(span, err, new("failed to update voting"))
		log.Errorw("unable to update voting", "err", err)
		return nil, CreateVotingError(Internal, "unable to update voting", err)
	}

	var receivedVotes []DatabaseVote
	if votingStatus == Closed {
		receivedVotes, err = service.database.GetVotes(ctx, board, VoteFilter{Voting: &id})
		if err != nil {
			otel.RecordErrorSpan(span, err, new("failed to get votes"))
			log.Errorw("unable to get votes", "err", err)
			return nil, CreateVotingError(Internal, "unable to get votes", err)
		}
	}

	service.updatedVoting(ctx, board, voting, receivedVotes, affectedNotes)
	return new(Voting).From(voting, receivedVotes), nil
}

func (service *Service) createdVoting(ctx context.Context, board uuid.UUID, voting DatabaseVoting) {
	ctx, span := tracer.Start(ctx, "scrumlr.votings.service.create")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.votings.service.create.board", board.String()),
		attribute.String("scrumlr.votings.service.create.voting", voting.ID.String()),
	)

	err := service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
		Type: realtime.BoardEventVotingCreated,
		Data: new(Voting).From(voting, nil),
	})

	if err != nil {
		otel.RecordErrorSpan(span, err, new("failed to send voting created"))
		log.Errorw("unable to send voting created", "err", err)
	}
}

func (service *Service) updatedVoting(ctx context.Context, board uuid.UUID, voting DatabaseVoting, votes []DatabaseVote, affectedNotes []Note) {
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
	sortNotesByVotes(affectedNotes, currentVoting.VotingResults)

	err := service.realtime.BroadcastToBoard(ctx, board, realtime.BoardEvent{
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
		otel.RecordErrorSpan(span, err, new("failed to send voting update"))
		log.Errorw("unable to send voting update", "err", err)
	}
}
