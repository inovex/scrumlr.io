package realtime

func (r *Realtime) IsHealthy() bool {
	err := r.con.Publish("health", "test")
	if err != nil {
		return false
	}
	return true
}
