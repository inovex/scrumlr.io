# Concurrency Audit

## Goal

This document is a working audit for backend code paths that keep mutable in-memory state across requests or background goroutines.

It is intended to answer three questions for each area:

1. What shared state exists?
2. Which code paths read and write it concurrently?
3. Which concrete user flows could trigger that concurrency?

## Confidence Levels

- Confirmed: reproduced with `go test -race` or observed as a runtime crash.
- Highly likely: shared mutable state with clear concurrent access paths, but no dedicated repro yet.
- Concurrency smell: ownership or lifecycle is unclear and likely to become race-prone.

## Current State

- The confirmed websocket races in board subscriptions and session-request subscriptions have been addressed with mutex-based synchronization.
- The original opt-in repro tests were converted into normal regression tests that exercise the same concurrent flows without bypassing the production lock protocol.
- The current expectation is that these regression tests pass under `go test -race`.
- Remaining concerns are around ownership and cleanup, not the previously confirmed map races.

## Audit Checklist

1. Inventory long-lived mutable in-memory state.
2. Identify all readers for each shared field.
3. Identify all writers for each shared field.
4. Mark every request-handler entry point touching that state.
5. Mark every goroutine boundary touching that state.
6. Check for check-then-act patterns on shared maps.
7. Check for iterate-while-mutate patterns on shared maps.
8. Check for shared cached snapshots updated from multiple paths.
9. Check whether subscription lifecycle has a single owner.
10. Check whether entries and channels are cleaned up consistently.
11. Check for duplicate registries or overlapping ownership.
12. Add `-race` repro tests for the highest-risk paths.
13. Translate each finding into a concrete user flow.
14. Classify each finding by confidence.
15. Track the fix strategy and follow-up verification.

## Audit Table

| Area | Shared state | Readers | Writers | Concurrency source | Concrete user flow | Confidence | Evidence |
| --- | --- | --- | --- | --- | --- | --- | --- |
| `server/src/api/boards_listen_on_board.go` | `Server.boardSubscriptions` | `listenOnBoard` reads shared board subscription entries | `listenOnBoard` initializes shared board subscription entries | Multiple HTTP request goroutines can open board sockets in parallel | Two users open the same board at the same time, or two first-time websocket opens happen for different boards simultaneously | Confirmed | Historically reproduced with `-race` and runtime crash; now covered by regression test `TestListenOnBoardConcurrentFirstConnections` |
| `server/src/api/boards_listen_on_board.go` | `BoardSubscription.clients` | `startListeningOnBoard` snapshots `bs.clients` before broadcasting | `listenOnBoard` writes clients, disconnect handling deletes clients | Request goroutines mutate the map while the board listener goroutine broadcasts | One user refreshes or leaves the board while another board event is broadcast | Confirmed | Historically reproduced with `-race`; now covered by regression test `TestStartListeningOnBoardConcurrentClientChurn` |
| `server/src/api/boards_listen_on_board.go` and `server/src/api/event_filter.go` | Cached board snapshot on `BoardSubscription` (`boardParticipants`, `boardSettings`, `boardColumns`, `boardNotes`, `boardReactions`) | `eventFilter` and helper methods read and sometimes rewrite cached fields | `listenOnBoard` updates cached state, `event_filter.go` updates filtered snapshots | Request goroutines and board-listener goroutine both update the same subscription state | A user joins while another board event updates notes, columns, board settings, or sessions | Confirmed | Lock coverage was added across live snapshot fields; current board regression tests pass after the synchronization changes |
| `server/src/sessionrequests/websocket.go` | `sessionRequestWebsocket.boardSessionRequestSubscriptions` | `listenOnBoardSessionRequest` reads shared session-request subscription entries | `listenOnBoardSessionRequest` initializes shared session-request subscription entries | Multiple HTTP request goroutines can open session-request sockets in parallel | Two candidates reconnect to the same invite-only board at the same time, or two first-time request sockets open concurrently | Confirmed | Historically reproduced with `-race`; now covered by regression test `TestListenOnBoardSessionRequestConcurrentFirstConnections` |
| `server/src/sessionrequests/websocket.go` | `BoardSessionRequestSubscription.clients` and `subscriptions` | `startListeningOnBoardSessionRequest` reads per-user channel and client under `RLock` | `listenOnBoardSessionRequest` writes maps, `OpenSocket` deletes clients on disconnect | Request goroutines mutate maps while a background goroutine reads them | A candidate refreshes or closes the approval page while a moderator action triggers a session-request event | Confirmed | Listener reads now take place under `RLock` and the concurrent-first-connection regression test passes under `-race` |
| `server/src/api/router.go` and `server/src/sessionrequests/websocket.go` | Two separate subscription registries for session requests (`Server.boardSessionRequestSubscriptions` and `sessionRequestWebsocket.boardSessionRequestSubscriptions`) | Ownership is unclear | Ownership is unclear | Long-lived registries exist in two places | Future fixes may update one registry and miss the other, leaving inconsistent behavior | Concurrency smell | Duplicate ownership makes synchronization and cleanup harder to reason about |
| `server/src/sessionrequests/websocket.go` | Per-user `subscriptions[userID]` entries | `startListeningOnBoardSessionRequest` reads a single entry once | `listenOnBoardSessionRequest` creates entries, but no obvious cleanup removes them | Long-lived map entries outlive short-lived goroutines | Repeated reconnects by the same or many users can leave stale subscription entries behind | Concurrency smell | Lifecycle looks incomplete even before synchronization is added |

