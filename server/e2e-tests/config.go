package e2e

import (
	"errors"
	"fmt"
	"os"
	"time"

	"github.com/spf13/viper"
)

type E2ETestConfig struct {
	Server ServerConfig `mapstructure:"server"`
	Users  UsersConfig  `mapstructure:"users"`
	Board  BoardConfig  `mapstructure:"board"`
}

type ServerConfig struct {
	BaseURL        string `mapstructure:"base_url"`
	TimeoutSeconds int    `mapstructure:"timeout_seconds"`
}

func (s ServerConfig) Timeout() time.Duration {
	return time.Duration(s.TimeoutSeconds) * time.Second
}

type UsersConfig struct {
	Default     UserConfig `mapstructure:"default"`
	Moderator   UserConfig `mapstructure:"moderator"`
	Participant UserConfig `mapstructure:"participant"`
}

type UserConfig struct {
	Name string `mapstructure:"name"`
}

type BoardConfig struct {
	DefaultAccessPolicy string         `mapstructure:"default_access_policy"`
	DefaultColumns      []ColumnConfig `mapstructure:"default_columns"`
}

type ColumnConfig struct {
	Name    string `mapstructure:"name"`
	Color   string `mapstructure:"color"`
	Visible bool   `mapstructure:"visible"`
}

func LoadConfig() (*E2ETestConfig, error) {
	v := viper.New()

	configPath := findConfigPath()
	v.SetConfigName("config")
	v.SetConfigType("yaml")
	v.AddConfigPath(configPath)

	// Environment variable overrides (E2E_SERVER_BASE_URL, etc.)
	v.SetEnvPrefix("E2E")
	v.AutomaticEnv()

	if url := os.Getenv("E2E_BASE_URL"); url != "" {
		v.Set("server.base_url", url)
	}

	if err := v.ReadInConfig(); err != nil {
		var configFileNotFoundError viper.ConfigFileNotFoundError
		if !errors.As(err, &configFileNotFoundError) {
			return nil, fmt.Errorf("error reading config: %w", err)
		}
		// use defaults
	}

	var cfg E2ETestConfig
	if err := v.Unmarshal(&cfg); err != nil {
		return nil, fmt.Errorf("error unmarshaling config: %w", err)
	}

	return &cfg, nil
}

func findConfigPath() string {
	// Try e2e-tests directory
	if _, err := os.Stat("e2e-tests/config.yaml"); err == nil {
		return "e2e-tests"
	}
	// Default to current directory
	return "."
}
