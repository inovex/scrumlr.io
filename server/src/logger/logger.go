package logger

import (
  "context"
  "fmt"
  "net/http"
  "os"
  "time"

  "github.com/go-chi/chi/v5/middleware"
  "go.opentelemetry.io/contrib/bridges/otelzap"
  "go.opentelemetry.io/otel/log/global"
  "go.uber.org/zap"
  "go.uber.org/zap/zapcore"
)

var _logger *zap.SugaredLogger
var _logLevel zapcore.Level = zap.InfoLevel

type ctxLoggerKey int
type TmpLogger struct {
  _logger *zap.SugaredLogger
}

const ctxRequestLogger ctxLoggerKey = iota

func init() {
  createLogger()
}

// Initialze a new logger with the given log level.
// If the level does not match set the level to 'INFO'
func SetLogLevel(logLevel string) {
  switch logLevel {
  case "DEBUG":
    _logLevel = zap.DebugLevel
  case "INFO":
    _logLevel = zap.InfoLevel
  case "WARN":
    _logLevel = zap.WarnLevel
  case "ERROR":
    _logLevel = zap.ErrorLevel
  case "FATAL":
    _logLevel = zap.FatalLevel
  default:
    _logLevel = zap.InfoLevel
  }
  createLogger()
}

func GetLogLevel() zapcore.Level {
  return _logLevel
}

func createLogger() {
  loggerConfig := zap.NewProductionConfig()
  loggerConfig.Level = zap.NewAtomicLevelAt(_logLevel)
  loggerConfig.EncoderConfig.StacktraceKey = "" //remove stacktrace from logging
  logger, _ := loggerConfig.Build()
  _logger = logger.Sugar()
}

// EnableDevelopmentLogger constructs a development logger and overwrites the default production logger
// this is only for development
func EnableDevelopmentLogger() {
  loggerConfig := zap.NewDevelopmentConfig()
  loggerConfig.Level = zap.NewAtomicLevelAt(_logLevel)
  logger, _ := loggerConfig.Build()
  _logger = logger.Sugar()
}

func (l TmpLogger) Logf(format string, args ...interface{}) {
  l._logger.Debug(fmt.Sprintf(format, args...))

}
func GetTmpLogger() TmpLogger {
  return TmpLogger{
    _logger: _logger,
  }
}

// EnableOtelLogger constructs a logger that logs to the consol and to OpenTelemtry and overrites the default logger
func EnableOtelLogging() {
  provider := global.GetLoggerProvider()

  config := zap.NewProductionEncoderConfig()
  config.StacktraceKey = ""

  core := zapcore.NewTee(
    zapcore.NewCore(zapcore.NewJSONEncoder(config), zapcore.AddSync(os.Stdout), _logLevel),
    otelzap.NewCore("scrumlr.io/server/", otelzap.WithLoggerProvider(provider)),
  )

  _logger = zap.New(core).Sugar()
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

//func InitTestLogger(req *http.Request) *http.Request {
//	loggerConfig := zap.NewNop() // Use a no-op logger for testing
//	logger := loggerConfig.Sugar()
//	req = req.WithContext(AddLoggerToContext(req.Context(), logger))
//	return req
//}

func InitTestLogger(ctx context.Context) context.Context {
  loggerConfig := zap.NewNop() // Use a no-op logger for testing
  logger := loggerConfig.Sugar()

  return AddLoggerToContext(ctx, logger)
}

func InitTestLoggerRequest(req *http.Request) *http.Request {
  ctx := InitTestLogger(req.Context())
  req = req.WithContext(ctx)
  return req
}
