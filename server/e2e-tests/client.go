package e2e

import (
	"bytes"
	"encoding/json"
	"fmt"
	"io"
	"net/http"
	"net/http/cookiejar"
	"os"
	"strings"

	"github.com/google/uuid"
	"scrumlr.io/server/boards"
	"scrumlr.io/server/columns"
	"scrumlr.io/server/notes"
	"scrumlr.io/server/reactions"
	"scrumlr.io/server/sessions"
	"scrumlr.io/server/users"
	"scrumlr.io/server/votings"
)

// Client is a typed Go client for the scrumlr API.
// Uses types from the server module for type safety.
type Client struct {
	http    *http.Client
	baseURL string
}

// NewClient creates a new API client with cookie jar for session handling.
func NewClient(cfg *E2ETestConfig) *Client {
	jar, _ := cookiejar.New(nil)
	c := &Client{
		http: &http.Client{
			Jar:     jar,
			Timeout: cfg.Server.Timeout(),
		},
		baseURL: cfg.Server.BaseURL,
	}

	if v := strings.ToLower(os.Getenv("E2E_INSECURE_SKIP_VERIFY")); v == "true" {
		insecureHTTPClient(c.http)
	}

	return c
}

// APIError represents an error response from the API.
type APIError struct {
	StatusCode int
	Body       string
}

func (e APIError) Error() string {
	return fmt.Sprintf("API error %d: %s", e.StatusCode, e.Body)
}

// --- HTTP helpers ---

func (c *Client) do(method, path string, body, response any) (*http.Response, error) {
	var reqBody io.Reader
	if body != nil {
		data, err := json.Marshal(body)
		if err != nil {
			return nil, fmt.Errorf("marshal request: %w", err)
		}
		reqBody = bytes.NewReader(data)
	}

	req, err := http.NewRequest(method, c.baseURL+path, reqBody)
	if err != nil {
		return nil, fmt.Errorf("create request: %w", err)
	}

	req.Header.Set("Content-Type", "application/json")

	resp, err := c.http.Do(req)
	if err != nil {
		return nil, fmt.Errorf("execute request: %w", err)
	}
	defer resp.Body.Close()

	respBody, _ := io.ReadAll(resp.Body)

	if resp.StatusCode >= 400 {
		return resp, APIError{StatusCode: resp.StatusCode, Body: string(respBody)}
	}

	if response != nil && len(respBody) > 0 {
		if err := json.Unmarshal(respBody, response); err != nil {
			return resp, fmt.Errorf("unmarshal response: %w", err)
		}
	}

	return resp, nil
}

// --- API methods ---

// Health checks the server health endpoint.
func (c *Client) Health() error {
	resp, err := c.http.Get(c.baseURL + "/health")
	if err != nil {
		return err
	}
	defer resp.Body.Close()
	if resp.StatusCode != http.StatusNoContent {
		return fmt.Errorf("health check failed: %d", resp.StatusCode)
	}
	return nil
}

// --- Auth ---

func (c *Client) LoginAnonymous(name string) (*users.User, error) {
	var user users.User
	_, err := c.do("POST", "/login/anonymous", map[string]string{"name": name}, &user)
	if err != nil {
		return nil, fmt.Errorf("login: %w", err)
	}
	return &user, nil
}

func (c *Client) Logout() error {
	_, err := c.do("DELETE", "/login", nil, nil)
	return err
}

// --- User ---

func (c *Client) GetUser() (*users.User, error) {
	var user users.User
	_, err := c.do("GET", "/users", nil, &user)
	if err != nil {
		return nil, fmt.Errorf("get user: %w", err)
	}
	return &user, nil
}

func (c *Client) UpdateUser(req users.UserUpdateRequest) (*users.User, error) {
	var user users.User
	_, err := c.do("PUT", "/users", req, &user)
	if err != nil {
		return nil, fmt.Errorf("update user: %w", err)
	}
	return &user, nil
}

// --- Boards ---

func (c *Client) CreateBoard(req boards.CreateBoardRequest) (*boards.Board, error) {
	var board boards.Board
	_, err := c.do("POST", "/boards", req, &board)
	if err != nil {
		return nil, fmt.Errorf("create board: %w", err)
	}
	return &board, nil
}

func (c *Client) GetBoard(id uuid.UUID) (*boards.Board, error) {
	var board boards.Board
	_, err := c.do("GET", "/boards/"+id.String(), nil, &board)
	if err != nil {
		return nil, fmt.Errorf("get board: %w", err)
	}
	return &board, nil
}

func (c *Client) GetBoards() ([]*boards.Board, error) {
	var list []*boards.Board
	_, err := c.do("GET", "/boards", nil, &list)
	if err != nil {
		return nil, fmt.Errorf("get boards: %w", err)
	}
	return list, nil
}

func (c *Client) UpdateBoard(id uuid.UUID, req boards.BoardUpdateRequest) (*boards.Board, error) {
	var board boards.Board
	_, err := c.do("PUT", "/boards/"+id.String(), req, &board)
	if err != nil {
		return nil, fmt.Errorf("update board: %w", err)
	}
	return &board, nil
}

