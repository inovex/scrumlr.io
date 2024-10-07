package types

import (
	"fmt"
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestNewAccountType(t *testing.T) {
	tests := map[string]struct {
		have      string
		want      AccountType
		wantError bool
	}{
		"ANONYMOUS": {
			have: "ANONYMOUS",
			want: AccountTypeAnonymous,
		},
		"GOOGLE": {
			have: "GOOGLE",
			want: AccountTypeGoogle,
		},
		"MICROSOFT": {
			have: "MICROSOFT",
			want: AccountTypeMicrosoft,
		},
		"AZURE_AD": {
			have: "AZURE_AD",
			want: AccountTypeAzureAd,
		},
		"GITHUB": {
			have: "GITHUB",
			want: AccountTypeGitHub,
		},
		"APPLE": {
			have: "APPLE",
			want: AccountTypeApple,
		},
		"OIDC": {
			have: "OIDC",
			want: AccountTypeOIDC,
		},
		"ANONYMOUS (lowercase)": {
			have: "anonymous",
			want: AccountTypeAnonymous,
		},
		"GOOGLE (lowercase)": {
			have: "google",
			want: AccountTypeGoogle,
		},
		"MICROSOFT (lowercase)": {
			have: "microsoft",
			want: AccountTypeMicrosoft,
		},
		"AZURE_AD (lowercase)": {
			have: "azure_ad",
			want: AccountTypeAzureAd,
		},
		"GITHUB (lowercase)": {
			have: "github",
			want: AccountTypeGitHub,
		},
		"APPLE (lowercase)": {
			have: "apple",
			want: AccountTypeApple,
		},
		"OIDC (lowercase)": {
			have: "oidc",
			want: AccountTypeOIDC,
		},
		"invalid enum value": {
			have:      "FACEBOOK",
			wantError: true,
		},
	}

	for name, test := range tests {
		test := test
		t.Run(name, func(t *testing.T) {
			t.Parallel()
			got, gotErr := NewAccountType(test.have)
			if test.wantError {
				if gotErr == nil {
					t.Fatalf("NewAccountType(%q) did not yield an error", test.have)
				}
			} else {
				if got != test.want {
					t.Fatalf("NewAccountType(%q) returned %q; wanted %q", test.have, got, test.want)
				}
			}
		})
	}
}

func TestAccountTypeEnum(t *testing.T) {
	values := []AccountType{AccountTypeAnonymous, AccountTypeGoogle, AccountTypeGitHub, AccountTypeMicrosoft, AccountTypeApple, AccountTypeOIDC}
	for _, value := range values {
		var accountType AccountType
		err := accountType.UnmarshalJSON([]byte(fmt.Sprintf("\"%s\"", value)))
		assert.Nil(t, err)
		assert.Equal(t, value, accountType)
	}
}

func TestUnmarshalAccountTypeNil(t *testing.T) {
	var accountType AccountType
	err := accountType.UnmarshalJSON(nil)
	assert.NotNil(t, err)
}

func TestUnmarshalAccountTypeEmptyString(t *testing.T) {
	var accountType AccountType
	err := accountType.UnmarshalJSON([]byte(""))
	assert.NotNil(t, err)
}

func TestUnmarshalAccountTypeEmptyStringWithQuotation(t *testing.T) {
	var accountType AccountType
	err := accountType.UnmarshalJSON([]byte("\"\""))
	assert.NotNil(t, err)
}

func TestUnmarshalAccountTypeRandomValue(t *testing.T) {
	var accountType AccountType
	err := accountType.UnmarshalJSON([]byte("\"SOME_RANDOM_VALUE\""))
	assert.NotNil(t, err)
}
