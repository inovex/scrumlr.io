package html

import _ "embed"

//go:embed board.html
var BoardTemplate string

//go:embed index.html
var IndexTemplate string

//go:embed request.html
var RequestTemplate string
