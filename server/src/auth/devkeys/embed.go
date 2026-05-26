package devkeys

// blank embed import is used by annotated fields below
import _ "embed"

//go:embed dev_key
var PrivateKey string

//go:embed dev_key.pub
var PublicKey string
