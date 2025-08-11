-- original values found in migration files 14 and 19
ALTER TABLE IF EXISTS boards ALTER COLUMN description TYPE VARCHAR(300);
ALTER TABLE IF EXISTS columns ALTER COLUMN description TYPE VARCHAR(128);
