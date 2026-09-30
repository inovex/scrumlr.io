/*
 * The unique google id has a maximum length of 255 ASCII characters.
 * https://developers.google.com/identity/openid-connect/openid-connect#server-flow
*/
ALTER TABLE IF EXISTS google_users ALTER COLUMN id TYPE VARCHAR(256);
