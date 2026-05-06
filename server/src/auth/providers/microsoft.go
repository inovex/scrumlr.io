package providers

func NewMicrosoftProvider(clientID, clientSecret, redirectURI string) (Provider, error) {
	return NewOIDCProvider(
		"microsoft",
		clientID, clientSecret, redirectURI,
		"https://login.microsoftonline.com/common/v2.0",
		true,
		"User.Read",
	)
}
