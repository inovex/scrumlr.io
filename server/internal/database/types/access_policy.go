package types

import (
	"encoding/json"
	"errors"
)

// AccessPolicy defines the access policy by which users can join a board.
//
// If it set to 'PUBLIC' all users may join a board. If it set to 'BY_PASSPHRASE' they must first complete
// the passphrase challenge. If it is set to 'BY_INVITE' all moderators of a board can either accept or
// reject join requests of new users.
type AccessPolicy string

const (
	// AccessPolicyPublic access policy allows all users to join a board
	AccessPolicyPublic AccessPolicy = "PUBLIC"

	// AccessPolicyByPassphrase access policy must pass a passphrase check before they can join a board
	AccessPolicyByPassphrase AccessPolicy = "BY_PASSPHRASE"

	// AccessPolicyByInvite access policy lets moderators accept and reject user join requests to a board
	AccessPolicyByInvite AccessPolicy = "BY_INVITE"
)

func (accessPolicy *AccessPolicy) UnmarshalJSON(b []byte) error {
	var s string
	json.Unmarshal(b, &s)
	unmarshalledAccessPolicy := AccessPolicy(s)
	switch unmarshalledAccessPolicy {
	case AccessPolicyPublic, AccessPolicyByPassphrase, AccessPolicyByInvite:
		*accessPolicy = unmarshalledAccessPolicy
		return nil
	}
	return errors.New("invalid access policy")
}
