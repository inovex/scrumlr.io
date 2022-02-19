package database

import "errors"

// Observer can be used to observe changes on the database triggered within the application.
//
// Changes applied directly on the database won't be notified here.
type Observer interface{}

func (d *Database) AttachObserver(observer Observer) {
	d.observer = append(d.observer, observer)
}

func (d *Database) DetachObserver(observer Observer) (bool, error) {
	for i, o := range d.observer {
		if observer == o {
			d.observer = append(d.observer[:i], d.observer[i+1:]...)
			return true, nil
		}
	}
	return false, errors.New("specified observer not found")
}
