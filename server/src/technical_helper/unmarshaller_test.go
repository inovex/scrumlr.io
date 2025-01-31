package technical_helper

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
	actual, err := Unmarshal[string](given)

	assert.NoError(t, err)
	assert.Equal(t, given, *actual)
}

func TestCorrectStringSlice(t *testing.T) {
	s := "TEST_STRING"
	given := []*string{&s}
	actual, err := UnmarshalSlice[string](given)

	assert.NoError(t, err)
	assert.Equal(t, given, actual)
}

func TestCorrectEmptySlice(t *testing.T) {
	var given []*string
	actual, err := UnmarshalSlice[string](given)

	assert.NoError(t, err)
	assert.Equal(t, given, actual)
}

func TestCorrectUUID(t *testing.T) {
	given, _ := uuid.NewRandom()
	actual, err := Unmarshal[uuid.UUID](given)

	assert.NoError(t, err)
	assert.Equal(t, given, *actual)
}

func TestCorrectInterfaceTypeStruct(t *testing.T) {
	given := "TEST_ID"
	actual, err := Unmarshal[TestStruct](reflect.ValueOf(TestStruct{ID: given}).Interface())

	assert.NoError(t, err)
	assert.Equal(t, given, actual.ID)
}

func TestNil(t *testing.T) {
	actual, err := Unmarshal[TestStruct](nil)

	assert.NoError(t, err)
	assert.Nil(t, actual)
}
