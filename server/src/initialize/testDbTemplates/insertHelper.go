package testDbTemplates

import (
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

func InsertUser(db *bun.DB, id uuid.UUID, name string, accountType string) error {
	_, err := db.Exec("INSERT INTO users (\"id\", \"name\", \"account_type\") VALUES (?, ?, ?);", id.String(), name, accountType)
	return err
}

func InsertGoogleUser(db *bun.DB, userID uuid.UUID, googleID string, name string, avatarUrl string) error {
	_, err := db.Exec("INSERT INTO google_users (\"user\", id, name, \"avatar_url\") VALUES (?, ?, ?, ?)", userID, googleID, name, avatarUrl)
	return err
}

func InsertBoard(db *bun.DB, id uuid.UUID, name string, description string, passhphrase *string, salt *string, accessPolicy string, showAuthors bool, showOtherNotes bool, showReactions bool, stacking bool, locked bool) error {
	_, err := db.Exec("INSERT INTO boards (\"id\", \"name\", \"description\", \"passphrase\", \"salt\", \"access_policy\", \"show_authors\", \"show_notes_of_other_users\", \"show_note_reactions\", \"allow_stacking\", \"is_locked\") VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?);",
		id.String(), name, description, passhphrase, salt, accessPolicy, showAuthors, showOtherNotes, showReactions, stacking, locked)
	return err
}

func InsertColumn(db *bun.DB, id uuid.UUID, boardId uuid.UUID, name string, description string, color string, visible bool, index int) error {
	_, err := db.Exec("INSERT INTO columns (\"id\", \"board\", \"name\", \"description\", \"color\", \"visible\", \"index\") VALUES (?, ?, ?, ?, ?, ?, ?);", id.String(), boardId.String(), name, description, color, visible, index)
	return err
}

func InsertNote(db *bun.DB, id uuid.UUID, author uuid.UUID, board uuid.UUID, column uuid.UUID, text string, stack uuid.NullUUID, rank int) error {
	var stackId *string
	if stack.Valid {
		id := stack.UUID.String()
		stackId = &id
	}
	_, err := db.Exec("INSERT INTO notes (\"id\", \"author\", \"board\", \"column\", \"text\", \"stack\", \"rank\") VALUES (?, ?, ?, ?, ?, ?, ?);", id.String(), author.String(), board.String(), column.String(), text, stackId, rank)
	return err
}

func InsertReaction(db *bun.DB, id uuid.UUID, note uuid.UUID, user uuid.UUID, reaction string) error {
	_, err := db.Exec("INSERT INTO reactions (\"id\", \"note\", \"user\", \"reaction_type\") VALUES (?, ?, ?, ?);", id.String(), note.String(), user.String(), reaction)
	return err
}

func InsertSession(db *bun.DB, user uuid.UUID, board uuid.UUID, role string, banned bool, ready bool, connected bool, handRaised bool) error {
	_, err := db.Exec("INSERT INTO \"board_sessions\" (\"user\", \"board\", \"role\", \"banned\", \"ready\", \"connected\", \"raised_hand\") VALUES (?, ?, ?, ?, ?, ?, ?);", user, board, role, banned, ready, connected, handRaised)
	return err
}

func InsertSessionRequest(db *bun.DB, user uuid.UUID, board uuid.UUID, status string) error {
	_, err := db.Exec("INSERT INTO \"board_session_requests\" (\"user\", \"board\", \"status\") VALUES(?, ?, ?);", user, board, status)
	return err
}

func InsertBoardTemplate(db *bun.DB, id uuid.UUID, creator uuid.UUID, name string, description string, favourite bool) error {
	_, err := db.Exec("INSERT INTO \"board_templates\" (\"id\", \"creator\", \"name\", \"description\", \"favourite\") VALUES (?, ?, ?, ?, ?);", id, creator, name, description, favourite)
	return err
}

func InsertColumnTemplate(db *bun.DB, id uuid.UUID, board uuid.UUID, name string, description string, color string, visible bool, index int) error {
	_, err := db.Exec("INSERT INTO \"column_templates\" (\"id\", \"board_template\", \"name\", \"description\", \"color\", \"visible\", \"index\") VALUES (?, ?, ?, ?, ?, ?, ?);", id, board, name, description, color, visible, index)
	return err
}

func InsertVoting(db *bun.DB, id uuid.UUID, board uuid.UUID, limit int, multiple bool, others bool, status string, anonymous bool) error {
	_, err := db.Exec("INSERT INTO \"votings\" (\"id\", \"board\", \"vote_limit\", \"allow_multiple_votes\", \"show_votes_of_others\", \"status\", \"is_anonymous\") VALUES (?, ?, ?, ?, ?, ?, ?);", id, board, limit, multiple, others, status, anonymous)
	return err
}

func InsertVote(db *bun.DB, board uuid.UUID, voting uuid.UUID, user uuid.UUID, note uuid.UUID) error {
	_, err := db.Exec("INSERT INTO \"votes\" (\"board\", \"voting\", \"user\", \"note\") VALUES (?, ?, ?, ?);", board, voting, user, note)
	return err
}
