package reactions

import (
	"context"
	"errors"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/identifiers"
)

type DB struct {
	db *bun.DB
}

func NewReactionsDatabase(database *bun.DB) ReactionDatabase {
	db := new(DB)
	db.db = database

	return db
}

// Get gets a specific Reaction
func (d *DB) Get(id uuid.UUID) (DatabaseReaction, error) {
	var reaction DatabaseReaction
	err := d.db.
		NewSelect().
		Model((*DatabaseReaction)(nil)).
		Where("id = ?", id).
		Scan(context.Background(), &reaction)
	return reaction, err
}

// GetAll gets all reactions for a specific board
// query:
// SELECT r.* FROM reactions r JOIN notes n ON r.note = n.id WHERE n.board = ?;
func (d *DB) GetAll(board uuid.UUID) ([]DatabaseReaction, error) {
	var reactions []DatabaseReaction
	err := d.db.
		NewSelect().
		Model(&reactions).
		Join("JOIN notes ON notes.id = reaction.note"). // important: 'reaction.note' instead of 'reactions.note'
		Where("notes.board = ?", board).
		Scan(context.Background())
	return reactions, err
}

// GetAllForNote gets all reactions for a specific note
func (d *DB) GetAllForNote(note uuid.UUID) ([]DatabaseReaction, error) {
	var reactions []DatabaseReaction
	err := d.db.
		NewSelect().
		Model(&reactions).
		Where("note = ?", note).
		Scan(context.Background())

	return reactions, err
}

// Create inserts a new reaction
func (d *DB) Create(board uuid.UUID, insert DatabaseReactionInsert) (DatabaseReaction, error) {
	var currentNoteReactions, err = d.GetAllForNote(insert.Note)
	if err != nil {
		return DatabaseReaction{}, err
	}
	// check if user has already made a reaction on this note
	for _, r := range currentNoteReactions {
		if r.User == insert.User {
			return DatabaseReaction{}, errors.New("cannot make multiple reactions on the same note by the same user")
		}
	}

	var reaction DatabaseReaction
	_, err = d.db.NewInsert().
		Model(&insert).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, board), &reaction)

	return reaction, err
}

// Delete deletes a reaction
func (d *DB) Delete(board, user, id uuid.UUID) error {
	var r, err = d.Get(id)
	if err != nil {
		return err
	}
	if r.User != user {
		return common.ForbiddenError(errors.New("forbidden"))
	}
	_, err = d.db.NewDelete().
		Model((*DatabaseReaction)(nil)).
		Where("id = ?", id).
		Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, board, identifiers.ReactionIdentifier, id))

	return err
}

// Update updates the reaction type
func (d *DB) Update(board, user, id uuid.UUID, update DatabaseReactionUpdate) (DatabaseReaction, error) {
	var r, err = d.Get(id)
	if err != nil {
		return DatabaseReaction{}, err
	}
	if r.User != user {
		return DatabaseReaction{}, common.ForbiddenError(errors.New("forbidden"))
	}

	var reaction DatabaseReaction
	_, err = d.db.
		NewUpdate().
		Model(&reaction).
		Set("reaction_type = ?", update.ReactionType).
		Where("id = ?", id).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, board, identifiers.ReactionIdentifier, reaction))

	return reaction, err
}
