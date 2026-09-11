package encoder

type PasswordEncoder interface {
	Encode(password string) (*string, *string, error)
	Matches(password, encodedPassword, salt string) (bool, error)
	UpgradeEncoding(encodedPassword string) bool
}

func InitializePasswordEncoder() (PasswordEncoder, error) {
	sha512Encoder := NewSha512Encoder()
	argon2idEncoder, err := NewArgon2IdEncoder(WithOWASPRecomended())
	if err != nil {
		return nil, err
	}

	return NewDelegatingPasswordEncoder(
		"argon2id",
		WithPasswordEncoder("sha512", sha512Encoder),
		WithPasswordEncoder("argon2id", argon2idEncoder),
	)
}
