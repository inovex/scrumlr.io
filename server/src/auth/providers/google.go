package providers

func NewGoogleProvider(clientID, clientSecret, redirectURI string) (Provider, error) {
	return NewOIDCProvider("google", clientID, clientSecret, redirectURI, "https://accounts.google.com", false)
}
