package custom_metrics

import (
	"github.com/prometheus/client_golang/prometheus"
	"github.com/prometheus/client_golang/prometheus/collectors"
	"scrumlr.io/server/services"
)

type CustomMetricService struct {
	registry prometheus.Registry
}

func NewCustomMetricService(enabled bool) services.CustomMetrics {
	if enabled {
		m := &CustomMetricService{}
		m.registry = *prometheus.NewRegistry()
		m.registry.Unregister(collectors.NewGoCollector()) // Unregister the default bloat of metrics
		return m
	}

	return nil
}

func (cms *CustomMetricService) RegisterHistogramVec(histo *prometheus.HistogramVec) error {
	return cms.registry.Register(histo)
}

func (cms *CustomMetricService) RegisterCounterVec(ctr *prometheus.CounterVec) error {
	return cms.registry.Register(ctr)
}

func (cms *CustomMetricService) Registry() *prometheus.Registry {
	return &cms.registry
}
