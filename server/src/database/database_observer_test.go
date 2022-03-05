package database

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestDetachObserver(t *testing.T) {
	emptyObserver := struct{}{}

	testDb.AttachObserver(emptyObserver)
	numObserver := len(testDb.observer)

	deleted, err := testDb.DetachObserver(emptyObserver)
	assert.True(t, deleted)
	assert.Nil(t, err)
	assert.Equal(t, numObserver-1, len(testDb.observer))
}
