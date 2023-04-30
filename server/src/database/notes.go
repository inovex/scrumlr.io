package database

import (
	"context"
	"errors"
	"time"

	"github.com/google/uuid"
	"github.com/uptrace/bun"
	"scrumlr.io/server/common"
	"scrumlr.io/server/database/types"
)

type Note struct {
	bun.BaseModel `bun:"table:notes"`
	ID            uuid.UUID
	CreatedAt     time.Time
	Author        uuid.UUID
	Board         uuid.UUID
	Column        uuid.UUID
	Text          string
	Stack         uuid.NullUUID
	Rank          int
}

type NoteInsert struct {
	bun.BaseModel `bun:"table:notes"`
	Author        uuid.UUID
	Board         uuid.UUID
	Column        uuid.UUID
	Text          string
}

type NoteUpdatePosition struct {
	Column uuid.UUID
	Rank   int
	Stack  uuid.NullUUID
}

type NoteUpdate struct {
	bun.BaseModel `bun:"table:notes"`
	ID            uuid.UUID
	Board         uuid.UUID
	Text          *string
	Position      *NoteUpdatePosition `bun:"embed"`
}

func (d *Database) CreateNote(insert NoteInsert) (Note, error) {
	var note Note
	_, err := d.db.NewInsert().
		Model(&insert).
		Value("rank", "coalesce((SELECT COUNT(*) as rank FROM notes WHERE board = ? AND \"column\" = ? AND stack IS NULL), 0)", insert.Board, insert.Column).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", insert.Board), &note)
	return note, err
}

func (d *Database) GetNote(id uuid.UUID) (Note, error) {
	var note Note
	err := d.db.NewSelect().Model((*Note)(nil)).Where("id = ?", id).Scan(context.Background(), &note)
	return note, err
}

func (d *Database) GetNotes(board uuid.UUID, columns ...uuid.UUID) ([]Note, error) {
	var notes []Note
	query := d.db.NewSelect().Model((*Note)(nil)).Where("board = ?", board)
	if len(columns) > 0 {
		query = query.Where("\"column\" IN (?)", bun.In(columns))
	}
	err := query.OrderExpr("\"column\", stack DESC, rank DESC").Scan(context.Background(), &notes)
	return notes, err
}

func (d *Database) UpdateNote(caller uuid.UUID, update NoteUpdate) (Note, error) {
	boardSelect := d.db.NewSelect().Model((*Board)(nil)).Column("allow_stacking").Where("id = ?", update.Board)
	sessionSelect := d.db.NewSelect().Model((*BoardSession)(nil)).Column("role").Where("\"user\" = ?", caller).Where("board = ?", update.Board)
	noteSelect := d.db.NewSelect().Model((*Note)(nil)).Column("author").Where("id = ?", update.ID).Where("board = ?", update.Board)

	var precondition struct {
		StackingAllowed bool
		CallerRole      types.SessionRole
		Author          uuid.UUID
	}
	err := d.db.NewSelect().
		ColumnExpr("(?) AS stacking_allowed", boardSelect).
		ColumnExpr("(?) AS caller_role", sessionSelect).
		ColumnExpr("(?) as author", noteSelect).
		Scan(context.Background(), &precondition)
	if err != nil {
		return Note{}, err
	}

	var note Note
	if update.Text != nil && update.Position == nil {
		if caller == precondition.Author || precondition.CallerRole == types.SessionRoleModerator || precondition.CallerRole == types.SessionRoleOwner {
			note, err = d.updateNoteText(update)
		} else {
			err = errors.New("not permitted to change text of note")
		}
	} else if update.Position != nil {
		if update.Text != nil && (caller != precondition.Author || precondition.CallerRole == types.SessionRoleParticipant) {
			return Note{}, errors.New("not permitted to change text of note")
		}

		if update.Position.Stack.Valid && update.Position.Stack.UUID == update.ID {
			return Note{}, errors.New("stacking on self is not allowed")
		}

		if precondition.CallerRole == types.SessionRoleModerator || precondition.CallerRole == types.SessionRoleOwner || precondition.StackingAllowed {
			if !update.Position.Stack.Valid {
				note, err = d.updateNoteWithoutStack(update)
			} else {
				note, err = d.updateNoteWithStack(update)
			}
		} else {
			err = errors.New("not permitted to change position of note")
		}
	}

	return note, err
}

