package providers

func NewGenericOIDCProvider(clientID, clientSecret, redirectURI, discoveryURL string) (Provider, error) {
	return NewOIDCProvider("oidc", clientID, clientSecret, redirectURI, discoveryURL, false)
}
