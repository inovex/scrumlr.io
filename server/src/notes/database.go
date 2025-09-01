package notes

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

func NewNotesDatabase(database *bun.DB) NotesDatabase {
	db := new(DB)
	db.db = database
	return db
}

func (d *DB) CreateNote(insert DatabaseNoteInsert) (DatabaseNote, error) {
	var note DatabaseNote
	_, err := d.db.NewInsert().
		Model(&insert).
		Value("rank", "coalesce((SELECT COUNT(*) as rank FROM notes WHERE board = ? AND \"column\" = ? AND stack IS NULL), 0)", insert.Board, insert.Column).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, insert.Board), &note)

	return note, err
}

func (d *DB) ImportNote(insert DatabaseNoteImport) (DatabaseNote, error) {
	var note DatabaseNote
	_, err := d.db.NewInsert().
		Model(&insert).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, insert.Board), &note)

	return note, err
}

func (d *DB) Get(id uuid.UUID) (DatabaseNote, error) {
	var note DatabaseNote
	err := d.db.NewSelect().
		Model((*DatabaseNote)(nil)).
		Where("id = ?", id).
		Scan(context.Background(), &note)

	return note, err
}

func (d *DB) GetAll(board uuid.UUID, columns ...uuid.UUID) ([]DatabaseNote, error) {
	var notes []DatabaseNote
	query := d.db.NewSelect().
		Model((*DatabaseNote)(nil)).
		Where("board = ?", board)

	if len(columns) > 0 {
		query = query.Where("\"column\" IN (?)", bun.In(columns))
	}

	err := query.OrderExpr("\"column\", stack DESC, rank DESC").
		Scan(context.Background(), &notes)
	return notes, err
}

func (d *DB) GetChildNotes(parentNote uuid.UUID) ([]DatabaseNote, error) {
	var notes []DatabaseNote
	err := d.db.NewSelect().
		Model((*DatabaseNote)(nil)).
		Where("stack = ?", parentNote).
		Order("rank ASC").
		Scan(context.Background(), &notes)

	return notes, err
}