func (d *Database) updateNoteText(update NoteUpdate) (Note, error) {
	var note Note
	_, err := d.db.NewUpdate().Model(&update).Column("text").Where("id = ?", update.ID).Where("board = ?", update.Board).Where("id = ?", update.ID).Returning("*").Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", update.Board), &note)
	if err != nil {
		return note, err
	}
	return note, nil
}

func (d *Database) updateNoteWithoutStack(update NoteUpdate) (Note, error) {
	newRank := update.Position.Rank
	if update.Position.Rank < 0 {
		newRank = 0
	}

	// select previous configuration of note to update
	previous := d.db.NewSelect().Model((*Note)(nil)).Where("id = ?", update.ID).Where("board = ?", update.Board)
	// select whether the note is moved into another column or out from a stack. This will change the COUNT(*) of notes to consider
	rankAddition := d.db.NewSelect().ColumnExpr("CASE WHEN (SELECT \"column\" FROM previous) <> ? OR (SELECT stack FROM previous) IS NOT NULL THEN 0 ELSE -1 END as max_rank_addition", update.Position.Column)
	// select the max rank allowed for the column of the note
	rankRange := d.db.NewSelect().Model((*Note)(nil)).ColumnExpr("(COUNT(*) + (SELECT max_rank_addition FROM rank_addition)) as max_rank").Where("\"column\" = ?", update.Position.Column).Where("board = ?", update.Board).Where("stack IS NULL")
	// select the new rank to set based on the preceding queries
	rankSelection := d.db.NewSelect().ColumnExpr("LEAST((SELECT max_rank FROM rank_range), ?) as new_rank", newRank)
	// make room for this note (shift notes by +1 above the new rank) if this note will be moved into a new column or out of a stack
	updateWhenPreviouslyStackedOrInOtherColumn := d.db.NewUpdate().Model((*Note)(nil)).Set("rank=rank+1").Where("(SELECT max_rank_addition FROM rank_addition) = 0").Where("\"column\" = ?", update.Position.Column).Where("board = ?", update.Board).Where("rank >= (SELECT new_rank FROM rank_selection)")
	// shift notes within column if the new rank is lower than before
	updateWhenNewIsLower := d.db.NewUpdate().Model((*Note)(nil)).Set("rank=rank+1").Where("(SELECT max_rank_addition FROM rank_addition) = -1").Where("(SELECT new_rank FROM rank_selection) < (SELECT rank FROM previous)").Where("\"column\" = ?", update.Position.Column).Where("board = ?", update.Board).Where("rank >= (SELECT new_rank FROM rank_selection)").Where("rank < (SELECT rank FROM previous)").Where("stack IS NULL")
	// shift notes within column if the new rank is higher than before
	updateWhenNewIsHigher := d.db.NewUpdate().Model((*Note)(nil)).Set("rank=rank-1").Where("(SELECT max_rank_addition FROM rank_addition) = -1").Where("(SELECT new_rank FROM rank_selection) > (SELECT rank FROM previous)").Where("\"column\" = ?", update.Position.Column).Where("board = ?", update.Board).Where("rank <= (SELECT new_rank FROM rank_selection)").Where("rank > (SELECT rank FROM previous)").Where("stack IS NULL")
	// update column of child notes
	updateChildNotes := d.db.NewUpdate().Model((*Note)(nil)).Set("\"column\" = ?", update.Position.Column).Where("stack = ?", update.ID)

	query := d.db.NewUpdate().Model(&update).
		With("previous", previous).
		With("rank_addition", rankAddition).
		With("rank_range", rankRange).
		With("rank_selection", rankSelection).
		With("update_when_previously_stacked_or_in_other_column", updateWhenPreviouslyStackedOrInOtherColumn).
		With("update_when_new_is_lower", updateWhenNewIsLower).
		With("update_when_new_is_higher", updateWhenNewIsHigher).
		With("update_child_notes", updateChildNotes).
		Set("\"column\" = ?", update.Position.Column).
		Set("\"stack\" = ?", update.Position.Stack).
		Set("rank = (SELECT new_rank FROM rank_selection)").
		Where("id = ?", update.ID).
		Where("board = ?", update.Board).
		Returning("*")
	if update.Text != nil {
		query = query.Set("text = ?", &update.Text)
	}

	var note []Note
	_, err := query.Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", update.Board), &note)
	return note[0], err
}

