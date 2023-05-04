package database

import (
	"context"
	"github.com/google/uuid"
	"github.com/uptrace/bun"
)

type Reaction struct {
	bun.BaseModel `bun:"table:reactions"`
	ID            uuid.UUID
	Note          uuid.UUID
	User          uuid.UUID
	ReactionType  string
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

// GetReactions gets all reactions for a specific Note
func (d *Database) GetReactions(note uuid.UUID) ([]Reaction, error) {
	var reactions []Reaction
	err := d.db.
		NewSelect().
		Model(&reactions).
		Where("note = ?", note).
		Scan(context.Background())
	return reactions, err
}
