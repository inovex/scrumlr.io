package sessions

import "scrumlr.io/server/common"

type BoardSessionFilter struct {
	Connected  *bool
	Ready      *bool
	RaisedHand *bool
	Role       *common.SessionRole
}
