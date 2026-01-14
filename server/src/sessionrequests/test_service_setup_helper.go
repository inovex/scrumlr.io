package sessionrequests

import (
	"github.com/uptrace/bun"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/realtime"
	"scrumlr.io/server/sessions"
)

type TestServices struct {
	SessionRequestService SessionRequestService
	SessionService        sessions.SessionService
	ColumnService         columns.ColumnService
	NoteService           notes.NotesService
}

func setupTestServices(db *bun.DB, broker *realtime.Broker, websocket Websocket) TestServices {
	noteDatabase := notes.NewNotesDatabase(db)
	noteService := notes.NewNotesService(noteDatabase, broker)

	columnDatabase := columns.NewColumnsDatabase(db)
	columnService := columns.NewColumnService(columnDatabase, broker, noteService)

	sessionDatabase := sessions.NewSessionDatabase(db)
	sessionService := sessions.NewSessionService(sessionDatabase, broker, columnService, noteService)

	sessionRequestDatabase := NewSessionRequestDatabase(db)
	sessionRequestService := NewSessionRequestService(sessionRequestDatabase, broker, websocket, sessionService)

	return TestServices{
		SessionRequestService: sessionRequestService,
		SessionService:        sessionService,
		ColumnService:         columnService,
		NoteService:           noteService,
	}
}
