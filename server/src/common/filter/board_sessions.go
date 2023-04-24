package filter

import "scrumlr.io/server/database/types"

type BoardSessionFilter struct {
	Connected       *bool
	Ready           *bool
	RaisedHand      *bool
	ViewsSharedNote *bool
	Moderating      *bool
	Role            *types.SessionRole
}
