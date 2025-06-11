package sessions

import (
	"net/http"

	"github.com/google/uuid"
	"scrumlr.io/server/common"
)

// User is the response for all user requests.
type User struct {
	// The id of the user
	ID uuid.UUID `json:"id"`

	// The user's display name
	Name string `json:"name"`

	// The user's avatar configuration
	Avatar *common.Avatar `json:"avatar,omitempty"`

	// The user's account type configuration
	AccountType common.AccountType `json:"accountType"`
}

type UserUpdateRequest struct {
	ID     uuid.UUID      `json:"-"`
	Name   string         `json:"name"`
	Avatar *common.Avatar `json:"avatar,omitempty"`
}

func (u *User) From(user DatabaseUser) *User {
	u.ID = user.ID
	u.Name = user.Name
	u.Avatar = user.Avatar
	u.AccountType = user.AccountType
	return u
}

func (*User) Render(_ http.ResponseWriter, _ *http.Request) error {
	return nil
}
