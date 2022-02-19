package common

import "context"

func ContextWithValues(ctx context.Context, kv ...interface{}) context.Context {
	if len(kv)%2 != 0 {
		panic("odd numbers of key-value pairs")
	}
	for i := 0; i < len(kv); i = i + 2 {
		ctx = context.WithValue(ctx, kv[i], kv[i+1])
	}
	return ctx
}
