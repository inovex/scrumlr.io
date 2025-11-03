package cache

import (
	"context"
)

func (c *Cache) IsHealthy(ctx context.Context) bool {
	if c == nil || c.Con == nil {
		return false
	}

	err := c.Con.Put(ctx, "health", "test")
	return err == nil
}
