package sessions

type BoardSessionFilter struct {
	Connected  *bool
	Ready      *bool
	RaisedHand *bool
	Role       *SessionRole
}
