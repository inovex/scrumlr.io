package api

import (
	"net/http"
	"strconv"
	"strings"
	"time"

	"github.com/go-chi/chi/middleware"
	"github.com/prometheus/client_golang/prometheus"
)

var (
	endpointLatency = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request latency per endpoint.",
			Buckets: []float64{0.1, 0.2, 0.5, 1, 3, 5, 10},
		},
		[]string{"method", "route", "status"},
	)
	requestCounter = prometheus.NewCounterVec(
		prometheus.CounterOpts{
			Name: "http_request_counter",
			Help: "Counter of HTTP requests",
		}, []string{"method", "route", "status"},
	)
)

func (s *Server) initPublicRouteMetrics() {
	s.customMetrics.RegisterHistogramVec(endpointLatency)
	s.customMetrics.RegisterCounterVec(requestCounter)
}

func metricCounterMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		defer func() {
			urlPath := generalizeURLPath(r.URL.Path)
			requestCounter.WithLabelValues(r.Method, urlPath, strconv.Itoa(ww.Status())).Inc()
		}()
		next.ServeHTTP(ww, r)

	})
}
func metricMeasureLatencyMiddleware(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		ww := middleware.NewWrapResponseWriter(w, r.ProtoMajor)
		defer func() {
			duration := time.Since(start).Seconds()
			urlPath := generalizeURLPath(r.URL.Path)
			endpointLatency.WithLabelValues(r.Method, urlPath, strconv.Itoa(ww.Status())).Observe(duration)
		}()
		next.ServeHTTP(ww, r)

	})
}

// Replaces UUID-like segments with a wildcard placeholder
func generalizeURLPath(path string) string {
	segments := strings.Split(path, "/")
	for i, segment := range segments {
		if len(segment) == 36 && strings.Contains(segment, "-") {
			segments[i] = "*"
		}
	}
	return strings.Join(segments, "/")
}
