alter table users
  add column if not exists avatar JSONB;
