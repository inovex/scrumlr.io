module scrumlr.io/server

go 1.20

// https://github.com/inovex/scrumlr.io/security/dependabot/108
replace github.com/opencontainers/runc v1.1.0 => github.com/opencontainers/runc v1.1.2

require (
	github.com/go-chi/chi/v5 v5.0.12
	github.com/go-chi/cors v1.2.1
	github.com/go-chi/httprate v0.9.0
	github.com/go-chi/jwtauth/v5 v5.1.1
	github.com/go-chi/render v1.0.3
	github.com/go-redis/redis/v8 v8.11.5
	github.com/golang-migrate/migrate/v4 v4.17.1
	github.com/google/uuid v1.6.0
	github.com/gorilla/websocket v1.5.1
	github.com/lestrrat-go/jwx/v2 v2.0.21
	github.com/markbates/goth v1.80.0
	github.com/nats-io/nats.go v1.35.0
	github.com/ory/dockertest/v3 v3.10.0
	github.com/pkg/errors v0.9.1
	github.com/stretchr/testify v1.9.0
	github.com/uptrace/bun v1.1.17
	github.com/uptrace/bun/dbfixture v1.1.17
	github.com/uptrace/bun/dialect/pgdialect v1.1.17
	github.com/uptrace/bun/extra/bundebug v1.1.17
	github.com/urfave/cli/v2 v2.27.2
	go.uber.org/zap v1.27.0
	golang.org/x/crypto v0.23.0
)

require (
	cloud.google.com/go/compute v1.23.3 // indirect
	cloud.google.com/go/compute/metadata v0.2.3 // indirect
	github.com/Azure/go-ansiterm v0.0.0-20230124172434-306776ec8161 // indirect
	github.com/BurntSushi/toml v1.3.2 // indirect
	github.com/Microsoft/go-winio v0.6.1 // indirect
	github.com/Nvveen/Gotty v0.0.0-20120604004816-cd527374f1e5 // indirect
	github.com/ajg/form v1.5.1 // indirect
	github.com/cenkalti/backoff/v4 v4.1.3 // indirect
	github.com/cespare/xxhash/v2 v2.2.0 // indirect
	github.com/containerd/continuity v0.3.0 // indirect
	github.com/cpuguy83/go-md2man/v2 v2.0.4 // indirect
	github.com/davecgh/go-spew v1.1.1 // indirect
	github.com/decred/dcrd/dcrec/secp256k1/v4 v4.2.0 // indirect
	github.com/dgryski/go-rendezvous v0.0.0-20200823014737-9f7001d12a5f // indirect
	github.com/docker/cli v20.10.17+incompatible // indirect
	github.com/docker/docker v24.0.9+incompatible // indirect
	github.com/docker/go-connections v0.4.0 // indirect
	github.com/docker/go-units v0.5.0 // indirect
	github.com/fatih/color v1.16.0 // indirect
	github.com/goccy/go-json v0.10.2 // indirect
	github.com/gogo/protobuf v1.3.2 // indirect
	github.com/golang-jwt/jwt/v4 v4.4.2 // indirect
	github.com/golang/protobuf v1.5.3 // indirect
	github.com/google/shlex v0.0.0-20191202100458-e7afc7fbc510 // indirect
	github.com/gorilla/mux v1.8.0 // indirect
	github.com/gorilla/securecookie v1.1.1 // indirect
	github.com/gorilla/sessions v1.2.1 // indirect
	github.com/hashicorp/errwrap v1.1.0 // indirect
	github.com/hashicorp/go-multierror v1.1.1 // indirect
	github.com/imdario/mergo v0.3.12 // indirect
	github.com/jinzhu/inflection v1.0.0 // indirect
	github.com/klauspost/compress v1.17.2 // indirect
	github.com/lestrrat-go/backoff/v2 v2.0.8 // indirect
	github.com/lestrrat-go/blackmagic v1.0.2 // indirect
	github.com/lestrrat-go/httpcc v1.0.1 // indirect
	github.com/lestrrat-go/httprc v1.0.5 // indirect
	github.com/lestrrat-go/iter v1.0.2 // indirect
	github.com/lestrrat-go/jwx v1.2.29 // indirect
	github.com/lestrrat-go/option v1.0.1 // indirect
	github.com/lib/pq v1.10.9 // indirect
	github.com/markbates/going v1.0.3 // indirect
	github.com/mattn/go-colorable v0.1.13 // indirect
	github.com/mattn/go-isatty v0.0.20 // indirect
	github.com/mitchellh/mapstructure v1.4.3 // indirect
	github.com/moby/term v0.5.0 // indirect
	github.com/nats-io/nkeys v0.4.7 // indirect
	github.com/nats-io/nuid v1.0.1 // indirect
	github.com/opencontainers/go-digest v1.0.0 // indirect
	github.com/opencontainers/image-spec v1.0.2 // indirect
	github.com/opencontainers/runc v1.1.12 // indirect
	github.com/pmezard/go-difflib v1.0.0 // indirect
	github.com/russross/blackfriday/v2 v2.1.0 // indirect
	github.com/segmentio/asm v1.2.0 // indirect
	github.com/sirupsen/logrus v1.9.2 // indirect
	github.com/stretchr/objx v0.5.2 // indirect
	github.com/tmthrgd/go-hex v0.0.0-20190904060850-447a3041c3bc // indirect
	github.com/vmihailenco/msgpack/v5 v5.4.1 // indirect
	github.com/vmihailenco/tagparser/v2 v2.0.0 // indirect
	github.com/xeipuuv/gojsonpointer v0.0.0-20190905194746-02993c407bfb // indirect
	github.com/xeipuuv/gojsonreference v0.0.0-20180127040603-bd5ef7bd5415 // indirect
	github.com/xeipuuv/gojsonschema v1.2.0 // indirect
	github.com/xrash/smetrics v0.0.0-20240312152122-5f08fbb34913 // indirect
	go.uber.org/atomic v1.9.0 // indirect
	go.uber.org/multierr v1.10.0 // indirect
	golang.org/x/mod v0.11.0 // indirect
	golang.org/x/net v0.23.0 // indirect
	golang.org/x/oauth2 v0.17.0 // indirect
	golang.org/x/sys v0.20.0 // indirect
	golang.org/x/tools v0.10.0 // indirect
	google.golang.org/appengine v1.6.8 // indirect
	google.golang.org/protobuf v1.33.0 // indirect
	gopkg.in/yaml.v2 v2.4.0 // indirect
	gopkg.in/yaml.v3 v3.0.1 // indirect
)
