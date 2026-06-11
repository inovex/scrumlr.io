package hash

type Hash interface {
	HashWithSalt(passphrase string) (*string, *string, error)
	HashBySalt(passphrase, salt string) string
}
