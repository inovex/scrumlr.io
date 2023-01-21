alter table users
  add column if not exists key_migration date;
