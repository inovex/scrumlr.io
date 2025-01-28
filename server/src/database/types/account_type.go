package types

import (
	"encoding/json"
	"errors"
	"strings"
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

	// AccountTypeOIDC users registered on OIDC
	AccountTypeOIDC AccountType = "OIDC"
)

func NewAccountType(s string) (result AccountType, err error) {
	result = AccountType(strings.ToUpper(s))
	switch result {
	case AccountTypeAnonymous, AccountTypeGoogle, AccountTypeMicrosoft, AccountTypeAzureAd, AccountTypeGitHub, AccountTypeApple, AccountTypeOIDC:
		return
	}
	err = errors.New("invalid account type")

	return
}

func (accountType *AccountType) UnmarshalJSON(b []byte) error {
	var s string
	if err := json.Unmarshal(b, &s); err != nil {
		return err
	}
	unmarshalledAccountType, err := NewAccountType(s)
	if err != nil {
		return err
	}

	*accountType = unmarshalledAccountType

	return nil
}
