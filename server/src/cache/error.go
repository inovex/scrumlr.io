package cache

type KeyNotFound struct {
	Err error
}

func (e *KeyNotFound) Error() string {
	return e.Err.Error()
}

func (e *KeyNotFound) Unwrap() error {
	return e.Err
}

type KeyAlreadyExists struct {
	Err error
}

func (e *KeyAlreadyExists) Error() string {
	return e.Err.Error()
}

func (e *KeyAlreadyExists) Unwrap() error {
	return e.Err
}
