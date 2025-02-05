package technical_helper

import (
	"github.com/stretchr/testify/assert"
	"testing"
)

func TestAllMatch(t *testing.T) {
	ret := Filter[int]([]int{1, 2, 3}, func(i int) bool {
		return i == 1 || i == 2 || i == 3
	})

	assert.Equal(t, []int{1, 2, 3}, ret)
}

func TestOneMatch(t *testing.T) {
	ret := Filter[int]([]int{1, 2, 3}, func(i int) bool {
		return i == 1
	})

	assert.Equal(t, []int{1}, ret)
}

func TestNoMatch(t *testing.T) {

	emptySlice := make([]int, 0)

	ret := Filter[int]([]int{1, 2, 3}, func(i int) bool {
		return i == 4
	})

	assert.Equal(t, emptySlice, ret)
}

func TestMapNilSliceShouldProduceEmptySlice(t *testing.T) {
	var nilSlice []int

	ret := MapSlice[int, int](nilSlice, func(i int) int {
		return i
	})

	assert.Empty(t, ret)
}

func TestMapEmptySliceShouldProduceEmptySlice(t *testing.T) {
	emptySlice := make([]int, 0)

	ret := MapSlice[int, int](emptySlice, func(i int) int {
		return i
	})

	assert.Empty(t, ret)
}

func TestMapSliceShouldProduceMappedSlice(t *testing.T) {
	slice := []int{1, 2, 3}

	ret := MapSlice[int, int](slice, func(i int) int {
		return i
	})

	assert.Equal(t, slice, ret)
}
