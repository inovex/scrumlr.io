package timeprovider

import "time"

type TimeProvider interface {
	Now() time.Time
	NewTimer(duration time.Duration) *time.Timer
}

type Clock struct{}

func NewClock() TimeProvider {
	return new(Clock)
}

func (c *Clock) Now() time.Time {
	return time.Now()
}

func (c *Clock) NewTimer(d time.Duration) *time.Timer {
	return time.NewTimer(d)
}
