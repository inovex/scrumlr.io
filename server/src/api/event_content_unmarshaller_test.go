package api

import (
	"github.com/google/uuid"
	"github.com/stretchr/testify/assert"
	"reflect"
	"testing"
)

type TestStruct struct {
	ID string `json:"id"`
}

func TestCorrectString(t *testing.T) {
	given := "TEST_STRING"
	actual, err := unmarshal[string](given)

	assert.NoError(t, err)
	assert.Equal(t, given, *actual)
}

func TestCorrectStringSlice(t *testing.T) {
	s := "TEST_STRING"
	given := []*string{&s}
	actual, err := unmarshalSlice[string](given)

	assert.NoError(t, err)
	assert.Equal(t, given, actual)
}

func TestCorrectEmptySlice(t *testing.T) {
	var given []*string
	actual, err := unmarshalSlice[string](given)

	assert.NoError(t, err)
	assert.Equal(t, given, actual)
}

func TestCorrectUUID(t *testing.T) {
	given, _ := uuid.NewRandom()
	actual, err := unmarshal[uuid.UUID](given)

	assert.NoError(t, err)
	assert.Equal(t, given, *actual)
}

func TestCorrectInterfaceTypeStruct(t *testing.T) {
	given := "TEST_ID"
	actual, err := unmarshal[TestStruct](reflect.ValueOf(TestStruct{ID: given}).Interface())

	assert.NoError(t, err)
	assert.Equal(t, given, actual.ID)
}

func TestNil(t *testing.T) {
	actual, err := unmarshal[TestStruct](nil)

	assert.NoError(t, err)
	assert.Nil(t, actual)
}
