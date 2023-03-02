package types

import (
	"encoding/json"
	"errors"
)

// AccountType of users (e.g. the authentication provider)
type AccountType string

const (
	// AccountTypeAnonymous users don't require a registration
	AccountTypeAnonymous AccountType = "ANONYMOUS"

	// AccountTypeGoogle users registered on Google
	AccountTypeGoogle AccountType = "GOOGLE"

	// AccountTypeMicrosoft users registered on Microsoft
	AccountTypeMicrosoft AccountType = "MICROSOFT"

	// AccountTypeAzureAd users registered on Azure AD
	AccountTypeAzureAd AccountType = "AZURE_AD"

	// AccountTypeGitHub users registered on GitHub
	AccountTypeGitHub AccountType = "GITHUB"

	// AccountTypeApple users registered on Apple
	AccountTypeApple AccountType = "APPLE"
)

func (accountType *AccountType) UnmarshalJSON(b []byte) error {
	var s string
	json.Unmarshal(b, &s)
	unmarshalledAccountType := AccountType(s)
	switch unmarshalledAccountType {
	case AccountTypeAnonymous, AccountTypeGoogle, AccountTypeMicrosoft, AccountTypeGitHub, AccountTypeApple:
		*accountType = unmarshalledAccountType
		return nil
	}
	return errors.New("invalid account type")
}
