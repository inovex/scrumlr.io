package devkeys

import _ "embed"

//go:embed dev_key
var PrivateKey string

//go:embed dev_key.pub
var PublicKey string
