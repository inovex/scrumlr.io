package initialize

import (
	"github.com/uptrace/bun"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/votes"
)

// TODO: create generic method to initialize services
func InitializeReactionService(db *bun.DB) *reactions.ReactionDatabase {
	reactionDB := reactions.NewReactionsDatabase(db)
	return &reactionDB
}

func InitializeNotesService(db *bun.DB) *notes.NotesDatabase {
	notesDB := notes.NewNotesDatabase(db)
	return &notesDB
}

func InitializeVotingService(db *bun.DB) *votes.VotingDatabase {
	votingDB := votes.NewVotingDatabase(db)
	return &votingDB
}
