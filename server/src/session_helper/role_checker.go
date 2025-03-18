package session_helper

import (
	"slices"

	"github.com/google/uuid"
	"scrumlr.io/server/sessions"
)

func CheckSessionRole(clientID uuid.UUID, sessions []*sessions.BoardSession, sessionsRoles []sessions.SessionRole) bool {
	for _, session := range sessions {
		if clientID == session.User.ID {
			if slices.Contains(sessionsRoles, session.Role) {
				return true
			}
		}
	}
	return false
}