func (d *DB) UpdateNote(caller uuid.UUID, update DatabaseNoteUpdate) (DatabaseNote, error) {
	var note DatabaseNote
	boardSelect := d.db.NewSelect().
		Model((*common.DatabaseBoard)(nil)).
		Column("allow_stacking").
		Where("id = ?", update.Board)

	sessionSelect := d.db.NewSelect().
		Model((*common.DatabaseBoardSession)(nil)).
		Column("role").
		Where("\"user\" = ?", caller).
		Where("board = ?", update.Board)

	noteSelect := d.db.NewSelect().
		Model((*DatabaseNote)(nil)).
		Column("author").
		Where("id = ?", update.ID).
		Where("board = ?", update.Board)

	var precondition struct {
		StackingAllowed bool
		CallerRole      common.SessionRole
		Author          uuid.UUID
	}
	err := d.db.NewSelect().
		ColumnExpr("(?) AS stacking_allowed", boardSelect).
		ColumnExpr("(?) AS caller_role", sessionSelect).
		ColumnExpr("(?) as author", noteSelect).
		Scan(context.Background(), &precondition)

	if err != nil {
		return note, err
	}

	if update.Text != nil && update.Position == nil {
		if caller == precondition.Author || precondition.CallerRole == common.ModeratorRole || precondition.CallerRole == common.OwnerRole {
			note, err = d.updateNoteText(update)
		} else {
			err = errors.New("not permitted to change text of note")
		}
	} else if update.Position != nil {
		if update.Text != nil && (caller != precondition.Author || precondition.CallerRole == common.ParticipantRole) {
			return note, errors.New("not permitted to change text of note")
		}

		if update.Position.Stack.Valid && update.Position.Stack.UUID == update.ID {
			return note, errors.New("stacking on self is not allowed")
		}

		if precondition.CallerRole == common.ModeratorRole || precondition.CallerRole == common.OwnerRole || precondition.StackingAllowed {
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

func (d *DB) DeleteNote(caller uuid.UUID, boardID uuid.UUID, id uuid.UUID, deleteStack bool) error {
	sessionSelect := d.db.NewSelect().
		Model((*common.DatabaseBoardSession)(nil)).
		Column("role").
		Where("\"user\" = ?", caller).
		Where("board = ?", boardID)

	noteSelect := d.db.NewSelect().
		Model((*DatabaseNote)(nil)).
		Column("author").
		Where("id = ?", id).
		Where("board = ?", boardID)

	var precondition struct {
		StackingAllowed bool
		CallerRole      common.SessionRole
		Author          uuid.UUID
	}

	err := d.db.NewSelect().
		ColumnExpr("(?) AS caller_role", sessionSelect).
		ColumnExpr("(?) as author", noteSelect).
		Scan(context.Background(), &precondition)

	if err != nil {
		return err
	}

	if precondition.Author == caller || precondition.CallerRole == common.ModeratorRole || precondition.CallerRole == common.OwnerRole {
		previous := d.db.NewSelect().
			Model((*DatabaseNote)(nil)).
			Where("id = ?", id).
			Where("board = ?", boardID)

		children := d.db.NewSelect().
			Model((*DatabaseNote)(nil)).
			Where("stack = ?", id)

		updateBoard := d.db.NewUpdate().
			Model((*common.DatabaseBoard)(nil)).
			Set("shared_note = null").
			Where("id = ? AND shared_note = ?", boardID, id)

		updateRanks := d.db.NewUpdate().
			With("previous", previous).
			With("children", children).
			Model((*DatabaseNote)(nil)).Set("rank = rank-1").
			Where("board = ?", boardID).
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

		var notes []DatabaseNote

		if deleteStack {
			_, err := d.db.NewDelete().
				With("update_board", updateBoard).
				With("update_ranks", updateRanks).
				Model((*DatabaseNote)(nil)).Where("id = ?", id).
				Where("board = ?", boardID).
				Returning("*").
				Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, boardID, identifiers.NoteIdentifier, id, identifiers.UserIdentifier, caller, "DeleteStack", deleteStack, "Result", &notes), &notes)

			return err
		}

		nextParentSelect := d.db.NewSelect().
			Model((*DatabaseNote)(nil)).
			Where("stack = ?", id).
			Where("rank = (SELECT MAX(rank) FROM notes WHERE stack = ?)", id).
			Limit((1))

		updateStackRefs := d.db.NewUpdate().
			With("next_parent", nextParentSelect).
			Model((*DatabaseNote)(nil)).Set("stack = (SELECT id FROM next_parent)").
			Where("board = ?", boardID).
			Where("stack = ?", id)

		updateNextParentStackId := d.db.NewUpdate().
			With("previous", previous).
			With("next_parent", nextParentSelect).
			Model((*DatabaseNote)(nil)).
			Set("stack = null").
			Set("rank = (SELECT rank FROM previous)").
			Where("id = (SELECT id FROM next_parent)")

		_, err := d.db.NewDelete().
			With("update_board", updateBoard).
			With("update_ranks", updateRanks).
			With("update_stackrefs", updateStackRefs).
			With("update_parentStackId", updateNextParentStackId).
			Model((*DatabaseNote)(nil)).
			Where("id = ?", id).
			Where("board = ?", boardID).
			Returning("*").
			Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, boardID, identifiers.NoteIdentifier, id, identifiers.UserIdentifier, caller, "DeleteStack", deleteStack, "Result", &notes), &notes)

		return err
	}

	return errors.New("not permitted to delete note")
}

func (d *DB) updateNoteText(update DatabaseNoteUpdate) (DatabaseNote, error) {
	var note DatabaseNote
	_, err := d.db.NewUpdate().
		Model(&update).
		Column("text", "edited").
		Where("id = ?", update.ID).
		Where("board = ?", update.Board).
		Where("id = ?", update.ID).
		Returning("*").
		Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, update.Board), &note)

	return note, err
}