func (c *Client) DeleteBoard(id uuid.UUID) error {
	_, err := c.do("DELETE", "/boards/"+id.String(), nil, nil)
	return err
}

// --- Timer ---

func (c *Client) SetTimer(boardID uuid.UUID, minutes uint8) (*boards.Board, error) {
	var board boards.Board
	_, err := c.do("POST", "/boards/"+boardID.String()+"/timer", boards.SetTimerRequest{Minutes: minutes}, &board)
	if err != nil {
		return nil, fmt.Errorf("set timer: %w", err)
	}
	return &board, nil
}

func (c *Client) IncrementTimer(boardID uuid.UUID) (*boards.Board, error) {
	var board boards.Board
	_, err := c.do("POST", "/boards/"+boardID.String()+"/timer/increment", nil, &board)
	if err != nil {
		return nil, fmt.Errorf("increment timer: %w", err)
	}
	return &board, nil
}

func (c *Client) DeleteTimer(boardID uuid.UUID) (*boards.Board, error) {
	var board boards.Board
	_, err := c.do("DELETE", "/boards/"+boardID.String()+"/timer", nil, &board)
	if err != nil {
		return nil, fmt.Errorf("delete timer: %w", err)
	}
	return &board, nil
}

// --- Columns ---

func (c *Client) GetColumns(boardID uuid.UUID) ([]*columns.Column, error) {
	var list []*columns.Column
	_, err := c.do("GET", "/boards/"+boardID.String()+"/columns", nil, &list)
	if err != nil {
		return nil, fmt.Errorf("get columns: %w", err)
	}
	return list, nil
}

func (c *Client) GetColumn(boardID, columnID uuid.UUID) (*columns.Column, error) {
	var col columns.Column
	_, err := c.do("GET", fmt.Sprintf("/boards/%s/columns/%s", boardID, columnID), nil, &col)
	if err != nil {
		return nil, fmt.Errorf("get column: %w", err)
	}
	return &col, nil
}

func (c *Client) CreateColumn(boardID uuid.UUID, req columns.ColumnRequest) (*columns.Column, error) {
	var col columns.Column
	_, err := c.do("POST", "/boards/"+boardID.String()+"/columns", req, &col)
	if err != nil {
		return nil, fmt.Errorf("create column: %w", err)
	}
	return &col, nil
}

func (c *Client) UpdateColumn(boardID, columnID uuid.UUID, req columns.ColumnUpdateRequest) (*columns.Column, error) {
	var col columns.Column
	_, err := c.do("PUT", fmt.Sprintf("/boards/%s/columns/%s", boardID, columnID), req, &col)
	if err != nil {
		return nil, fmt.Errorf("update column: %w", err)
	}
	return &col, nil
}

func (c *Client) DeleteColumn(boardID, columnID uuid.UUID) error {
	_, err := c.do("DELETE", fmt.Sprintf("/boards/%s/columns/%s", boardID, columnID), nil, nil)
	return err
}

// --- Notes ---

func (c *Client) GetNotes(boardID uuid.UUID) ([]*notes.Note, error) {
	var list []*notes.Note
	_, err := c.do("GET", "/boards/"+boardID.String()+"/notes", nil, &list)
	if err != nil {
		return nil, fmt.Errorf("get notes: %w", err)
	}
	return list, nil
}

func (c *Client) GetNote(boardID, noteID uuid.UUID) (*notes.Note, error) {
	var note notes.Note
	_, err := c.do("GET", fmt.Sprintf("/boards/%s/notes/%s", boardID, noteID), nil, &note)
	if err != nil {
		return nil, fmt.Errorf("get note: %w", err)
	}
	return &note, nil
}

func (c *Client) CreateNote(boardID uuid.UUID, req notes.NoteCreateRequest) (*notes.Note, error) {
	var note notes.Note
	_, err := c.do("POST", "/boards/"+boardID.String()+"/notes", req, &note)
	if err != nil {
		return nil, fmt.Errorf("create note: %w", err)
	}
	return &note, nil
}

func (c *Client) UpdateNote(boardID, noteID uuid.UUID, req notes.NoteUpdateRequest) (*notes.Note, error) {
	var note notes.Note
	_, err := c.do("PUT", fmt.Sprintf("/boards/%s/notes/%s", boardID, noteID), req, &note)
	if err != nil {
		return nil, fmt.Errorf("update note: %w", err)
	}
	return &note, nil
}

func (c *Client) DeleteNote(boardID, noteID uuid.UUID, req notes.NoteDeleteRequest) error {
	_, err := c.do("DELETE", fmt.Sprintf("/boards/%s/notes/%s", boardID, noteID), req, nil)
	return err
}

// --- Votings ---

func (c *Client) CreateVoting(boardID uuid.UUID, req votings.VotingCreateRequest) (*votings.Voting, error) {
	var voting votings.Voting
	_, err := c.do("POST", "/boards/"+boardID.String()+"/votings", req, &voting)
	if err != nil {
		return nil, fmt.Errorf("create voting: %w", err)
	}
	return &voting, nil
}

