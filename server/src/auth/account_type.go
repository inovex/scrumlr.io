package auth

import (
	"encoding/json"
	"errors"
	"strings"
)

// AccountType of users (e.g. the authentication provider)
type AccountType string

const (
	// Anonymous users don't require a registration
	Anonymous AccountType = "ANONYMOUS"

	// Google users registered on Google
	Google AccountType = "GOOGLE"

	// Microsoft users registered on Microsoft
	Microsoft AccountType = "MICROSOFT"

	// AzureAd users registered on Azure AD
	AzureAd AccountType = "AZURE_AD"

	// GitHub users registered on GitHub
	GitHub AccountType = "GITHUB"

	// Apple users registered on Apple
	Apple AccountType = "APPLE"

	// TypeOIDC users registered on OIDC
	TypeOIDC AccountType = "OIDC"
)

func NewAccountType(s string) (result AccountType, err error) {
	result = AccountType(strings.ToUpper(s))
	switch result {
	case Anonymous, Google, Microsoft, AzureAd, GitHub, Apple, TypeOIDC:
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
