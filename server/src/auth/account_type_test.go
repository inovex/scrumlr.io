package auth

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
			want: Anonymous,
		},
		"GOOGLE": {
			have: "GOOGLE",
			want: Google,
		},
		"MICROSOFT": {
			have: "MICROSOFT",
			want: Microsoft,
		},
		"AZURE_AD": {
			have: "AZURE_AD",
			want: AzureAd,
		},
		"GITHUB": {
			have: "GITHUB",
			want: GitHub,
		},
		"APPLE": {
			have: "APPLE",
			want: Apple,
		},
		"OIDC": {
			have: "OIDC",
			want: TypeOIDC,
		},
		"ANONYMOUS (lowercase)": {
			have: "anonymous",
			want: Anonymous,
		},
		"GOOGLE (lowercase)": {
			have: "google",
			want: Google,
		},
		"MICROSOFT (lowercase)": {
			have: "microsoft",
			want: Microsoft,
		},
		"AZURE_AD (lowercase)": {
			have: "azure_ad",
			want: AzureAd,
		},
		"GITHUB (lowercase)": {
			have: "github",
			want: GitHub,
		},
		"APPLE (lowercase)": {
			have: "apple",
			want: Apple,
		},
		"OIDC (lowercase)": {
			have: "oidc",
			want: TypeOIDC,
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
	values := []AccountType{Anonymous, Google, GitHub, Microsoft, Apple, TypeOIDC}
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
