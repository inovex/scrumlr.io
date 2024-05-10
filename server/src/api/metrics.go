package api

import (
	"net/http"
	"time"

	"github.com/prometheus/client_golang/prometheus"
)

var (
	endpointLatency = prometheus.NewHistogramVec(
		prometheus.HistogramOpts{
			Name:    "http_request_duration_seconds",
			Help:    "HTTP request latency per endpoint.",
			Buckets: []float64{.00001, .0002, .002, 5, 10, 100},
		},
		[]string{"endpoint"},
	)
	requestCounter = prometheus.NewCounter(
		prometheus.CounterOpts{
			Name: "http_request_counter",
			Help: "Counter of HTTP requests",
		},
	)
)

func (s *Server) initPublicRouteMetrics() {
	s.customMetrics.RegisterHistogram(endpointLatency)
	s.customMetrics.RegisterCounter(&requestCounter)
}

func metricMeasureLatency(next http.Handler) http.Handler {
	return http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		start := time.Now()
		next.ServeHTTP(w, r)
		duration := time.Since(start).Seconds()
		requestCounter.Inc()
		// endpoint := chi.RouteContext(r.Context()).RoutePattern()
		endpointLatency.WithLabelValues("public_routes").Observe(duration)
	})
}
