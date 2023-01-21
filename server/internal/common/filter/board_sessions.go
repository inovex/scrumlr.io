package filter

import "scrumlr.io/server/internal/database/types"

type BoardSessionFilter struct {
	Connected  *bool
	Ready      *bool
	RaisedHand *bool
	Role       *types.SessionRole
}
