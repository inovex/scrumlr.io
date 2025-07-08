--- Users
INSERT INTO "users" ("id", "name", "account_type") VALUES ('7c57533e-3f39-477a-a753-56e7a92f9831', 'Stan', 'GOOGLE'); --- OWNER
INSERT INTO "users" ("id", "name", "account_type") VALUES ('88894c86-51cb-4f5b-8ac7-cefc7e1aec00', 'Friend', 'ANONYMOUS'); --- Moderator
INSERT INTO "users" ("id", "name", "account_type") VALUES ('ebe9194d-11ea-4c66-b130-03523e566919', 'Santa', 'ANONYMOUS'); --- Participant
INSERT INTO "users" ("id", "name", "account_type") VALUES ('71be6023-6c01-4059-a05f-d5f67eeeafc3', 'Bob', 'ANONYMOUS'); --- Participant banned

--- Boards
INSERT INTO "boards" ("id", "name") VALUES ('da46d8d5-1b29-4a98-8f78-62aea611b86d', 'First Board'); --- Insert, Update, Delete
INSERT INTO "boards" ("id", "name") VALUES ('a359f156-7a13-4afc-8a0c-beddc9ccd455', 'Second Board'); --- Get, Exists
INSERT INTO "boards" ("id", "name") VALUES ('799bf01f-a3dd-40fe-bc24-6cf4d18cca3f', 'Second Board'); --- Get with filter

--- Sessions

INSERT INTO "board_sessions" ("user", "board", "role") VALUES ('7c57533e-3f39-477a-a753-56e7a92f9831', 'a359f156-7a13-4afc-8a0c-beddc9ccd455', 'OWNER');
INSERT INTO "board_sessions" ("user", "board", "role") VALUES ('88894c86-51cb-4f5b-8ac7-cefc7e1aec00', 'a359f156-7a13-4afc-8a0c-beddc9ccd455', 'MODERATOR');
INSERT INTO "board_sessions" ("user", "board", "role") VALUES ('ebe9194d-11ea-4c66-b130-03523e566919', 'a359f156-7a13-4afc-8a0c-beddc9ccd455', 'PARTICIPANT');
INSERT INTO "board_sessions" ("user", "board", "role", "banned") VALUES ('71be6023-6c01-4059-a05f-d5f67eeeafc3', 'a359f156-7a13-4afc-8a0c-beddc9ccd455', 'PARTICIPANT', 'true');

INSERT INTO "board_sessions" ("user", "board", "role", "ready", "connected") VALUES ('7c57533e-3f39-477a-a753-56e7a92f9831', '799bf01f-a3dd-40fe-bc24-6cf4d18cca3f', 'OWNER', 'true', 'true');
INSERT INTO "board_sessions" ("user", "board", "role", "ready") VALUES ('88894c86-51cb-4f5b-8ac7-cefc7e1aec00', '799bf01f-a3dd-40fe-bc24-6cf4d18cca3f', 'MODERATOR', 'true');
INSERT INTO "board_sessions" ("user", "board", "role", "raised_hand", "connected") VALUES ('ebe9194d-11ea-4c66-b130-03523e566919', '799bf01f-a3dd-40fe-bc24-6cf4d18cca3f', 'PARTICIPANT', 'true', 'true');
INSERT INTO "board_sessions" ("user", "board", "role", "raised_hand") VALUES ('71be6023-6c01-4059-a05f-d5f67eeeafc3', '799bf01f-a3dd-40fe-bc24-6cf4d18cca3f', 'PARTICIPANT', 'true');
