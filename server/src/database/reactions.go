package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/database/types"
)

type Reaction struct {
	bun.BaseModel `bun:"table:reactions"`
	ID            uuid.UUID
	Note          uuid.UUID
	User          uuid.UUID
	ReactionType  types.Reaction
}

type ReactionInsert struct {
	bun.BaseModel `bun:"table:reactions"`
	Note          uuid.UUID
	User          uuid.UUID
	ReactionType  types.Reaction
}

type ReactionUpdate struct {
	bun.BaseModel `bun:"table:reactions"`
	ReactionType  types.Reaction
}

// GetReaction gets a specific Reaction
func (d *Database) GetReaction(id uuid.UUID) (Reaction, error) {
	var reaction Reaction
	err := d.db.
		NewSelect().
		Model((*Reaction)(nil)).
		Where("id = ?", id).
		Scan(context.Background(), &reaction)
	return reaction, err
}

// GetReactions gets all reactions for a specific board
// query:
// SELECT r.* FROM reactions r JOIN notes n ON r.note = n.id WHERE n.board = ?;
func (d *Database) GetReactions(board uuid.UUID) ([]Reaction, error) {
	var reactions []Reaction
	err := d.db.
		NewSelect().
		Model(&reactions).
		Join("JOIN notes ON notes.id = reaction.note"). // important: 'reaction.note' instead of 'reactions.note'
		Where("notes.board = ?", board).
		Scan(context.Background())
	return reactions, err
}

// CreateReaction inserts a new reaction
func (d *Database) CreateReaction(board uuid.UUID, insert ReactionInsert) (Reaction, error) {
	var reaction Reaction
	_, err := d.db.NewInsert().
		Model(&insert).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", board), &reaction)

	return reaction, err
}

// RemoveReaction deletes a reaction
func (d *Database) RemoveReaction(board, id uuid.UUID) error {
	_, err := d.db.NewDelete().
		Model((*Reaction)(nil)).
		Where("id = ?", id).
		Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", board, "Reaction", id))

	return err
}

// UpdateReaction updates the reaction type
func (d *Database) UpdateReaction(board, id uuid.UUID, update ReactionUpdate) (Reaction, error) {
	var reaction Reaction
	_, err := d.db.
		NewUpdate().
		Model(&reaction).
		Set("reaction_type = ?", update.ReactionType).
		Where("id = ?", id).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", board, "Reaction", reaction))

	return reaction, err
}
