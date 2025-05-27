package session_helper

import (
	"github.com/google/uuid"
	"scrumlr.io/server/common/dto"
	"scrumlr.io/server/database/types"
	"slices"
)

func CheckSessionRole(clientID uuid.UUID, sessions []*dto.BoardSession, sessionsRoles []types.SessionRole) bool {
	for _, session := range sessions {
		if clientID == session.User.ID {
			if slices.Contains(sessionsRoles, session.Role) {
				return true
			}
		}
	}
	return false
}
