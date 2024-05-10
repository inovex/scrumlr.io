package custom_metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"scrumlr.io/server/services"
)

type CustomMetricService struct {
	registry prometheus.Registry
}

func NewCustomMetricService() services.CustomMetrics {
	m := &CustomMetricService{}
	m.registry = *prometheus.NewRegistry()
	m.registry.Unregister(collectors.NewGoCollector()) // Unregister the default bloat of metrics
	return m
}

func (cms *CustomMetricService) RegisterHistogram(histo *prometheus.HistogramVec) {
	cms.registry.Register(histo)
}

func (cms *CustomMetricService) RegisterCounter(ctr *prometheus.Counter) {
	cms.registry.Register(*ctr)
}

func (cms *CustomMetricService) Registry() *prometheus.Registry {
	return &cms.registry
}
