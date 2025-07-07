--- Users
INSERT INTO "users" ("id", "name", "account_type") VALUES ('7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4', 'Stan', 'ANONYMOUS');
INSERT INTO "users" ("id", "name", "account_type") VALUES ('7efcbaad-f72e-4f01-9b2c-70d42426d036', 'Friend', 'ANONYMOUS');

--- Boards
INSERT INTO "boards" ("id", "name") VALUES ('f23ac3e5-21a2-4e66-81db-c23df904badc', 'First Board'); --- Insert, Update, Delete
INSERT INTO "boards" ("id", "name") VALUES ('493b3d06-c3a4-4fd0-94ea-f64819a007e4', 'Second Board'); --- Get

--- Columns
INSERT INTO "columns" ("id", "board", "name") VALUES ('40776893-7fd7-47bc-a435-2a7391e21af9', 'f23ac3e5-21a2-4e66-81db-c23df904badc', 'First Column'); --- Insert, Update, Delete
INSERT INTO "columns" ("id", "board", "name") VALUES ('31c600a0-d143-44e8-83c2-85defe440488', '493b3d06-c3a4-4fd0-94ea-f64819a007e4', 'First Column'); --- Get

--- Notes
INSERT INTO "notes" ("id", "author", "board", "column", "text") VALUES ('b1a61dbb-0d55-49c1-9b78-cb2c38d49ae8', '7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4', 'f23ac3e5-21a2-4e66-81db-c23df904badc', '40776893-7fd7-47bc-a435-2a7391e21af9', 'This is a note'); --- Insert, Update, Delete
INSERT INTO "notes" ("id", "author", "board", "column", "text") VALUES ('c53c722c-e82a-4904-a387-aa1eea0c57db', '7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4', 'f23ac3e5-21a2-4e66-81db-c23df904badc', '40776893-7fd7-47bc-a435-2a7391e21af9', 'This is a note'); --- Insert, Update, Delete
INSERT INTO "notes" ("id", "author", "board", "column", "text") VALUES ('abb08905-3efc-4fe8-b2b3-cb27393fe84b', '7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4', '493b3d06-c3a4-4fd0-94ea-f64819a007e4', '31c600a0-d143-44e8-83c2-85defe440488', 'This is a note'); --- Get
INSERT INTO "notes" ("id", "author", "board", "column", "text") VALUES ('04b00221-8eaf-4594-8f7d-0865ca97d6c0', '7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4', '493b3d06-c3a4-4fd0-94ea-f64819a007e4', '31c600a0-d143-44e8-83c2-85defe440488', 'This is also a note'); --- Get

--- Reactions
INSERT INTO "reactions" ("id", "note", "user", "reaction_type") VALUES ('b193c436-4d6f-4630-90a3-3415843f38f7', 'b1a61dbb-0d55-49c1-9b78-cb2c38d49ae8', '7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4', 'like'); --- Delete
INSERT INTO "reactions" ("id", "note", "user", "reaction_type") VALUES ('ac7102c8-0c7d-45d0-afaa-3d6b39984923', 'b1a61dbb-0d55-49c1-9b78-cb2c38d49ae8', '7efcbaad-f72e-4f01-9b2c-70d42426d036', 'heart'); --- Update, Delete error
INSERT INTO "reactions" ("id", "note", "user", "reaction_type") VALUES ('57c398c0-8a37-42af-b5b7-c1b4056538e7', 'abb08905-3efc-4fe8-b2b3-cb27393fe84b', '7a6e0a1a-bdc2-4ac7-91eb-45587d65c8b4', 'heart'); --- Get
INSERT INTO "reactions" ("id", "note", "user", "reaction_type") VALUES ('ce18cd27-09bc-4201-9b1e-8916530063d0', 'abb08905-3efc-4fe8-b2b3-cb27393fe84b', '7efcbaad-f72e-4f01-9b2c-70d42426d036', 'like'); --- Get
INSERT INTO "reactions" ("id", "note", "user", "reaction_type") VALUES ('09a7e64d-bd74-45c5-8c77-642eb229193b', '04b00221-8eaf-4594-8f7d-0865ca97d6c0', '7efcbaad-f72e-4f01-9b2c-70d42426d036', 'heart'); --- Get