## Historical Reproduction

### Board websocket initialization race

This race was originally reproduced before the synchronization changes landed.

Location:

- `server/src/api/boards_listen_on_board_integration_test.go`

Historical command:

```bash
SCRUMLR_ENABLE_RACE_REPRO=1 go test -race ./api -run TestBoardsListenIntegrationTestSuite/TestListenOnBoardConcurrentFirstConnectionsRace -count=1
```

What it simulates:

1. Two users open the same board at nearly the same time.
2. Both request goroutines enter `listenOnBoard` together.
3. Both try to initialize the shared board subscription state.

Observed evidence:

- Race detector warnings on `server/src/api/boards_listen_on_board.go:110-111`
- Additional race warnings on `server/src/api/boards_listen_on_board.go:117-126`
- Separate run also reproduced `fatal error: concurrent map writes` at line 111

### Session-request websocket initialization race

This race was also reproduced before the synchronization changes landed.

Location:

- `server/src/sessionrequests/websocket_race_integration_test.go` (since replaced by a regression test file)

Historical command:

```bash
SCRUMLR_ENABLE_RACE_REPRO=1 go test -race ./sessionrequests -run TestSessionRequestWebsocketRaceTestSuite/TestListenOnBoardSessionRequestConcurrentFirstConnectionsRace -count=1
```

What it simulates:

1. Two users open the waiting page for the same board at nearly the same time.
2. Both request goroutines enter `listenOnBoardSessionRequest` together.
3. Both try to initialize the shared session-request subscription state.

Observed evidence:

- Race detector warnings on `server/src/sessionrequests/websocket.go:76-77`
- Additional race warnings on `server/src/sessionrequests/websocket.go:84` and `:88`
- The repro also escalated to `fatal error: concurrent map writes` at line 77

### Board client broadcast versus client mutation race

This race was reproduced before the broadcast path switched to synchronized access plus snapshot iteration.

Location:

- `server/src/api/boards_listen_on_board_integration_test.go`

Historical command:

```bash
SCRUMLR_ENABLE_RACE_REPRO=1 go test -race ./api -run TestBoardsListenIntegrationTestSuite/TestStartListeningOnBoardConcurrentClientMutationRace -count=1
```

What it simulates:

1. A busy board already has many connected websocket clients.
2. The board listener goroutine starts broadcasting events to all clients.
3. At the same time, another goroutine mutates the same clients map like connect or disconnect traffic would.

Observed evidence:

- Race detector warnings on `server/src/api/boards_listen_on_board.go:134`
- Additional race warnings in the repro loop that adds and deletes from `BoardSubscription.clients`
- The repro escalated to `fatal error: concurrent map iteration and map write`

## Current Regression Coverage

### Board websocket subscriptions

Location:

- `server/src/api/boards_listen_on_board_integration_test.go`

Tests:

- `TestListenOnBoardConcurrentFirstConnections`
- `TestStartListeningOnBoardConcurrentClientChurn`

Command:

```bash
go test -race ./api -run 'TestBoardsListenIntegrationTestSuite/(TestListenOnBoardConcurrentFirstConnections|TestStartListeningOnBoardConcurrentClientChurn)' -count=1
```

What it covers:

1. Concurrent first-time websocket subscription setup for the same board.
2. Concurrent board-event broadcasting while clients join and leave through the synchronized production paths.

Expected result:

- No race detector warnings.
- No `concurrent map writes` or `concurrent map iteration and map write` panics.

### Session-request websocket subscriptions

Location:

- `server/src/sessionrequests/websocket_integration_test.go`

Tests:

- `TestListenOnBoardSessionRequestConcurrentFirstConnections`

Command:

```bash
go test -race ./sessionrequests -run TestSessionRequestWebsocketTestSuite -count=1
```

What it covers:

1. Concurrent first-time session-request websocket setup for the same board.
2. Per-user listener startup reading channel and client entries through the synchronized path.

Expected result:

- No race detector warnings.
- No `concurrent map writes` panic during parallel subscription setup.

## Recommended Next Audit Targets

1. Re-audit both websocket subsystems for lifecycle cleanup now that synchronization is in place.
2. Decide which object owns subscription state for session requests and remove duplicate registries.
3. Document the intended ownership model for websocket subscription state in `server/docs/architecture.md` or a follow-up section here.
4. Consider adding a focused regression test for session-request connect/disconnect churn versus listener reads.

## Fix Tracking

| Area | Planned fix | Status | Verification |
| --- | --- | --- | --- |
| Board websocket subscriptions | Add mutex coverage for top-level and per-subscription state, then keep concurrent coverage in normal tests | Done | `TestListenOnBoardConcurrentFirstConnections` and `TestStartListeningOnBoardConcurrentClientChurn` under `go test -race ./api` |
| Session-request websocket subscriptions | Add mutex coverage for top-level and per-subscription state, then keep concurrent coverage in normal tests | Done | `TestListenOnBoardSessionRequestConcurrentFirstConnections` under `go test -race ./sessionrequests` |
| Registry ownership cleanup | Not started | Open | Code review plus targeted tests |