func (c *Client) GetVotings(boardID uuid.UUID) ([]*votings.Voting, error) {
	var list []*votings.Voting
	_, err := c.do("GET", "/boards/"+boardID.String()+"/votings", nil, &list)
	if err != nil {
		return nil, fmt.Errorf("get votings: %w", err)
	}
	return list, nil
}

func (c *Client) GetVoting(boardID, votingID uuid.UUID) (*votings.Voting, error) {
	var voting votings.Voting
	_, err := c.do("GET", fmt.Sprintf("/boards/%s/votings/%s", boardID, votingID), nil, &voting)
	if err != nil {
		return nil, fmt.Errorf("get voting: %w", err)
	}
	return &voting, nil
}

func (c *Client) CloseVoting(boardID, votingID uuid.UUID) (*votings.Voting, error) {
	var voting votings.Voting
	_, err := c.do("PUT", fmt.Sprintf("/boards/%s/votings/%s", boardID, votingID), nil, &voting)
	if err != nil {
		return nil, fmt.Errorf("close voting: %w", err)
	}
	return &voting, nil
}

// --- Votes ---

func (c *Client) AddVote(boardID uuid.UUID, req votings.VoteRequest) error {
	_, err := c.do("POST", "/boards/"+boardID.String()+"/votes", req, nil)
	return err
}

func (c *Client) GetVotes(boardID uuid.UUID) ([]*votings.Vote, error) {
	var list []*votings.Vote
	_, err := c.do("GET", "/boards/"+boardID.String()+"/votes", nil, &list)
	if err != nil {
		return nil, fmt.Errorf("get votes: %w", err)
	}
	return list, nil
}

func (c *Client) RemoveVote(boardID uuid.UUID, req votings.VoteRequest) error {
	_, err := c.do("DELETE", "/boards/"+boardID.String()+"/votes", req, nil)
	return err
}

// --- Reactions ---

func (c *Client) CreateReaction(boardID uuid.UUID, req reactions.ReactionCreateRequest) (*reactions.Reaction, error) {
	var reaction reactions.Reaction
	_, err := c.do("POST", "/boards/"+boardID.String()+"/reactions", req, &reaction)
	if err != nil {
		return nil, fmt.Errorf("create reaction: %w", err)
	}
	return &reaction, nil
}

func (c *Client) GetReactions(boardID uuid.UUID) ([]*reactions.Reaction, error) {
	var list []*reactions.Reaction
	_, err := c.do("GET", "/boards/"+boardID.String()+"/reactions", nil, &list)
	if err != nil {
		return nil, fmt.Errorf("get reactions: %w", err)
	}
	return list, nil
}

func (c *Client) GetReaction(boardID, reactionID uuid.UUID) (*reactions.Reaction, error) {
	var reaction reactions.Reaction
	_, err := c.do("GET", fmt.Sprintf("/boards/%s/reactions/%s", boardID, reactionID), nil, &reaction)
	if err != nil {
		return nil, fmt.Errorf("get reaction: %w", err)
	}
	return &reaction, nil
}

func (c *Client) UpdateReaction(boardID, reactionID uuid.UUID, req reactions.ReactionUpdateTypeRequest) (*reactions.Reaction, error) {
	var reaction reactions.Reaction
	_, err := c.do("PUT", fmt.Sprintf("/boards/%s/reactions/%s", boardID, reactionID), req, &reaction)
	if err != nil {
		return nil, fmt.Errorf("update reaction: %w", err)
	}
	return &reaction, nil
}

func (c *Client) DeleteReaction(boardID, reactionID uuid.UUID) error {
	_, err := c.do("DELETE", fmt.Sprintf("/boards/%s/reactions/%s", boardID, reactionID), nil, nil)
	return err
}

// --- Participants ---

func (c *Client) JoinBoard(boardID uuid.UUID) error {
	_, err := c.do("POST", "/boards/"+boardID.String()+"/participants", nil, nil)
	return err
}

func (c *Client) GetParticipants(boardID uuid.UUID) ([]*sessions.BoardSession, error) {
	var list []*sessions.BoardSession
	_, err := c.do("GET", "/boards/"+boardID.String()+"/participants", nil, &list)
	if err != nil {
		return nil, fmt.Errorf("get participants: %w", err)
	}
	return list, nil
}

func (c *Client) GetParticipant(boardID, userID uuid.UUID) (*sessions.BoardSession, error) {
	var session sessions.BoardSession
	_, err := c.do("GET", fmt.Sprintf("/boards/%s/participants/%s", boardID, userID), nil, &session)
	if err != nil {
		return nil, fmt.Errorf("get participant: %w", err)
	}
	return &session, nil
}

func (c *Client) UpdateParticipant(boardID, userID uuid.UUID, req sessions.BoardSessionUpdateRequest) (*sessions.BoardSession, error) {
	var session sessions.BoardSession
	_, err := c.do("PUT", fmt.Sprintf("/boards/%s/participants/%s", boardID, userID), req, &session)
	if err != nil {
		return nil, fmt.Errorf("update participant: %w", err)
	}
	return &session, nil
}
