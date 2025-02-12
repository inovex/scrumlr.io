package technical_helper

import "encoding/json"

func UnmarshalSlice[T any](data interface{}) ([]*T, error) {
	var result []*T
	b, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(b, &result)
	if err != nil {
		return nil, err
	}
	return result, nil
}

func Unmarshal[T any](data interface{}) (*T, error) {
	var result *T
	b, err := json.Marshal(data)
	if err != nil {
		return nil, err
	}
	err = json.Unmarshal(b, &result)
	if err != nil {
		return nil, err
	}
	return result, nil
}
