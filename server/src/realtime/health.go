package realtime

import "context"

// IsHealthy returns true if the Broker is in a healthy state
func (b *Broker) IsHealthy(ctx context.Context) bool {
	if b == nil || b.Con == nil {
		return false
	}
	err := b.Con.Publish(ctx, "health", "test")
	return err == nil
}