func (d *DB) updateNoteWithoutStack(update DatabaseNoteUpdate) (DatabaseNote, error) {
	newRank := update.Position.Rank
	if update.Position.Rank < 0 {
		newRank = 0
	}

	// select previous configuration of note to update
	previous := d.db.NewSelect().
		Model((*DatabaseNote)(nil)).
		Where("id = ?", update.ID).
		Where("board = ?", update.Board)
	// select whether the note is moved into another column or out from a stack. This will change the COUNT(*) of notes to consider
	rankAddition := d.db.NewSelect().
		ColumnExpr("CASE WHEN (SELECT \"column\" FROM previous) <> ? OR (SELECT stack FROM previous) IS NOT NULL THEN 0 ELSE -1 END as max_rank_addition", update.Position.Column)
	// select the max rank allowed for the column of the note
	rankRange := d.db.NewSelect().
		Model((*DatabaseNote)(nil)).
		ColumnExpr("(COUNT(*) + (SELECT max_rank_addition FROM rank_addition)) as max_rank").
		Where("\"column\" = ?", update.Position.Column).
		Where("board = ?", update.Board).
		Where("stack IS NULL")
	// select the new rank to set based on the preceding queries
	rankSelection := d.db.NewSelect().
		ColumnExpr("LEAST((SELECT max_rank FROM rank_range), ?) as new_rank", newRank)
	// make room for this note (shift notes by +1 above the new rank) if this note will be moved into a new column or out of a stack
	updateWhenPreviouslyStackedOrInOtherColumn := d.db.NewUpdate().
		Model((*DatabaseNote)(nil)).
		Set("rank=rank+1").
		Where("(SELECT max_rank_addition FROM rank_addition) = 0").
		Where("\"column\" = ?", update.Position.Column).
		Where("board = ?", update.Board).Where("rank >= (SELECT new_rank FROM rank_selection)")
	// If the note is moved into a new column, decrease the ranks of the notes in the previous column that where above the note
	decreaseRanksInPreviousColumn := d.db.NewUpdate().
		Model((*DatabaseNote)(nil)).
		Set("rank=rank-1").
		Where("\"column\" = (SELECT \"column\" FROM previous)").
		Where("board = ?", update.Board).Where("rank > (SELECT rank FROM previous)").
		Where("stack IS NULL").
		Where("\"column\" <> ?", update.Position.Column)
	// shift notes within column if the new rank is lower than before
	updateWhenNewIsLower := d.db.NewUpdate().
		Model((*DatabaseNote)(nil)).
		Set("rank=rank+1").
		Where("(SELECT max_rank_addition FROM rank_addition) = -1").
		Where("(SELECT new_rank FROM rank_selection) < (SELECT rank FROM previous)").
		Where("\"column\" = ?", update.Position.Column).
		Where("board = ?", update.Board).
		Where("rank >= (SELECT new_rank FROM rank_selection)").
		Where("rank < (SELECT rank FROM previous)").
		Where("stack IS NULL")
	// shift notes within column if the new rank is higher than before
	updateWhenNewIsHigher := d.db.NewUpdate().
		Model((*DatabaseNote)(nil)).
		Set("rank=rank-1").
		Where("(SELECT max_rank_addition FROM rank_addition) = -1").
		Where("(SELECT new_rank FROM rank_selection) > (SELECT rank FROM previous)").
		Where("\"column\" = ?", update.Position.Column).
		Where("board = ?", update.Board).
		Where("rank <= (SELECT new_rank FROM rank_selection)").
		Where("rank > (SELECT rank FROM previous)").
		Where("stack IS NULL")
	// update column of child notes
	updateChildNotes := d.db.NewUpdate().
		Model((*DatabaseNote)(nil)).
		Set("\"column\" = ?", update.Position.Column).
		Where("stack = ?", update.ID)

	query := d.db.NewUpdate().Model(&update).
		With("previous", previous).
		With("rank_addition", rankAddition).
		With("rank_range", rankRange).
		With("rank_selection", rankSelection).
		With("decrease_rank", decreaseRanksInPreviousColumn).
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

	var note []DatabaseNote
	_, err := query.Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, update.Board), &note)

	return note[0], err
}

