package feedback

import (
	"context"
	"net/http"
	"net/http/httptest"
	"testing"

	"github.com/stretchr/testify/assert"
)

func TestCreateFeedback(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		w.WriteHeader(200)
	})
	server := httptest.NewServer(handler)
	defer server.Close()
	client := server.Client()

	feedbackService := NewFeedbackService(client, server.URL)
	err := feedbackService.Create(context.Background(), string(FeatureRequest), "", "")

	assert.Nil(t, err)
}

func TestCreateFeedbackPostFailed(t *testing.T) {
	handler := http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		if r.Method != http.MethodPost {
			http.Error(w, "Method Not Allowed", http.StatusMethodNotAllowed)
			return
		}

		w.WriteHeader(200)
	})
	server := httptest.NewServer(handler)
	defer server.Close()
	client := server.Client()

	feedbackService := NewFeedbackService(client, "")
	err := feedbackService.Create(context.Background(), string(FeatureRequest), "", "")

	assert.NotNil(t, err)
}

func TestFeedbackEnabled(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
	}))
	defer server.Close()
	client := server.Client()

	feedbackService := NewFeedbackService(client, server.URL)
	enabled := feedbackService.Enabled()

	assert.True(t, enabled)
}

func TestFeedbackDisabled(t *testing.T) {
	server := httptest.NewServer(http.HandlerFunc(func(w http.ResponseWriter, r *http.Request) {
		w.WriteHeader(200)
	}))
	defer server.Close()
	client := server.Client()

	feedbackService := NewFeedbackService(client, "")
	enabled := feedbackService.Enabled()

	assert.False(t, enabled)
}