func (d *Database) updateNoteWithStack(update NoteUpdate) (Note, error) {
	newRank := update.Position.Rank
	if update.Position.Rank < 0 {
		newRank = 0
	}

	// select previous configuration of note to update
	previous := d.db.NewSelect().Model((*Note)(nil)).Where("id = ?", update.ID).Where("board = ?", update.Board)

	// select previous configuration of stack target
	stackTarget := d.db.NewSelect().Model((*Note)(nil)).Where("id = ?", update.Position.Stack).Where("board = ?", update.Board)

	// check whether this note should be updated
	updateCheck := d.db.
		NewSelect().
		ColumnExpr("CASE WHEN (SELECT \"stack\" FROM previous) IS NOT NULL AND (SELECT \"stack\" FROM previous) <> ? THEN true WHEN (SELECT \"stack\" FROM previous) IS NULL THEN true ELSE false END as is_new_in_stack", update.Position.Stack).
		ColumnExpr("CASE WHEN (SELECT \"stack\" FROM previous) = ? AND (SELECT \"rank\" FROM previous) <> ? THEN true ELSE false END as is_same_stack", update.Position.Stack, update.Position.Rank).
		ColumnExpr("CASE WHEN (SELECT \"stack\" FROM stack_target) = ? THEN true ELSE false END as is_stack_swap", update.ID).
		ColumnExpr("CASE WHEN (SELECT \"column\" FROM notes WHERE id = ?) = ? THEN true ELSE false END as valid_update", update.Position.Stack, update.Position.Column)

	// select the children of the note to update
	children := d.db.NewSelect().Model((*Note)(nil)).Column("*").ColumnExpr("row_number() over (ORDER BY rank DESC) as index").Where("stack = ?", update.ID)

	// select the new rank for the note based on the limits of the ranks pre-existing
	rankSelection := d.db.NewSelect().Model((*Note)(nil)).
		ColumnExpr("CASE "+
			"WHEN (SELECT is_stack_swap FROM update_check) THEN (SELECT rank FROM stack_target) "+
			"WHEN (SELECT is_same_stack FROM update_check) THEN LEAST((SELECT COUNT(*) FROM notes WHERE \"stack\" = ?)-1, ?) "+
			"WHEN (SELECT is_new_in_stack FROM update_check) THEN COUNT(*) + (SELECT COUNT(*) FROM children) "+
			"ELSE (SELECT rank FROM previous) END as new_rank", update.Position.Stack, newRank).
		Where("\"column\" = ?", update.Position.Column).
		Where("board = ?", update.Board).
		Where("stack = ?", update.Position.Stack)

	// shift notes within stack if the new rank is lower than before
	updateWhenNewIsLower := d.db.NewUpdate().Model((*Note)(nil)).Set("rank=rank+1").Where("(SELECT is_same_stack FROM update_check)").Where("(SELECT new_rank FROM rank_selection) < (SELECT rank FROM previous)").Where("\"stack\" = ?", update.Position.Stack).Where("board = ?", update.Board).Where("rank >= (SELECT new_rank FROM rank_selection)").Where("rank < (SELECT rank FROM previous)")

	// shift notes within stack if the new rank is higher than before
	updateWhenNewIsHigher := d.db.NewUpdate().Model((*Note)(nil)).Set("rank=rank-1").Where("(SELECT is_same_stack FROM update_check)").Where("(SELECT new_rank FROM rank_selection) > (SELECT rank FROM previous)").Where("\"stack\" = ?", update.Position.Stack).Where("board = ?", update.Board).Where("rank <= (SELECT new_rank FROM rank_selection)").Where("rank > (SELECT rank FROM previous)")

	// update the ranks of other notes if this note is moved freshly into a new stack
	updateWhenPreviouslyNotInStack := d.db.NewUpdate().Model((*Note)(nil)).
		Set("rank=rank-1").
		Where("(SELECT is_new_in_stack FROM update_check)").
		Where("NOT (SELECT is_stack_swap FROM update_check)").
		Where("(SELECT valid_update FROM update_check)").
		Where("board = ?", update.Board).
		Where("\"column\" = (SELECT \"column\" FROM previous)").
		Where("rank >= (SELECT rank FROM previous)").
		WhereGroup(" AND ", func(q *bun.UpdateQuery) *bun.UpdateQuery {
			return q.
				WhereGroup(" OR ", func(q *bun.UpdateQuery) *bun.UpdateQuery {
					return q.
						Where("(SELECT stack FROM previous) IS NULL").
						Where("stack IS NULL")
				}).
				WhereGroup(" OR ", func(q *bun.UpdateQuery) *bun.UpdateQuery {
					return q.
						Where("(SELECT stack FROM previous) IS NOT NULL").
						Where("stack = (SELECT stack FROM previous)")
				})
		})

	// update the stack and rank of the children of the note to update, so that it matches the new configuration
	updateChildren := d.db.NewUpdate().
		TableExpr("notes as n").
		TableExpr("children as c").
		Set("stack = ?", update.Position.Stack).
		Set("rank = (SELECT new_rank FROM rank_selection) - c.index").
		Set("\"column\" = ?", update.Position.Column).
		Where("(SELECT valid_update FROM update_check)").
		Where("(SELECT is_new_in_stack FROM update_check)").
		Where("NOT (SELECT is_stack_swap FROM update_check)").
		Where("n.id = c.id")

	// update the stack and rank of the children of the note to update, so that it matches the new configuration
	updateChildrenInSwap := d.db.NewUpdate().
		TableExpr("notes as n").
		TableExpr("children as c").
		Set("stack = ?", update.Position.Stack).
		Set("\"column\" = ?", update.Position.Column).
		Where("(SELECT valid_update FROM update_check)").
		Where("(SELECT is_stack_swap FROM update_check)").
		Where("n.id = c.id")

	// update new stack root
	updateSwapNote := d.db.NewUpdate().Model((*Note)(nil)).
		Set("rank = (SELECT rank FROM previous)").
		Set("stack = ?", nil).
		Where("(SELECT valid_update FROM update_check)").
		Where("(SELECT is_stack_swap FROM update_check)").
		Where("id = (SELECT id FROM stack_target)").
		Where("board = ?", update.Board)

	query := d.db.NewUpdate().Model(&update).
		With("previous", previous).
		With("stack_target", stackTarget).
		With("update_check", updateCheck).
		With("children", children).
		With("rank_selection", rankSelection).
		With("update_lower", updateWhenNewIsLower).
		With("update_higher", updateWhenNewIsHigher).
		With("update_when_previously_not_in_stack", updateWhenPreviouslyNotInStack).
		With("update_children", updateChildren).
		With("update_children_in_swap", updateChildrenInSwap).
		With("update_stack_target", updateSwapNote).
		Set("\"column\" = ?", update.Position.Column).
		Set("stack = ?", update.Position.Stack).
		Set("rank = (SELECT new_rank FROM rank_selection)").
		Where("(SELECT valid_update FROM update_check)").
		Where("id = ?", update.ID).
		Where("board = ?", update.Board).
		Returning("*")
	if update.Text != nil {
		query = query.Set("text = ?", &update.Text)
	}

	var note []Note
	_, err := query.Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", update.Board), &note)
	return note[0], err
}

