package testDbTemplates

import (
  "log"

  "scrumlr.io/server/common"

  "github.com/google/uuid"
  "github.com/uptrace/bun"
  "scrumlr.io/server/initialize"
)

var baseSeedHash = "base_seed_hash_v1"

type TestUser struct {
  Name        string
  ID          uuid.UUID
  AccountType common.AccountType
}

type TestBoard struct {
  Name string
  ID   uuid.UUID
}

type TestColumn struct {
  Name    string
  ID      uuid.UUID
  BoardID uuid.UUID
}

type TestNote struct {
  Name     string
  ID       uuid.UUID
  AuthorID uuid.UUID
  BoardID  uuid.UUID
  ColumnID uuid.UUID
  Text     string
}

type TestVoting struct {
  Name               string
  ID                 uuid.UUID
  BoardID            uuid.UUID
  VoteLimit          int
  AllowMultipleVotes bool
  ShowVotesOfOthers  bool
  Status             string
  IsAnonymous        bool
}

type DbBaseIDs struct {
  Users   map[string]TestUser
  Boards  map[string]TestBoard
  Columns map[string]TestColumn
  Notes   map[string]TestNote
  Votings map[string]TestVoting
}

var (
  users = []TestUser{
    {"Stan", uuid.MustParse("e12ef59c-e424-5e25-8290-1e3fb88088d3"), common.Google},
    {"Santa", uuid.MustParse("39eb88b4-674a-5609-9ad8-6804e8d78961"), common.Anonymous},
  }

  stanID = users[0].ID

  boards = []TestBoard{
    {"Create", uuid.MustParse("7b53c2f0-d2db-5c9d-996d-b10fd8ae7d42")},
    {"CreateEmpty", uuid.MustParse("ca4b7c86-f3a4-574c-8e2a-88c382f98759")},
    {"CreateDuplicate", uuid.MustParse("7ea04db6-6328-515b-8b60-9ac4d67f49a3")},
    {"Update", uuid.MustParse("4887cf58-241e-57dd-b051-f6bd91b527cd")},
    {"ClosedUpdate", uuid.MustParse("3da52e5e-3d82-59b0-b347-4abed0ff3955")},
    {"Read", uuid.MustParse("c90130b5-daaa-5d9d-98bc-b29ae22b8c7e")},
    {"SortedUpdate", uuid.MustParse("b0180427-ed4b-556a-a891-242daaf35918")},
    {"Write", uuid.MustParse("da359700-922e-5873-88b0-9e5f54ae10d6")},
    {"WriteClosed", uuid.MustParse("3e130131-bf55-5da3-b6db-cb83d5dec13b")},
    {"WriteLimit", uuid.MustParse("ac73b2e5-079d-529b-aa11-7397b0d3ed3a")},
    {"WriteMultiple", uuid.MustParse("080a67b9-c089-53eb-8746-62b827b426a1")},
  }

  columns = []TestColumn{
    {"Create", uuid.MustParse("4ac88716-a2e4-50d2-875c-12e8bee73a01"), uuid.MustParse("7b53c2f0-d2db-5c9d-996d-b10fd8ae7d42")},
    {"CreateEmpty", uuid.MustParse("40a5fae0-6db8-5f9a-8ae5-e40db0de77b5"), uuid.MustParse("ca4b7c86-f3a4-574c-8e2a-88c382f98759")},
    {"Update", uuid.MustParse("a6f886da-d3bd-5ae1-8dd2-2e66acec74c4"), uuid.MustParse("4887cf58-241e-57dd-b051-f6bd91b527cd")},
    {"ClosedUpdate", uuid.MustParse("d3bc5cfb-24c9-581c-8f0b-cdef6aba9c34"), uuid.MustParse("3da52e5e-3d82-59b0-b347-4abed0ff3955")},
    {"Read", uuid.MustParse("5aef3afc-92ea-5c44-9730-c76a79b01879"), uuid.MustParse("c90130b5-daaa-5d9d-98bc-b29ae22b8c7e")},
    {"SortedUpdate", uuid.MustParse("b82a4fa9-1ff4-5c89-b73e-c1aa1cc4f9a8"), uuid.MustParse("b0180427-ed4b-556a-a891-242daaf35918")},
    {"Write", uuid.MustParse("15ab1fe0-8c5d-53c9-8e46-f8db2ea66a09"), uuid.MustParse("da359700-922e-5873-88b0-9e5f54ae10d6")},
    {"WriteClosed", uuid.MustParse("e67fb8c7-0ef4-5f74-916c-d60c2e6e62f5"), uuid.MustParse("3e130131-bf55-5da3-b6db-cb83d5dec13b")},
    {"WriteLimit", uuid.MustParse("a1cef54b-8b29-5d8c-a3df-d4f6c1e27c44"), uuid.MustParse("ac73b2e5-079d-529b-aa11-7397b0d3ed3a")},
    {"WriteMultiple", uuid.MustParse("77e22ed8-7d10-5b36-98f9-bc836e7d4b3f"), uuid.MustParse("080a67b9-c089-53eb-8746-62b827b426a1")},
  }

  notes = []TestNote{
    {"Create", uuid.MustParse("89f4ab52-7630-5daf-8e02-7a57be30c94f"), stanID, uuid.MustParse("7b53c2f0-d2db-5c9d-996d-b10fd8ae7d42"), uuid.MustParse("4ac88716-a2e4-50d2-875c-12e8bee73a01"), "Create voting note"},
    {"CreateEmpty", uuid.MustParse("18e88382-9ce7-5a62-ada0-b6bbe06d39c3"), stanID, uuid.MustParse("ca4b7c86-f3a4-574c-8e2a-88c382f98759"), uuid.MustParse("40a5fae0-6db8-5f9a-8ae5-e40db0de77b5"), "CreateEmpty voting note"},
    {"Update1", uuid.MustParse("f8986c64-7f14-51f6-9259-280141cecb44"), stanID, uuid.MustParse("4887cf58-241e-57dd-b051-f6bd91b527cd"), uuid.MustParse("a6f886da-d3bd-5ae1-8dd2-2e66acec74c4"), "Update voting note one"},
    {"Update2", uuid.MustParse("de4633cc-8dd7-5b49-821c-19aefac2a85b"), stanID, uuid.MustParse("4887cf58-241e-57dd-b051-f6bd91b527cd"), uuid.MustParse("a6f886da-d3bd-5ae1-8dd2-2e66acec74c4"), "Update voting note two"},
    {"Update3", uuid.MustParse("16a707e0-2251-572f-abf8-e614e4baf5ed"), stanID, uuid.MustParse("4887cf58-241e-57dd-b051-f6bd91b527cd"), uuid.MustParse("a6f886da-d3bd-5ae1-8dd2-2e66acec74c4"), "Update voting note three"},
    {"SortedUpdate1", uuid.MustParse("c7d5e8b4-f32b-5168-af3c-122a111990ff"), stanID, uuid.MustParse("b0180427-ed4b-556a-a891-242daaf35918"), uuid.MustParse("b82a4fa9-1ff4-5c89-b73e-c1aa1cc4f9a8"), "SortedUpdate voting note one"},
    {"SortedUpdate2", uuid.MustParse("c37fc562-c9f5-5f60-9f47-1868db1b2fcf"), stanID, uuid.MustParse("b0180427-ed4b-556a-a891-242daaf35918"), uuid.MustParse("b82a4fa9-1ff4-5c89-b73e-c1aa1cc4f9a8"), "SortedUpdate voting note two"},
    {"SortedUpdate3", uuid.MustParse("501945c5-2c31-597a-b474-252c8f9d0c49"), stanID, uuid.MustParse("b0180427-ed4b-556a-a891-242daaf35918"), uuid.MustParse("b82a4fa9-1ff4-5c89-b73e-c1aa1cc4f9a8"), "SortedUpdate voting note three"},
    {"ClosedUpdate", uuid.MustParse("dfc9b07f-6fc2-58ac-8c98-6c5f0c9e57a3"), stanID, uuid.MustParse("3da52e5e-3d82-59b0-b347-4abed0ff3955"), uuid.MustParse("d3bc5cfb-24c9-581c-8f0b-cdef6aba9c34"), "ClosedUpdate voting note"},
    {"Read1", uuid.MustParse("387f1959-8af7-5203-8395-f87a9f0c0208"), stanID, uuid.MustParse("c90130b5-daaa-5d9d-98bc-b29ae22b8c7e"), uuid.MustParse("5aef3afc-92ea-5c44-9730-c76a79b01879"), "Read note 1"},
    {"Read2", uuid.MustParse("d6dd038a-d06c-5d36-a97f-293fe2caddcf"), stanID, uuid.MustParse("c90130b5-daaa-5d9d-98bc-b29ae22b8c7e"), uuid.MustParse("5aef3afc-92ea-5c44-9730-c76a79b01879"), "Read note 2"},
    {"WriteAdd", uuid.MustParse("d016e6cf-b2d5-5b15-b44e-9ae43c8dd726"), stanID, uuid.MustParse("da359700-922e-5873-88b0-9e5f54ae10d6"), uuid.MustParse("15ab1fe0-8c5d-53c9-8e46-f8db2ea66a09"), "Write add note"},
    {"WriteRemove", uuid.MustParse("d7053980-883e-543d-a7fa-a0745452fe1b"), stanID, uuid.MustParse("da359700-922e-5873-88b0-9e5f54ae10d6"), uuid.MustParse("15ab1fe0-8c5d-53c9-8e46-f8db2ea66a09"), "Write remove note"},
    {"WriteClosed", uuid.MustParse("18c888ae-a270-5014-9262-bcae09ad28d5"), stanID, uuid.MustParse("3e130131-bf55-5da3-b6db-cb83d5dec13b"), uuid.MustParse("e67fb8c7-0ef4-5f74-916c-d60c2e6e62f5"), "WriteClosed note"},
    {"WriteLimit", uuid.MustParse("c330b3e9-c5dc-5eae-9d64-58d154968dcf"), stanID, uuid.MustParse("ac73b2e5-079d-529b-aa11-7397b0d3ed3a"), uuid.MustParse("a1cef54b-8b29-5d8c-a3df-d4f6c1e27c44"), "WriteLimit note"},
    {"WriteMultiple", uuid.MustParse("4f7a0be8-576e-5e65-afe5-4946ac260db0"), stanID, uuid.MustParse("080a67b9-c089-53eb-8746-62b827b426a1"), uuid.MustParse("77e22ed8-7d10-5b36-98f9-bc836e7d4b3f"), "WriteMultiple note"},
  }

  votings = []TestVoting{
    {"CreateDuplicate", uuid.MustParse("7ea04db6-6328-515b-8b60-9ac4d67f49a4"), uuid.MustParse("7ea04db6-6328-515b-8b60-9ac4d67f49a3"), 7, true, false, "OPEN", false},
    {"Update", uuid.MustParse("4887cf58-241e-57dd-b051-f6bd91b527ce"), uuid.MustParse("4887cf58-241e-57dd-b051-f6bd91b527cd"), 7, true, false, "OPEN", false},
    {"ClosedUpdate", uuid.MustParse("3da52e5e-3d82-59b0-b347-4abed0ff3956"), uuid.MustParse("3da52e5e-3d82-59b0-b347-4abed0ff3955"), 7, true, false, "CLOSED", false},
    {"ReadOpen", uuid.MustParse("c90130b5-daaa-5d9d-98bc-b29ae22b8c7f"), uuid.MustParse("c90130b5-daaa-5d9d-98bc-b29ae22b8c7e"), 5, true, false, "OPEN", false},
    {"ReadClosed", uuid.MustParse("c90130b5-daaa-5d9d-98bc-b29ae22b8c80"), uuid.MustParse("c90130b5-daaa-5d9d-98bc-b29ae22b8c7e"), 5, true, false, "CLOSED", false},
    {"Write", uuid.MustParse("da359700-922e-5873-88b0-9e5f54ae10d7"), uuid.MustParse("da359700-922e-5873-88b0-9e5f54ae10d6"), 5, true, false, "OPEN", false},
    {"WriteClosed", uuid.MustParse("3e130131-bf55-5da3-b6db-cb83d5dec13c"), uuid.MustParse("3e130131-bf55-5da3-b6db-cb83d5dec13b"), 5, true, false, "CLOSED", false},
    {"WriteLimit", uuid.MustParse("ac73b2e5-079d-529b-aa11-7397b0d3ed3b"), uuid.MustParse("ac73b2e5-079d-529b-aa11-7397b0d3ed3a"), 1, true, false, "OPEN", false},
    {"WriteMultiple", uuid.MustParse("080a67b9-c089-53eb-8746-62b827b426a2"), uuid.MustParse("080a67b9-c089-53eb-8746-62b827b426a1"), 5, false, false, "OPEN", false},
    {"SortedUpdate", uuid.MustParse("b0180427-ed4b-556a-a891-242daaf35919"), uuid.MustParse("b0180427-ed4b-556a-a891-242daaf35918"), 7, true, false, "OPEN", false},
  }
)

