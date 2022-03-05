package filter

import "scrumlr.io/server/database/types"

type BoardSessionFilter struct {
	Connected  *bool
	Ready      *bool
	RaisedHand *bool
	Role       *types.SessionRole
}
