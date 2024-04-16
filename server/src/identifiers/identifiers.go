package identifiers

//
//type KeyBoardIdentifier struct{}
//type KeyUserIdentifier struct{}
//type KeyNoteIdentifier struct{}
//type KeyColumnIdentifier struct{}
//type KeyReactionIdentifier struct{}
//type KeyVotingIdentifier struct{}
//type KeyBoardEditableIdentifier struct{}

type keyBoardIdentifier string
type keyUserIdentifier string
type keyNoteIdentifier string
type keyColumnIdentifier string
type keyReactionIdentifier string
type keyVotingIdentifier string
type keyBoardEditableIdentifier string

const (
	KeyBoardIdentifier         keyBoardIdentifier         = "Board"
	KeyUserIdentifier          keyUserIdentifier          = "User"
	KeyNoteIdentifier          keyNoteIdentifier          = "Note"
	KeyColumnIdentifier        keyColumnIdentifier        = "Column"
	KeyReactionIdentifier      keyReactionIdentifier      = "Reaction"
	KeyVotingIdentifier        keyVotingIdentifier        = "Voting"
	KeyBoardEditableIdentifier keyBoardEditableIdentifier = "BoardEditable"
)
