package logger

import (
	"context"
	"fmt"
	"net/http"
	"time"

	"github.com/go-chi/chi/v5/middleware"
	"go.uber.org/zap"
)

var _logger *zap.SugaredLogger

type ctxLoggerKey int

const ctxRequestLogger ctxLoggerKey = iota

func init() {
	loggerConfig := zap.NewProductionConfig()
	loggerConfig.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	logger, _ := loggerConfig.Build()
	_logger = logger.Sugar()
}

// EnableDevelopmentLogger constructs a development logger and overwrites the default production logger
// this is only for development
func EnableDevelopmentLogger() {
	loggerConfig := zap.NewDevelopmentConfig()
	loggerConfig.Level = zap.NewAtomicLevelAt(zap.InfoLevel)
	logger, _ := loggerConfig.Build()
	_logger = logger.Sugar()
}

// Get returns the current default SugaredLogger
func Get() *zap.SugaredLogger {
	return _logger
}

// FromRequest returns a logger from an HTTP request.
func FromRequest(r *http.Request) *zap.SugaredLogger {
	return FromContext(r.Context())
}

// FromContext tries to return a logger from the given context or falls back
// to the pre initialized logger.
func FromContext(ctx context.Context) *zap.SugaredLogger {
	l, ok := ctx.Value(ctxRequestLogger).(*zap.SugaredLogger)
	if !ok {
		return _logger
	}
	return l
}

// AddLoggerToContext returns a wrapped context with the given logger.
func AddLoggerToContext(ctx context.Context, logger *zap.SugaredLogger) context.Context {
	return context.WithValue(ctx, ctxRequestLogger, logger)
}

// RequestIDMiddleware adds the requestID from aws to the current logger
func RequestIDMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		requestID := r.Context().Value(middleware.RequestIDKey)
		ctx := AddLoggerToContext(r.Context(), _logger.With(
			"requestID", requestID,
		))
		next.ServeHTTP(w, r.WithContext(ctx))
	})
}

func ChiZapLogger() func(next http.Handler) http.Handler {
	return func(next http.Handler) http.Handler {
		fn := func(w http.ResponseWriter, r *http.Request) {
			log := FromRequest(r)
			ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
			t1 := time.Now()
			defer func() {
				scheme := "http"
				if r.TLS != nil {
					scheme = "https"
				}
				log.Infow("Served",
					"method", r.Method,
					"proto", r.Proto,
					"address", fmt.Sprintf(`"%s://%s%s"`, scheme, r.Host, r.RequestURI),
					"lat", time.Since(t1),
					"status", ww.Status(),
					"size", ww.BytesWritten(),
				)
			}()
			next.ServeHTTP(ww, r)
		}
		return http.HandlerFunc(fn)
	}
}
