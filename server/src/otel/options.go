package otel

type options struct {
	httpEndpoint *string
	grpcEndpoint *string
}

type OTelOption func(options *options) error

func WithHttpEndpoint(httpEndpoint string) OTelOption {
	return func(options *options) error {
		if httpEndpoint == "" {
			return nil
		}

		options.httpEndpoint = &httpEndpoint
		return nil
	}
}

func WithGrpcEndpoint(grpcEndpoint string) OTelOption {
	return func(options *options) error {
		if grpcEndpoint == "" {
			return nil
		}

		options.grpcEndpoint = &grpcEndpoint
		return nil
	}
}
