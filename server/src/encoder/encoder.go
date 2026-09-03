package encoder

type PasswordEncoder interface {
	Encode(password string) (*string, *string, error)
	Matches(password, encodedPassword, salt string) (bool, error)
	UpgradeEncoding(encodedPassword string) bool
}
