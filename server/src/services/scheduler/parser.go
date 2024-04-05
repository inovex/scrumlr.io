package scheduler

import (
	"context"
	"github.com/mitchellh/mapstructure"
	"gopkg.in/yaml.v3"
	"os"
	"scrumlr.io/server/logger"
)

func parse(path string, ctx context.Context) Config {
	log := logger.FromContext(ctx)
	file, err := os.ReadFile(path)
	if err != nil {
		log.Errorw("Failed to reading file", "error", err)
	}
	config := &Config{}
	err = yaml.Unmarshal(file, config)
	if err != nil {
		log.Errorw("Failed to parse file")
	}
	return *config
}

func parseTaskParameters(ctx context.Context, parameters map[string]interface{}, task Task) []any {
	log := logger.FromContext(ctx)
	err := mapstructure.Decode(parameters, &task)
	if err != nil {
		log.Errorw("Failed to parse job parameters", "error", err)
	}
	return task.GetParams()
}
