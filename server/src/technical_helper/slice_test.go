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

	var nilSlice []int

	ret := Filter[int]([]int{1, 2, 3}, func(i int) bool {
		return i == 4
	})

	assert.Equal(t, nilSlice, ret)
}
