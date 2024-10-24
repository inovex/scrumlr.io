package identifiers

type boardIdentifier string
type userIdentifier string
type noteIdentifier string
type columnIdentifier string
type reactionIdentifier string
type votingIdentifier string
type boardEditableIdentifier string
type boardTemplateIdentifier string
type columnTemplateIdentifier string

const (
	BoardIdentifier          boardIdentifier          = "Board"
	UserIdentifier           userIdentifier           = "User"
	NoteIdentifier           noteIdentifier           = "Note"
	ColumnIdentifier         columnIdentifier         = "Column"
	ReactionIdentifier       reactionIdentifier       = "Reaction"
	VotingIdentifier         votingIdentifier         = "Voting"
	BoardEditableIdentifier  boardEditableIdentifier  = "BoardEditable"
	BoardTemplateIdentifier  boardTemplateIdentifier  = "BoardTemplate"
	ColumnTemplateIdentifier columnTemplateIdentifier = "ColumnTemplate"
)
