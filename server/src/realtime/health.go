package realtime

func (r *Realtime) IsHealthy() bool {
	if r == nil || r.con == nil {
		return false
	}
	err := r.con.Publish("health", "test")
	if err != nil {
		return false
	}
	return true
}
