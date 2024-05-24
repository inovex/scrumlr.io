package identifiers

//
//type BoardIdentifier struct{}
//type UserIdentifier struct{}
//type NoteIdentifier struct{}
//type ColumnIdentifier struct{}
//type ReactionIdentifier struct{}
//type VotingIdentifier struct{}
//type BoardEditableIdentifier struct{}

type boardIdentifier string
type userIdentifier string
type noteIdentifier string
type columnIdentifier string
type reactionIdentifier string
type votingIdentifier string
type boardEditableIdentifier string

const (
	BoardIdentifier         boardIdentifier         = "Board"
	UserIdentifier          userIdentifier          = "User"
	NoteIdentifier          noteIdentifier          = "Note"
	ColumnIdentifier        columnIdentifier        = "Column"
	ReactionIdentifier      reactionIdentifier      = "Reaction"
	VotingIdentifier        votingIdentifier        = "Voting"
	BoardEditableIdentifier boardEditableIdentifier = "BoardEditable"
)
