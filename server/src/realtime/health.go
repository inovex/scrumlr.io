package realtime

// IsHealthy returns true if the Broker is in a healthy state
func (b *Broker) IsHealthy() bool {
	if b == nil || b.con == nil {
		return false
	}
	err := b.con.Publish("health", "test")
	if err != nil {
		return false
	}
	return true
}