func (d *DB) updateNoteWithStack(update DatabaseNoteUpdate) (DatabaseNote, error) {
	newRank := update.Position.Rank
	if update.Position.Rank < 0 {
		newRank = 0
	}

	// select previous configuration of note to update
	previous := d.db.NewSelect().
		Model((*DatabaseNote)(nil)).
		Where("id = ?", update.ID).
		Where("board = ?", update.Board)

	// select previous configuration of stack target
	stackTarget := d.db.NewSelect().
		Model((*DatabaseNote)(nil)).
		Where("id = ?", update.Position.Stack).
		Where("board = ?", update.Board)

	// check whether this note should be updated
	updateCheck := d.db.
		NewSelect().
		ColumnExpr("CASE WHEN (SELECT \"stack\" FROM previous) IS NOT NULL AND (SELECT \"stack\" FROM previous) <> ? THEN true WHEN (SELECT \"stack\" FROM previous) IS NULL THEN true ELSE false END as is_new_in_stack", update.Position.Stack).
		ColumnExpr("CASE WHEN (SELECT \"stack\" FROM previous) = ? AND (SELECT \"rank\" FROM previous) <> ? THEN true ELSE false END as is_same_stack", update.Position.Stack, update.Position.Rank).
		ColumnExpr("CASE WHEN (SELECT \"stack\" FROM stack_target) = ? THEN true ELSE false END as is_stack_swap", update.ID).
		ColumnExpr("CASE WHEN (SELECT \"column\" FROM notes WHERE id = ?) = ? THEN true ELSE false END as valid_update", update.Position.Stack, update.Position.Column)

	// select the children of the note to update
	children := d.db.NewSelect().
		Model((*DatabaseNote)(nil)).
		Column("*").
		ColumnExpr("row_number() over (ORDER BY rank DESC) as index").
		Where("stack = ?", update.ID)

	// select the new rank for the note based on the limits of the ranks pre-existing
	rankSelection := d.db.NewSelect().
		Model((*DatabaseNote)(nil)).
		ColumnExpr("CASE "+
			"WHEN (SELECT is_stack_swap FROM update_check) THEN (SELECT rank FROM stack_target) "+
			"WHEN (SELECT is_same_stack FROM update_check) THEN LEAST((SELECT COUNT(*) FROM notes WHERE \"stack\" = ?)-1, ?) "+
			"WHEN (SELECT is_new_in_stack FROM update_check) THEN COUNT(*) + (SELECT COUNT(*) FROM children) "+
			"ELSE (SELECT rank FROM previous) END as new_rank", update.Position.Stack, newRank).
		Where("\"column\" = ?", update.Position.Column).
		Where("board = ?", update.Board).
		Where("stack = ?", update.Position.Stack)

	// shift notes within stack if the new rank is lower than before
	updateWhenNewIsLower := d.db.NewUpdate().
		Model((*DatabaseNote)(nil)).
		Set("rank=rank+1").
		Where("(SELECT is_same_stack FROM update_check)").
		Where("(SELECT new_rank FROM rank_selection) < (SELECT rank FROM previous)").
		Where("\"stack\" = ?", update.Position.Stack).
		Where("board = ?", update.Board).
		Where("rank >= (SELECT new_rank FROM rank_selection)").
		Where("rank < (SELECT rank FROM previous)")

	// shift notes within stack if the new rank is higher than before
	updateWhenNewIsHigher := d.db.NewUpdate().
		Model((*DatabaseNote)(nil)).
		Set("rank=rank-1").
		Where("(SELECT is_same_stack FROM update_check)").
		Where("(SELECT new_rank FROM rank_selection) > (SELECT rank FROM previous)").
		Where("\"stack\" = ?", update.Position.Stack).
		Where("board = ?", update.Board).
		Where("rank <= (SELECT new_rank FROM rank_selection)").
		Where("rank > (SELECT rank FROM previous)")

	// update the ranks of other notes if this note is moved freshly into a new stack
	updateWhenPreviouslyNotInStack := d.db.NewUpdate().
		Model((*DatabaseNote)(nil)).
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
	updateSwapNote := d.db.NewUpdate().Model((*DatabaseNote)(nil)).
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

	var note []DatabaseNote
	_, err := query.Exec(common.ContextWithValues(context.Background(), "Database", d, identifiers.BoardIdentifier, update.Board), &note)

	return note[0], err
}

func (d *DB) GetStack(noteID uuid.UUID) ([]DatabaseNote, error) {
	var notes []DatabaseNote
	err := d.db.NewSelect().
		Model(&notes).
		Where("id = ?", noteID).
		WhereOr("stack = ?", noteID).
		OrderExpr("rank ASC NULLS FIRST").
		Scan(context.Background())

	return notes, err
}
