package timeprovider

import "time"

type TimeProvider interface {
	Now() time.Time
}

type Clock struct{}

func NewClock() TimeProvider {
	return new(Clock)
}

func (c *Clock) Now() time.Time {
	return time.Now()
}
