package dto

import (
	"github.com/google/uuid"
	"net/http"
	"scrumlr.io/server/database"
)

// User is the response for all user requests.
type User struct {
	// The id of the user
	ID uuid.UUID `json:"id"`

	// The user's display name
	Name string `json:"name"`
}

func (u *User) From(user database.User) *User {
	u.ID = user.ID
	u.Name = user.Name
	return u
}

func (*User) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}

type UserUpdateRequest struct {
	ID   uuid.UUID `json:"-"`
	Name string    `json:"name"`
}
