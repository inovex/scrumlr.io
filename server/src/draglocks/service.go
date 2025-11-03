package draglocks

import (
	"context"
	"encoding/json"
	"time"

	"github.com/google/uuid"
	"go.opentelemetry.io/otel"
	"go.opentelemetry.io/otel/attribute"
	"go.opentelemetry.io/otel/codes"
	"go.opentelemetry.io/otel/trace"
	"scrumlr.io/server/cache"
	"scrumlr.io/server/logger"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
)

const DefaultTTL = 10 * time.Second

var tracer trace.Tracer = otel.Tracer("scrumlr.io/server/cache")

type Service struct {
	cache       *cache.Cache
	realtime    *realtime.Broker
	noteService notes.NotesService
}

func NewDragLockService(noteService notes.NotesService, cache *cache.Cache, rt *realtime.Broker) DragLockService {
	service := new(Service)
	service.cache = cache
	service.realtime = rt
	service.noteService = noteService

	return service
}

func (service *Service) AcquireLock(ctx context.Context, noteID uuid.UUID, userID uuid.UUID, boardID uuid.UUID) bool {
	ctx, span := tracer.Start(ctx, "scrumlr.draglock.service.acquire")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.draglock.service.acquire.noteid", noteID.String()),
		attribute.String("scrumlr.draglock.service.acquire.userid", userID.String()),
	)

	notes, err := service.noteService.GetStack(ctx, noteID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get stack")
		span.RecordError(err)
		log.Errorw("failed to get stack", "err", err)
		return false
	}

	for _, note := range notes {
		err = service.cache.Con.Create(ctx, note.ID.String(), userID.String(), DefaultTTL)
		if err != nil {
			log.Infow("lock already exists")
			return false
		}
	}

	service.broadcastAcquireLock(ctx, boardID, noteID, userID)
	return true
}

func (service *Service) ReleaseLock(ctx context.Context, noteID uuid.UUID, userID uuid.UUID, boardID uuid.UUID) bool {
	ctx, span := tracer.Start(ctx, "scrumlr.draglock.service.release")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.draglock.service.acquire.noteid", noteID.String()),
	)

	notes, err := service.noteService.GetStack(ctx, noteID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get stack")
		span.RecordError(err)
		log.Errorw("failed to get stack", "err", err)
		return false
	}

	for _, note := range notes {
		err := service.cache.Con.Delete(ctx, note.ID.String())
		if err != nil {
			log.Errorw("failed to release lock", "note", note.ID, "err", err)
			span.SetStatus(codes.Error, "failed to release lock")
			span.RecordError(err)
			return false
		}
	}

	service.broadcastReleaseLock(ctx, boardID, noteID, userID)
	return true
}

func (service *Service) GetLock(ctx context.Context, noteID uuid.UUID) (*DragLock, error) {
	ctx, span := tracer.Start(ctx, "scrumlr.draglock.service.get")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.draglock.service.get.noteid", noteID.String()),
	)

	val, err := service.cache.Con.Get(ctx, noteID.String())
	if err != nil {
		span.SetStatus(codes.Error, "failed to get lock")
		span.RecordError(err)
		log.Errorw("failed to get lock", "err", err)
		return nil, err
	}

	var lock DragLock
	err = json.Unmarshal(val, &lock)
	if err != nil {
		span.SetStatus(codes.Error, "failed to unmarschal lock data")
		span.RecordError(err)
		return nil, err
	}

	return &lock, err
}

func (service *Service) IsLocked(ctx context.Context, noteID uuid.UUID) bool {
	ctx, span := tracer.Start(ctx, "scrumlr.draglock.service.islocked")
	defer span.End()
	log := logger.FromContext(ctx)

	span.SetAttributes(
		attribute.String("scrumlr.draglock.service.islocked.noteid", noteID.String()),
	)

	notes, err := service.noteService.GetStack(ctx, noteID)
	if err != nil {
		span.SetStatus(codes.Error, "failed to get stack")
		span.RecordError(err)
		log.Errorw("failed to get stack", "err", err)
		return false
	}

	locked := false
	for _, note := range notes {
		// if an error occured the lock is not found -> note not locked
		_, err := service.cache.Con.Get(ctx, note.ID.String())
		if err == nil {
			locked = true
		}
	}

	return locked
}

func (service *Service) broadcastAcquireLock(ctx context.Context, boardID uuid.UUID, noteID uuid.UUID, userID uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.draglock.service.broadcast.lock")
	defer span.End()
	log := logger.FromContext(ctx)

	err := service.realtime.BroadcastToBoard(ctx, boardID, realtime.BoardEvent{
		Type: realtime.BoardEventNoteDragStart,
		Data: map[string]string{
			"noteId": noteID.String(),
			"userId": userID.String(),
		},
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to broadcast acquire lock")
		span.RecordError(err)
		log.Errorw("failed to send note drag event", "err", err)
	}
}

func (service *Service) broadcastReleaseLock(ctx context.Context, boardID uuid.UUID, noteID uuid.UUID, userID uuid.UUID) {
	ctx, span := tracer.Start(ctx, "scrumlr.draglock.service.broadcast.lock")
	defer span.End()
	log := logger.FromContext(ctx)

	err := service.realtime.BroadcastToBoard(ctx, boardID, realtime.BoardEvent{
		Type: realtime.BoardEventNoteDragEnd,
		Data: map[string]string{
			"noteId": noteID.String(),
			"userId": userID.String(),
		},
	})

	if err != nil {
		span.SetStatus(codes.Error, "failed to broadcast release lock")
		span.RecordError(err)
		log.Errorw("failed to send note drag event", "err", err)
	}
}