func (d *Database) DeleteNote(caller uuid.UUID, board uuid.UUID, id uuid.UUID, deleteStack bool) error {
	sessionSelect := d.db.NewSelect().Model((*BoardSession)(nil)).Column("role").Where("\"user\" = ?", caller).Where("board = ?", board)
	noteSelect := d.db.NewSelect().Model((*Note)(nil)).Column("author").Where("id = ?", id).Where("board = ?", board)

	var precondition struct {
		StackingAllowed bool
		CallerRole      types.SessionRole
		Author          uuid.UUID
	}
	err := d.db.NewSelect().
		ColumnExpr("(?) AS caller_role", sessionSelect).
		ColumnExpr("(?) as author", noteSelect).
		Scan(context.Background(), &precondition)
	if err != nil {
		return err
	}

	if precondition.Author == caller || precondition.CallerRole == types.SessionRoleModerator || precondition.CallerRole == types.SessionRoleOwner {
		previous := d.db.NewSelect().Model((*Note)(nil)).Where("id = ?", id).Where("board = ?", board)

		children := d.db.NewSelect().Model((*Note)(nil)).Where("stack = ?", id)

		updateBoard := d.db.NewUpdate().
			Model((*Board)(nil)).
			Set("shared_note = null").
			Where("id = ? AND shared_note = ?", board, id)

		updateRanks := d.db.NewUpdate().
			With("previous", previous).
			With("children", children).
			Model((*Note)(nil)).Set("rank = rank-1").
			Where("board = ?", board).
			Where("\"column\" = (SELECT \"column\" FROM previous)").
			WhereGroup(" AND ", func(q *bun.UpdateQuery) *bun.UpdateQuery {
				return q.
					Where("rank > (SELECT rank FROM previous)").
					WhereGroup(" AND ", func(q *bun.UpdateQuery) *bun.UpdateQuery {
						return q.
							WhereGroup(" OR ", func(q *bun.UpdateQuery) *bun.UpdateQuery {
								return q.
									Where("(?) IS FALSE", deleteStack).
									Where("(SELECT stack FROM previous) IS NULL").
									Where("NOT EXISTS (?)", children).
									Where("stack IS NULL")
							}).
							WhereGroup(" OR ", func(q *bun.UpdateQuery) *bun.UpdateQuery {
								return q.
									Where("(?) IS FALSE", deleteStack).
									Where("(SELECT stack FROM previous) IS NOT NULL").
									Where("stack = (SELECT stack FROM previous)")
							}).
							WhereGroup(" OR ", func(q *bun.UpdateQuery) *bun.UpdateQuery {
								return q.
									Where("(?) IS TRUE", deleteStack).
									Where("stack IS NULL")
							})
					})
			})

		var notes []Note

		if deleteStack {
			_, err := d.db.NewDelete().
				With("update_board", updateBoard).
				With("update_ranks", updateRanks).
				Model((*Note)(nil)).Where("id = ?", id).Where("board = ?", board).Returning("*").
				Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", board, "Note", id, "User", caller, "DeleteStack", deleteStack, "Result", &notes), &notes)

			return err
		}

		nextParentSelect := d.db.NewSelect().Model((*Note)(nil)).Where("stack = ?", id).Where("rank = (SELECT MAX(rank) FROM notes WHERE stack = ?)", id).Limit((1))

		updateStackRefs := d.db.NewUpdate().
			With("next_parent", nextParentSelect).
			Model((*Note)(nil)).Set("stack = (SELECT id FROM next_parent)").
			Where("board = ?", board).
			Where("stack = ?", id)

		updateNextParentStackId := d.db.NewUpdate().
			With("previous", previous).
			With("next_parent", nextParentSelect).
			Model((*Note)(nil)).
			Set("stack = null").
			Set("rank = (SELECT rank FROM previous)").
			Where("id = (SELECT id FROM next_parent)")

		_, err := d.db.NewDelete().
			With("update_board", updateBoard).
			With("update_ranks", updateRanks).
			With("update_stackrefs", updateStackRefs).
			With("update_parentStackId", updateNextParentStackId).
			Model((*Note)(nil)).Where("id = ?", id).Where("board = ?", board).Returning("*").
			Exec(common.ContextWithValues(context.Background(), "Database", d, "Board", board, "Note", id, "User", caller, "DeleteStack", deleteStack, "Result", &notes), &notes)

		return err
	}
	return errors.New("not permitted to delete note")
}
