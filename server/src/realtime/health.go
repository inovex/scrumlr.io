package realtime

// IsHealthy returns true if the Broker is in a healthy state
func (b *Broker) IsHealthy() bool {
	if b == nil || b.Con == nil {
		return false
	}
	err := b.Con.Publish("health", "test")
	return err == nil
}
