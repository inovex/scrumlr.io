package scheduler

import (
  "context"
  "github.com/stretchr/testify/assert"
  "github.com/stretchr/testify/suite"
  "testing"
)

type ParserTestSuite struct {
	suite.Suite
}

func TestParserSuite(t *testing.T) {
	suite.Run(t, new(ParserTestSuite))
}

type Test struct {
	Val1 string
	Val2 int
	Val3 bool
}

func (t Test) GetParams() []any {
	return []any{t.Val1, t.Val2, t.Val3}
}

func (suite *ParserTestSuite) TestExistingJob() {
	configs := []struct {
		name       string
		yaml       []byte
		want       interface{}
		wantParams []any
	}{
		{name: "Parse valid Job",
			yaml: []byte(`jobs:
      - name: "Delete Unused Boards"
        schedule: "*/20 * * * * *"
        withSeconds: true
        task:
          timeToExpiry: "720h"
          interactions: 4`),
			want: Config{
				Jobs: []Job{
					{
						Name:        "Delete Unused Boards",
						Schedule:    "*/20 * * * * *",
						WithSeconds: true,
						Task: map[string]interface{}{
							"timeToExpiry": "720h",
							"interactions": 4,
						},
					},
				},
			},
			wantParams: []any{[]any{"720h", 4}},
		},
		{name: "Parse multiple valid Jobs",
			yaml: []byte(` jobs:
  - name: "Delete Unused Boards"
    schedule: "*/20 * * * * *"
    withSeconds: true
    task:
      timeToExpiry: "720h"
      interactions: 4
  - name: "Test"
    schedule: "*/5 * * * *"
    withSeconds: false
    task:
      val1: "val1"
      val2: 2
      val3: true
 `),
			want: Config{
				Jobs: []Job{
					{
						Name:        "Delete Unused Boards",
						Schedule:    "*/20 * * * * *",
						WithSeconds: true,
						Task: map[string]interface{}{
							"timeToExpiry": "720h",
							"interactions": 4,
						},
					},
					{
						Name:        "Test",
						Schedule:    "*/5 * * * *",
						WithSeconds: false,
						Task: map[string]interface{}{
							"val1": "val1",
							"val2": 2,
							"val3": true,
						},
					},
				},
			},
			wantParams: []any{[]any{"720h", 4}, []any{"val1", 2, true}},
		},
	}

	for _, tt := range configs {
		got, _ := parseToObject(tt.yaml)
		for i, job := range got.Jobs {
			var gotParams []any
			switch job.Name {
			case "Delete Unused Boards":
				gotParams = parseTaskParameters(context.Background(), job.Task, new(DeleteBoards))
			case "Test":
				gotParams = parseTaskParameters(context.Background(), job.Task, new(Test))
			}
			assert.Equal(suite.T(), tt.want, got)
			assert.Equal(suite.T(), tt.wantParams[i], gotParams)

		}
	}
}
