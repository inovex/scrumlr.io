package providers

import "fmt"

func NewAzureADProvider(clientID, clientSecret, redirectURI, tenantID string) (Provider, error) {
	issuerURL := fmt.Sprintf("https://login.microsoftonline.com/%s/v2.0", tenantID)
	return NewOIDCProvider("azure_ad", clientID, clientSecret, redirectURI, issuerURL, false, "User.Read")
}