func GetBaseIDs() DbBaseIDs {
  baseIDs := DbBaseIDs{
    Users:   make(map[string]TestUser),
    Boards:  make(map[string]TestBoard),
    Columns: make(map[string]TestColumn),
    Notes:   make(map[string]TestNote),
    Votings: make(map[string]TestVoting),
  }

  for _, user := range users {
    baseIDs.Users[user.Name] = user
  }

  for _, board := range boards {
    baseIDs.Boards[board.Name] = board
  }

  for _, column := range columns {
    baseIDs.Columns[column.Name] = column
  }

  for _, note := range notes {
    baseIDs.Notes[note.Name] = note
  }

  for _, voting := range votings {
    baseIDs.Votings[voting.Name] = voting
  }

  return baseIDs
}

func SeedDBBase(db *bun.DB) {
  for _, user := range users {
    if err := initialize.InsertUser(db, user.ID, user.Name, string(user.AccountType)); err != nil {
      log.Fatalf("Failed to insert test user %s: %s", user.Name, err)
    }
  }

  for _, board := range boards {
    if err := initialize.InsertBoard(db, board.ID, board.Name+" Board", "", nil, nil, "PUBLIC", true, true, true, true, false); err != nil {
      log.Fatalf("Failed to insert test board %s: %s", board.Name, err)
    }
  }

  for _, column := range columns {
    if err := initialize.InsertColumn(db, column.ID, column.BoardID, column.Name+" Column", "", "backlog-blue", true, 0); err != nil {
      log.Fatalf("Failed to insert test column %s: %s", column.Name, err)
    }
  }

  for _, note := range notes {
    if err := initialize.InsertNote(db, note.ID, note.AuthorID, note.BoardID, note.ColumnID, note.Text, uuid.NullUUID{UUID: uuid.Nil, Valid: false}, 0); err != nil {
      log.Fatalf("Failed to insert test note %s: %s", note.Name, err)
    }
  }

  for _, voting := range votings {
    if err := initialize.InsertVoting(db, voting.ID, voting.BoardID, voting.VoteLimit, voting.AllowMultipleVotes, voting.ShowVotesOfOthers, voting.Status, voting.IsAnonymous); err != nil {
      log.Fatalf("Failed to insert test voting %s: %s", voting.Name, err)
    }
  }
}
