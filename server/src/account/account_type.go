package account

import (
	"encoding/json"
	"errors"
	"strings"
)

// Type of users (e.g. the authentication provider)
type Type string

const (
	// Anonymous users don't require a registration
	Anonymous Type = "ANONYMOUS"

	// Google users registered on Google
	Google Type = "GOOGLE"

	// Microsoft users registered on Microsoft
	Microsoft Type = "MICROSOFT"

	// AzureAd users registered on Azure AD
	AzureAd Type = "AZURE_AD"

	// GitHub users registered on GitHub
	GitHub Type = "GITHUB"

	// Apple users registered on Apple
	Apple Type = "APPLE"

	// OIDC users registered on OIDC
	OIDC Type = "OIDC"
)

func NewAccountType(s string) (result Type, err error) {
	result = Type(strings.ToUpper(s))
	switch result {
	case Anonymous, Google, Microsoft, AzureAd, GitHub, Apple, OIDC:
		return
	}
	err = errors.New("invalid account type")

	return
}

func (accountType *Type) UnmarshalJSON(b []byte) error {
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
