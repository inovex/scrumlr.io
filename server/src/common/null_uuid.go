package common

import (
	"database/sql/driver"
	"fmt"
	"uuid"
)

type NullUUID struct {
	UUID  uuid.UUID
	Valid bool
}

func (u NullUUID) Value() (driver.Value, error) {
	if !u.Valid {
		return nil, nil
	}
	return u.UUID.String(), nil
}

func (u *NullUUID) Scan(value any) error {
	if value == nil {
		u.UUID = uuid.UUID{}
		u.Valid = false
		return nil
	}

	var raw string
	switch value := value.(type) {
	case string:
		raw = value
	case []byte:
		if len(value) == 16 {
			copy(u.UUID[:], value)
			u.Valid = true
			return nil
		}
		raw = string(value)
	default:
		return fmt.Errorf("cannot scan %T into uuid.UUID", value)
	}
	parsed, err := uuid.Parse(raw)
	if err != nil {
		return err
	}
	u.UUID = parsed
	u.Valid = true
	return nil
}
