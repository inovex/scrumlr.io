package scheduler

import (
	"context"
	"errors"
	"github.com/mitchellh/mapstructure"
	"gopkg.in/yaml.v3"
	"os"
	"scrumlr.io/server/logger"
)

func parseFile(path string) (Config, error) {
	file, err := os.ReadFile(path)
	if err != nil {
		return Config{}, errors.New("failed reading file")
	}
	return parseToObject(file)
}

func parseToObject(data []byte) (Config, error) {
	config := &Config{}
	err := yaml.Unmarshal(data, config)
	if err != nil {
		return Config{}, errors.New("failed to parse file")
	}
	return *config, nil
}

func parseTaskParameters(ctx context.Context, parameters map[string]interface{}, task Task) []any {
	log := logger.FromContext(ctx)
	err := mapstructure.Decode(parameters, &task)
	if err != nil {
		log.Errorw("Failed to parse job parameters", "error", err)
	}
	return task.GetParams()
}
